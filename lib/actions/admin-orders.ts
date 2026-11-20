'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { OPS_ADMIN_ROLES, logAdminAction, requireAdminRole } from '@/lib/supabase/admin-auth';
import { canTransitionOrderStatus, canTransitionPaymentStatus } from '@/lib/orders/state-machine';
import { normalizeAddress } from '@/lib/utils/address';
import { sanitizePostgrestSearchTerm, stripHtmlTags } from '@/lib/validators/commerce';
import type { Json } from '@/types/database';
import { revalidatePath } from 'next/cache';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  variant_details: Json | Record<string, any> | null;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  phone: string | null;
  status: string;
  payment_status: string;
  payment_method: string | null;
  payment_id?: string | null;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  shipping_address: Record<string, any>;
  billing_address?: Record<string, any>;
  notes: string | null;
  vidyas_note: string | null;
  tracking_number: string | null;
  courier_partner: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  gift_wrap?: boolean;
  gift_message?: string | null;
  whatsapp_opt_in?: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  items_count?: number;
  items?: OrderItem[];
}

export async function getOrders(filters?: {
  status?: string;
  search?: string;
}): Promise<AdminOrder[]> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return [];
    }
    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      const term = sanitizePostgrestSearchTerm(filters.search);
      if (term) {
        query = query.or(`order_number.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error('getOrders query error:', error);
      return [];
    }

    return (data || []).map((order: any) => {
      const rawItems: OrderItem[] = order.order_items || [];
      const itemsCount = rawItems.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
      const addr = normalizeAddress(order.shipping_address);
      const customerName = addr.fullName || order.email;

      return {
        ...order,
        shipping_address: addr,
        customer_name: customerName,
        items_count: itemsCount,
        items: rawItems,
      };
    });
  } catch (err) {
    console.error('getOrders unexpected error:', err);
    return [];
  }
}

export async function getOrderById(id: string): Promise<{ order: AdminOrder | null; items: OrderItem[] }> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { order: null, items: [] };
    }
    const [orderRes, itemsRes] = await Promise.all([
      supabaseAdmin.from('orders').select('*').eq('id', id).maybeSingle(),
      supabaseAdmin.from('order_items').select('*').eq('order_id', id),
    ]);

    if (!orderRes.data) return { order: null, items: [] };

    const orderData = orderRes.data;
    const items: OrderItem[] = (itemsRes.data || []) as OrderItem[];
    const itemsCount = items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
    const addr = normalizeAddress(orderData.shipping_address);
    const customerName = addr.fullName || orderData.email;

    const order: AdminOrder = {
      ...orderData,
      shipping_address: addr,
      billing_address: orderData.billing_address ? normalizeAddress(orderData.billing_address) : undefined,
      metadata: (typeof orderData.metadata === 'object' && orderData.metadata !== null && !Array.isArray(orderData.metadata))
        ? (orderData.metadata as Record<string, any>)
        : {},
      customer_name: customerName,
      items_count: itemsCount,
      items,
    };

    return { order, items };
  } catch (err) {
    console.error('getOrderById error:', err);
    return { order: null, items: [] };
  }
}

export async function updateOrderStatus(
  id: string,
  status: string,
  trackingNumber?: string,
  courierPartner?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }

    const { data: currentOrder } = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('id', id)
      .maybeSingle();

    if (!currentOrder) {
      return { success: false, error: 'Order not found' };
    }
    if (!canTransitionOrderStatus(currentOrder.status, status)) {
      return { success: false, error: `Invalid order transition from ${currentOrder.status} to ${status}` };
    }

    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (trackingNumber !== undefined) updates['tracking_number'] = trackingNumber;
    if (courierPartner !== undefined) updates['courier_partner'] = courierPartner;
    if (status === 'shipped') updates['shipped_at'] = new Date().toISOString();
    if (status === 'delivered') updates['delivered_at'] = new Date().toISOString();
    if (status === 'cancelled') updates['cancelled_at'] = new Date().toISOString();

    const { error } = await supabaseAdmin.from('orders').update(updates).eq('id', id);
    if (error) {
      console.error('updateOrderStatus error:', error);
      return { success: false, error: error.message };
    }

    if (status === 'cancelled' && currentOrder.status !== 'cancelled') {
      await supabaseAdmin.rpc('release_order_inventory', { p_order_id: id });
    }

    await logAdminAction({
      actorId: auth.userId,
      action: 'update_order_status',
      entityType: 'order',
      entityId: id,
      afterState: { status, trackingNumber, courierPartner },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    revalidatePath('/admin/orders/shipments');
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath('/account/orders');
    return { success: true };
  } catch (err: any) {
    console.error('updateOrderStatus error:', err);
    return { success: false, error: err?.message || 'Failed to update order status' };
  }
}

export async function updateShipmentFulfillment(
  orderId: string,
  data: {
    courierPartner: string;
    trackingNumber: string;
    status?: 'shipped' | 'delivered';
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }
    const targetStatus = data.status || 'shipped';
    const { data: currentOrder } = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .maybeSingle();

    if (!currentOrder) {
      return { success: false, error: 'Order not found' };
    }
    if (!canTransitionOrderStatus(currentOrder.status, targetStatus)) {
      return { success: false, error: `Invalid order transition from ${currentOrder.status} to ${targetStatus}` };
    }
    const cleanCourier = stripHtmlTags(data.courierPartner || '').slice(0, 80);
    const cleanTracking = stripHtmlTags(data.trackingNumber || '').slice(0, 100);
    const updates: Record<string, any> = {
      status: targetStatus,
      courier_partner: cleanCourier,
      tracking_number: cleanTracking,
      updated_at: new Date().toISOString(),
    };

    if (targetStatus === 'shipped') {
      updates['shipped_at'] = new Date().toISOString();
    } else if (targetStatus === 'delivered') {
      updates['delivered_at'] = new Date().toISOString();
    }

    const { error } = await supabaseAdmin.from('orders').update(updates).eq('id', orderId);

    if (error) {
      console.error('updateShipmentFulfillment error:', error);
      return { success: false, error: error.message };
    }

    await logAdminAction({
      actorId: auth.userId,
      action: 'update_shipment_fulfillment',
      entityType: 'order',
      entityId: orderId,
      afterState: { status: targetStatus, courierPartner: data.courierPartner, trackingNumber: data.trackingNumber },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/orders/shipments');
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/account/orders');
    return { success: true };
  } catch (err: any) {
    console.error('updateShipmentFulfillment error:', err);
    return { success: false, error: err?.message || 'Failed to update shipment' };
  }
}

export async function autoDispatchShipmentAwb(orderId: string): Promise<{
  success: boolean;
  configured: boolean;
  awbNumber?: string;
  courierPartner?: string;
  trackingUrl?: string;
  error?: string;
}> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, configured: false, error: auth.error || 'Unauthorized' };
    }

    const { createShipmentAwb } = await import('@/lib/services/logistics');
    const { normalizeAddress } = await import('@/lib/utils/address');

    const { data: order, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total_amount, payment_method, status, shipping_address, phone')
      .eq('id', orderId)
      .maybeSingle();

    if (fetchErr || !order) {
      return { success: false, configured: false, error: 'Order not found' };
    }

    const addr = normalizeAddress(order.shipping_address);
    const result = await createShipmentAwb({
      orderNumber: order.order_number,
      customerName: addr.fullName || 'Customer',
      phone: order.phone || addr.phone || '',
      address: [addr.address1, addr.address2].filter(Boolean).join(', '),
      city: addr.city,
      state: addr.state,
      pincode: addr.postalCode,
      totalAmountInr: Number(order.total_amount || 0),
      paymentMethod: (order.payment_method || '').toLowerCase() === 'cod' ? 'cod' : 'prepaid',
    });

    if (!result.success || !result.awbNumber) {
      return {
        success: false,
        configured: result.configured,
        error: result.error || 'Could not generate AWB.',
      };
    }

    const courierName = result.provider === 'shiprocket' ? 'Shiprocket' : 'Delhivery';
    await updateShipmentFulfillment(orderId, {
      courierPartner: courierName,
      trackingNumber: result.awbNumber,
      status: 'shipped',
    });

    return {
      success: true,
      configured: true,
      awbNumber: result.awbNumber,
      courierPartner: courierName,
      trackingUrl: result.trackingUrl,
    };
  } catch (err: any) {
    return {
      success: false,
      configured: false,
      error: err?.message || 'Failed to generate carrier AWB.',
    };
  }
}

export async function updatePaymentStatus(
  id: string,
  payment_status: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }

    const { data: currentOrder } = await supabaseAdmin
      .from('orders')
      .select('payment_status')
      .eq('id', id)
      .maybeSingle();

    if (!currentOrder) {
      return { success: false, error: 'Order not found' };
    }
    if (!canTransitionPaymentStatus(currentOrder.payment_status, payment_status)) {
      return { success: false, error: `Invalid payment status transition from ${currentOrder.payment_status} to ${payment_status}` };
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ payment_status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('updatePaymentStatus error:', error);
      return { success: false, error: error.message };
    }

    await logAdminAction({
      actorId: auth.userId,
      action: 'update_payment_status',
      entityType: 'order',
      entityId: id,
      afterState: { payment_status },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath('/account/orders');
    return { success: true };
  } catch (err: any) {
    console.error('updatePaymentStatus error:', err);
    return { success: false, error: err?.message || 'Failed to update payment status' };
  }
}

export async function updateVidyasNote(id: string, note: string): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { success: false, error: auth.error || 'Unauthorized' };
    }

    const cleanNote = stripHtmlTags(note || '').slice(0, 1000);
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ vidyas_note: cleanNote, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      await logAdminAction({
        actorId: auth.userId,
        action: 'update_vidyas_note',
        entityType: 'order',
        entityId: id,
      });
    }

    if (error) {
      console.error('updateVidyasNote error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/orders/${id}`);
    return { success: true };
  } catch (err: any) {
    console.error('updateVidyasNote error:', err);
    return { success: false, error: err?.message || 'Failed to update note' };
  }
}

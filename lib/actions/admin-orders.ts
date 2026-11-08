'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  variant_details: Record<string, any> | null;
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
    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      const term = filters.search.trim();
      query = query.or(`order_number.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('getOrders query error:', error);
      return [];
    }

    return (data || []).map((order: any) => {
      const rawItems: OrderItem[] = order.order_items || [];
      const itemsCount = rawItems.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
      const addr = order.shipping_address || {};
      const customerName = [addr.firstName, addr.lastName].filter(Boolean).join(' ') || addr.full_name || order.email;

      return {
        ...order,
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
    const [orderRes, itemsRes] = await Promise.all([
      supabaseAdmin.from('orders').select('*').eq('id', id).maybeSingle(),
      supabaseAdmin.from('order_items').select('*').eq('order_id', id),
    ]);

    if (!orderRes.data) return { order: null, items: [] };

    const orderData = orderRes.data;
    const items: OrderItem[] = itemsRes.data || [];
    const itemsCount = items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
    const addr = orderData.shipping_address || {};
    const customerName = [addr.firstName, addr.lastName].filter(Boolean).join(' ') || addr.full_name || orderData.email;

    const order: AdminOrder = {
      ...orderData,
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
    const targetStatus = data.status || 'shipped';
    const updates: Record<string, any> = {
      status: targetStatus,
      courier_partner: data.courierPartner,
      tracking_number: data.trackingNumber,
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

export async function updatePaymentStatus(
  id: string,
  payment_status: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ payment_status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('updatePaymentStatus error:', error);
      return { success: false, error: error.message };
    }

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
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ vidyas_note: note, updated_at: new Date().toISOString() })
      .eq('id', id);

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

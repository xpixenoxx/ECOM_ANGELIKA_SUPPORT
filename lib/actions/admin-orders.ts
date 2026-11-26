'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { OPS_ADMIN_ROLES, logAdminAction, requireAdminRole } from '@/lib/supabase/admin-auth';
import {
  canTransitionOrderStatus,
  canTransitionPaymentStatus,
  canTransitionShipmentStatus,
  evaluateShipmentEligibility,
} from '@/lib/orders/state-machine';
import { normalizeAddress } from '@/lib/utils/address';
import { sanitizePostgrestSearchTerm, stripHtmlTags } from '@/lib/validators/commerce';
import {
  cancelShiprocketShipment,
  createShipmentWithRealOrderData,
  generateShiprocketLabel,
  generateShiprocketManifest,
  scheduleShiprocketPickup,
  trackShiprocketAwb,
} from '@/lib/services/logistics';
import {
  sendOrderCancelledNotification,
  sendShipmentLifecycleNotification,
} from '@/lib/actions/notifications';
import type { Database, Json } from '@/types/database';
import { revalidatePath } from 'next/cache';

export type OrderShipmentRow = Database['public']['Tables']['shipments']['Row'];
export type OrderRefundRow = Database['public']['Tables']['order_refunds']['Row'];

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  gst_rate?: number;
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
  tracking_url?: string | null;
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
  shipments?: OrderShipmentRow[];
  refunds?: OrderRefundRow[];
}

function revalidateOrderPaths(orderId: string) {
  try {
    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    revalidatePath('/admin/orders/shipments');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/account/orders');
  } catch {
    // Non-fatal outside Next.js request lifecycle (e.g. unit tests)
  }
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

export async function getOrderById(id: string): Promise<{
  order: AdminOrder | null;
  items: OrderItem[];
  shipments: OrderShipmentRow[];
  refunds: OrderRefundRow[];
}> {
  try {
    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    if (!auth.authorized) {
      return { order: null, items: [], shipments: [], refunds: [] };
    }
    const [orderRes, itemsRes, shipmentsRes, refundsRes] = await Promise.all([
      supabaseAdmin.from('orders').select('*').eq('id', id).maybeSingle(),
      supabaseAdmin.from('order_items').select('*').eq('order_id', id),
      supabaseAdmin
        .from('shipments')
        .select('*')
        .eq('order_id', id)
        .order('created_at', { ascending: false })
        .then((r) => r, () => ({ data: [] as OrderShipmentRow[], error: null })),
      supabaseAdmin
        .from('order_refunds')
        .select('*')
        .eq('order_id', id)
        .order('created_at', { ascending: false })
        .then((r) => r, () => ({ data: [] as OrderRefundRow[], error: null })),
    ]);

    if (!orderRes.data) return { order: null, items: [], shipments: [], refunds: [] };

    const orderData = orderRes.data;
    const items: OrderItem[] = (itemsRes.data || []) as OrderItem[];
    const shipments: OrderShipmentRow[] = (shipmentsRes.data || []) as OrderShipmentRow[];
    const refunds: OrderRefundRow[] = (refundsRes.data || []) as OrderRefundRow[];
    const itemsCount = items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
    const addr = normalizeAddress(orderData.shipping_address);
    const customerName = addr.fullName || orderData.email;

    const order: AdminOrder = {
      ...orderData,
      shipping_address: addr,
      billing_address: orderData.billing_address
        ? normalizeAddress(orderData.billing_address)
        : undefined,
      metadata:
        typeof orderData.metadata === 'object' &&
        orderData.metadata !== null &&
        !Array.isArray(orderData.metadata)
          ? (orderData.metadata as Record<string, any>)
          : {},
      customer_name: customerName,
      items_count: itemsCount,
      items,
      shipments,
      refunds,
    };

    return { order, items, shipments, refunds };
  } catch (err) {
    console.error('getOrderById error:', err);
    return { order: null, items: [], shipments: [], refunds: [] };
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
      .select('status, payment_method, payment_status, tracking_url')
      .eq('id', id)
      .maybeSingle();

    if (!currentOrder) {
      return { success: false, error: 'Order not found' };
    }
    if (!canTransitionOrderStatus(currentOrder.status, status)) {
      return {
        success: false,
        error: `Invalid order transition from ${currentOrder.status} to ${status}`,
      };
    }

    // Never allow shipping unpaid prepaid orders
    if (status === 'shipped' || status === 'out_for_delivery' || status === 'delivered') {
      const elig = evaluateShipmentEligibility(currentOrder);
      if (!elig.eligible) {
        return { success: false, error: elig.reason || 'Order is not eligible for dispatch.' };
      }
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
      await sendOrderCancelledNotification(id, 'Cancelled by store administrator');
    }

    if (status === 'shipped' || status === 'out_for_delivery' || status === 'delivered') {
      await sendShipmentLifecycleNotification({
        orderId: id,
        shipmentRef: trackingNumber || id,
        stage: status,
        courierName: courierPartner || null,
        awbCode: trackingNumber || null,
        trackingUrl: currentOrder.tracking_url || null,
      });
    }

    await logAdminAction({
      actorId: auth.userId,
      action: 'update_order_status',
      entityType: 'order',
      entityId: id,
      afterState: { status, trackingNumber, courierPartner },
    });

    revalidateOrderPaths(id);
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
    trackingUrl?: string;
    status?: 'processing' | 'shipped' | 'delivered';
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
      .select('status, payment_method, payment_status')
      .eq('id', orderId)
      .maybeSingle();

    if (!currentOrder) {
      return { success: false, error: 'Order not found' };
    }

    const elig = evaluateShipmentEligibility(currentOrder);
    if (!elig.eligible) {
      return { success: false, error: elig.reason || 'Order is not eligible for dispatch.' };
    }

    if (!canTransitionOrderStatus(currentOrder.status, targetStatus)) {
      return {
        success: false,
        error: `Invalid order transition from ${currentOrder.status} to ${targetStatus}`,
      };
    }

    const cleanCourier = stripHtmlTags(data.courierPartner || '').slice(0, 80);
    const cleanTracking = stripHtmlTags(data.trackingNumber || '').slice(0, 100);
    const updates: Record<string, any> = {
      status: targetStatus,
      courier_partner: cleanCourier,
      tracking_number: cleanTracking,
      updated_at: new Date().toISOString(),
    };

    if (data.trackingUrl) {
      updates['tracking_url'] = data.trackingUrl;
    }
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

    if (targetStatus === 'shipped' || targetStatus === 'delivered') {
      await sendShipmentLifecycleNotification({
        orderId,
        shipmentRef: cleanTracking || orderId,
        stage: targetStatus,
        courierName: cleanCourier,
        awbCode: cleanTracking,
        trackingUrl: data.trackingUrl || null,
      });
    }

    await logAdminAction({
      actorId: auth.userId,
      action: 'update_shipment_fulfillment',
      entityType: 'order',
      entityId: orderId,
      afterState: {
        status: targetStatus,
        courierPartner: cleanCourier,
        trackingNumber: cleanTracking,
        trackingUrl: data.trackingUrl || null,
      },
    });

    revalidateOrderPaths(orderId);
    return { success: true };
  } catch (err: any) {
    console.error('updateShipmentFulfillment error:', err);
    return { success: false, error: err?.message || 'Failed to update shipment' };
  }
}

/**
 * Create a Shiprocket Order & Shipment + Assign Courier AWB using real authoritative order data.
 *
 * Safeguards:
 * 1. Enforces `evaluateShipmentEligibility` (blocks unpaid prepaid orders, cancelled, delivered).
 * 2. Prevents duplicate shipment/AWB bookings via active `shipments` check.
 * 3. Fetches real `order_items` joined with `products` (SKU, HSN, GST) and `product_variants` (weight_grams).
 * 4. Sends real customer email (`order.email`) and addresses.
 * 5. Persists real assigned `courier_name` (never generic "Shiprocket") + `tracking_url` + Shiprocket IDs.
 * 6. Sets `orders.status = 'processing'` and `shipments.shipment_status = 'awb_assigned'` —
 *    does NOT falsely mark the order physically `'shipped'` until pickup/in-transit scan!
 */
export async function autoDispatchShipmentAwb(
  orderId: string,
  courierCompanyId?: number | null
): Promise<{
  success: boolean;
  configured: boolean;
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
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

    const { data: order, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        created_at,
        email,
        phone,
        subtotal,
        shipping_cost,
        discount_amount,
        total_amount,
        payment_method,
        payment_status,
        status,
        shipping_address,
        billing_address,
        notes,
        tracking_number,
        courier_partner,
        order_items (
          id,
          product_id,
          variant_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          gst_rate,
          variant_details,
          product:products!order_items_product_id_fkey (sku, hsn_code, gst_slab),
          variant:product_variants!order_items_variant_id_fkey (size, weight_grams)
        )
      `)
      .eq('id', orderId)
      .maybeSingle();

    if (fetchErr || !order) {
      return { success: false, configured: false, error: 'Order not found' };
    }

    // 1. Strict payment & order eligibility gate
    const eligibility = evaluateShipmentEligibility(order);
    if (!eligibility.eligible) {
      return {
        success: false,
        configured: true,
        error: eligibility.reason || 'Order is not eligible for shipment creation.',
      };
    }

    // 2. Duplicate shipment prevention check
    const { data: existingActiveShipment } = await supabaseAdmin
      .from('shipments')
      .select('id, awb_code, shiprocket_shipment_id, courier_name, shipment_status')
      .eq('order_id', orderId)
      .neq('shipment_status', 'cancelled')
      .maybeSingle();

    if (existingActiveShipment?.awb_code) {
      return {
        success: false,
        configured: true,
        error: `An active shipment already exists for this order (AWB: ${existingActiveShipment.awb_code} via ${existingActiveShipment.courier_name || 'Assigned Courier'}). Cancel it first if you need to rebook.`,
      };
    }

    if (order.tracking_number && !existingActiveShipment) {
      return {
        success: false,
        configured: true,
        error: `Order already has tracking number ${order.tracking_number}. Use Edit or cancel existing shipment before creating a duplicate AWB.`,
      };
    }

    const rawItems: any[] = Array.isArray((order as any).order_items)
      ? (order as any).order_items
      : [];

    if (rawItems.length === 0) {
      return {
        success: false,
        configured: true,
        error: 'Order has no line items to ship.',
      };
    }

    const shipAddr = normalizeAddress(order.shipping_address);
    const billAddr = order.billing_address ? normalizeAddress(order.billing_address) : shipAddr;

    const shiprocketItems = rawItems.map((item) => {
      const vd =
        item.variant_details && typeof item.variant_details === 'object'
          ? (item.variant_details as Record<string, any>)
          : {};
      const prod = Array.isArray(item.product) ? item.product[0] : item.product;
      const variant = Array.isArray(item.variant) ? item.variant[0] : item.variant;
      const sizeSuffix = vd['size'] || variant?.size ? `-${String(vd['size'] || variant?.size).replace(/\s+/g, '')}` : '';
      const baseSku = prod?.sku || vd['sku'] || `AF-${String(item.variant_id || item.id).slice(0, 8).toUpperCase()}`;

      return {
        name: `${item.product_name}${vd['size'] ? ` (${vd['size']})` : ''}`,
        sku: `${baseSku}${sizeSuffix}`.slice(0, 50),
        units: Number(item.quantity || 1),
        sellingPrice: Number(item.unit_price || 0),
        discount: 0,
        tax: 0,
        hsn: prod?.hsn_code || vd['hsn_code'] || null,
        weightGrams: variant?.weight_grams ?? vd['weight_grams'] ?? null,
      };
    });

    const isCod = (order.payment_method || '').toLowerCase() === 'cod';
    const result = await createShipmentWithRealOrderData(
      {
        orderNumber: order.order_number,
        orderDateIso: order.created_at,
        customerEmail: order.email,
        customerPhone: order.phone || shipAddr.phone || '',
        shippingAddress: {
          firstName: shipAddr.firstName,
          lastName: shipAddr.lastName,
          address1: shipAddr.address1,
          address2: shipAddr.address2,
          city: shipAddr.city,
          state: shipAddr.state,
          postalCode: shipAddr.postalCode,
          country: shipAddr.country || 'India',
          phone: shipAddr.phone || order.phone || '',
          email: order.email,
        },
        billingAddress: {
          firstName: billAddr.firstName,
          lastName: billAddr.lastName,
          address1: billAddr.address1,
          address2: billAddr.address2,
          city: billAddr.city,
          state: billAddr.state,
          postalCode: billAddr.postalCode,
          country: billAddr.country || 'India',
          phone: billAddr.phone || order.phone || '',
          email: order.email,
        },
        items: shiprocketItems,
        subtotalInr: Number(order.subtotal || order.total_amount || 0),
        shippingChargesInr: Number(order.shipping_cost || 0),
        discountInr: Number(order.discount_amount || 0),
        paymentMethod: isCod ? 'cod' : 'prepaid',
        comment: order.notes,
      },
      courierCompanyId
    );

    // Partial failure reconciliation: Shiprocket order/shipment created, but AWB failed -> persist shipment row in 'created' state
    if (!result.success && result.shiprocketShipmentId) {
      await supabaseAdmin.from('shipments').upsert(
        {
          order_id: orderId,
          provider: 'shiprocket',
          shiprocket_order_id: result.shiprocketOrderId || null,
          shiprocket_shipment_id: result.shiprocketShipmentId,
          shipment_status: 'created',
          weight_kg: result.weightKg ?? null,
          length_cm: result.dimensionsCm?.length ?? null,
          breadth_cm: result.dimensionsCm?.breadth ?? null,
          height_cm: result.dimensionsCm?.height ?? null,
          metadata: {
            awb_error: result.error || 'AWB assignment failed',
            used_default_weight: Boolean(result.usedDefaultWeight),
            used_default_dimensions: Boolean(result.usedDefaultDimensions),
          } as unknown as Json,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'shiprocket_shipment_id' }
      );

      revalidateOrderPaths(orderId);
      return {
        success: false,
        configured: true,
        shiprocketOrderId: result.shiprocketOrderId,
        shiprocketShipmentId: result.shiprocketShipmentId,
        error: result.error || 'Shiprocket shipment created, but courier AWB could not be assigned.',
      };
    }

    if (!result.success || !result.awbNumber) {
      return {
        success: false,
        configured: result.configured,
        error: result.error || 'Could not generate Shiprocket AWB.',
      };
    }

    const actualCourierName = result.courierPartner || 'Assigned Courier';

    // Persist durable shipment row
    const { error: shipPersistErr } = await supabaseAdmin.from('shipments').upsert(
      {
        order_id: orderId,
        provider: 'shiprocket',
        shiprocket_order_id: result.shiprocketOrderId || null,
        shiprocket_shipment_id: result.shiprocketShipmentId || null,
        awb_code: result.awbNumber,
        courier_company_id: result.courierCompanyId ?? null,
        courier_name: actualCourierName,
        tracking_url: result.trackingUrl || null,
        pickup_status: 'unscheduled',
        shipment_status: 'awb_assigned',
        weight_kg: result.weightKg ?? null,
        length_cm: result.dimensionsCm?.length ?? null,
        breadth_cm: result.dimensionsCm?.breadth ?? null,
        height_cm: result.dimensionsCm?.height ?? null,
        metadata: {
          used_default_weight: Boolean(result.usedDefaultWeight),
          used_default_dimensions: Boolean(result.usedDefaultDimensions),
        } as unknown as Json,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'shiprocket_shipment_id' }
    );

    if (shipPersistErr) {
      console.error(
        JSON.stringify({
          service: 'shiprocket',
          event: 'shipment_db_persist_failed',
          orderId,
          shiprocketOrderId: result.shiprocketOrderId,
          shiprocketShipmentId: result.shiprocketShipmentId,
          awbNumber: result.awbNumber,
          error: shipPersistErr.message,
        })
      );
    }

    // Sync orders table: advance to 'processing' (NOT physically 'shipped' until pickup/in-transit!)
    const nextOrderStatus =
      order.status === 'confirmed' || order.status === 'pending' ? 'processing' : order.status;

    await supabaseAdmin
      .from('orders')
      .update({
        status: nextOrderStatus,
        courier_partner: actualCourierName,
        tracking_number: result.awbNumber,
        tracking_url: result.trackingUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    await sendShipmentLifecycleNotification({
      orderId,
      shipmentRef: result.awbNumber,
      stage: 'created',
      courierName: actualCourierName,
      awbCode: result.awbNumber,
      trackingUrl: result.trackingUrl || null,
    });

    await logAdminAction({
      actorId: auth.userId,
      action: 'create_shiprocket_shipment',
      entityType: 'order',
      entityId: orderId,
      afterState: {
        shiprocketOrderId: result.shiprocketOrderId,
        shiprocketShipmentId: result.shiprocketShipmentId,
        awbNumber: result.awbNumber,
        courierPartner: actualCourierName,
        trackingUrl: result.trackingUrl,
      },
    });

    revalidateOrderPaths(orderId);
    return {
      success: true,
      configured: true,
      shiprocketOrderId: result.shiprocketOrderId,
      shiprocketShipmentId: result.shiprocketShipmentId,
      awbNumber: result.awbNumber,
      courierPartner: actualCourierName,
      trackingUrl: result.trackingUrl,
    };
  } catch (err: any) {
    return {
      success: false,
      configured: false,
      error: err?.message || 'Failed to create Shiprocket shipment.',
    };
  }
}

/** Schedule courier pickup for an existing Shiprocket shipment. */
export async function scheduleOrderPickup(orderId: string): Promise<{
  success: boolean;
  pickupScheduledDate?: string | null;
  pickupTokenNumber?: string | null;
  error?: string;
}> {
  const auth = await requireAdminRole(OPS_ADMIN_ROLES);
  if (!auth.authorized) return { success: false, error: auth.error || 'Unauthorized' };

  const { data: shipment } = await supabaseAdmin
    .from('shipments')
    .select('*')
    .eq('order_id', orderId)
    .neq('shipment_status', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!shipment || !shipment.shiprocket_shipment_id || !shipment.awb_code) {
    return { success: false, error: 'Create shipment and assign an AWB before scheduling pickup.' };
  }

  if (shipment.pickup_status === 'scheduled' || shipment.pickup_status === 'picked_up') {
    return {
      success: true,
      pickupScheduledDate: shipment.pickup_scheduled_date,
      pickupTokenNumber: shipment.pickup_token_number,
    };
  }

  const res = await scheduleShiprocketPickup(shipment.shiprocket_shipment_id);
  if (!res.success) {
    return { success: false, error: res.error || 'Pickup scheduling failed.' };
  }

  await supabaseAdmin
    .from('shipments')
    .update({
      pickup_status: 'scheduled',
      pickup_scheduled_date: res.pickupScheduledDate || null,
      pickup_token_number: res.pickupTokenNumber || null,
      shipment_status: canTransitionShipmentStatus(shipment.shipment_status, 'pickup_scheduled')
        ? 'pickup_scheduled'
        : shipment.shipment_status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', shipment.id);

  await logAdminAction({
    actorId: auth.userId,
    action: 'schedule_shiprocket_pickup',
    entityType: 'shipment',
    entityId: shipment.id,
    afterState: {
      orderId,
      pickupScheduledDate: res.pickupScheduledDate,
      pickupTokenNumber: res.pickupTokenNumber,
    },
  });

  revalidateOrderPaths(orderId);
  return {
    success: true,
    pickupScheduledDate: res.pickupScheduledDate,
    pickupTokenNumber: res.pickupTokenNumber,
  };
}

/** Generate & persist downloadable Shiprocket shipping label PDF URL. */
export async function generateOrderShippingLabel(orderId: string): Promise<{
  success: boolean;
  labelUrl?: string;
  error?: string;
}> {
  const auth = await requireAdminRole(OPS_ADMIN_ROLES);
  if (!auth.authorized) return { success: false, error: auth.error || 'Unauthorized' };

  const { data: shipment } = await supabaseAdmin
    .from('shipments')
    .select('id, shiprocket_shipment_id, awb_code')
    .eq('order_id', orderId)
    .neq('shipment_status', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!shipment || !shipment.shiprocket_shipment_id || !shipment.awb_code) {
    return { success: false, error: 'Assign an AWB before generating a shipping label.' };
  }

  const res = await generateShiprocketLabel(shipment.shiprocket_shipment_id);
  if (!res.success || !res.labelUrl) {
    return { success: false, error: res.error || 'Could not generate shipping label.' };
  }

  await supabaseAdmin
    .from('shipments')
    .update({ label_url: res.labelUrl, updated_at: new Date().toISOString() })
    .eq('id', shipment.id);

  await logAdminAction({
    actorId: auth.userId,
    action: 'generate_shiprocket_label',
    entityType: 'shipment',
    entityId: shipment.id,
  });

  revalidateOrderPaths(orderId);
  return { success: true, labelUrl: res.labelUrl };
}

/** Generate & persist Shiprocket handover manifest PDF URL. */
export async function generateOrderManifest(orderId: string): Promise<{
  success: boolean;
  manifestUrl?: string;
  error?: string;
}> {
  const auth = await requireAdminRole(OPS_ADMIN_ROLES);
  if (!auth.authorized) return { success: false, error: auth.error || 'Unauthorized' };

  const { data: shipment } = await supabaseAdmin
    .from('shipments')
    .select('id, shiprocket_shipment_id, awb_code')
    .eq('order_id', orderId)
    .neq('shipment_status', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!shipment || !shipment.shiprocket_shipment_id || !shipment.awb_code) {
    return { success: false, error: 'Assign an AWB before generating a manifest.' };
  }

  const res = await generateShiprocketManifest(shipment.shiprocket_shipment_id);
  if (!res.success || !res.manifestUrl) {
    return { success: false, error: res.error || 'Could not generate manifest.' };
  }

  await supabaseAdmin
    .from('shipments')
    .update({ manifest_url: res.manifestUrl, updated_at: new Date().toISOString() })
    .eq('id', shipment.id);

  revalidateOrderPaths(orderId);
  return { success: true, manifestUrl: res.manifestUrl };
}

/** Pull live Shiprocket tracking by AWB and reconcile local shipment & order states safely. */
export async function syncOrderShipmentTracking(orderId: string): Promise<{
  success: boolean;
  shipmentStatus?: string;
  orderStatus?: string;
  error?: string;
}> {
  const auth = await requireAdminRole(OPS_ADMIN_ROLES);
  if (!auth.authorized) return { success: false, error: auth.error || 'Unauthorized' };

  const [{ data: order }, { data: shipment }] = await Promise.all([
    supabaseAdmin.from('orders').select('id, status, tracking_number, courier_partner').eq('id', orderId).maybeSingle(),
    supabaseAdmin
      .from('shipments')
      .select('*')
      .eq('order_id', orderId)
      .neq('shipment_status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!order) return { success: false, error: 'Order not found' };
  const awb = shipment?.awb_code || order.tracking_number;
  if (!awb) return { success: false, error: 'No AWB number is attached to this order.' };

  const track = await trackShiprocketAwb(awb);
  if (!track.success || !track.shipmentStatus) {
    return { success: false, error: track.error || 'Unable to fetch Shiprocket tracking.' };
  }

  if (shipment) {
    const nextShipStatus = canTransitionShipmentStatus(shipment.shipment_status, track.shipmentStatus)
      ? track.shipmentStatus
      : shipment.shipment_status;

    await supabaseAdmin
      .from('shipments')
      .update({
        shipment_status: nextShipStatus,
        raw_status_code: track.rawStatusCode ?? shipment.raw_status_code,
        raw_status_label: track.rawStatusLabel ?? shipment.raw_status_label,
        courier_name: track.courierName || shipment.courier_name,
        etd: track.etd || shipment.etd,
        tracking_url: track.trackingUrl || shipment.tracking_url,
        scans: (track.scans || []) as unknown as Json,
        last_event_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipment.id);
  }

  let nextOrderStatus = order.status;
  if (track.orderStatus && canTransitionOrderStatus(order.status, track.orderStatus)) {
    nextOrderStatus = track.orderStatus;
    const orderPatch: Record<string, unknown> = {
      status: nextOrderStatus,
      updated_at: new Date().toISOString(),
    };
    if (track.courierName) orderPatch['courier_partner'] = track.courierName;
    if (track.trackingUrl) orderPatch['tracking_url'] = track.trackingUrl;
    if (nextOrderStatus === 'shipped') orderPatch['shipped_at'] = new Date().toISOString();
    if (nextOrderStatus === 'delivered') orderPatch['delivered_at'] = new Date().toISOString();
    await supabaseAdmin.from('orders').update(orderPatch).eq('id', order.id);
  }

  revalidateOrderPaths(orderId);
  return {
    success: true,
    shipmentStatus: track.shipmentStatus,
    orderStatus: nextOrderStatus,
  };
}

/** Cancel a pre-pickup Shiprocket shipment and clear local active shipment cleanly. */
export async function cancelOrderShipment(orderId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const auth = await requireAdminRole(OPS_ADMIN_ROLES);
  if (!auth.authorized) return { success: false, error: auth.error || 'Unauthorized' };

  const { data: shipment } = await supabaseAdmin
    .from('shipments')
    .select('*')
    .eq('order_id', orderId)
    .neq('shipment_status', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!shipment) {
    return { success: false, error: 'No active shipment found to cancel.' };
  }

  if (
    shipment.shipment_status === 'picked_up' ||
    shipment.shipment_status === 'in_transit' ||
    shipment.shipment_status === 'out_for_delivery' ||
    shipment.shipment_status === 'delivered'
  ) {
    return {
      success: false,
      error: `Cannot cancel shipment already in "${shipment.shipment_status}" stage.`,
    };
  }

  const cancelRes = await cancelShiprocketShipment({
    shiprocketOrderId: shipment.shiprocket_order_id,
    awbCode: shipment.awb_code,
  });

  if (!cancelRes.success) {
    return { success: false, error: cancelRes.error || 'Shiprocket shipment cancellation failed.' };
  }

  await supabaseAdmin
    .from('shipments')
    .update({
      shipment_status: 'cancelled',
      pickup_status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', shipment.id);

  await supabaseAdmin
    .from('orders')
    .update({
      tracking_number: null,
      tracking_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  await logAdminAction({
    actorId: auth.userId,
    action: 'cancel_shiprocket_shipment',
    entityType: 'shipment',
    entityId: shipment.id,
    afterState: { orderId, awbCode: shipment.awb_code },
  });

  revalidateOrderPaths(orderId);
  return { success: true };
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
      return {
        success: false,
        error: `Invalid payment status transition from ${currentOrder.payment_status} to ${payment_status}`,
      };
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

    revalidateOrderPaths(id);
    return { success: true };
  } catch (err: any) {
    console.error('updatePaymentStatus error:', err);
    return { success: false, error: err?.message || 'Failed to update payment status' };
  }
}

export async function updateVidyasNote(
  id: string,
  note: string
): Promise<{ success: boolean; error?: string }> {
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

    if (error) {
      console.error('updateVidyasNote error:', error);
      return { success: false, error: error.message };
    }

    await logAdminAction({
      actorId: auth.userId,
      action: 'update_vidyas_note',
      entityType: 'order',
      entityId: id,
    });

    revalidateOrderPaths(id);
    return { success: true };
  } catch (err: any) {
    console.error('updateVidyasNote error:', err);
    return { success: false, error: err?.message || 'Failed to update note' };
  }
}

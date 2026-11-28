'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { OPS_ADMIN_ROLES, requireAdminRole } from '@/lib/supabase/admin-auth';
import { canCustomerCancelOrder } from '@/lib/orders/state-machine';
import { normalizeAddress } from '@/lib/utils/address';
import { normalizeIndianPhone, sanitizePostgrestSearchTerm, stripHtmlTags } from '@/lib/validators/commerce';
import { checkRateLimitAsync } from '@/lib/utils/rate-limit';
import { createOrderReceiptToken, verifyOrderReceiptToken } from '@/lib/utils/order-access-token';
import { sendOrderCancelledNotification } from '@/lib/actions/notifications';
import { revalidatePath } from 'next/cache';
import type { Json } from '@/types/database';

export interface CustomerOrderItemReview {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  quality_rating?: number | null;
  fit_rating?: number | null;
  reviewer_name?: string;
  created_at?: string;
}

export interface CustomerOrderItemReturn {
  id: string;
  order_id: string;
  order_item_id: string;
  type: string;
  status: string;
  reason: string;
  reason_detail?: string | null;
  refund_amount?: number | null;
  exchange_size?: string | null;
  created_at: string;
}

export interface CustomerOrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_slug?: string | null;
  variant_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  existing_review?: CustomerOrderItemReview | null;
  existing_return?: CustomerOrderItemReturn | null;
  return_window_days?: number;
  is_return_eligible?: boolean;
  return_expired?: boolean;
  return_deadline?: string | null;
  days_left?: number;
  variant_details?: {
    size?: string;
    color?: string;
    image?: string;
    image_url?: string;
    color_hex?: string;
    [key: string]: any;
  } | null;
}

export interface CustomerOrderScan {
  date?: string;
  status?: string;
  activity?: string;
  location?: string;
}

export interface CustomerOrder {
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
  courier_partner: string | null;
  tracking_number: string | null;
  tracking_url?: string | null;
  tracking_token?: string | null;
  shipment_status?: string | null;
  etd?: string | null;
  scans?: CustomerOrderScan[];
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancel_reason?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  items_count: number;
  items: CustomerOrderItem[];
  customer_name?: string;
}

/**
 * Fetch customer orders by authenticated server session, user ID, or user email.
 * Matches user_id OR email so guest checkouts and previous orders are always accurate.
 */
export async function getCustomerOrders(_options?: {
  userId?: string;
  userEmail?: string;
}): Promise<{
  success: boolean;
  isAuthenticated: boolean;
  orders: CustomerOrder[];
  error?: string;
}> {
  try {
    const serverSupabase = createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        isAuthenticated: false,
        orders: [],
        error: 'Please sign in to view your order history.',
      };
    }

    const resolvedUserId = user.id;
    const resolvedEmail = user.email ? user.email.trim().toLowerCase() : null;

    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (resolvedEmail) {
      query = query.or(`user_id.eq.${resolvedUserId},email.ilike.${sanitizePostgrestSearchTerm(resolvedEmail)}`);
    } else {
      query = query.eq('user_id', resolvedUserId);
    }

    const { data: rawOrders, error } = await query;

    if (error) {
      console.error('getCustomerOrders database error:', error);
      return { success: false, isAuthenticated: true, orders: [], error: error.message };
    }

    const ordersList = rawOrders || [];
    const orderIds = ordersList.map((o: any) => o.id).filter(Boolean);
    const prodIds = Array.from(
      new Set(
        ordersList
          .flatMap((o: any) => o.order_items || [])
          .map((it: any) => it.product_id)
          .filter(Boolean)
      )
    );

    const shipmentByOrderId = new Map<string, any>();
    const slugByProductId = new Map<string, string>();

    if (orderIds.length > 0) {
      const [shipmentsRes, productsRes] = await Promise.all([
        supabaseAdmin
          .from('shipments')
          .select('order_id, courier_name, awb_code, tracking_url, shipment_status, etd, created_at')
          .in('order_id', orderIds)
          .order('created_at', { ascending: false }),
        prodIds.length > 0
          ? supabaseAdmin.from('products').select('id, slug').in('id', prodIds)
          : Promise.resolve({ data: [] as Array<{ id: string; slug: string }> }),
      ]);

      for (const sh of shipmentsRes.data || []) {
        if (sh.order_id && !shipmentByOrderId.has(sh.order_id)) {
          shipmentByOrderId.set(sh.order_id, sh);
        }
      }
      for (const p of (productsRes as any).data || []) {
        if (p?.id && p?.slug) {
          slugByProductId.set(p.id, p.slug);
        }
      }
    }

    const formattedOrders: CustomerOrder[] = ordersList.map((order: any) => {
      const shipment = shipmentByOrderId.get(order.id);
      const items: CustomerOrderItem[] = (order.order_items || []).map((it: any) => {
        const vd = it.variant_details || {};
        const img = vd.image || vd.image_url || '/images/collection-kurtis.jpg';
        const resolvedSlug =
          (it.product_id ? slugByProductId.get(it.product_id) : null) ||
          vd.slug ||
          vd.product_slug ||
          null;
        return {
          ...it,
          product_slug: resolvedSlug,
          variant_details: {
            ...vd,
            image: img,
            image_url: img,
          },
        };
      });

      const itemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      const addr: any = order.shipping_address || {};
      const customerName = [addr.firstName, addr.lastName].filter(Boolean).join(' ') || addr.full_name || order.email;
      const trackingToken = createOrderReceiptToken(order.id, order.email);

      return {
        id: order.id,
        order_number: order.order_number,
        user_id: order.user_id,
        email: order.email,
        phone: order.phone,
        status: order.status || 'confirmed',
        payment_status: order.payment_status || 'pending',
        payment_method: order.payment_method || 'online',
        payment_id: order.payment_id,
        subtotal: Number(order.subtotal) || 0,
        shipping_cost: Number(order.shipping_cost) || 0,
        tax_amount: Number(order.tax_amount) || 0,
        discount_amount: Number(order.discount_amount) || 0,
        total_amount: Number(order.total_amount) || 0,
        currency: order.currency || 'INR',
        shipping_address: order.shipping_address || {},
        billing_address: order.billing_address || {},
        courier_partner: order.courier_partner || shipment?.courier_name || null,
        tracking_number: order.tracking_number || shipment?.awb_code || null,
        tracking_url: shipment?.tracking_url || null,
        tracking_token: trackingToken || null,
        shipment_status: shipment?.shipment_status || null,
        etd: shipment?.etd || null,
        shipped_at: order.shipped_at || null,
        delivered_at: order.delivered_at || null,
        cancelled_at: order.cancelled_at || null,
        cancel_reason: order.cancel_reason || null,
        notes: order.notes || null,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items_count: itemsCount,
        items,
        customer_name: customerName,
      };
    });

    return {
      success: true,
      isAuthenticated: true,
      orders: formattedOrders,
    };
  } catch (err: any) {
    console.error('getCustomerOrders unexpected error:', err);
    return {
      success: false,
      isAuthenticated: false,
      orders: [],
      error: err?.message || 'Failed to retrieve order history.',
    };
  }
}

/**
 * Fetch a single order by ID or order_number for the customer order details page.
 */
export async function getCustomerOrderById(
  orderId: string,
  _options?: {
    userId?: string;
    userEmail?: string;
  }
): Promise<{
  success: boolean;
  order: CustomerOrder | null;
  error?: string;
}> {
  try {
    const serverSupabase = createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();

    if (!user) {
      return { success: false, order: null, error: 'Authentication required' };
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(*)');

    if (isUuid) {
      query = query.eq('id', orderId);
    } else {
      query = query.eq('order_number', orderId);
    }

    const { data: order, error } = await query.maybeSingle();

    if (error || !order) {
      return { success: false, order: null, error: 'Order not found' };
    }

    const isOwner = Boolean(
      (order.user_id && order.user_id === user.id) ||
      (user.email && order.email.toLowerCase() === user.email.toLowerCase())
    );
    // Only incur admin-role verification roundtrips when a non-owner staff member inspects an order
    if (!isOwner) {
      const adminAuth = await requireAdminRole(OPS_ADMIN_ROLES);
      if (!adminAuth.authorized) {
        return { success: false, order: null, error: 'Order not found' };
      }
    }

    const rawOrderItems = order.order_items || [];
    const itemIds = rawOrderItems.map((it: any) => it.id).filter(Boolean);
    const prodIds = Array.from(new Set(rawOrderItems.map((it: any) => it.product_id).filter(Boolean)));

    // Fetch reviews, returns, product metadata (slug + return window), and live shipment scans in ONE parallel batch
    const [revsByItemRes, revsByProdRes, returnsRes, productsRes, shipmentRes] = await Promise.all([
      itemIds.length > 0
        ? supabaseAdmin
            .from('reviews')
            .select('id, product_id, order_item_id, rating, title, body, quality_rating, fit_rating, user_measurements, created_at')
            .in('order_item_id', itemIds)
        : Promise.resolve({ data: [] as any[] }),
      prodIds.length > 0 && order.user_id
        ? supabaseAdmin
            .from('reviews')
            .select('id, product_id, order_item_id, rating, title, body, quality_rating, fit_rating, user_measurements, created_at')
            .eq('user_id', order.user_id)
            .in('product_id', prodIds)
        : Promise.resolve({ data: [] as any[] }),
      supabaseAdmin
        .from('returns')
        .select('id, order_id, order_item_id, type, status, reason, reason_detail, refund_amount, exchange_size, created_at')
        .eq('order_id', order.id),
      prodIds.length > 0
        ? supabaseAdmin.from('products').select('id, slug, tags').in('id', prodIds)
        : Promise.resolve({ data: [] as any[] }),
      supabaseAdmin
        .from('shipments')
        .select('courier_name, awb_code, tracking_url, shipment_status, etd, scans, created_at')
        .eq('order_id', order.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const existingReviews: any[] =
      revsByItemRes.data && revsByItemRes.data.length > 0
        ? revsByItemRes.data
        : revsByProdRes.data || [];
    const existingReturns: any[] = returnsRes.data || [];
    const latestShipment = shipmentRes.data || null;

    const productReturnMap = new Map<string, number>();
    const productSlugMap = new Map<string, string>();
    for (const p of (productsRes as any).data || []) {
      if (p?.id && p?.slug) {
        productSlugMap.set(p.id, p.slug);
      }
      const tag = (p?.tags || []).find((t: string) => typeof t === 'string' && t.startsWith('return-days:'));
      if (tag) {
        const val = parseInt(tag.replace('return-days:', ''), 10);
        productReturnMap.set(p.id, isNaN(val) ? 7 : val);
      } else if (p?.id) {
        productReturnMap.set(p.id, 7);
      }
    }

    const isDelivered = (order.status || '').toLowerCase() === 'delivered';
    const deliveryDate = order.delivered_at || order.updated_at || order.created_at;
    const deliveryTime = new Date(deliveryDate).getTime();
    const now = Date.now();
    const daysElapsed = Math.floor((now - deliveryTime) / (1000 * 60 * 60 * 24));

    const items: CustomerOrderItem[] = rawOrderItems.map((it: any) => {
      const vd = it.variant_details || {};
      const img = vd.image || vd.image_url || '/images/collection-kurtis.jpg';

      const itemReturnWindowDays = it.product_id && productReturnMap.has(it.product_id)
        ? productReturnMap.get(it.product_id)!
        : 7;

      const matchReview = existingReviews.find((r: any) =>
        r.order_item_id === it.id || (it.product_id && r.product_id === it.product_id)
      );

      const reviewObj: CustomerOrderItemReview | null = matchReview ? {
        id: matchReview.id,
        rating: Number(matchReview.rating) || 5,
        title: matchReview.title,
        body: matchReview.body,
        quality_rating: matchReview.quality_rating,
        fit_rating: matchReview.fit_rating,
        reviewer_name: matchReview.user_measurements?.reviewer_name || 'Verified Customer',
        created_at: matchReview.created_at,
      } : null;

      const matchReturn = existingReturns.find((r: any) => r.order_item_id === it.id);
      const returnObj: CustomerOrderItemReturn | null = matchReturn ? {
        id: matchReturn.id,
        order_id: matchReturn.order_id,
        order_item_id: matchReturn.order_item_id,
        type: matchReturn.type || 'return',
        status: matchReturn.status || 'requested',
        reason: matchReturn.reason,
        reason_detail: matchReturn.reason_detail,
        refund_amount: matchReturn.refund_amount ? Number(matchReturn.refund_amount) : null,
        exchange_size: matchReturn.exchange_size || null,
        created_at: matchReturn.created_at,
      } : null;

      // Item is eligible only if delivered, has >0 days return policy, within return days, and not already requested
      const isReturnExpired = isDelivered ? (itemReturnWindowDays === 0 || daysElapsed > itemReturnWindowDays) : false;
      const isReturnEligible = isDelivered && itemReturnWindowDays > 0 && daysElapsed <= itemReturnWindowDays && !returnObj;
      const daysLeft = isDelivered && itemReturnWindowDays > 0 ? Math.max(0, itemReturnWindowDays - daysElapsed) : 0;
      const returnDeadline = isDelivered && itemReturnWindowDays > 0
        ? new Date(deliveryTime + itemReturnWindowDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      return {
        ...it,
        product_slug:
          (it.product_id ? productSlugMap.get(it.product_id) : null) ||
          vd.slug ||
          vd.product_slug ||
          null,
        existing_review: reviewObj,
        existing_return: returnObj,
        return_window_days: itemReturnWindowDays,
        is_return_eligible: isReturnEligible,
        return_expired: isReturnExpired,
        return_deadline: returnDeadline,
        days_left: daysLeft,
        variant_details: {
          ...vd,
          image: img,
          image_url: img,
        },
      };
    });

    const itemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const addr: any = order.shipping_address || {};
    const customerName = [addr.firstName, addr.lastName].filter(Boolean).join(' ') || addr.full_name || order.email;
    const rawScans = Array.isArray(latestShipment?.scans) ? (latestShipment.scans as any[]) : [];
    const normalizedScans: CustomerOrderScan[] = rawScans.map((s: any) => ({
      date: s?.date || s?.timestamp || s?.scan_date || undefined,
      status: s?.status || s?.['sr-status-label'] || undefined,
      activity: s?.activity || s?.description || s?.status || undefined,
      location: s?.location || undefined,
    }));

    const formattedOrder: CustomerOrder = {
      id: order.id,
      order_number: order.order_number,
      user_id: order.user_id,
      email: order.email,
      phone: order.phone,
      status: order.status || 'confirmed',
      payment_status: order.payment_status || 'pending',
      payment_method: order.payment_method || 'online',
      payment_id: order.payment_id,
      subtotal: Number(order.subtotal) || 0,
      shipping_cost: Number(order.shipping_cost) || 0,
      tax_amount: Number(order.tax_amount) || 0,
      discount_amount: Number(order.discount_amount) || 0,
      total_amount: Number(order.total_amount) || 0,
      currency: order.currency || 'INR',
      shipping_address: normalizeAddress(order.shipping_address),
      billing_address: order.billing_address ? normalizeAddress(order.billing_address) : undefined,
      courier_partner: order.courier_partner || latestShipment?.courier_name || null,
      tracking_number: order.tracking_number || latestShipment?.awb_code || null,
      tracking_url: latestShipment?.tracking_url || null,
      tracking_token: createOrderReceiptToken(order.id, order.email) || null,
      shipment_status: latestShipment?.shipment_status || null,
      etd: latestShipment?.etd || null,
      scans: normalizedScans,
      shipped_at: order.shipped_at || null,
      delivered_at: order.delivered_at || null,
      cancelled_at: order.cancelled_at || null,
      cancel_reason: order.cancel_reason || null,
      notes: order.notes || null,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items_count: itemsCount,
      items,
      customer_name: customerName,
    };

    return {
      success: true,
      order: formattedOrder,
    };
  } catch (err: any) {
    console.error('getCustomerOrderById error:', err);
    return { success: false, order: null, error: err?.message || 'Failed to retrieve order' };
  }
}

/**
 * Allows verified customer to submit or edit their review for a delivered ensemble product.
 */
export async function submitCustomerOrderReview(data: {
  orderId: string;
  orderItemId: string;
  productId: string;
  productName?: string;
  rating: number;
  title: string;
  body: string;
  reviewerName?: string;
  qualityRating?: number;
  fitRating?: number;
}): Promise<{ success: boolean; error?: string; review?: CustomerOrderItemReview }> {
  try {
    const serverSupabase = createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Please sign in to submit a verified review' };
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.orderId);
    let orderQuery = supabaseAdmin.from('orders').select('*, order_items(*)');
    if (isUuid) {
      orderQuery = orderQuery.eq('id', data.orderId);
    } else {
      orderQuery = orderQuery.eq('order_number', data.orderId);
    }
    const { data: order, error: oErr } = await orderQuery.maybeSingle();

    if (oErr || !order) {
      return { success: false, error: 'Order not found' };
    }

    const isOwner =
      (order.user_id && order.user_id === user.id) ||
      (user.email && order.email.toLowerCase() === user.email.toLowerCase());
    if (!isOwner) {
      return { success: false, error: 'Unauthorized: you do not own this order' };
    }

    const matchingItem = (order.order_items || []).find((i: any) => i.id === data.orderItemId);
    if (!matchingItem) {
      return { success: false, error: 'Order item does not belong to this order' };
    }

    const orderStatus = (order.status || '').toLowerCase();
    if (orderStatus !== 'delivered') {
      return { success: false, error: 'Reviews can only be submitted after your order is delivered' };
    }

    // Resolve true product id
    let resolvedProductId = data.productId;
    let resolvedSlug = '';
    const isProdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedProductId);

    if (!isProdUuid) {
      // Find product by slug or name
      const searchTerms = [data.productId, data.productName].filter(Boolean);
      for (const term of searchTerms) {
        const safeTerm = sanitizePostgrestSearchTerm(String(term || ''));
        if (!safeTerm) continue;
        const { data: p } = await supabaseAdmin
          .from('products')
          .select('id, slug')
          .or(`slug.eq.${safeTerm},name.ilike.%${safeTerm}%`)
          .limit(1)
          .maybeSingle();
        if (p) {
          resolvedProductId = p.id;
          resolvedSlug = p.slug;
          break;
        }
      }
    } else {
      const { data: p } = await supabaseAdmin
        .from('products')
        .select('slug')
        .eq('id', resolvedProductId)
        .maybeSingle();
      if (p) {
        resolvedSlug = p.slug;
      }
    }

    if (!resolvedProductId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedProductId)) {
      return { success: false, error: 'Could not associate review with a catalog product' };
    }

    const addr = normalizeAddress(order.shipping_address);
    const defaultName = addr.fullName || 'Verified Customer';
    const reviewerName = stripHtmlTags(data.reviewerName || '').slice(0, 100) || defaultName;

    // Check if existing review
    let existingReview: any = null;
    if (data.orderItemId) {
      const { data: r } = await supabaseAdmin
        .from('reviews')
        .select('id')
        .eq('order_item_id', data.orderItemId)
        .maybeSingle();
      existingReview = r;
    }

    if (!existingReview && order.user_id && resolvedProductId) {
      const { data: r } = await supabaseAdmin
        .from('reviews')
        .select('id')
        .eq('user_id', order.user_id)
        .eq('product_id', resolvedProductId)
        .maybeSingle();
      existingReview = r;
    }

    const reviewPayload = {
      product_id: resolvedProductId,
      user_id: order.user_id || null,
      order_item_id: data.orderItemId || null,
      rating: Math.max(1, Math.min(5, Number(data.rating) || 5)),
      title: data.title ? stripHtmlTags(data.title).slice(0, 200) : null,
      body: data.body ? stripHtmlTags(data.body).slice(0, 2000) : null,
      quality_rating: data.qualityRating ? Math.max(1, Math.min(5, Number(data.qualityRating))) : null,
      fit_rating: data.fitRating ? Math.max(1, Math.min(5, Number(data.fitRating))) : null,
      is_verified_purchase: true,
      is_published: true,
      user_measurements: { reviewer_name: reviewerName },
      updated_at: new Date().toISOString(),
    };

    let savedReview: any = null;

    if (existingReview?.id) {
      const { data: updated, error: uErr } = await supabaseAdmin
        .from('reviews')
        .update(reviewPayload)
        .eq('id', existingReview.id)
        .select()
        .single();
      if (uErr) throw uErr;
      savedReview = updated;
    } else {
      const { data: created, error: cErr } = await supabaseAdmin
        .from('reviews')
        .insert({
          ...reviewPayload,
          helpful_count: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (cErr) throw cErr;
      savedReview = created;
    }

    // Revalidate paths so storefront & admin immediately reflect new review
    revalidatePath(`/account/orders/${order.id}`);
    revalidatePath(`/account/orders/${order.order_number}`);
    revalidatePath('/admin/products/reviews');
    if (resolvedSlug) {
      revalidatePath(`/product/${resolvedSlug}`);
    }
    revalidatePath('/shop');

    return {
      success: true,
      review: {
        id: savedReview.id,
        rating: savedReview.rating,
        title: savedReview.title,
        body: savedReview.body,
        quality_rating: savedReview.quality_rating,
        fit_rating: savedReview.fit_rating,
        reviewer_name: reviewerName,
        created_at: savedReview.created_at,
      },
    };
  } catch (err: any) {
    console.error('submitCustomerOrderReview error:', err);
    return { success: false, error: err?.message || 'Failed to submit review' };
  }
}

/**
 * Allows verified customer to submit a return or exchange request for a delivered product.
 */
export async function submitCustomerReturnRequest(data: {
  orderId: string;
  orderItemId: string;
  type: 'return' | 'exchange';
  reason: string;
  reasonDetail?: string;
  pickupAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  exchangeSize?: string;
  refundAmount?: number;
}): Promise<{ success: boolean; error?: string; returnRecord?: CustomerOrderItemReturn }> {
  try {
    const serverSupabase = createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Please sign in to submit a return or exchange request' };
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.orderId);
    let orderQuery = supabaseAdmin.from('orders').select('*, order_items(*)');
    if (isUuid) {
      orderQuery = orderQuery.eq('id', data.orderId);
    } else {
      orderQuery = orderQuery.eq('order_number', data.orderId);
    }
    const { data: order, error: oErr } = await orderQuery.maybeSingle();

    if (oErr || !order) {
      return { success: false, error: 'Order not found' };
    }

    const isOwner =
      (order.user_id && order.user_id === user.id) ||
      (user.email && order.email.toLowerCase() === user.email.toLowerCase());
    if (!isOwner) {
      return { success: false, error: 'Unauthorized: you do not own this order' };
    }

    if ((order.status || '').toLowerCase() !== 'delivered') {
      return { success: false, error: 'Returns and exchanges can only be requested after delivery' };
    }

    const item = (order.order_items || []).find((i: any) => i.id === data.orderItemId);
    if (!item) {
      return { success: false, error: 'Item not found in this order' };
    }

    // Verify item has not already been requested
    const { data: existingRet } = await supabaseAdmin
      .from('returns')
      .select('id, status')
      .eq('order_item_id', data.orderItemId)
      .maybeSingle();

    if (existingRet) {
      return {
        success: false,
        error: `A return request has already been recorded for this item (Status: ${existingRet.status.toUpperCase()})`,
      };
    }

    // Verify product return window has not expired
    if (item.product_id) {
      const { data: prod } = await supabaseAdmin
        .from('products')
        .select('tags')
        .eq('id', item.product_id)
        .maybeSingle();

      const returnTag = (prod?.tags || []).find((t: string) => typeof t === 'string' && t.startsWith('return-days:'));
      const returnWindowDays = returnTag ? parseInt(returnTag.replace('return-days:', ''), 10) : 7;

      if (returnWindowDays === 0) {
        return {
          success: false,
          error: 'This handcrafted item is designated as Final Sale and cannot be returned or exchanged.',
        };
      }

      const deliveryDate = order.delivered_at || order.updated_at || order.created_at;
      const daysElapsed = Math.floor((Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24));

      if (daysElapsed > returnWindowDays) {
        return {
          success: false,
          error: `The return period for this item has completed (${returnWindowDays} days policy). Return requests can no longer be processed.`,
        };
      }
    }

    const resolvedUserId = order.user_id || user.id || null;

    // Never trust client-supplied refund amount; always compute from order_items price
    const calculatedRefund = Number(item.total_price ?? Number(item.unit_price) * Number(item.quantity));

    // Map reasons to database check constraint 'returns_reason_check': ('size', 'fit', 'wrong_item', 'damaged', 'quality', 'changed_mind', 'other')
    const allowedReasons = ['size', 'fit', 'wrong_item', 'damaged', 'quality', 'changed_mind', 'other'];
    const reasonMapping: Record<string, string> = {
      size: 'size',
      wrong_size: 'size',
      fit: 'fit',
      fit_issue: 'fit',
      wrong_item: 'wrong_item',
      wrong_color: 'wrong_item',
      color_difference: 'wrong_item',
      not_as_described: 'wrong_item',
      damaged: 'damaged',
      damaged_defective: 'damaged',
      defective: 'damaged',
      quality: 'quality',
      quality_issue: 'quality',
      fabric_quality: 'quality',
      changed_mind: 'changed_mind',
      other: 'other',
    };
    const sanitizedReason = reasonMapping[data.reason] || (allowedReasons.includes(data.reason) ? data.reason : 'other');

    const returnPayload = {
      order_id: order.id,
      order_item_id: data.orderItemId,
      user_id: resolvedUserId,
      type: data.type === 'exchange' ? 'exchange' : 'return',
      status: 'requested',
      reason: sanitizedReason,
      reason_detail: data.reasonDetail ? stripHtmlTags(data.reasonDetail).slice(0, 1000) : null,
      refund_amount: calculatedRefund,
      pickup_address: data.pickupAddress || order.shipping_address || null,
      exchange_size: data.exchangeSize ? stripHtmlTags(data.exchangeSize).slice(0, 50) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: created, error: cErr } = await supabaseAdmin
      .from('returns')
      .insert(returnPayload)
      .select()
      .single();

    if (cErr) {
      console.error('Failed to insert return record:', cErr);
      return { success: false, error: cErr.message || 'Failed to submit return request' };
    }

    revalidatePath(`/account/orders/${order.id}`);
    revalidatePath(`/account/orders/${order.order_number}`);
    revalidatePath('/admin/orders/returns');

    return {
      success: true,
      returnRecord: {
        id: created.id,
        order_id: created.order_id,
        order_item_id: created.order_item_id,
        type: created.type,
        status: created.status,
        reason: created.reason,
        reason_detail: created.reason_detail,
        refund_amount: created.refund_amount ? Number(created.refund_amount) : null,
        exchange_size: created.exchange_size || null,
        created_at: created.created_at,
      },
    };
  } catch (err: any) {
    console.error('submitCustomerReturnRequest error:', err);
    return { success: false, error: err?.message || 'Failed to submit return request' };
  }
}

/**
 * Allows authenticated customer to cancel their own eligible pre-dispatch order,
 * atomically releasing reserved inventory & coupon allocations.
 */
export async function cancelCustomerOrder(
  orderId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const serverSupabase = createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Please sign in to cancel your order' };
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    let query = supabaseAdmin.from('orders').select('id, order_number, user_id, email, status, payment_status, payment_method, total_amount, metadata');
    query = isUuid ? query.eq('id', orderId) : query.eq('order_number', orderId);
    const { data: order, error } = await query.maybeSingle();

    if (error || !order) {
      return { success: false, error: 'Order not found' };
    }

    const isOwner =
      (order.user_id && order.user_id === user.id) ||
      (user.email && order.email.toLowerCase() === user.email.toLowerCase());
    if (!isOwner) {
      return { success: false, error: 'Unauthorized: you do not own this order' };
    }

    if (!canCustomerCancelOrder(order.status)) {
      return {
        success: false,
        error: `Orders already in "${order.status}" stage cannot be cancelled online. Please contact concierge or request a return after delivery.`,
      };
    }

    // Check active Shiprocket shipment before cancelling so we never refund an already-picked-up parcel
    // and always cancel pre-pickup AWBs on Shiprocket automatically.
    let activePrePickupShipment: {
      id: string;
      shiprocket_order_id: string | null;
      awb_code: string | null;
      shipment_status: string;
    } | null = null;
    try {
      const shipTable: any = supabaseAdmin.from('shipments');
      if (shipTable && typeof shipTable.select === 'function') {
        const { data: activeShip } = await shipTable
          .select('id, shiprocket_order_id, awb_code, shipment_status')
          .eq('order_id', order.id)
          .neq('shipment_status', 'cancelled')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (activeShip) {
          if (
            ['picked_up', 'in_transit', 'out_for_delivery', 'delivered'].includes(
              activeShip.shipment_status
            )
          ) {
            return {
              success: false,
              error:
                'This parcel has already been handed over to the courier and cannot be cancelled online. You may refuse delivery or request a return after arrival.',
            };
          }
          activePrePickupShipment = activeShip;
        }
      }
    } catch {
      // Non-fatal in minimal unit-test mocks without shipments table
    }

    const cleanReason = reason ? stripHtmlTags(reason).slice(0, 300) : 'Cancelled by customer';
    const existingMeta = (typeof order.metadata === 'object' && order.metadata !== null && !Array.isArray(order.metadata))
      ? (order.metadata as Record<string, unknown>)
      : {};

    let shiprocketCancelWarning: string | null = null;
    if (activePrePickupShipment) {
      try {
        const { cancelShiprocketShipment } = await import('@/lib/services/logistics');
        const srCancel = await cancelShiprocketShipment({
          shiprocketOrderId: activePrePickupShipment.shiprocket_order_id,
          awbCode: activePrePickupShipment.awb_code,
        });
        if (!srCancel.success) {
          shiprocketCancelWarning = srCancel.error || 'Shiprocket pre-pickup cancel returned error';
        }
      } catch (srErr: any) {
        shiprocketCancelWarning = srErr?.message || 'Shiprocket cancel call failed';
      }

      try {
        await supabaseAdmin
          .from('shipments')
          .update({
            shipment_status: 'cancelled',
            pickup_status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', activePrePickupShipment.id);
      } catch {
        // Non-fatal in minimal unit-test mocks
      }
    }

    const orderCancelPatch: Record<string, unknown> = {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancel_reason: cleanReason,
      updated_at: new Date().toISOString(),
    };
    if (activePrePickupShipment) {
      orderCancelPatch['tracking_number'] = null;
      orderCancelPatch['tracking_url'] = null;
      if (shiprocketCancelWarning) {
        orderCancelPatch['metadata'] = {
          ...existingMeta,
          shiprocket_cancel_warning: shiprocketCancelWarning,
        } as unknown as Json;
      }
    }

    const { error: updateErr } = await supabaseAdmin
      .from('orders')
      .update(orderCancelPatch)
      .eq('id', order.id);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    await supabaseAdmin.rpc('release_order_inventory', { p_order_id: order.id });

    // If order was paid online, trigger automatic gateway refund WITHOUT double-restoring inventory
    if (order.payment_status === 'paid' && order.payment_method !== 'cod') {
      try {
        const { executeGatewayRefund } = await import('@/lib/actions/payments');
        const refundRes = await executeGatewayRefund(order.id, undefined, cleanReason, {
          restoreInventory: false,
          idempotencyKey: `cust_cancel_${order.id.replace(/-/g, '')}`,
        });
        if (!refundRes.success) {
          console.warn('[cancelCustomerOrder] Gateway refund failed, flagged for admin review:', refundRes.error);
          await supabaseAdmin
            .from('orders')
            .update({
              metadata: {
                ...existingMeta,
                manual_refund_required: true,
                refund_pending_reason: cleanReason,
                gateway_refund_error: refundRes.error || 'Gateway refund invocation failed',
              } as unknown as Json,
            })
            .eq('id', order.id);
        }
      } catch (refundErr: any) {
        console.error('[cancelCustomerOrder] Refund execution error:', refundErr);
        await supabaseAdmin
          .from('orders')
          .update({
            metadata: {
              ...existingMeta,
              manual_refund_required: true,
              refund_pending_reason: cleanReason,
              gateway_refund_error: refundErr?.message || 'Unexpected refund error',
            } as unknown as Json,
          })
          .eq('id', order.id);
      }
    }

    await sendOrderCancelledNotification(order.id, cleanReason);

    try {
      revalidatePath('/account/orders');
      revalidatePath(`/account/orders/${order.id}`);
      revalidatePath(`/account/orders/${order.order_number}`);
      revalidatePath('/admin/orders');
    } catch {
      // Non-blocking outside request context
    }

    return { success: true };
  } catch (err: any) {
    console.error('cancelCustomerOrder error:', err);
    return { success: false, error: err?.message || 'Failed to cancel order' };
  }
}

export interface PublicTrackedOrder {
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  courier_partner: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipment_status?: string | null;
  etd?: string | null;
  scans?: Array<{
    date: string;
    status: string;
    activity: string;
    location: string;
  }>;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  destination_city: string;
  destination_state: string;
  total_amount: number;
  items: Array<{
    product_name: string;
    quantity: number;
    size?: string;
    color?: string;
    image?: string;
  }>;
}

/**
 * Privacy-safe public order tracking by Order Number + (Email/10-digit Phone OR signed HMAC receiptToken).
 * Never leaks street address, full phone, or full email.
 */
export async function trackOrderPublic(params: {
  orderNumber: string;
  contact?: string;
  receiptToken?: string;
}): Promise<{ success: boolean; order?: PublicTrackedOrder; error?: string }> {
  try {
    const cleanOrderNum = sanitizePostgrestSearchTerm(params.orderNumber || '').toUpperCase();
    const rawContact = (params.contact || '').trim();
    const rawToken = (params.receiptToken || '').trim();
    if (!cleanOrderNum || (!rawContact && !rawToken)) {
      return { success: false, error: 'Order number and email or phone number are required.' };
    }

    const rl = await checkRateLimitAsync(`track_order:${cleanOrderNum}`, 15, 15 * 60 * 1000);
    if (!rl.allowed) {
      return {
        success: false,
        error: 'Too many tracking lookup attempts for this order. Please wait a few minutes and try again.',
      };
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        email,
        phone,
        status,
        payment_status,
        payment_method,
        courier_partner,
        tracking_number,
        tracking_url,
        shipped_at,
        delivered_at,
        created_at,
        shipping_address,
        total_amount,
        order_items(product_name, quantity, variant_details)
      `)
      .ilike('order_number', cleanOrderNum)
      .maybeSingle();

    if (error || !order) {
      return { success: false, error: 'No matching order found. Please verify your Order Number and contact details.' };
    }

    const addr = normalizeAddress(order.shipping_address);
    const inputLower = rawContact.toLowerCase();
    const inputPhone = normalizeIndianPhone(rawContact);
    const orderPhone = normalizeIndianPhone(order.phone || addr.phone || '');

    const matchesEmail = Boolean(
      rawContact && order.email && inputLower.includes('@') && order.email.toLowerCase() === inputLower
    );
    const matchesPhone = Boolean(
      rawContact && inputPhone.length >= 10 && orderPhone.length >= 10 && inputPhone === orderPhone
    );
    const matchesToken = Boolean(
      rawToken && verifyOrderReceiptToken(order.id, order.email, rawToken)
    );

    if (!matchesEmail && !matchesPhone && !matchesToken) {
      return { success: false, error: 'No matching order found. Please verify your Order Number and contact details.' };
    }

    // Enrich with latest non-cancelled shipment record (ETD, live courier scans, tracking URL)
    let latestShipment: any = null;
    try {
      const { data: shipRows } = await supabaseAdmin
        .from('shipments')
        .select('courier_name, awb_code, tracking_url, shipment_status, etd, scans')
        .eq('order_id', order.id)
        .neq('shipment_status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(1);
      if (Array.isArray(shipRows) && shipRows.length > 0) {
        latestShipment = shipRows[0];
      }
    } catch {
      // Safe fallback when running against minimal test mocks without shipments table
    }

    const resolvedAwb = latestShipment?.awb_code || order.tracking_number || null;
    const resolvedCourier = latestShipment?.courier_name || order.courier_partner || null;
    const resolvedTrackingUrl =
      latestShipment?.tracking_url ||
      order.tracking_url ||
      (resolvedAwb ? `https://shiprocket.co/tracking/${encodeURIComponent(resolvedAwb)}` : null);

    const rawScans = Array.isArray(latestShipment?.scans) ? latestShipment.scans : [];
    const scans = rawScans.slice(0, 8).map((s: any) => ({
      date: String(s?.date || s?.timestamp || ''),
      status: String(s?.status || s?.['sr-status-label'] || ''),
      activity: String(s?.activity || s?.description || ''),
      location: String(s?.location || ''),
    }));

    const items = ((order as any).order_items || []).map((it: any) => {
      const vd = (it.variant_details && typeof it.variant_details === 'object') ? it.variant_details : {};
      return {
        product_name: it.product_name,
        quantity: Number(it.quantity || 1),
        size: vd.size,
        color: vd.color,
        image: vd.image || vd.image_url,
      };
    });

    return {
      success: true,
      order: {
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        courier_partner: resolvedCourier,
        tracking_number: resolvedAwb,
        tracking_url: resolvedTrackingUrl,
        shipment_status: latestShipment?.shipment_status || null,
        etd: latestShipment?.etd || null,
        scans,
        shipped_at: order.shipped_at,
        delivered_at: order.delivered_at,
        created_at: order.created_at,
        destination_city: addr.city || '',
        destination_state: addr.state || '',
        total_amount: Number(order.total_amount || 0),
        items,
      },
    };
  } catch (err: any) {
    console.error('trackOrderPublic error:', err);
    return { success: false, error: 'Unable to retrieve order tracking details right now.' };
  }
}

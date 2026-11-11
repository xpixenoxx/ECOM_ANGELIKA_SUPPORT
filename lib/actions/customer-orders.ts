'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cancelShiprocketOrder } from '@/lib/shipping/shiprocket';

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
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancel_reason?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any> | null;
  items_count: number;
  items: CustomerOrderItem[];
  customer_name?: string;
}

/**
 * Fetch customer orders by authenticated server session, user ID, or user email.
 * Matches user_id OR email so guest checkouts and previous orders are always accurate.
 */
export async function getCustomerOrders(options?: {
  userId?: string;
  userEmail?: string;
}): Promise<{
  success: boolean;
  isAuthenticated: boolean;
  orders: CustomerOrder[];
  error?: string;
}> {
  try {
    let resolvedUserId = options?.userId?.trim() || null;
    let resolvedEmail = options?.userEmail?.trim()?.toLowerCase() || null;

    // Check server session if credentials not explicitly passed
    if (!resolvedUserId && !resolvedEmail) {
      try {
        const serverSupabase = createServerClient();
        const { data: { user } } = await serverSupabase.auth.getUser();
        if (user) {
          resolvedUserId = user.id;
          resolvedEmail = user.email ? user.email.toLowerCase() : null;
        }
      } catch (authErr) {
        // Continue with whatever credentials were provided
      }
    }

    if (!resolvedUserId && !resolvedEmail) {
      return {
        success: false,
        isAuthenticated: false,
        orders: [],
        error: 'Please sign in to view your order history.',
      };
    }

    // Build query using admin client to guarantee fast, bypass-RLS accuracy
    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (resolvedUserId && resolvedEmail) {
      query = query.or(`user_id.eq.${resolvedUserId},email.ilike.${resolvedEmail}`);
    } else if (resolvedUserId) {
      query = query.eq('user_id', resolvedUserId);
    } else if (resolvedEmail) {
      query = query.ilike('email', resolvedEmail);
    }

    const { data: rawOrders, error } = await query;

    if (error) {
      console.error('getCustomerOrders database error:', error);
      return { success: false, isAuthenticated: true, orders: [], error: error.message };
    }

    const formattedOrders: CustomerOrder[] = (rawOrders || []).map((order: any) => {
      const items: CustomerOrderItem[] = (order.order_items || []).map((it: any) => {
        const vd = it.variant_details || {};
        const img = vd.image || vd.image_url || '/images/collection-kurtis.jpg';
        return {
          ...it,
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
        courier_partner: order.courier_partner || null,
        tracking_number: order.tracking_number || null,
        shipped_at: order.shipped_at || null,
        delivered_at: order.delivered_at || null,
        cancelled_at: order.cancelled_at || null,
        cancel_reason: order.cancel_reason || null,
        notes: order.notes || null,
        created_at: order.created_at,
        updated_at: order.updated_at,
        metadata: order.metadata || null,
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
  options?: {
    userId?: string;
    userEmail?: string;
  }
): Promise<{
  success: boolean;
  order: CustomerOrder | null;
  error?: string;
}> {
  try {
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

    // Authorize caller to prevent IDOR
    const userClient = createServerClient();
    const { data: { user } } = await userClient.auth.getUser();

    let isAuthorized = false;

    if (user) {
      if (order.user_id && order.user_id === user.id) {
        isAuthorized = true;
      } else if (user.email && order.email && user.email.toLowerCase() === order.email.toLowerCase()) {
        isAuthorized = true;
      } else {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role === 'admin' || profile?.role === 'manager' || profile?.role === 'designer') {
          isAuthorized = true;
        }
      }
    } else if (options?.userId && order.user_id === options.userId) {
      isAuthorized = true;
    } else if (options?.userEmail && order.email && options.userEmail.toLowerCase() === order.email.toLowerCase()) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return { success: false, order: null, error: 'Unauthorized to view this order' };
    }

    // Fetch existing reviews for order items or products
    const rawOrderItems = order.order_items || [];
    const itemIds = rawOrderItems.map((it: any) => it.id).filter(Boolean);
    const prodIds = rawOrderItems.map((it: any) => it.product_id).filter(Boolean);

    let existingReviews: any[] = [];
    try {
      if (itemIds.length > 0) {
        const { data: revsByItem } = await supabaseAdmin
          .from('reviews')
          .select('id, product_id, order_item_id, rating, title, body, quality_rating, fit_rating, user_measurements, created_at')
          .in('order_item_id', itemIds);
        if (revsByItem && revsByItem.length > 0) {
          existingReviews = revsByItem;
        }
      }

      if (existingReviews.length === 0 && prodIds.length > 0 && order.user_id) {
        const { data: revsByProd } = await supabaseAdmin
          .from('reviews')
          .select('id, product_id, order_item_id, rating, title, body, quality_rating, fit_rating, user_measurements, created_at')
          .eq('user_id', order.user_id)
          .in('product_id', prodIds);
        if (revsByProd && revsByProd.length > 0) {
          existingReviews = revsByProd;
        }
      }
    } catch (e) {
      console.warn('Reviews fetch warning for order:', e);
    }

    // Fetch existing return requests for this order
    let existingReturns: any[] = [];
    try {
      const { data: retRows } = await supabaseAdmin
        .from('returns')
        .select('id, order_id, order_item_id, type, status, reason, reason_detail, refund_amount, exchange_size, created_at')
        .eq('order_id', order.id);
      if (retRows && retRows.length > 0) {
        existingReturns = retRows;
      }
    } catch (e) {
      console.warn('Returns fetch warning for order:', e);
    }

    // Fetch product tags for return windows
    const productReturnMap = new Map<string, number>();
    if (prodIds.length > 0) {
      try {
        const { data: prods } = await supabaseAdmin
          .from('products')
          .select('id, tags')
          .in('id', prodIds);

        (prods || []).forEach((p: any) => {
          const tag = (p.tags || []).find((t: string) => typeof t === 'string' && t.startsWith('return-days:'));
          if (tag) {
            const val = parseInt(tag.replace('return-days:', ''), 10);
            productReturnMap.set(p.id, isNaN(val) ? 7 : val);
          } else {
            productReturnMap.set(p.id, 7);
          }
        });
      } catch (pErr) {
        console.warn('Product return window fetch warning:', pErr);
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
      shipping_address: order.shipping_address || {},
      billing_address: order.billing_address || {},
      courier_partner: order.courier_partner || null,
      tracking_number: order.tracking_number || null,
      shipped_at: order.shipped_at || null,
      delivered_at: order.delivered_at || null,
      cancelled_at: order.cancelled_at || null,
      cancel_reason: order.cancel_reason || null,
      notes: order.notes || null,
      created_at: order.created_at,
      updated_at: order.updated_at,
      metadata: order.metadata || null,
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
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.orderId);
    let orderQuery = supabaseAdmin.from('orders').select('*');
    if (isUuid) {
      orderQuery = orderQuery.eq('id', data.orderId);
    } else {
      orderQuery = orderQuery.eq('order_number', data.orderId);
    }
    const { data: order, error: oErr } = await orderQuery.maybeSingle();

    if (oErr || !order) {
      return { success: false, error: 'Order not found' };
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
        const { data: p } = await supabaseAdmin
          .from('products')
          .select('id, slug')
          .or(`slug.eq.${term},name.ilike.%${term}%`)
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

    const addr: any = order.shipping_address || {};
    const defaultName = [addr.firstName, addr.lastName].filter(Boolean).join(' ') || addr.full_name || order.customer_name || 'Verified Customer';
    const reviewerName = (data.reviewerName || '').trim() || defaultName;

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
      title: data.title?.trim() || null,
      body: data.body?.trim() || null,
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

    // Resolve user_id from order or profile
    let userId = order.user_id;
    if (!userId && order.email) {
      const { data: prof } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', order.email)
        .maybeSingle();
      if (prof?.id) {
        userId = prof.id;
      }
    }
    if (!userId) {
      const { data: anyProf } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .limit(1)
        .maybeSingle();
      if (anyProf?.id) {
        userId = anyProf.id;
      }
    }

    if (!userId) {
      return { success: false, error: 'Could not associate return with a valid customer account' };
    }

    const calculatedRefund = typeof data.refundAmount === 'number' && data.refundAmount > 0
      ? data.refundAmount
      : (item.total_price || item.unit_price * item.quantity);

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
      user_id: userId,
      type: data.type === 'exchange' ? 'exchange' : 'return',
      status: 'requested',
      reason: sanitizedReason,
      reason_detail: data.reasonDetail?.trim() || null,
      refund_amount: calculatedRefund,
      pickup_address: data.pickupAddress || order.shipping_address || null,
      exchange_size: data.exchangeSize || null,
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
 * Customer Self-Service Order Cancellation Action
 *
 * Rules:
 * 1. An order can ONLY be cancelled until it is shipped (e.g. pending, confirmed, processing).
 * 2. Once the order status is 'shipped' (or 'delivered'), cancellation is strictly prohibited.
 * 3. Automatically restores variant inventory quantities in Supabase.
 * 4. Automatically syncs cancellation to Shiprocket if an order was created.
 */
export async function cancelCustomerOrder(data: {
  orderId: string;
  reason?: string;
}): Promise<{ success: boolean; error?: string; cancelled_at?: string }> {
  try {
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

    // Check optional authenticated user permissions
    try {
      const supabaseUser = await createServerClient();
      const { data: { user } } = await supabaseUser.auth.getUser();
      if (user && order.user_id && user.id !== order.user_id && user.email?.toLowerCase() !== order.email?.toLowerCase()) {
        return { success: false, error: 'You are not authorized to cancel this order' };
      }
    } catch {
      // Continue if session read fails (e.g. guest verification)
    }

    const currentStatus = (order.status || '').toLowerCase();

    // STRICT CANCELLATION RESTRICTIONS
    if (currentStatus === 'shipped') {
      return {
        success: false,
        error: 'Your order has already been shipped and handed over to our courier partner. It can no longer be cancelled. You can request a return or exchange once it arrives at your doorstep.',
      };
    }

    if (currentStatus === 'delivered') {
      return {
        success: false,
        error: 'This order has already been delivered and cannot be cancelled. You can initiate a return or exchange for your item.',
      };
    }

    if (currentStatus === 'cancelled') {
      return {
        success: false,
        error: 'This order has already been cancelled.',
      };
    }

    if (currentStatus === 'returned') {
      return {
        success: false,
        error: 'This order has already been returned and cannot be cancelled.',
      };
    }

    const cancelledAt = new Date().toISOString();
    const reason = data.reason?.trim() || 'Customer requested cancellation prior to shipment';

    // 1. Update Order in Supabase
    const { error: updateErr } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: cancelledAt,
        cancel_reason: reason,
        updated_at: cancelledAt,
        metadata: {
          ...(typeof order.metadata === 'object' && order.metadata !== null && !Array.isArray(order.metadata)
            ? order.metadata
            : {}),
          cancelled_by: 'customer',
          cancellation_recorded_at: cancelledAt,
        },
      })
      .eq('id', order.id);

    if (updateErr) {
      console.error('Failed to update order to cancelled:', updateErr);
      return { success: false, error: updateErr.message || 'Failed to cancel order' };
    }

    // 2. Restore Inventory Quantities for each variant in the order
    if (Array.isArray(order.order_items)) {
      for (const item of order.order_items) {
        if (item.variant_id && item.quantity > 0) {
          try {
            const { data: v } = await supabaseAdmin
              .from('product_variants')
              .select('inventory_quantity')
              .eq('id', item.variant_id)
              .maybeSingle();

            if (v && v.inventory_quantity !== null) {
              await supabaseAdmin
                .from('product_variants')
                .update({ inventory_quantity: v.inventory_quantity + item.quantity })
                .eq('id', item.variant_id);
            }
          } catch (invErr) {
            console.warn('[Inventory Restore Notice on Cancellation]:', invErr);
          }
        }
      }
    }

    // 3. Notify / Cancel in Shiprocket if an adhoc order was already generated
    const srOrderId = order.metadata?.['shiprocket_order_id'];
    if (srOrderId) {
      try {
        await cancelShiprocketOrder(srOrderId);
      } catch (srErr) {
        console.warn('[Shiprocket Cancellation Notice]:', srErr);
      }
    }

    // 4. Revalidate all customer and admin views
    revalidatePath('/account/orders');
    revalidatePath(`/account/orders/${order.id}`);
    revalidatePath(`/account/orders/${order.order_number}`);
    revalidatePath('/admin/orders');
    revalidatePath('/admin/orders/shipments');
    revalidatePath(`/admin/orders/${order.id}`);

    return {
      success: true,
      cancelled_at: cancelledAt,
    };
  } catch (err: any) {
    console.error('cancelCustomerOrder error:', err);
    return { success: false, error: err?.message || 'Failed to cancel order' };
  }
}

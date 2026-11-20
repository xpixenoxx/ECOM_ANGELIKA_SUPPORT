'use server';

import { hmacSha256Hex, randomInt, timingSafeEqualStrings } from '@/lib/utils/edge-crypto';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { OPS_ADMIN_ROLES, requireAdminRole } from '@/lib/supabase/admin-auth';
import { createOrderReceiptToken, verifyOrderReceiptToken } from '@/lib/utils/order-access-token';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import { getCashfreeApiBaseUrl, getCashfreeMode, getOptionalEnv } from '@/lib/env';
import { calculateOrderTotals, PRICING_CONSTANTS, toPaise, type CouponSpec } from '@/lib/pricing';
import { normalizeAddress } from '@/lib/utils/address';
import {
  INDIAN_PINCODE_REGEX,
  INDIAN_PHONE_REGEX,
  UUID_REGEX,
  normalizeIndianPhone,
  stripHtmlTags,
} from '@/lib/validators/commerce';
import type { CartItem, Address, AppliedCoupon } from '@/types/commerce';
import type { Json } from '@/types/database';

async function getSupabaseClient() {
  return createServerClient();
}

export interface OrderData {
  items: CartItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: 'cashfree' | 'razorpay' | 'cod' | 'stripe';
  email: string;
  phone: string;
  notes?: string;
  coupon?: AppliedCoupon;
  userId?: string;
  giftWrap?: boolean;
  giftMessage?: string;
  whatsappOptIn?: boolean;
  idempotencyKey?: string;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  cashfreeOrderId?: string;
  cashfreePaymentSessionId?: string;
  cashfreeEnv?: 'sandbox' | 'production';
  razorpayOrderId?: string;
  receiptToken?: string;
  error?: string;
}

function formatCouponRpcError(message: string): string {
  if (message.includes('COUPON_INVALID')) return 'Coupon is invalid or inactive';
  if (message.includes('COUPON_NOT_STARTED')) return 'Coupon is not active yet';
  if (message.includes('COUPON_EXPIRED')) return 'Coupon has expired';
  if (message.includes('COUPON_EXHAUSTED')) return 'Coupon usage limit reached';
  if (message.includes('COUPON_MIN_ORDER')) return message.split('COUPON_MIN_ORDER:')[1] || 'Minimum order value not met for coupon';
  if (message.includes('COUPON_USER_LIMIT')) return 'You have already used this coupon the maximum number of times';
  if (message.includes('COUPON_FIRST_ORDER_ONLY')) return 'This coupon is valid only on your first order';
  return 'Coupon could not be applied';
}

function formatInventoryRpcError(message: string): string {
  if (message.includes('INSUFFICIENT_STOCK:')) {
    return `Sorry, insufficient stock for ${message.split('INSUFFICIENT_STOCK:')[1]}`;
  }
  if (message.includes('VARIANT_UNAVAILABLE:')) {
    return 'One or more selected garment sizes are no longer available.';
  }
  return 'Selected inventory is currently unavailable. Please review your bag.';
}

export async function createOrder(orderData: OrderData): Promise<CreateOrderResult> {
  const userClient = await getSupabaseClient();
  const supabase = supabaseAdmin;

  try {
    // 1. Resolve session identity server-side (never trust client userId spoofing)
    const { data: { user } } = await userClient.auth.getUser();
    const userId = user?.id ?? null;

    // 2. Validate contact details, addresses & quantities
    const cleanEmail = (orderData.email || '').trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const cleanPhone = normalizeIndianPhone(orderData.phone || orderData.shippingAddress?.phone || '');
    if (!INDIAN_PHONE_REGEX.test(cleanPhone)) {
      return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
    }

    const cleanShipping = normalizeAddress({ ...orderData.shippingAddress, phone: cleanPhone, email: cleanEmail });
    if (!cleanShipping.firstName || !cleanShipping.address1 || !cleanShipping.city || !cleanShipping.state) {
      return { success: false, error: 'Complete delivery address is required.' };
    }
    if (!INDIAN_PINCODE_REGEX.test(cleanShipping.postalCode)) {
      return { success: false, error: 'Please enter a valid 6-digit Indian pincode.' };
    }

    const cleanBilling = orderData.billingAddress
      ? normalizeAddress(orderData.billingAddress)
      : cleanShipping;

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return { success: false, error: 'Your shopping bag is empty.' };
    }

    for (const item of orderData.items) {
      if (!item.variant_id || !UUID_REGEX.test(item.variant_id)) {
        return { success: false, error: 'Invalid variant identifier in bag. Please refresh your bag.' };
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
        return { success: false, error: 'Item quantity must be between 1 and 10.' };
      }
    }

    // 3. Idempotency check if key provided
    const cleanIdemKey = orderData.idempotencyKey?.trim() || null;
    if (cleanIdemKey) {
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id, order_number, email, payment_id, payment_method, status, payment_status, metadata')
        .eq('idempotency_key', cleanIdemKey)
        .maybeSingle();

      if (existingOrder && existingOrder.status !== 'cancelled') {
        const existingMeta =
          existingOrder.metadata && typeof existingOrder.metadata === 'object' && !Array.isArray(existingOrder.metadata)
            ? (existingOrder.metadata as Record<string, any>)
            : {};
        return {
          success: true,
          orderId: existingOrder.id,
          orderNumber: existingOrder.order_number,
          cashfreeOrderId:
            existingOrder.payment_method === 'cashfree'
              ? (existingMeta['cashfree_order_id'] || existingOrder.payment_id || undefined)
              : undefined,
          cashfreePaymentSessionId:
            existingOrder.payment_method === 'cashfree'
              ? (existingMeta['cashfree_payment_session_id'] || undefined)
              : undefined,
          cashfreeEnv: existingOrder.payment_method === 'cashfree' ? getCashfreeMode() : undefined,
          razorpayOrderId: existingOrder.payment_id || undefined,
          receiptToken: createOrderReceiptToken(existingOrder.id, existingOrder.email),
        };
      }
    }

    // 4. Authoritative Server Price & Active Variant Lookup (NEVER trust client item.price)
    const variantIds = Array.from(new Set(orderData.items.map((i) => i.variant_id)));
    const { data: dbVariants, error: variantsError } = await supabase
      .from('product_variants')
      .select(`
        id,
        product_id,
        size,
        price,
        inventory_quantity,
        is_active,
        color:colors(id, name, hex),
        product:products!product_variants_product_id_fkey(
          id,
          name,
          gst_slab,
          is_active,
          images:product_images!product_images_product_id_fkey(url, is_primary)
        )
      `)
      .in('id', variantIds);

    if (variantsError || !dbVariants || dbVariants.length === 0) {
      return { success: false, error: 'Could not verify selected garments. Please refresh your bag.' };
    }

    const variantMap = new Map(dbVariants.map((v: any) => [v.id, v]));
    const verifiedItems: Array<{
      product_id: string;
      variant_id: string;
      product_name: string;
      size: string;
      color: string;
      color_hex: string;
      image: string;
      unitPrice: number;
      quantity: number;
      gstSlab?: number | null;
    }> = [];

    for (const item of orderData.items) {
      const v: any = variantMap.get(item.variant_id);
      const prod = v?.product;
      if (!v || !v.is_active || !prod || !prod.is_active) {
        return { success: false, error: `${item.product_name || 'Selected item'} is no longer available.` };
      }
      const imagesArr = Array.isArray(prod.images) ? prod.images : [];
      const primaryImg =
        imagesArr.find((img: any) => img?.is_primary)?.url ||
        imagesArr[0]?.url ||
        item.image ||
        '/images/collection-kurtis.jpg';

      verifiedItems.push({
        product_id: prod.id,
        variant_id: v.id,
        product_name: prod.name || item.product_name,
        size: v.size || item.size || 'Free Size',
        color: v.color?.name || item.color || 'Classic',
        color_hex: v.color?.hex || item.color_hex || '#C9A84C',
        image: primaryImg,
        unitPrice: Number(v.price),
        quantity: item.quantity,
        gstSlab: prod.gst_slab,
      });
    }

    // 5. Initial pricing without coupon (coupon discount evaluated atomically via RPC)
    const initialTotals = calculateOrderTotals({
      items: verifiedItems.map((i) => ({
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        gstSlab: i.gstSlab,
      })),
      paymentMethod: orderData.paymentMethod,
      giftWrap: orderData.giftWrap,
    });

    const initialOrderStatus = orderData.paymentMethod === 'cod' ? 'confirmed' : 'pending';
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${randomInt(1000, 9999)}`;

    // 6. Create pending order row first so atomic reservation RPCs bind to order_id
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId,
        email: cleanEmail,
        phone: cleanPhone,
        idempotency_key: cleanIdemKey,
        shipping_address: cleanShipping as unknown as Json,
        billing_address: cleanBilling as unknown as Json,
        payment_method: orderData.paymentMethod,
        payment_status: 'pending',
        status: initialOrderStatus,
        subtotal: initialTotals.subtotal,
        shipping_cost: initialTotals.shippingCost,
        tax_amount: initialTotals.taxAmount,
        discount_amount: 0,
        total_amount: initialTotals.total,
        currency: 'INR',
        notes: orderData.notes ? stripHtmlTags(orderData.notes).slice(0, 500) : null,
        gift_wrap: Boolean(orderData.giftWrap),
        gift_message: orderData.giftMessage ? stripHtmlTags(orderData.giftMessage).slice(0, 300) : null,
        whatsapp_opt_in: orderData.whatsappOptIn !== false,
        metadata: {
          cod_fee: initialTotals.codFee,
          included_gst_amount: initialTotals.includedGstAmount,
          gift_wrap: Boolean(orderData.giftWrap),
        } as unknown as Json,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation failed:', orderError);
      return { success: false, error: orderError?.message || 'Failed to create order' };
    }

    const cleanupOrder = async (releaseInventoryFirst: boolean) => {
      if (releaseInventoryFirst) {
        try {
          await supabase.rpc('release_order_inventory', { p_order_id: order.id });
        } catch (relErr) {
          console.error('Cleanup inventory release failed:', relErr);
        }
      }
      await supabase.from('order_items').delete().eq('order_id', order.id);
      await supabase.from('orders').delete().eq('id', order.id);
    };

    // 7. Insert order items with authoritative DB unit prices
    const orderItemsPayload = verifiedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
      variant_details: {
        size: item.size,
        color: item.color,
        color_hex: item.color_hex,
        image: item.image,
      } as unknown as Json,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsError) {
      await cleanupOrder(false);
      return { success: false, error: itemsError.message || 'Failed to create order items' };
    }

    // 8. Atomic dead-lock free Inventory Reservation RPC (sorted FOR UPDATE)
    const { error: invErr } = await supabase.rpc('reserve_order_inventory', {
      p_order_id: order.id,
      p_items: verifiedItems.map((i) => ({
        variant_id: i.variant_id,
        product_id: i.product_id,
        quantity: i.quantity,
      })) as unknown as Json,
      p_ttl_minutes: 15,
    });

    if (invErr) {
      await cleanupOrder(false);
      return { success: false, error: formatInventoryRpcError(invErr.message) };
    }

    // 9. Atomic Coupon Validation & Reservation RPC (NEVER trust client discountAmount)
    let appliedCouponSpec: CouponSpec | null = null;
    if (orderData.coupon?.code?.trim()) {
      const couponRes = await supabase.rpc('reserve_coupon_for_order', {
        p_code: orderData.coupon.code.trim().toUpperCase(),
        p_order_id: order.id,
        p_subtotal: initialTotals.subtotal,
        p_user_id: userId ?? undefined,
        p_email: cleanEmail,
        p_ttl_minutes: 15,
      });

      if (couponRes.error || !couponRes.data) {
        await cleanupOrder(true);
        return {
          success: false,
          error: formatCouponRpcError(couponRes.error?.message || 'COUPON_INVALID'),
        };
      }

      const cData = couponRes.data as Record<string, any>;
      appliedCouponSpec = {
        code: String(cData['code']),
        type: String(cData['type']),
        value: Number(cData['value'] || 0),
        maxDiscountAmount: cData['discount_amount'] ? Number(cData['discount_amount']) : undefined,
      };
    }

    // 10. Compute Final Authoritative Totals (shared pricing engine)
    const finalTotals = calculateOrderTotals({
      items: verifiedItems.map((i) => ({
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        gstSlab: i.gstSlab,
      })),
      coupon: appliedCouponSpec,
      paymentMethod: orderData.paymentMethod,
      giftWrap: orderData.giftWrap,
    });

    // Enforce COD limit AFTER discount
    if (orderData.paymentMethod === 'cod' && finalTotals.total > PRICING_CONSTANTS.COD_MAX_AMOUNT) {
      await cleanupOrder(true);
      return { success: false, error: `COD orders cannot exceed ₹${PRICING_CONSTANTS.COD_MAX_AMOUNT.toLocaleString('en-IN')}` };
    }

    await supabase
      .from('orders')
      .update({
        shipping_cost: finalTotals.shippingCost,
        discount_amount: finalTotals.discountAmount,
        total_amount: finalTotals.total,
        metadata: {
          cod_fee: finalTotals.codFee,
          included_gst_amount: finalTotals.includedGstAmount,
          coupon_code: appliedCouponSpec?.code || null,
          gift_wrap: Boolean(orderData.giftWrap),
        } as unknown as Json,
      })
      .eq('id', order.id);

    // Clear user's cart if logged in (for COD orders that are immediately confirmed)
    if (userId && orderData.paymentMethod === 'cod') {
      await supabase.from('carts').delete().eq('user_id', userId);
    }

    // 11. Finalize COD or Initialize Cashfree / Razorpay Order
    const receiptToken = createOrderReceiptToken(order.id, cleanEmail);
    let razorpayOrderId: string | undefined;
    let cashfreeOrderId: string | undefined;
    let cashfreePaymentSessionId: string | undefined;
    let cashfreeEnv: 'sandbox' | 'production' | undefined;

    if (orderData.paymentMethod === 'cod') {
      await supabase.rpc('confirm_order_inventory', { p_order_id: order.id });
    } else if (orderData.paymentMethod === 'cashfree') {
      const cfResult = await createCashfreeOrder({
        internalOrderId: order.id,
        orderNumber: order.order_number,
        amountInr: finalTotals.total,
        currency: 'INR',
        customerId: userId || `guest_${cleanPhone}`,
        customerName: `${cleanShipping.firstName} ${cleanShipping.lastName || ''}`.trim() || 'Angelika Customer',
        customerEmail: cleanEmail,
        customerPhone: cleanPhone,
        receiptToken,
      });

      if (!cfResult.success || !cfResult.cfOrderId || !cfResult.paymentSessionId) {
        console.error('Cashfree order creation failed — releasing reservations & rolling back:', cfResult.error);
        await cleanupOrder(true);
        return {
          success: false,
          error: cfResult.error || 'Could not connect to Cashfree payment gateway. Please try again.',
        };
      }

      cashfreeOrderId = cfResult.cfOrderId;
      cashfreePaymentSessionId = cfResult.paymentSessionId;
      cashfreeEnv = getCashfreeMode();

      await supabase
        .from('orders')
        .update({
          payment_id: cashfreeOrderId,
          metadata: {
            cod_fee: finalTotals.codFee,
            included_gst_amount: finalTotals.includedGstAmount,
            coupon_code: appliedCouponSpec?.code || null,
            gift_wrap: Boolean(orderData.giftWrap),
            cashfree_order_id: cashfreeOrderId,
            cashfree_payment_session_id: cashfreePaymentSessionId,
          } as unknown as Json,
        })
        .eq('id', order.id);
    } else if (orderData.paymentMethod === 'razorpay') {
      const razorpayResult = await createRazorpayOrder({
        amount: toPaise(finalTotals.total),
        currency: 'INR',
        receipt: `order_${order.id}`,
        notes: {
          order_id: order.id,
          user_id: userId || 'guest',
        },
      });

      if (!razorpayResult.success || !razorpayResult.orderId) {
        console.error('Razorpay order creation failed — releasing reservations & rolling back:', razorpayResult.error);
        await cleanupOrder(true);
        return {
          success: false,
          error: razorpayResult.error || 'Could not connect to payment gateway. Please try again.',
        };
      }

      razorpayOrderId = razorpayResult.orderId;

      await supabase
        .from('orders')
        .update({
          payment_id: razorpayOrderId,
          metadata: {
            cod_fee: finalTotals.codFee,
            included_gst_amount: finalTotals.includedGstAmount,
            coupon_code: appliedCouponSpec?.code || null,
            gift_wrap: Boolean(orderData.giftWrap),
            razorpay_order_id: razorpayOrderId,
          } as unknown as Json,
        })
        .eq('id', order.id);
    }

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      cashfreeOrderId,
      cashfreePaymentSessionId,
      cashfreeEnv,
      razorpayOrderId,
      receiptToken,
    };
  } catch (error) {
    console.error('Create order error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

interface CashfreeOrderParams {
  internalOrderId: string;
  orderNumber: string;
  amountInr: number;
  currency: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  receiptToken: string;
}

interface CashfreeOrderResult {
  success: boolean;
  cfOrderId?: string;
  paymentSessionId?: string;
  error?: string;
}

async function createCashfreeOrder(params: CashfreeOrderParams): Promise<CashfreeOrderResult> {
  try {
    const appId = getOptionalEnv('CASHFREE_APP_ID');
    const secretKey = getOptionalEnv('CASHFREE_SECRET_KEY');

    if (!appId || !secretKey) {
      return { success: false, error: 'Cashfree payment gateway is not configured' };
    }

    const siteUrl = (process.env['NEXT_PUBLIC_SITE_URL'] || 'https://angelikafashions.com').replace(/\/+$/, '');
    const cfOrderId = `cf_${params.internalOrderId.replace(/-/g, '')}`;
    const baseUrl = getCashfreeApiBaseUrl();

    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        order_id: cfOrderId,
        order_amount: Number(params.amountInr.toFixed(2)),
        order_currency: params.currency,
        customer_details: {
          customer_id: params.customerId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 45),
          customer_name: params.customerName.slice(0, 100),
          customer_email: params.customerEmail,
          customer_phone: params.customerPhone,
        },
        order_meta: {
          return_url: `${siteUrl}/order-success?order_id=${params.internalOrderId}&cf_order_id={order_id}&token=${encodeURIComponent(params.receiptToken)}`,
          notify_url: `${siteUrl}/api/webhooks/cashfree`,
        },
        order_tags: {
          internal_order_id: params.internalOrderId,
          order_number: params.orderNumber,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || !data?.payment_session_id) {
      console.error('Cashfree order creation failed:', data);
      return {
        success: false,
        error: data?.message || 'Failed to initialize Cashfree payment session',
      };
    }

    return {
      success: true,
      cfOrderId: data.order_id || cfOrderId,
      paymentSessionId: data.payment_session_id,
    };
  } catch (error) {
    console.error('Cashfree order error:', error);
    return { success: false, error: 'Failed to create Cashfree payment order' };
  }
}

export async function verifyCashfreePayment(
  cashfreeOrderId: string
): Promise<{ success: boolean; orderId?: string; receiptToken?: string; error?: string }> {
  try {
    const appId = getOptionalEnv('CASHFREE_APP_ID');
    const secretKey = getOptionalEnv('CASHFREE_SECRET_KEY');
    if (!appId || !secretKey) {
      return { success: false, error: 'Cashfree not configured' };
    }

    const cleanCfOrderId = (cashfreeOrderId || '').trim();
    if (!cleanCfOrderId) {
      return { success: false, error: 'Missing Cashfree order ID' };
    }

    const baseUrl = getCashfreeApiBaseUrl();
    const response = await fetch(`${baseUrl}/orders/${encodeURIComponent(cleanCfOrderId)}`, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
        Accept: 'application/json',
      },
    });

    const cfOrder = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: cfOrder?.message || 'Could not verify payment status with Cashfree',
      };
    }

    if (cfOrder?.order_status !== 'PAID') {
      return {
        success: false,
        error: `Payment status is ${cfOrder?.order_status || 'PENDING'}. If your account was debited, it will update automatically.`,
      };
    }

    const supabase = supabaseAdmin;
    const internalOrderIdFromTags = cfOrder?.order_tags?.internal_order_id;

    let query = supabase
      .from('orders')
      .select('id, user_id, email, total_amount, metadata, payment_status, status');

    if (internalOrderIdFromTags && UUID_REGEX.test(internalOrderIdFromTags)) {
      query = query.eq('id', internalOrderIdFromTags);
    } else {
      query = query.eq('payment_id', cleanCfOrderId);
    }

    const { data: order, error: findError } = await query.maybeSingle();

    if (findError || !order) {
      return { success: false, error: 'Order not found' };
    }

    if (Number(cfOrder.order_amount || 0) < Number(order.total_amount || 0)) {
      return { success: false, error: 'Payment amount mismatch' };
    }

    if (order.payment_status === 'paid') {
      return {
        success: true,
        orderId: order.id,
        receiptToken: createOrderReceiptToken(order.id, order.email),
      };
    }

    // Confirm atomic inventory & coupon reservation
    const confirmRes = await supabase.rpc('confirm_order_inventory', { p_order_id: order.id });
    const confirmData = confirmRes.data as { confirmed?: boolean; stock_conflict?: boolean } | null;

    const existingMeta =
      typeof order.metadata === 'object' && order.metadata !== null && !Array.isArray(order.metadata)
        ? (order.metadata as Record<string, unknown>)
        : {};

    if (confirmRes.error || confirmData?.stock_conflict) {
      await supabase
        .from('orders')
        .update({
          metadata: {
            ...existingMeta,
            stock_conflict: true,
            cashfree_order_id: cleanCfOrderId,
            cf_order_id: cfOrder.cf_order_id,
          } as unknown as Json,
        })
        .eq('id', order.id);

      return {
        success: false,
        error: 'Item sold out during payment window. Our team will initiate an immediate automatic refund.',
      };
    }

    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        metadata: {
          ...existingMeta,
          cashfree_order_id: cleanCfOrderId,
          cf_order_id: cfOrder.cf_order_id,
          paid_at: new Date().toISOString(),
        } as unknown as Json,
      })
      .eq('id', order.id);

    if (order.user_id) {
      await supabase.from('carts').delete().eq('user_id', order.user_id);
    }

    return {
      success: true,
      orderId: order.id,
      receiptToken: createOrderReceiptToken(order.id, order.email),
    };
  } catch (error) {
    console.error('Verify Cashfree payment error:', error);
    return { success: false, error: 'Cashfree payment verification failed' };
  }
}

interface RazorpayOrderParams {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

interface RazorpayOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

async function createRazorpayOrder(params: RazorpayOrderParams): Promise<RazorpayOrderResult> {
  try {
    const keyId = process.env['RAZORPAY_KEY_ID'];
    const keySecret = process.env['RAZORPAY_KEY_SECRET'];

    if (!keyId || !keySecret) {
      return { success: false, error: 'Razorpay not configured' };
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency,
        receipt: params.receipt,
        notes: params.notes,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay order creation failed:', data);
      return { success: false, error: data.error?.description || 'Failed to create Razorpay order' };
    }

    return { success: true, orderId: data.id };
  } catch (error) {
    console.error('Razorpay order error:', error);
    return { success: false, error: 'Failed to create payment order' };
  }
}

export async function verifyRazorpayPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<{ success: boolean; orderId?: string; receiptToken?: string; error?: string }> {
  try {
    const keySecret = process.env['RAZORPAY_KEY_SECRET'];
    if (!keySecret) {
      return { success: false, error: 'Razorpay not configured' };
    }

    const expectedSignature = hmacSha256Hex(keySecret, `${razorpayOrderId}|${razorpayPaymentId}`);

    if (!timingSafeEqualStrings(expectedSignature, razorpaySignature.toLowerCase())) {
      return { success: false, error: 'Invalid payment signature' };
    }

    const supabase = supabaseAdmin;

    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('id, user_id, email, metadata, payment_status, status')
      .eq('payment_id', razorpayOrderId)
      .single();

    if (findError || !order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.payment_status === 'paid') {
      return {
        success: true,
        orderId: order.id,
        receiptToken: createOrderReceiptToken(order.id, order.email),
      };
    }

    // Confirm atomic inventory & coupon reservation
    const confirmRes = await supabase.rpc('confirm_order_inventory', { p_order_id: order.id });
    const confirmData = confirmRes.data as { confirmed?: boolean; stock_conflict?: boolean } | null;

    if (confirmRes.error || confirmData?.stock_conflict) {
      const existingMeta = (typeof order.metadata === 'object' && order.metadata !== null && !Array.isArray(order.metadata))
        ? (order.metadata as Record<string, unknown>)
        : {};
      await supabase
        .from('orders')
        .update({
          metadata: {
            ...existingMeta,
            stock_conflict: true,
            razorpay_payment_id: razorpayPaymentId,
          } as unknown as Json,
        })
        .eq('id', order.id);

      return {
        success: false,
        error: 'Item sold out during payment window. Our team will initiate an immediate automatic refund.',
      };
    }

    const existingMeta = (typeof order.metadata === 'object' && order.metadata !== null && !Array.isArray(order.metadata))
      ? (order.metadata as Record<string, unknown>)
      : {};

    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        metadata: {
          ...existingMeta,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
          paid_at: new Date().toISOString(),
        } as unknown as Json,
      })
      .eq('id', order.id);

    // Clear server cart now that payment is confirmed
    if (order.user_id) {
      await supabase.from('carts').delete().eq('user_id', order.user_id);
    }

    return {
      success: true,
      orderId: order.id,
      receiptToken: createOrderReceiptToken(order.id, order.email),
    };
  } catch (error) {
    console.error('Verify payment error:', error);
    return { success: false, error: 'Payment verification failed' };
  }
}

export async function getOrderById(orderId: string, receiptToken?: string | null) {
  try {
    const userClient = await getSupabaseClient();
    const { data: { user } } = await userClient.auth.getUser();
    const adminAuth = user ? await requireAdminRole(OPS_ADMIN_ROLES) : null;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .maybeSingle();

    if (error || !order) return null;

    const isOwner = Boolean(
      user &&
      ((order.user_id && order.user_id === user.id) ||
        (user.email && order.email.toLowerCase() === user.email.toLowerCase()))
    );
    const hasValidReceiptToken = Boolean(
      receiptToken && verifyOrderReceiptToken(order.id, order.email, receiptToken)
    );

    if (!isOwner && !hasValidReceiptToken && !adminAuth?.authorized) {
      return null;
    }

    return order;
  } catch (err) {
    console.error('Failed to get order:', err);
    return null;
  }
}

export async function getUserAddresses(userId?: string): Promise<(Address & { id: string; is_default?: boolean })[]> {
  try {
    const userClient = await getSupabaseClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user || (userId && user.id !== userId)) {
      return [];
    }

    const supabase = supabaseAdmin;
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .maybeSingle();

    const prefs = (profile?.preferences && typeof profile.preferences === 'object')
      ? (profile.preferences as Record<string, any>)
      : {};

    const addresses = Array.isArray(prefs['addresses']) ? prefs['addresses'] : [];
    const { normalizeAddress, toCheckoutAddress } = await import('@/lib/utils/address');
    return addresses.map((raw: any) => ({
      ...toCheckoutAddress(raw),
      id: normalizeAddress(raw).id || String(raw?.id || ''),
      is_default: Boolean(raw?.is_default ?? raw?.isDefault),
    }));
  } catch (err) {
    console.error('Failed to get user addresses:', err);
    return [];
  }
}

export async function saveAddress(userId: string, address: Omit<Address, 'id'> & { id?: string; is_default?: boolean }) {
  try {
    const userClient = await getSupabaseClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user || (userId && user.id !== userId)) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = supabaseAdmin;
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .maybeSingle();

    const prefs = (profile?.preferences && typeof profile.preferences === 'object')
      ? (profile.preferences as Record<string, any>)
      : {};

    const existing: any[] = Array.isArray(prefs['addresses']) ? prefs['addresses'] : [];
    const newAddressId = address.id || `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const { toSavedAddress, toCheckoutAddress } = await import('@/lib/utils/address');
    const unified = toSavedAddress(
      { ...address, id: newAddressId, is_default: address.is_default ?? existing.length === 0 },
      newAddressId
    );
    const checkoutShape = toCheckoutAddress(unified as unknown as Record<string, unknown>);
    const newAddr = {
      ...unified,
      ...checkoutShape,
      id: newAddressId,
      is_default: unified.is_default,
    };

    const updated = [newAddr, ...existing.filter(a => a.id !== newAddressId).map(a => address.is_default ? { ...a, is_default: false } : a)];

    await supabase
      .from('profiles')
      .update({
        preferences: {
          ...prefs,
          addresses: updated,
        },
      })
      .eq('id', user.id);

    return { success: true, address: newAddr };
  } catch (err: any) {
    console.error('Failed to save address:', err);
    return { success: false, error: err?.message || 'Failed to save address' };
  }
}

export async function convertGuestToAccount({
  orderId,
  email,
  password,
  receiptToken,
}: {
  orderId: string;
  email: string;
  password: string;
  receiptToken?: string | null;
}) {
  try {
    const supabase = supabaseAdmin;
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long' };
    }

    const rl = checkRateLimit(`guest_convert:${orderId}:${cleanEmail}`, 5, 15 * 60 * 1000);
    if (!rl.allowed) {
      return { success: false, error: 'Too many activation attempts. Please try again later.' };
    }

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, user_id, email')
      .eq('id', orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.user_id) {
      return { success: false, error: 'Order is already linked to an account. Please sign in.' };
    }

    if (order.email.toLowerCase() !== cleanEmail) {
      return { success: false, error: 'Email does not match order email' };
    }

    if (!receiptToken || !verifyOrderReceiptToken(order.id, order.email, receiptToken)) {
      return { success: false, error: 'Order verification token is missing or expired. Please sign up on /register.' };
    }

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { role: 'customer' },
    });

    if (createError) {
      if (createError.message.toLowerCase().includes('already registered')) {
        return { success: false, error: 'An account with this email already exists. Please sign in.' };
      }
      return { success: false, error: createError.message };
    }

    const userId = newUser?.user?.id;
    if (userId) {
      await supabase
        .from('orders')
        .update({ user_id: userId })
        .eq('id', order.id)
        .is('user_id', null)
        .ilike('email', cleanEmail);

      await supabase.from('profiles').upsert({
        id: userId,
        email: cleanEmail,
        role: 'customer',
      });

      return { success: true, message: 'VIP Account activated successfully! Your order is linked.' };
    }

    return { success: false, error: 'Could not complete registration' };
  } catch (err: any) {
    console.error('convertGuestToAccount error:', err);
    return { success: false, error: err.message || 'Failed to create account' };
  }
}

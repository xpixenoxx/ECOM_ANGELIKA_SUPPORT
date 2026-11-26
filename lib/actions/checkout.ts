'use server';

import { randomInt } from '@/lib/utils/edge-crypto';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { OPS_ADMIN_ROLES, requireAdminRole } from '@/lib/supabase/admin-auth';
import { createOrderReceiptToken, verifyOrderReceiptToken } from '@/lib/utils/order-access-token';
import { checkRateLimitAsync } from '@/lib/utils/rate-limit';
import { getRazorpayConfig, type RazorpayMode } from '@/lib/env';
import { revalidatePath } from 'next/cache';
import { calculateOrderTotals, PRICING_CONSTANTS, toPaise, type CouponSpec } from '@/lib/pricing';
import { normalizeAddress } from '@/lib/utils/address';
import {
  INDIAN_PINCODE_REGEX,
  INDIAN_PHONE_REGEX,
  UUID_REGEX,
  normalizeIndianPhone,
  stripHtmlTags,
} from '@/lib/validators/commerce';
import {
  RAZORPAY_MIN_INR_PAISE,
  captureRazorpayPayment,
  createRazorpayGatewayOrder,
  fetchRazorpayPayment,
  verifyRazorpayCheckoutSignature,
} from '@/lib/services/razorpay';
import { confirmAndMarkOrderPaid } from '@/lib/actions/payments';
import { sendOrderConfirmedNotification } from '@/lib/actions/notifications';
import type { CartItem, Address, AppliedCoupon } from '@/types/commerce';
import type { Json } from '@/types/database';

async function getSupabaseClient() {
  return createServerClient();
}

export interface OrderData {
  items: CartItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: 'razorpay' | 'cod';
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
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  razorpayMode?: RazorpayMode | null;
  amountPaise?: number;
  currency?: string;
  receiptToken?: string;
  error?: string;
}

function formatCouponRpcError(message: string): string {
  if (message.includes('COUPON_INVALID')) return 'Coupon is invalid or inactive';
  if (message.includes('COUPON_NOT_STARTED')) return 'Coupon is not active yet';
  if (message.includes('COUPON_EXPIRED')) return 'Coupon has expired';
  if (message.includes('COUPON_EXHAUSTED')) return 'Coupon usage limit reached';
  if (message.includes('COUPON_MIN_ORDER'))
    return message.split('COUPON_MIN_ORDER:')[1] || 'Minimum order value not met for coupon';
  if (message.includes('COUPON_USER_LIMIT'))
    return 'You have already used this coupon the maximum number of times';
  if (message.includes('COUPON_FIRST_ORDER_ONLY'))
    return 'This coupon is valid only on your first order';
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
    const {
      data: { user },
    } = await userClient.auth.getUser();
    const userId = user?.id ?? null;

    // 2. Validate payment method explicitly (Razorpay is sole online gateway + COD)
    if (orderData.paymentMethod !== 'razorpay' && orderData.paymentMethod !== 'cod') {
      return { success: false, error: 'Unsupported payment method. Please select Online Payment (Razorpay) or COD.' };
    }

    // Fail fast before touching DB if Razorpay is selected but misconfigured
    const rzpCfg = orderData.paymentMethod === 'razorpay' ? getRazorpayConfig() : null;
    if (orderData.paymentMethod === 'razorpay') {
      if (rzpCfg?.mismatchError) {
        return { success: false, error: 'Online payment configuration mismatch. Please contact support.' };
      }
      if (!rzpCfg?.configured || !rzpCfg.keyId) {
        return { success: false, error: 'Razorpay online payment is currently unavailable. Please try again later or choose Cash on Delivery.' };
      }
    }

    // 3. Validate contact details, addresses & quantities
    const cleanEmail = (orderData.email || '').trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const cleanPhone = normalizeIndianPhone(orderData.phone || orderData.shippingAddress?.phone || '');
    if (!INDIAN_PHONE_REGEX.test(cleanPhone)) {
      return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
    }

    const cleanShipping = normalizeAddress({
      ...orderData.shippingAddress,
      phone: cleanPhone,
      email: cleanEmail,
    });
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

    const normalizedItems: CartItem[] = [];
    for (const rawItem of orderData.items) {
      let resolvedVariantId = rawItem.variant_id;

      if (!resolvedVariantId || !UUID_REGEX.test(resolvedVariantId)) {
        try {
          let candidateProductId =
            rawItem.product_id && UUID_REGEX.test(rawItem.product_id)
              ? rawItem.product_id
              : null;

          if (!candidateProductId && resolvedVariantId && !resolvedVariantId.startsWith('var-')) {
            const { data: prodBySlug } = await supabase
              .from('products')
              .select('id')
              .eq('slug', resolvedVariantId)
              .eq('is_active', true)
              .maybeSingle();
            candidateProductId = prodBySlug?.id || null;
          }

          if (!candidateProductId && rawItem.product_name?.trim()) {
            const { data: prodByName } = await supabase
              .from('products')
              .select('id')
              .ilike('name', rawItem.product_name.trim())
              .eq('is_active', true)
              .limit(1)
              .maybeSingle();
            candidateProductId = prodByName?.id || null;
          }

          if (candidateProductId) {
            const { data: activeVariant } = await supabase
              .from('product_variants')
              .select('id')
              .eq('product_id', candidateProductId)
              .eq('is_active', true)
              .order('sort_order', { ascending: true })
              .limit(1)
              .maybeSingle();

            if (activeVariant?.id) {
              resolvedVariantId = activeVariant.id;
            }
          }
        } catch {
          // Fall through to strict UUID validation below
        }
      }

      if (!resolvedVariantId || !UUID_REGEX.test(resolvedVariantId)) {
        return { success: false, error: 'Invalid variant identifier in bag. Please refresh your bag.' };
      }
      if (!Number.isInteger(rawItem.quantity) || rawItem.quantity < 1 || rawItem.quantity > 10) {
        return { success: false, error: 'Item quantity must be between 1 and 10.' };
      }

      normalizedItems.push({ ...rawItem, variant_id: resolvedVariantId });
    }

    // 4. Scoped idempotency check (binds ownership to email or authenticated userId to prevent cross-user token leaks)
    const cleanIdemKey = orderData.idempotencyKey?.trim().slice(0, 100) || null;
    if (cleanIdemKey) {
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id, order_number, user_id, email, payment_id, payment_method, status, payment_status, total_amount, currency, metadata')
        .eq('idempotency_key', cleanIdemKey)
        .maybeSingle();

      if (existingOrder && existingOrder.status !== 'cancelled') {
        const ownsExisting =
          existingOrder.email.toLowerCase() === cleanEmail ||
          Boolean(userId && existingOrder.user_id && existingOrder.user_id === userId);

        if (!ownsExisting) {
          return {
            success: false,
            error: 'Checkout session expired. Please refresh the page and try again.',
          };
        }

        // If online payment is already paid, return safely without creating a duplicate Razorpay order
        if (existingOrder.payment_status === 'paid' || existingOrder.payment_method === 'cod') {
          return {
            success: true,
            orderId: existingOrder.id,
            orderNumber: existingOrder.order_number,
            razorpayOrderId: existingOrder.payment_id || undefined,
            razorpayKeyId: rzpCfg?.keyId || undefined,
            razorpayMode: rzpCfg?.mode ?? null,
            amountPaise: toPaise(Number(existingOrder.total_amount)),
            currency: existingOrder.currency || 'INR',
            receiptToken: createOrderReceiptToken(existingOrder.id, existingOrder.email),
          };
        }

        // Reuse existing pending Razorpay order on retry / double-click
        if (existingOrder.payment_method === 'razorpay' && existingOrder.payment_id) {
          return {
            success: true,
            orderId: existingOrder.id,
            orderNumber: existingOrder.order_number,
            razorpayOrderId: existingOrder.payment_id,
            razorpayKeyId: rzpCfg?.keyId || undefined,
            razorpayMode: rzpCfg?.mode ?? null,
            amountPaise: toPaise(Number(existingOrder.total_amount)),
            currency: existingOrder.currency || 'INR',
            receiptToken: createOrderReceiptToken(existingOrder.id, existingOrder.email),
          };
        }
      }
    }

    // 5. Authoritative Server Price & Active Variant Lookup (NEVER trust client item.price)
    const variantIds = Array.from(new Set(normalizedItems.map((i) => i.variant_id)));
    const { data: dbVariants, error: variantsError } = await supabase
      .from('product_variants')
      .select(`
        id,
        product_id,
        size,
        price,
        inventory_quantity,
        is_active,
        weight_grams,
        color:colors(id, name, hex),
        product:products!product_variants_product_id_fkey(
          id,
          name,
          sku,
          hsn_code,
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
      sku: string;
      hsn_code: string | null;
      weight_grams: number | null;
      size: string;
      color: string;
      color_hex: string;
      image: string;
      unitPrice: number;
      quantity: number;
      gstSlab?: number | null;
    }> = [];

    for (const item of normalizedItems) {
      const v: any = variantMap.get(item.variant_id);
      const prod = v?.product;
      if (!v || !v.is_active || !prod || !prod.is_active) {
        return {
          success: false,
          error: `${item.product_name || 'Selected item'} is no longer available.`,
        };
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
        sku: prod.sku || `AF-${String(v.id).slice(0, 8).toUpperCase()}`,
        hsn_code: prod.hsn_code || null,
        weight_grams: v.weight_grams ? Number(v.weight_grams) : null,
        size: v.size || item.size || 'Free Size',
        color: v.color?.name || item.color || 'Classic',
        color_hex: v.color?.hex || item.color_hex || '#C9A84C',
        image: primaryImg,
        unitPrice: Number(v.price),
        quantity: item.quantity,
        gstSlab: prod.gst_slab,
      });
    }

    // 6. Initial pricing without coupon (coupon discount evaluated atomically via RPC)
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

    // 7. Create local order row first so atomic reservation RPCs bind to order_id
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

    // 8. Insert order items with authoritative DB unit prices, SKUs, and GST rates
    const orderItemsPayload = verifiedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
      gst_rate: item.gstSlab ?? (item.unitPrice <= PRICING_CONSTANTS.APPAREL_GST_LOW_THRESHOLD ? 5 : 12),
      variant_details: {
        size: item.size,
        color: item.color,
        color_hex: item.color_hex,
        image: item.image,
        sku: item.sku,
        hsn_code: item.hsn_code,
        weight_grams: item.weight_grams,
      } as unknown as Json,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);
    if (itemsError) {
      await cleanupOrder(false);
      return { success: false, error: itemsError.message || 'Failed to create order items' };
    }

    // 9. Atomic deadlock-free Inventory Reservation RPC (sorted FOR UPDATE)
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

    // 10. Atomic Coupon Validation & Reservation RPC (NEVER trust client discountAmount)
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

    // 11. Compute Final Authoritative Totals in rupees & integer paise
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

    const amountPaise = toPaise(finalTotals.total);

    // Enforce COD limit AFTER discount
    if (orderData.paymentMethod === 'cod' && finalTotals.total > PRICING_CONSTANTS.COD_MAX_AMOUNT) {
      await cleanupOrder(true);
      return {
        success: false,
        error: `COD orders cannot exceed ₹${PRICING_CONSTANTS.COD_MAX_AMOUNT.toLocaleString('en-IN')}`,
      };
    }

    // Enforce Razorpay minimum INR amount
    if (orderData.paymentMethod === 'razorpay' && amountPaise < RAZORPAY_MIN_INR_PAISE) {
      await cleanupOrder(true);
      return {
        success: false,
        error: 'Payable order total must be at least ₹1 for online payment.',
      };
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
          amount_paise: amountPaise,
        } as unknown as Json,
      })
      .eq('id', order.id);

    const receiptToken = createOrderReceiptToken(order.id, cleanEmail);

    // 12. Finalize COD or Initialize Razorpay Order
    if (orderData.paymentMethod === 'cod') {
      await supabase.rpc('confirm_order_inventory', { p_order_id: order.id });
      if (userId) {
        await supabase.from('carts').delete().eq('user_id', userId);
      }
      await sendOrderConfirmedNotification(order.id);
      try {
        revalidatePath('/admin/orders');
        revalidatePath('/admin');
        revalidatePath('/account/orders');
      } catch {
        // Non-blocking outside request context
      }

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        amountPaise,
        currency: 'INR',
        receiptToken,
      };
    }

    // Razorpay Standard Checkout order creation
    const rzpResult = await createRazorpayGatewayOrder({
      amountPaise,
      currency: 'INR',
      receipt: order.order_number,
      notes: {
        order_id: order.id,
        order_number: order.order_number,
        user_id: userId || 'guest',
      },
    });

    if (!rzpResult.success || !rzpResult.data?.id) {
      console.error('Razorpay order creation failed — releasing reservations & rolling back:', rzpResult.error);
      await cleanupOrder(true);
      return {
        success: false,
        error: rzpResult.error || 'Could not connect to Razorpay payment gateway. Please try again.',
      };
    }

    const razorpayOrderId = rzpResult.data.id;

    const { error: linkErr } = await supabase
      .from('orders')
      .update({
        payment_id: razorpayOrderId,
        metadata: {
          cod_fee: finalTotals.codFee,
          included_gst_amount: finalTotals.includedGstAmount,
          coupon_code: appliedCouponSpec?.code || null,
          gift_wrap: Boolean(orderData.giftWrap),
          amount_paise: amountPaise,
          razorpay_order_id: razorpayOrderId,
          razorpay_mode: rzpResult.mode || rzpCfg?.mode || null,
        } as unknown as Json,
      })
      .eq('id', order.id);

    if (linkErr) {
      // Log linkage failure explicitly for reconciliation rather than silently losing the gateway order ID
      console.error(
        JSON.stringify({
          service: 'checkout',
          event: 'razorpay_order_link_failed',
          orderId: order.id,
          orderNumber: order.order_number,
          razorpayOrderId,
          error: linkErr.message,
        })
      );
      await cleanupOrder(true);
      return {
        success: false,
        error: 'Could not finalize payment session. Please try again.',
      };
    }

    try {
      revalidatePath('/admin/orders');
      revalidatePath('/admin');
      revalidatePath('/account/orders');
    } catch {
      // Non-blocking outside request context
    }

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      razorpayOrderId,
      razorpayKeyId: rzpCfg?.keyId || undefined,
      razorpayMode: rzpResult.mode || rzpCfg?.mode || null,
      amountPaise,
      currency: 'INR',
      receiptToken,
    };
  } catch (error) {
    console.error('Create order error:', error);
    return { success: false, error: 'An unexpected error occurred while creating your order.' };
  }
}

/**
 * Authoritative Server-Side Razorpay Payment Verification
 *
 * 1. Validates field formats and timing-safe HMAC-SHA256 signature (`order_id|payment_id`)
 * 2. Resolves internal order strictly via server-stored `orders.payment_id = razorpayOrderId`
 * 3. Queries Razorpay `GET /v1/payments/{paymentId}` to independently confirm:
 *    - `payment.order_id === razorpayOrderId`
 *    - `payment.currency === 'INR'`
 *    - `payment.amount === toPaise(order.total_amount)`
 *    - `payment.status === 'captured'` (attempts server capture if `'authorized'`)
 * 4. Confirms inventory atomically & dispatches idempotent confirmation email
 */
export async function verifyRazorpayPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<{
  success: boolean;
  status?: 'paid' | 'pending_capture';
  orderId?: string;
  orderNumber?: string;
  receiptToken?: string;
  error?: string;
}> {
  try {
    const sigCheck = verifyRazorpayCheckoutSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!sigCheck.valid) {
      return { success: false, error: sigCheck.error || 'Invalid payment signature' };
    }

    const cleanOrderId = razorpayOrderId.trim();
    const cleanPaymentId = razorpayPaymentId.trim();

    const { data: order, error: findError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, user_id, email, total_amount, currency, metadata, payment_status, status')
      .eq('payment_id', cleanOrderId)
      .maybeSingle();

    if (findError || !order) {
      return { success: false, error: 'Order not found for this payment session.' };
    }

    if (order.payment_status === 'paid') {
      return {
        success: true,
        status: 'paid',
        orderId: order.id,
        orderNumber: order.order_number,
        receiptToken: createOrderReceiptToken(order.id, order.email),
      };
    }

    // Authoritative server-to-server check against Razorpay Payments API
    const expectedPaise = toPaise(Number(order.total_amount));
    const gwPaymentRes = await fetchRazorpayPayment(cleanPaymentId);
    if (!gwPaymentRes.success || !gwPaymentRes.data) {
      return {
        success: false,
        error: gwPaymentRes.error || 'Could not confirm payment status with Razorpay. Please wait a moment.',
      };
    }

    let gwPayment = gwPaymentRes.data;

    if (gwPayment.order_id !== cleanOrderId) {
      return { success: false, error: 'Payment does not belong to this Razorpay order.' };
    }

    if ((gwPayment.currency || '').toUpperCase() !== (order.currency || 'INR').toUpperCase()) {
      return { success: false, error: 'Payment currency mismatch.' };
    }

    if (Number(gwPayment.amount) !== expectedPaise) {
      return { success: false, error: 'Payment amount does not match authoritative order total.' };
    }

    // Handle authorized-but-not-yet-captured payments explicitly
    if (gwPayment.status === 'authorized') {
      const capRes = await captureRazorpayPayment({
        paymentId: cleanPaymentId,
        amountPaise: expectedPaise,
        currency: order.currency || 'INR',
      });
      if (capRes.success && capRes.data?.status === 'captured') {
        gwPayment = capRes.data;
      } else {
        const existingMeta =
          typeof order.metadata === 'object' && order.metadata !== null && !Array.isArray(order.metadata)
            ? (order.metadata as Record<string, unknown>)
            : {};
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'authorized',
            metadata: {
              ...existingMeta,
              razorpay_payment_id: cleanPaymentId,
              razorpay_payment_method: gwPayment.method || null,
            } as unknown as Json,
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.id);

        return {
          success: true,
          status: 'pending_capture',
          orderId: order.id,
          orderNumber: order.order_number,
          receiptToken: createOrderReceiptToken(order.id, order.email),
        };
      }
    }

    if (gwPayment.status !== 'captured') {
      return {
        success: false,
        error: `Payment status is "${gwPayment.status}". Order cannot be confirmed until payment is captured.`,
      };
    }

    const confirmRes = await confirmAndMarkOrderPaid({
      order,
      provider: 'razorpay',
      paymentId: cleanPaymentId,
      extraMeta: {
        razorpay_payment_method: gwPayment.method || null,
        razorpay_amount_paise: gwPayment.amount,
      },
    });

    if (confirmRes.stockConflict) {
      return {
        success: false,
        error:
          'An item sold out while your payment was settling. An automatic Razorpay refund has been initiated.',
      };
    }

    return {
      success: true,
      status: 'paid',
      orderId: order.id,
      orderNumber: order.order_number,
      receiptToken: createOrderReceiptToken(order.id, order.email),
    };
  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    return { success: false, error: 'Payment verification failed' };
  }
}

export async function getOrderById(orderId: string, receiptToken?: string | null) {
  try {
    const userClient = await getSupabaseClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();
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

export async function getUserAddresses(
  userId?: string
): Promise<(Address & { id: string; is_default?: boolean })[]> {
  try {
    const userClient = await getSupabaseClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user || (userId && user.id !== userId)) {
      return [];
    }

    const supabase = supabaseAdmin;
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .maybeSingle();

    const prefs =
      profile?.preferences && typeof profile.preferences === 'object'
        ? (profile.preferences as Record<string, any>)
        : {};

    const addresses = Array.isArray(prefs['addresses']) ? prefs['addresses'] : [];
    const { normalizeAddress: norm, toCheckoutAddress } = await import('@/lib/utils/address');
    return addresses.map((raw: any) => ({
      ...toCheckoutAddress(raw),
      id: norm(raw).id || String(raw?.id || ''),
      is_default: Boolean(raw?.is_default ?? raw?.isDefault),
    }));
  } catch (err) {
    console.error('Failed to get user addresses:', err);
    return [];
  }
}

export async function saveAddress(
  userId: string,
  address: Omit<Address, 'id'> & { id?: string; is_default?: boolean }
) {
  try {
    const userClient = await getSupabaseClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user || (userId && user.id !== userId)) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = supabaseAdmin;
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .maybeSingle();

    const prefs =
      profile?.preferences && typeof profile.preferences === 'object'
        ? (profile.preferences as Record<string, any>)
        : {};

    const existing: any[] = Array.isArray(prefs['addresses']) ? prefs['addresses'] : [];
    const newAddressId =
      address.id || `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
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

    const updated = [
      newAddr,
      ...existing
        .filter((a) => a.id !== newAddressId)
        .map((a) => (address.is_default ? { ...a, is_default: false } : a)),
    ];

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

    const rl = await checkRateLimitAsync(`guest_convert:${orderId}:${cleanEmail}`, 5, 15 * 60 * 1000);
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
      return {
        success: false,
        error: 'Order verification token is missing or expired. Please sign up on /register.',
      };
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

      return { success: true, message: 'Account activated successfully! Your order is now linked.' };
    }

    return { success: false, error: 'Could not complete registration' };
  } catch (err: any) {
    console.error('convertGuestToAccount error:', err);
    return { success: false, error: err.message || 'Failed to create account' };
  }
}

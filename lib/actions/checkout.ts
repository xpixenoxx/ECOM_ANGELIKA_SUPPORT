'use server';

import { createClient as createServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import type { CartItem, Address, CheckoutFormData, AppliedCoupon } from '@/types/commerce';
import { sendOrderConfirmationEmail } from '@/lib/email/order-confirmation';
import { createShiprocketOrder } from '@/lib/shipping/shiprocket';

async function getSupabaseClient() {
  return createServerClient();
}

/**
 * Checks whether a given customer (by userId, email, or phone) has any previous
 * non-cancelled orders in the database.
 */
export async function checkCustomerFirstOrderEligibility(params: {
  userId?: string | null;
  email?: string | null;
  phone?: string | null;
}): Promise<{
  isFirstOrder: boolean;
  orderCount: number;
}> {
  const conditions: string[] = [];
  if (params.userId) {
    conditions.push(`user_id.eq.${params.userId}`);
  }
  if (params.email && params.email.trim()) {
    conditions.push(`email.ilike.${params.email.trim()}`);
  }
  const cleanPhone = (params.phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.length >= 10) {
    conditions.push(`phone.ilike.%${cleanPhone.slice(-10)}%`);
  } else if (params.phone && params.phone.trim()) {
    conditions.push(`phone.eq.${params.phone.trim()}`);
  }

  if (conditions.length === 0) {
    return { isFirstOrder: true, orderCount: 0 };
  }

  const { count, error } = await supabaseAdmin
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .or(conditions.join(','))
    .neq('status', 'cancelled');

  if (error) {
    console.warn('checkCustomerFirstOrderEligibility query error:', error);
    return { isFirstOrder: true, orderCount: 0 };
  }

  const orderCount = count || 0;
  return {
    isFirstOrder: orderCount === 0,
    orderCount,
  };
}

/**
 * Server action to validate a coupon against database rules, limits, and first-time customer eligibility.
 */
export async function validateCouponAction(
  code: string,
  context?: {
    subtotal?: number;
    email?: string;
    phone?: string;
    userId?: string;
  }
): Promise<{
  valid: boolean;
  error?: string;
  coupon?: {
    code: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    discountAmount: number;
    first_order_only?: boolean;
    min_order_amount?: number;
    max_discount_amount?: number;
  };
}> {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, error: 'Please enter a coupon code' };
  }

  // 1. Fetch coupon from database via supabaseAdmin
  const { data: dbCoupon, error: couponErr } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .eq('code', cleanCode)
    .maybeSingle();

  if (couponErr) {
    console.warn('validateCouponAction lookup warning:', couponErr);
  }

  if (dbCoupon) {
    if (!dbCoupon.is_active) {
      return { valid: false, error: `Coupon ${dbCoupon.code} is currently inactive` };
    }

    const now = new Date();
    if (dbCoupon.valid_from && new Date(dbCoupon.valid_from) > now) {
      return { valid: false, error: `Coupon ${dbCoupon.code} is not active yet` };
    }

    if (dbCoupon.valid_until && new Date(dbCoupon.valid_until) < now) {
      return { valid: false, error: `Coupon ${dbCoupon.code} has expired` };
    }

    if (dbCoupon.usage_limit && (dbCoupon.usage_count || 0) >= dbCoupon.usage_limit) {
      return { valid: false, error: `Coupon ${dbCoupon.code} total usage limit reached` };
    }

    const subtotal = context?.subtotal ?? 0;
    const minOrder = dbCoupon.min_order_amount
      ? (dbCoupon.min_order_amount > 50000 ? Math.round(dbCoupon.min_order_amount / 100) : dbCoupon.min_order_amount)
      : 0;

    if (minOrder > 0 && subtotal > 0 && subtotal < minOrder) {
      return {
        valid: false,
        error: `Minimum order of ₹${minOrder.toLocaleString('en-IN')} required for ${dbCoupon.code}`,
      };
    }

    // Resolve user details from context or active session
    let customerUserId = context?.userId || null;
    let customerEmail = context?.email || null;
    if (!customerUserId || !customerEmail) {
      try {
        const userClient = await getSupabaseClient();
        const { data: { user } } = await userClient.auth.getUser();
        if (user) {
          customerUserId = customerUserId || user.id;
          customerEmail = customerEmail || user.email || null;
        }
      } catch {}
    }

    // Enforce First Order Only
    if (dbCoupon.first_order_only) {
      const { isFirstOrder, orderCount } = await checkCustomerFirstOrderEligibility({
        userId: customerUserId,
        email: customerEmail,
        phone: context?.phone,
      });

      if (!isFirstOrder) {
        return {
          valid: false,
          error: `Coupon "${dbCoupon.code}" is valid for first-time orders only. You have already placed ${orderCount} prior order${orderCount > 1 ? 's' : ''}.`,
        };
      }
    }

    // Enforce Per-Customer Limit
    if (dbCoupon.user_limit && dbCoupon.user_limit > 0) {
      const conditions: string[] = [];
      if (customerUserId) conditions.push(`user_id.eq.${customerUserId}`);
      if (customerEmail && customerEmail.trim()) conditions.push(`email.ilike.${customerEmail.trim()}`);
      const cleanPhone = (context?.phone || '').replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 10) conditions.push(`phone.ilike.%${cleanPhone.slice(-10)}%`);

      if (conditions.length > 0) {
        const { data: pastOrders } = await supabaseAdmin
          .from('orders')
          .select('metadata')
          .or(conditions.join(','))
          .neq('status', 'cancelled');

        if (pastOrders) {
          const usedCount = pastOrders.filter((o: any) => {
            const meta = o?.metadata;
            return meta && typeof meta === 'object' && meta.coupon_code && String(meta.coupon_code).toUpperCase() === cleanCode;
          }).length;

          if (usedCount >= dbCoupon.user_limit) {
            return {
              valid: false,
              error: `You have reached the per-customer usage limit (${dbCoupon.user_limit}) for coupon "${dbCoupon.code}".`,
            };
          }
        }
      }
    }

    let discountAmount = 0;
    if (dbCoupon.type === 'percentage') {
      discountAmount = Math.round((subtotal * Number(dbCoupon.value)) / 100);
      if (dbCoupon.max_discount_amount) {
        discountAmount = Math.min(discountAmount, Number(dbCoupon.max_discount_amount));
      }
    } else if (dbCoupon.type === 'fixed') {
      discountAmount = Math.min(Number(dbCoupon.value), subtotal || Number(dbCoupon.value));
    }

    return {
      valid: true,
      coupon: {
        code: dbCoupon.code,
        type: dbCoupon.type as 'percentage' | 'fixed' | 'free_shipping',
        value: Number(dbCoupon.value),
        discountAmount,
        first_order_only: Boolean(dbCoupon.first_order_only),
        min_order_amount: minOrder,
        max_discount_amount: dbCoupon.max_discount_amount || undefined,
      },
    };
  }

  // 2. Fallback privilege offers if not in DB
  const PRIVILEGE_OFFERS: Record<string, {
    code: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    min_order_amount: number;
    max_discount_amount?: number;
    first_order_only?: boolean;
  }> = {
    FIRST10: {
      code: 'FIRST10',
      type: 'percentage',
      value: 10,
      min_order_amount: 1999,
      max_discount_amount: 1500,
      first_order_only: true,
    },
    ROYAL500: {
      code: 'ROYAL500',
      type: 'fixed',
      value: 500,
      min_order_amount: 4999,
      first_order_only: false,
    },
    COUTURE15: {
      code: 'COUTURE15',
      type: 'percentage',
      value: 15,
      min_order_amount: 5999,
      max_discount_amount: 2000,
      first_order_only: false,
    },
  };

  const offer = PRIVILEGE_OFFERS[cleanCode];
  if (offer) {
    if (offer.first_order_only) {
      let customerUserId = context?.userId || null;
      let customerEmail = context?.email || null;
      if (!customerUserId || !customerEmail) {
        try {
          const userClient = await getSupabaseClient();
          const { data: { user } } = await userClient.auth.getUser();
          if (user) {
            customerUserId = customerUserId || user.id;
            customerEmail = customerEmail || user.email || null;
          }
        } catch {}
      }

      const { isFirstOrder, orderCount } = await checkCustomerFirstOrderEligibility({
        userId: customerUserId,
        email: customerEmail,
        phone: context?.phone,
      });

      if (!isFirstOrder) {
        return {
          valid: false,
          error: `Coupon "${cleanCode}" is valid for first-time orders only. You have already placed ${orderCount} prior order${orderCount > 1 ? 's' : ''}.`,
        };
      }
    }

    const subtotal = context?.subtotal ?? 0;
    if (offer.min_order_amount && subtotal > 0 && subtotal < offer.min_order_amount) {
      return {
        valid: false,
        error: `Minimum order of ₹${offer.min_order_amount.toLocaleString('en-IN')} required for ${offer.code}`,
      };
    }

    let discountAmount = 0;
    if (offer.type === 'percentage') {
      discountAmount = Math.round((subtotal * offer.value) / 100);
      if (offer.max_discount_amount) {
        discountAmount = Math.min(discountAmount, offer.max_discount_amount);
      }
    } else if (offer.type === 'fixed') {
      discountAmount = Math.min(offer.value, subtotal || offer.value);
    }

    return {
      valid: true,
      coupon: {
        code: offer.code,
        type: offer.type,
        value: offer.value,
        discountAmount,
        first_order_only: offer.first_order_only,
        min_order_amount: offer.min_order_amount,
        max_discount_amount: offer.max_discount_amount,
      },
    };
  }

  return { valid: false, error: 'Invalid or expired coupon code' };
}

interface OrderData {
  items: CartItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: 'razorpay' | 'cod' | 'stripe';
  email: string;
  phone: string;
  notes?: string;
  coupon?: AppliedCoupon;
  userId?: string;
  giftWrap?: boolean;
  giftMessage?: string;
  whatsappOptIn?: boolean;
}

interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  razorpayOrderId?: string;
  error?: string;
}

export async function createOrder(orderData: OrderData): Promise<CreateOrderResult> {
  const userClient = await getSupabaseClient();
  const supabase = supabaseAdmin;

  try {
    if (!orderData.items || orderData.items.length === 0) {
      return { success: false, error: 'Your cart is empty' };
    }

    // Get user if authenticated (supports both logged-in and guest checkout)
    const { data: { user } } = await userClient.auth.getUser();
    const userId = orderData.userId || user?.id || null;

    // 1. Authoritative server-side price lookup & inventory verification
    const variantIds = orderData.items
      .map((i) => i.variant_id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    const dbVariantsMap = new Map<string, { id: string; price: number; inventory_quantity: number | null; is_active: boolean | null }>();

    if (variantIds.length > 0) {
      const { data: dbVariants } = await supabase
        .from('product_variants')
        .select('id, price, inventory_quantity, is_active')
        .in('id', variantIds);

      if (dbVariants) {
        dbVariants.forEach((v) => {
          dbVariantsMap.set(v.id, {
            id: v.id,
            price: Number(v.price),
            inventory_quantity: v.inventory_quantity,
            is_active: v.is_active,
          });
        });
      }
    }

    // Verify each item's price and inventory
    const verifiedItems: Array<{
      item: CartItem;
      unitPrice: number;
      totalPrice: number;
    }> = [];

    let subtotal = 0;

    for (const item of orderData.items) {
      const qty = Math.max(1, typeof item.quantity === 'number' ? item.quantity : 1);
      const dbVar = item.variant_id ? dbVariantsMap.get(item.variant_id) : null;

      let unitPrice = 0;
      if (dbVar && !isNaN(dbVar.price) && dbVar.price > 0) {
        unitPrice = dbVar.price;
        if (dbVar.inventory_quantity !== null && dbVar.inventory_quantity < qty) {
          return {
            success: false,
            error: `${item.product_name} (${item.size || 'Free Size'}) only has ${dbVar.inventory_quantity} in stock. Please adjust quantity.`,
          };
        }
      } else {
        const cleanClientPrice = typeof item.price === 'number' && item.price > 0 ? item.price : 2999;
        unitPrice = cleanClientPrice;
      }

      const itemTotal = unitPrice * qty;
      subtotal += itemTotal;
      verifiedItems.push({
        item,
        unitPrice,
        totalPrice: itemTotal,
      });
    }

    // 2. Authoritative server-side coupon recalculation
    let discountAmount = 0;
    let isCouponFreeShipping = false;

    if (orderData.coupon?.code) {
      const cleanCode = orderData.coupon.code.trim().toUpperCase();

      const { data: dbCoupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (dbCoupon && dbCoupon.is_active) {
        const now = new Date();
        const isValidDate = (!dbCoupon.valid_from || new Date(dbCoupon.valid_from) <= now) &&
                            (!dbCoupon.valid_until || new Date(dbCoupon.valid_until) >= now);
        const hasUsage = !dbCoupon.usage_limit || (dbCoupon.usage_count || 0) < dbCoupon.usage_limit;
        const minOrder = dbCoupon.min_order_amount
          ? (dbCoupon.min_order_amount > 50000 ? Math.round(dbCoupon.min_order_amount / 100) : dbCoupon.min_order_amount)
          : 0;

        if (!isValidDate) {
          return { success: false, error: `Coupon "${dbCoupon.code}" is expired or not active yet.` };
        }
        if (!hasUsage) {
          return { success: false, error: `Coupon "${dbCoupon.code}" total usage limit reached.` };
        }
        if (minOrder > 0 && subtotal < minOrder) {
          return {
            success: false,
            error: `Minimum order of ₹${minOrder.toLocaleString('en-IN')} required for coupon "${dbCoupon.code}".`,
          };
        }

        // ENFORCE FIRST ORDER ONLY
        if (dbCoupon.first_order_only) {
          const { isFirstOrder, orderCount } = await checkCustomerFirstOrderEligibility({
            userId,
            email: orderData.email || user?.email,
            phone: orderData.phone || orderData.shippingAddress?.phone,
          });

          if (!isFirstOrder) {
            return {
              success: false,
              error: `Coupon "${dbCoupon.code}" is valid for first-time orders only. You have already placed ${orderCount} prior order${orderCount > 1 ? 's' : ''}.`,
            };
          }
        }

        // ENFORCE PER-CUSTOMER LIMIT
        if (dbCoupon.user_limit && dbCoupon.user_limit > 0) {
          const conditions: string[] = [];
          if (userId) conditions.push(`user_id.eq.${userId}`);
          if (orderData.email) conditions.push(`email.ilike.${orderData.email.trim()}`);
          const cleanP = (orderData.phone || orderData.shippingAddress?.phone || '').replace(/[^0-9]/g, '');
          if (cleanP.length >= 10) conditions.push(`phone.ilike.%${cleanP.slice(-10)}%`);

          if (conditions.length > 0) {
            const { data: pastOrders } = await supabase
              .from('orders')
              .select('metadata')
              .or(conditions.join(','))
              .neq('status', 'cancelled');

            if (pastOrders) {
              const used = pastOrders.filter((o: any) => {
                const meta = o?.metadata;
                return meta && typeof meta === 'object' && meta.coupon_code && String(meta.coupon_code).toUpperCase() === cleanCode;
              }).length;

              if (used >= dbCoupon.user_limit) {
                return {
                  success: false,
                  error: `You have reached the per-customer usage limit (${dbCoupon.user_limit}) for coupon "${dbCoupon.code}".`,
                };
              }
            }
          }
        }

        if (dbCoupon.type === 'percentage') {
          discountAmount = Math.round((subtotal * Number(dbCoupon.value)) / 100);
          if (dbCoupon.max_discount_amount) {
            discountAmount = Math.min(discountAmount, Number(dbCoupon.max_discount_amount));
          }
        } else if (dbCoupon.type === 'fixed') {
          discountAmount = Math.min(Number(dbCoupon.value), subtotal);
        } else if (dbCoupon.type === 'free_shipping') {
          isCouponFreeShipping = true;
        }
      } else {
        const PRIVILEGE_OFFERS: Record<string, { type: string; value: number; min_order: number; max?: number; first_order_only?: boolean }> = {
          FIRST10: { type: 'percentage', value: 10, min_order: 1999, max: 1500, first_order_only: true },
          ROYAL500: { type: 'fixed', value: 500, min_order: 4999, first_order_only: false },
          COUTURE15: { type: 'percentage', value: 15, min_order: 5999, max: 2000, first_order_only: false },
        };
        const offer = PRIVILEGE_OFFERS[cleanCode];
        if (offer) {
          if (offer.first_order_only) {
            const { isFirstOrder, orderCount } = await checkCustomerFirstOrderEligibility({
              userId,
              email: orderData.email || user?.email,
              phone: orderData.phone || orderData.shippingAddress?.phone,
            });

            if (!isFirstOrder) {
              return {
                success: false,
                error: `Coupon "${cleanCode}" is valid for first-time orders only. You have already placed ${orderCount} prior order${orderCount > 1 ? 's' : ''}.`,
              };
            }
          }

          if (subtotal >= offer.min_order) {
            if (offer.type === 'percentage') {
              discountAmount = Math.round((subtotal * offer.value) / 100);
              if (offer.max) discountAmount = Math.min(discountAmount, offer.max);
            } else if (offer.type === 'fixed') {
              discountAmount = Math.min(offer.value, subtotal);
            }
          }
        }
      }
    }

    const isFreeShipping = subtotal >= 2999 || isCouponFreeShipping || orderData.coupon?.type === 'free_shipping';
    const shippingCost = isFreeShipping ? 0 : 99;
    const codFee = orderData.paymentMethod === 'cod' ? 49 : 0;
    const taxAmount = 0; // Prices are inclusive of GST

    const total = Math.max(0, subtotal + shippingCost + codFee - discountAmount);

    // Validate COD limit (maximum ₹10,000)
    if (orderData.paymentMethod === 'cod' && total > 10000) {
      return { success: false, error: 'COD orders cannot exceed ₹10,000' };
    }

    // Generate secure guest access token for guest checkout tracking
    const guestAccessToken = crypto.randomUUID();

    // Create order in database
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId,
        email: orderData.email,
        phone: orderData.phone,
        shipping_address: orderData.shippingAddress as any,
        billing_address: orderData.billingAddress as any,
        payment_method: orderData.paymentMethod,
        payment_status: 'pending',
        status: 'confirmed',
        subtotal,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: total,
        currency: 'INR',
        notes: orderData.notes || null,
        gift_wrap: orderData.giftWrap || false,
        gift_message: orderData.giftMessage || null,
        whatsapp_opt_in: orderData.whatsappOptIn !== false,
        metadata: {
          cod_fee: codFee,
          coupon_code: orderData.coupon?.code || null,
          gift_wrap: orderData.giftWrap || false,
          guest_token: guestAccessToken,
        },
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation failed:', orderError);
      return { success: false, error: orderError?.message || 'Failed to create order' };
    }

    // Set secure HTTP-only access cookie for the order
    try {
      const cookieStore = cookies();
      cookieStore.set(`order_access_${order.id}`, guestAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    } catch (cookieErr) {
      console.warn('Could not set order access cookie:', cookieErr);
    }

    // Create order items with verified database prices
    const orderItems = verifiedItems.map(({ item, unitPrice, totalPrice }) => ({
      order_id: order.id,
      product_id: item.product_id || null,
      variant_id: item.variant_id || null,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      variant_details: {
        size: item.size,
        color: item.color,
        color_hex: item.color_hex,
        image: item.image,
      },
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation failed:', itemsError);
      // Cleanup: delete the order
      await supabase.from('orders').delete().eq('id', order.id);
      return { success: false, error: itemsError?.message || 'Failed to create order items' };
    }

    // Decrease inventory safely directly on variants
    for (const item of orderData.items) {
      if (item.variant_id) {
        try {
          const { data: v } = await supabase
            .from('product_variants')
            .select('inventory_quantity')
            .eq('id', item.variant_id)
            .maybeSingle();

          if (v && v.inventory_quantity !== null) {
            await supabase
              .from('product_variants')
              .update({ inventory_quantity: Math.max(0, v.inventory_quantity - item.quantity) })
              .eq('id', item.variant_id);
          }
        } catch (invErr) {
          console.warn('Inventory update notice:', invErr);
        }
      }
    }

    // If coupon was used, increment usage count safely
    if (orderData.coupon?.code) {
      try {
        const { data: c } = await supabase
          .from('coupons')
          .select('usage_count')
          .eq('code', orderData.coupon.code)
          .maybeSingle();

        if (c) {
          await supabase
            .from('coupons')
            .update({ usage_count: (c.usage_count || 0) + 1 })
            .eq('code', orderData.coupon.code);
        }
      } catch (couponErr) {
        console.warn('Coupon usage update notice:', couponErr);
      }
    }

    // Clear user's cart if logged in
    if (userId) {
      await supabase.from('carts').delete().eq('user_id', userId);
    }

    // For Razorpay, create Razorpay order
    let razorpayOrderId: string | undefined;
    if (orderData.paymentMethod === 'razorpay') {
      const razorpayResult = await createRazorpayOrder({
        amount: Math.round(total * 100), // Razorpay requires amount in paise
        currency: 'INR',
        receipt: `order_${order.id}`,
        notes: {
          order_id: order.id,
          user_id: userId || 'guest',
        },
      });

      // Edge case #1: If Razorpay order creation fails, roll back the DB order
      // so the customer doesn't get an orphan pending order with no payment window.
      if (!razorpayResult.success || !razorpayResult.orderId) {
        console.error('Razorpay order creation failed — rolling back DB order:', razorpayResult.error);
        await supabase.from('order_items').delete().eq('order_id', order.id);
        await supabase.from('orders').delete().eq('id', order.id);
        // Restore inventory that was decremented above
        for (const item of orderData.items) {
          if (item.variant_id) {
            try {
              const { data: v } = await supabase
                .from('product_variants')
                .select('inventory_quantity')
                .eq('id', item.variant_id)
                .maybeSingle();
              if (v && v.inventory_quantity !== null) {
                await supabase
                  .from('product_variants')
                  .update({ inventory_quantity: v.inventory_quantity + item.quantity })
                  .eq('id', item.variant_id);
              }
            } catch (invErr) {
              console.warn('Inventory restore notice during rollback:', invErr);
            }
          }
        }
        return {
          success: false,
          error: razorpayResult.error || 'Could not connect to payment gateway. Please try again.',
        };
      }

      razorpayOrderId = razorpayResult.orderId;

      // Update order with Razorpay order ID in payment_id and metadata
      await supabase
        .from('orders')
        .update({
          payment_id: razorpayOrderId,
          metadata: {
            cod_fee: codFee,
            coupon_code: orderData.coupon?.code || null,
            razorpay_order_id: razorpayOrderId,
          },
        })
        .eq('id', order.id);
    }

    // For COD orders, the order is confirmed immediately upon placement — dispatch confirmation email to user
    if (orderData.paymentMethod === 'cod') {
      try {
        await sendOrderConfirmationEmail(order.id);
      } catch (emailErr) {
        console.warn('Order confirmation email notice (COD):', emailErr);
      }

      // Automatically sync order to Shiprocket for fulfillment
      createShiprocketOrder(order.id).catch((srErr) => {
        console.warn('[Shiprocket] Order auto-sync notice (COD):', srErr);
      });
    }

    return {
      success: true,
      orderId: order.id,
      razorpayOrderId,
    };
  } catch (error) {
    console.error('Create order error:', error);
    return { success: false, error: 'An unexpected error occurred' };
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
        'Authorization': `Basic ${auth}`,
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
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const keySecret = process.env['RAZORPAY_KEY_SECRET'];
    if (!keySecret) {
      return { success: false, error: 'Razorpay not configured' };
    }

    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return { success: false, error: 'Invalid payment signature' };
    }

    const supabase = await getSupabaseClient();

    // Find order by Razorpay order ID — stored in payment_id column
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('id, metadata, payment_status')
      .eq('payment_id', razorpayOrderId)
      .single();

    if (findError || !order) {
      return { success: false, error: 'Order not found' };
    }

    // Edge case #2: Idempotency — if already paid (double-submit / retry),
    // return success immediately without updating again or firing duplicate notifications.
    if (order.payment_status === 'paid') {
      return { success: true, orderId: order.id };
    }

    // Update order: mark as paid, store payment details in metadata
    const existingMeta = (typeof order.metadata === 'object' && order.metadata !== null && !Array.isArray(order.metadata))
      ? (order.metadata as Record<string, unknown>)
      : {};

    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        metadata: {
          ...existingMeta,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
          paid_at: new Date().toISOString(),
        },
      })
      .eq('id', order.id);

    // Send order confirmation email upon verified payment
    try {
      await sendOrderConfirmationEmail(order.id);
    } catch (emailErr) {
      console.warn('Order confirmation email notice (Online Payment):', emailErr);
    }

    // Automatically sync order to Shiprocket for fulfillment
    createShiprocketOrder(order.id).catch((srErr) => {
      console.warn('[Shiprocket] Order auto-sync notice (Online Payment):', srErr);
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Verify payment error:', error);
    return { success: false, error: 'Payment verification failed' };
  }
}

/**
 * Manually re-dispatches order confirmation email to the user
 */
export async function resendOrderConfirmation(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    return await sendOrderConfirmationEmail(orderId);
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to resend confirmation email' };
  }
}

export async function getOrderById(orderId: string) {
  try {
    const userClient = await getSupabaseClient();
    const { data: { user } } = await userClient.auth.getUser();

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .maybeSingle();

    if (error || !order) return null;

    // 1. Allow if logged-in user placed the order
    if (user) {
      if (order.user_id && order.user_id === user.id) {
        return order;
      }

      // Allow admin / manager access
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role === 'admin' || profile?.role === 'manager' || profile?.role === 'designer') {
        return order;
      }
    }

    // 2. Allow if secure guest access cookie matches the order's guest token
    try {
      const cookieStore = cookies();
      const guestCookie = cookieStore.get(`order_access_${order.id}`)?.value;
      const meta = (typeof order.metadata === 'object' && order.metadata !== null)
        ? (order.metadata as Record<string, any>)
        : {};

      if (guestCookie && meta['guest_token'] && guestCookie === meta['guest_token']) {
        return order;
      }

      // Allow if current user's email matches order's contact email
      if (user?.email && order.email && user.email.toLowerCase() === order.email.toLowerCase()) {
        return order;
      }
    } catch {
      // ignore
    }

    // Deny unauthorized access
    return null;
  } catch (err) {
    console.error('Failed to get order:', err);
    return null;
  }
}

export async function getUserAddresses(userId: string): Promise<(Address & { id: string; is_default?: boolean })[]> {
  try {
    const supabase = supabaseAdmin;
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', userId)
      .maybeSingle();

    const prefs = (profile?.preferences && typeof profile.preferences === 'object')
      ? (profile.preferences as Record<string, any>)
      : {};

    const addresses = Array.isArray(prefs['addresses']) ? prefs['addresses'] : [];
    return addresses;
  } catch (err) {
    console.error('Failed to get user addresses:', err);
    return [];
  }
}

export async function saveAddress(userId: string, address: Omit<Address, 'id'> & { id?: string; is_default?: boolean }) {
  try {
    const supabase = supabaseAdmin;
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', userId)
      .maybeSingle();

    const prefs = (profile?.preferences && typeof profile.preferences === 'object')
      ? (profile.preferences as Record<string, any>)
      : {};

    const existing: any[] = Array.isArray(prefs['addresses']) ? prefs['addresses'] : [];
    const newAddressId = address.id || `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newAddr = {
      ...address,
      id: newAddressId,
      is_default: address.is_default ?? (existing.length === 0),
    };

    let updated: any[];
    if (address.id && existing.some(a => a.id === address.id)) {
      updated = existing.map(a => {
        if (a.id === address.id) {
          return newAddr;
        }
        return address.is_default ? { ...a, is_default: false } : a;
      });
    } else {
      updated = [newAddr, ...existing.map(a => address.is_default ? { ...a, is_default: false } : a)];
    }

    await supabase
      .from('profiles')
      .update({
        preferences: {
          ...prefs,
          addresses: updated,
        },
      })
      .eq('id', userId);

    return { success: true, address: newAddr };
  } catch (err: any) {
    console.error('Failed to save address:', err);
    return { success: false, error: err?.message || 'Failed to save address' };
  }
}

export async function deleteAddress(userId: string, addressId: string) {
  try {
    const supabase = supabaseAdmin;
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', userId)
      .maybeSingle();

    const prefs = (profile?.preferences && typeof profile.preferences === 'object')
      ? (profile.preferences as Record<string, any>)
      : {};

    const existing: any[] = Array.isArray(prefs['addresses']) ? prefs['addresses'] : [];
    const updated = existing.filter(a => a.id !== addressId);

    if (updated.length > 0 && !updated.some(a => a.is_default)) {
      updated[0].is_default = true;
    }

    await supabase
      .from('profiles')
      .update({
        preferences: {
          ...prefs,
          addresses: updated,
        },
      })
      .eq('id', userId);

    return { success: true, addresses: updated };
  } catch (err: any) {
    console.error('Failed to delete address:', err);
    return { success: false, error: err?.message || 'Failed to delete address' };
  }
}

export async function convertGuestToAccount({
  orderId,
  email,
  password,
}: {
  orderId: string;
  email: string;
  password: string;
}) {
  try {
    const supabase = supabaseAdmin;
    if (!email || !password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    // 1. Create user with admin privileges
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { role: 'customer' },
    });

    let userId = newUser?.user?.id;

    if (createError) {
      if (createError.message.toLowerCase().includes('already registered')) {
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const found = existingUsers.users.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());
        if (found) {
          userId = found.id;
        } else {
          return { success: false, error: 'An account with this email already exists. Please sign in.' };
        }
      } else {
        return { success: false, error: createError.message };
      }
    }

    if (userId) {
      // 2. Link order to user
      await supabase
        .from('orders')
        .update({ user_id: userId })
        .eq('id', orderId);

      // 3. Ensure profile row exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: userId,
          email: email.trim().toLowerCase(),
          role: 'customer',
        });
      }

      return { success: true, message: 'VIP Account activated successfully! Your order is linked.' };
    }

    return { success: false, error: 'Could not complete registration' };
  } catch (err: any) {
    console.error('convertGuestToAccount error:', err);
    return { success: false, error: err.message || 'Failed to create account' };
  }
}
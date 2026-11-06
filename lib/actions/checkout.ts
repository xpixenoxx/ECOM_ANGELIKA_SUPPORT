'use server';

import { createClient as createServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { CartItem, Address, CheckoutFormData, AppliedCoupon } from '@/types/commerce';

async function getSupabaseClient() {
  return createServerClient();
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
    // Get user if authenticated (supports both logged-in and guest checkout)
    const { data: { user } } = await userClient.auth.getUser();
    const userId = orderData.userId || user?.id || null;

    // Calculate totals in Rupees (prices in database are stored in Rupees)
    const subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const isFreeShipping = subtotal >= 2999 || orderData.coupon?.type === 'free_shipping';
    const shippingCost = isFreeShipping ? 0 : 99;
    const codFee = orderData.paymentMethod === 'cod' ? 49 : 0;
    const discountAmount = orderData.coupon?.discountAmount || 0;
    const taxAmount = 0; // Prices are inclusive of GST

    const total = Math.max(0, subtotal + shippingCost + codFee - discountAmount);

    // Validate COD limit (maximum ₹10,000)
    if (orderData.paymentMethod === 'cod' && total > 10000) {
      return { success: false, error: 'COD orders cannot exceed ₹10,000' };
    }

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
        },
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation failed:', orderError);
      return { success: false, error: orderError?.message || 'Failed to create order' };
    }

    // Create order items
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id || null,
      variant_id: item.variant_id || null,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
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
      razorpayOrderId = razorpayResult.orderId;

      // Update order with Razorpay order ID in payment_id and metadata
      if (razorpayOrderId) {
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

    // Find order by Razorpay order ID
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('id')
      .eq('razorpay_order_id', razorpayOrderId)
      .single();

    if (findError || !order) {
      return { success: false, error: 'Order not found' };
    }

    // Update order with payment details
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Verify payment error:', error);
    return { success: false, error: 'Payment verification failed' };
  }
}

export async function getOrderById(orderId: string) {
  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .maybeSingle();

    if (error || !order) return null;
    return order;
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

    const updated = [newAddr, ...existing.filter(a => a.id !== newAddressId).map(a => address.is_default ? { ...a, is_default: false } : a)];

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
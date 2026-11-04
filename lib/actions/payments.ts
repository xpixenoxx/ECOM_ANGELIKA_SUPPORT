'use server';

import { createClient } from '@/lib/supabase/server';
import type { Database, Json } from '@/types/database';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];

// Helper to safely access JSON properties
function getJsonValue<T>(json: Json, key: string): T | undefined {
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    return json[key as keyof typeof json] as T;
  }
  return undefined;
}

// ============================================
// RAZORPAY WEBHOOK HANDLER
// ============================================

interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  captured: boolean;
  email: string;
  contact: string;
  fee: number;
  tax: number;
  error_code?: string;
  error_description?: string;
}

interface RazorpayOrderEntity {
  id: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
}

interface RazorpayRefundEntity {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
}

interface RazorpayWebhookEvent {
  event: string;
  payload: {
    payment?: { entity: RazorpayPaymentEntity };
    order?: { entity: RazorpayOrderEntity };
    refund?: { entity: RazorpayRefundEntity };
  };
  created_at: number;
}

export async function handleRazorpayWebhook(
  payload: string,
  signature: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const keySecret = process.env['RAZORPAY_KEY_SECRET'];
    if (!keySecret) {
      return { success: false, error: 'Razorpay not configured' };
    }

    // Verify webhook signature
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid Razorpay webhook signature');
      return { success: false, error: 'Invalid signature' };
    }

    const event: RazorpayWebhookEvent = JSON.parse(payload);
    const supabase = await getSupabaseClient();

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(supabase, event.payload.payment?.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(supabase, event.payload.payment?.entity);
        break;
      case 'order.paid':
        await handleOrderPaid(supabase, event.payload.order?.entity);
        break;
      case 'refund.created':
      case 'refund.processed':
        await handleRefund(supabase, event.payload.refund?.entity);
        break;
      default:
        console.log(`Unhandled Razorpay event: ${event.event}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return { success: false, error: 'Webhook processing failed' };
  }
}

async function handlePaymentCaptured(
  supabase: any,
  payment: RazorpayPaymentEntity | undefined
) {
  if (!payment) return;

  const { data: order } = await supabase
    .from('orders')
    .select('id, user_id, email, phone, total_amount, currency')
    .eq('razorpay_order_id', payment.order_id)
    .single();

  if (!order) return;

  // Update order payment status
  await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      razorpay_payment_id: payment.id,
      paid_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  // Send confirmation notifications
  await sendOrderConfirmation(order.id);
}

async function handlePaymentFailed(
  supabase: any,
  payment: RazorpayPaymentEntity | undefined
) {
  if (!payment) return;

  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('razorpay_order_id', payment.order_id)
    .single();

  if (!order) return;

  await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      payment_failed_at: new Date().toISOString(),
      payment_failure_reason: payment.error_description || payment.error_code || 'Payment failed',
    })
    .eq('id', order.id);

  // Restore inventory
  await restoreInventoryForOrder(supabase, order.id);
}

async function handleOrderPaid(
  supabase: any,
  orderData: RazorpayOrderEntity | undefined
) {
  if (!orderData) return;

  // This is a fallback - payment.captured should handle it
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('razorpay_order_id', orderData.id)
    .single();

  if (!order) return;

  if (orderData.amount_paid >= orderData.amount) {
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    await sendOrderConfirmation(order.id);
  }
}

async function handleRefund(
  supabase: any,
  refund: RazorpayRefundEntity | undefined
) {
  if (!refund) return;

  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('razorpay_payment_id', refund.payment_id)
    .single();

  if (!order) return;

  await supabase
    .from('orders')
    .update({
      payment_status: 'refunded',
      refund_amount: refund.amount,
      refunded_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  // Restore inventory for refunded items
  await restoreInventoryForOrder(supabase, order.id);
}

async function restoreInventoryForOrder(supabase: any, orderId: string) {
  const { data: items } = await supabase
    .from('order_items')
    .select('variant_id, quantity')
    .eq('order_id', orderId);

  if (!items) return;

  for (const item of items) {
    await supabase.rpc('increase_inventory', {
      variant_id: item.variant_id,
      quantity: item.quantity,
    });
  }
}

// ============================================
// STRIPE INTEGRATION
// ============================================

interface StripePaymentIntentParams {
  amount: number;
  currency: string;
  orderId: string;
  userId: string;
  email: string;
  metadata?: Record<string, string>;
}

interface StripePaymentIntentResult {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}

export async function createStripePaymentIntent(
  params: StripePaymentIntentParams
): Promise<StripePaymentIntentResult> {
  try {
    const secretKey = process.env['STRIPE_SECRET_KEY'];
    if (!secretKey) {
      return { success: false, error: 'Stripe not configured' };
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(secretKey, { apiVersion: '2024-04-10' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: params.orderId,
        user_id: params.userId,
        ...params.metadata,
      },
      receipt_email: params.email,
    });

    // Store payment intent ID in order
    const supabase = await getSupabaseClient();
    await supabase
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', params.orderId as string);

    return {
      success: true,
      clientSecret: paymentIntent.client_secret ?? undefined,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    return { success: false, error: 'Failed to create payment intent' };
  }
}

export async function verifyStripePayment(
  paymentIntentId: string
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const secretKey = process.env['STRIPE_SECRET_KEY'];
    if (!secretKey) {
      return { success: false, error: 'Stripe not configured' };
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(secretKey, { apiVersion: '2024-04-10' });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return { success: false, error: 'Payment not completed' };
    }

    const orderId = paymentIntent.metadata['order_id'];
    if (!orderId) {
      return { success: false, error: 'Order ID not found in payment metadata' };
    }

    const supabase = await getSupabaseClient();
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        stripe_payment_id: paymentIntent.id,
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    await sendOrderConfirmation(orderId);

    return { success: true, orderId };
  } catch (error) {
    console.error('Stripe verification error:', error);
    return { success: false, error: 'Payment verification failed' };
  }
}

export async function handleStripeWebhook(
  payload: string,
  signature: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];
    if (!webhookSecret) {
      return { success: false, error: 'Stripe webhook not configured' };
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env['STRIPE_SECRET_KEY']!, { apiVersion: '2024-04-10' });

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    const supabase = await getSupabaseClient();

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        const metadata = paymentIntent.metadata as Record<string, string> | undefined;
        const orderId = metadata ? metadata['order_id'] : undefined;
        if (orderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              stripe_payment_id: paymentIntent.id,
              paid_at: new Date().toISOString(),
            })
            .eq('id', orderId);
          await sendOrderConfirmation(orderId);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        const metadata = paymentIntent.metadata as Record<string, string> | undefined;
        const orderId = metadata ? metadata['order_id'] : undefined;
        if (orderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              payment_failed_at: new Date().toISOString(),
              payment_failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
            })
            .eq('id', orderId);
          await restoreInventoryForOrder(supabase, orderId);
        }
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as any;
        const paymentIntentId = charge.payment_intent;
        if (paymentIntentId) {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          const metadata = paymentIntent.metadata as Record<string, string> | undefined;
        const orderId = metadata ? metadata['order_id'] : undefined;
          if (orderId) {
            await supabase
              .from('orders')
              .update({
                payment_status: 'refunded',
                refund_amount: charge.amount_refunded,
                refunded_at: new Date().toISOString(),
              })
              .eq('id', orderId);
            await restoreInventoryForOrder(supabase, orderId);
          }
        }
        break;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return { success: false, error: 'Webhook processing failed' };
  }
}

// ============================================
// COD ORDER CONFIRMATION
// ============================================

export async function confirmCodOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, payment_method, status')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.payment_method !== 'cod') {
      return { success: false, error: 'Not a COD order' };
    }

    // COD orders are confirmed immediately, payment collected on delivery
    await supabase
      .from('orders')
      .update({
        payment_status: 'pending',
        status: 'confirmed',
      })
      .eq('id', orderId);

    await sendOrderConfirmation(orderId);

    return { success: true };
  } catch (error) {
    console.error('COD confirmation error:', error);
    return { success: false, error: 'Failed to confirm COD order' };
  }
}

// ============================================
// ORDER CONFIRMATION NOTIFICATIONS
// ============================================

async function sendOrderConfirmation(orderId: string) {
  try {
    const supabase = await getSupabaseClient();

    const { data: order } = await supabase
      .from('orders')
      .select(`
        *,
        order_items!order_items_order_id_fkey(
          *,
          product:products(id, name, slug, product_images(url, is_primary))
        )
      `)
      .eq('id', orderId)
      .single();

    if (!order) return;

    // Send email confirmation
    await sendOrderEmail(supabase, order);

    // Send WhatsApp confirmation if opted in
    if (order.whatsapp_opt_in) {
      await sendOrderWhatsApp(supabase, order);
    }

    // Send admin notification
    await sendAdminOrderNotification(supabase, order);
  } catch (error) {
    console.error('Order confirmation error:', error);
  }
}

async function sendOrderEmail(
  supabase: any,
  order: OrderRow & { order_items: (OrderItemRow & { product: any })[] }
) {
  // TODO: Implement email sending using Resend/SendGrid/NodeMailer
  // For now, log the email content
  console.log('Sending order confirmation email to:', order.email);
  console.log('Order:', order.id, 'Total:', order.total_amount / 100, order.currency);

  // Store notification in database for later processing
  await supabase
    .from('notifications')
    .insert({
      user_id: order.user_id,
      type: 'order_confirmation',
      channel: 'email',
      subject: `Order Confirmed - ${order.id}`,
      content: generateOrderEmailContent(order),
      status: 'pending',
    });
}

async function sendOrderWhatsApp(
  supabase: any,
  order: OrderRow & { order_items: (OrderItemRow & { product: any })[] }
) {
  // TODO: Implement WhatsApp Business API integration
  // For now, log the WhatsApp message
  console.log('Sending WhatsApp confirmation to:', order.phone);
  console.log('Order:', order.id);

  // Store notification in database for later processing
  await supabase
    .from('notifications')
    .insert({
      user_id: order.user_id,
      type: 'order_confirmation',
      channel: 'whatsapp',
      content: generateWhatsAppOrderContent(order),
      status: 'pending',
    });
}

async function sendAdminOrderNotification(
  supabase: any,
  order: OrderRow & { order_items: (OrderItemRow & { product: any })[] }
) {
  // Notify admin team
  console.log('New order received:', order.id);

  await supabase
    .from('notifications')
    .insert({
      user_id: null, // Admin notification
      type: 'new_order',
      channel: 'email',
      subject: `New Order: ${order.id}`,
      content: generateAdminOrderEmailContent(order),
      status: 'pending',
    });
}

function generateOrderEmailContent(
  order: OrderRow & { order_items: (OrderItemRow & { product: any })[] }
): string {
  const itemsHtml = order.order_items
    .map((item) => {
      const variantDetails = (item.variant_details as Json) as Record<string, any> | null;
      const size = (variantDetails?.['size'] as string) || '';
      const color = (variantDetails?.['color'] as string) || '';
      return `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        ${item.product_name} (${size}, ${color})
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
        ₹${(item.unit_price / 100).toLocaleString()}
      </td>
    </tr>
  `;
    })
    .join('');

  const shippingAddress = (order.shipping_address as Json) as Record<string, any> | null;
  const firstName = (shippingAddress?.['firstName'] as string) || 'Customer';

  return `
    <h1>Order Confirmed!</h1>
    <p>Hi ${firstName},</p>
    <p>Your order <strong>${order.id}</strong> has been confirmed.</p>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 12px; text-align: left;">Item</th>
          <th style="padding: 12px; text-align: center;">Qty</th>
          <th style="padding: 12px; text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <p style="text-align: right; font-size: 18px; font-weight: bold;">
      Total: ₹${(order.total_amount / 100).toLocaleString()}
    </p>
    <p>We'll notify you when your order ships.</p>
    <p>Thank you for shopping with Angelika Fashions!</p>
  `;
}

function generateWhatsAppOrderContent(
  order: OrderRow & { order_items: (OrderItemRow & { product: any })[] }
): string {
  const itemsText = order.order_items
    .map((item) => {
      const variantDetails = (item.variant_details as Json) as Record<string, any> | null;
      const size = (variantDetails?.['size'] as string) || '';
      const color = (variantDetails?.['color'] as string) || '';
      return `• ${item.product_name} (${size}, ${color}) x${item.quantity} - ₹${(item.unit_price / 100).toLocaleString()}`;
    })
    .join('\n');

  return `🎉 *Order Confirmed!*

Order: ${order.id}
${itemsText}

*Total: ₹${(order.total_amount / 100).toLocaleString()}*

We'll notify you when your order ships.

Thank you for shopping with Angelika Fashions! 🛍️`;
}

function generateAdminOrderEmailContent(
  order: OrderRow & { order_items: (OrderItemRow & { product: any })[] }
): string {
  const itemsText = order.order_items
    .map((item) => {
      const variantDetails = (item.variant_details as Json) as Record<string, any> | null;
      const size = (variantDetails?.['size'] as string) || '';
      const color = (variantDetails?.['color'] as string) || '';
      return `${item.product_name} (${size}, ${color}) x${item.quantity} - ₹${(item.unit_price / 100).toLocaleString()}`;
    })
    .join('\n');

  const shippingAddress = (order.shipping_address as Json) as Record<string, any> | null;

  return `
New order received!

Order ID: ${order.id}
Customer: ${(shippingAddress?.['firstName'] as string) || ''} ${(shippingAddress?.['lastName'] as string) || ''}
Email: ${order.email}
Phone: ${order.phone}
Payment: ${order.payment_method}
Status: ${order.status}

Items:
${itemsText}

Total: ₹${(order.total_amount / 100).toLocaleString()}
  `;
}

async function getSupabaseClient() {
  const { createClient } = await import('@/lib/supabase/server');
  return createClient();
}

// ============================================
// PAYMENT REFUND
// ============================================

export async function processRefund(
  orderId: string,
  amount?: number, // in paise, partial refund if specified
  reason?: string
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  try {
    const supabase = await getSupabaseClient();

    const { data: order } = await supabase
      .from('orders')
      .select('id, payment_method, payment_status, total_amount, razorpay_payment_id, stripe_payment_intent_id, currency')
      .eq('id', orderId)
      .single();

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if ((order as any).payment_status !== 'paid') {
      return { success: false, error: 'Order not paid' };
    }

    const refundAmount = amount || order.total_amount;

    if (order.payment_method === 'razorpay' && order.razorpay_payment_id) {
      const keySecret = process.env['RAZORPAY_KEY_SECRET'];
      if (!keySecret) return { success: false, error: 'Razorpay not configured' };

      const auth = Buffer.from(`${process.env['RAZORPAY_KEY_ID']}:${keySecret}`).toString('base64');
      const response = await fetch(`https://api.razorpay.com/v1/payments/${order.razorpay_payment_id}/refund`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: refundAmount,
          notes: { reason: reason || 'Customer requested refund' },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error?.description || 'Refund failed' };
      }

      await supabase
        .from('orders')
        .update({
          payment_status: refundAmount >= order.total_amount ? 'refunded' : 'partially_refunded',
          refund_amount: refundAmount,
          refunded_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      return { success: true, refundId: data.id };
    }

    if (order.payment_method === 'stripe' && order.stripe_payment_intent_id) {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env['STRIPE_SECRET_KEY']!, { apiVersion: '2024-04-10' });

      const refund = await stripe.refunds.create({
        payment_intent: order.stripe_payment_intent_id,
        amount: refundAmount,
        reason: 'requested_by_customer',
        metadata: { reason: reason || 'Customer requested refund' },
      });

      await supabase
        .from('orders')
        .update({
          payment_status: refundAmount >= order.total_amount ? 'refunded' : 'partially_refunded',
          refund_amount: refundAmount,
          refunded_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      return { success: true, refundId: refund.id };
    }

    return { success: false, error: 'Unsupported payment method for refund' };
  } catch (error) {
    console.error('Refund error:', error);
    return { success: false, error: 'Refund processing failed' };
  }
}
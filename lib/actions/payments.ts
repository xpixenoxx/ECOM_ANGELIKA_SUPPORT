'use server';

import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCashfreeApiBaseUrl, getOptionalEnv } from '@/lib/env';
import { sendEmailViaResend, isResendConfigured } from '@/lib/email/resend';
import { OPS_ADMIN_ROLES, logAdminAction, requireAdminRole } from '@/lib/supabase/admin-auth';
import { fromPaise, toPaise } from '@/lib/pricing';
import { escapeHtml } from '@/lib/validators/commerce';
import { normalizeAddress } from '@/lib/utils/address';
import type { Database, Json } from '@/types/database';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];

function parseMeta(json: Json): Record<string, unknown> {
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    return json as Record<string, unknown>;
  }
  return {};
}

async function claimWebhookEvent(
  provider: 'cashfree' | 'razorpay' | 'stripe' | 'delhivery' | 'whatsapp',
  eventId: string,
  eventType: string,
  payload: unknown
): Promise<{ alreadyProcessed: boolean }> {
  if (!eventId) return { alreadyProcessed: false };
  const { error } = await supabaseAdmin.from('webhook_events').insert({
    provider,
    event_id: eventId,
    event_type: eventType,
    payload: payload as Json,
    status: 'processed',
  });

  if (error) {
    // 23505 = unique_violation on (provider, event_id)
    if (error.code === '23505') {
      return { alreadyProcessed: true };
    }
    console.error('[claimWebhookEvent] error:', error.message);
  }
  return { alreadyProcessed: false };
}

// ============================================
// RAZORPAY WEBHOOK HANDLER
// ============================================

interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
  amount: number; // in paise
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
  amount: number; // in paise
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
  signature: string,
  deliveryEventId?: string | null
): Promise<{ success: boolean; error?: string; duplicate?: boolean }> {
  try {
    // Razorpay webhooks MUST verify against RAZORPAY_WEBHOOK_SECRET (never key secret)
    const webhookSecret = getOptionalEnv('RAZORPAY_WEBHOOK_SECRET');
    if (!webhookSecret) {
      return { success: false, error: 'Razorpay webhook secret not configured' };
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature.length !== signature.length) {
      return { success: false, error: 'Invalid signature' };
    }

    const sigMatches = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
    if (!sigMatches) {
      console.error('Invalid Razorpay webhook signature');
      return { success: false, error: 'Invalid signature' };
    }

    const event: RazorpayWebhookEvent = JSON.parse(payload);
    const derivedEventId =
      deliveryEventId ||
      `${event.event}:${event.payload.payment?.entity?.id || event.payload.refund?.entity?.id || event.payload.order?.entity?.id || event.created_at}`;

    const claim = await claimWebhookEvent('razorpay', derivedEventId, event.event, event);
    if (claim.alreadyProcessed) {
      return { success: true, duplicate: true };
    }

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment?.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment?.entity);
        break;
      case 'order.paid':
        await handleOrderPaid(event.payload.order?.entity);
        break;
      case 'refund.created':
      case 'refund.processed':
        await handleRazorpayRefundEvent(event.payload.refund?.entity);
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

async function confirmAndMarkOrderPaid(params: {
  order: Pick<OrderRow, 'id' | 'email' | 'total_amount' | 'payment_status' | 'status' | 'metadata'>;
  provider: 'cashfree' | 'razorpay' | 'stripe';
  paymentId: string;
}) {
  const { order, provider, paymentId } = params;
  const existingMeta = parseMeta(order.metadata);

  if (order.payment_status === 'paid') {
    return;
  }

  const confirmRes = await supabaseAdmin.rpc('confirm_order_inventory', { p_order_id: order.id });
  const confirmData = confirmRes.data as { confirmed?: boolean; stock_conflict?: boolean } | null;

  if (confirmRes.error || confirmData?.stock_conflict) {
    // Late webhook arrived after 15m TTL expired and stock was bought by someone else -> auto-refund
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'cancelled',
        cancel_reason: 'Stock unavailable when late payment settled — automatic refund initiated',
        cancelled_at: new Date().toISOString(),
        metadata: {
          ...existingMeta,
          stock_conflict: true,
          [`${provider}_payment_id`]: paymentId,
          late_payment_detected_at: new Date().toISOString(),
        } as unknown as Json,
      })
      .eq('id', order.id);

    await executeGatewayRefund(order.id, order.total_amount, 'Stock conflict after reservation expiry');
    return;
  }

  await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'confirmed',
      metadata: {
        ...existingMeta,
        [`${provider}_payment_id`]: paymentId,
        paid_at: new Date().toISOString(),
      } as unknown as Json,
    })
    .eq('id', order.id);

  await sendOrderConfirmation(order.id);
}

async function handlePaymentCaptured(payment: RazorpayPaymentEntity | undefined) {
  if (!payment) return;

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, email, total_amount, payment_status, status, metadata')
    .eq('payment_id', payment.order_id)
    .maybeSingle();

  if (!order) return;

  await confirmAndMarkOrderPaid({
    order,
    provider: 'razorpay',
    paymentId: payment.id,
  });
}

async function handlePaymentFailed(payment: RazorpayPaymentEntity | undefined) {
  if (!payment) return;

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, payment_status, status, metadata')
    .eq('payment_id', payment.order_id)
    .maybeSingle();

  if (!order) return;

  // Never downgrade an already-paid order from an out-of-order failed retry event
  if (order.payment_status === 'paid' || order.payment_status === 'refunded') {
    return;
  }

  const existingMeta = parseMeta(order.metadata);

  await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'failed',
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancel_reason: payment.error_description || payment.error_code || 'Payment failed',
      metadata: {
        ...existingMeta,
        payment_failed_at: new Date().toISOString(),
        payment_failure_reason: payment.error_description || payment.error_code || 'Payment failed',
      } as unknown as Json,
    })
    .eq('id', order.id);

  await supabaseAdmin.rpc('release_order_inventory', { p_order_id: order.id });
}

async function handleOrderPaid(orderData: RazorpayOrderEntity | undefined) {
  if (!orderData) return;

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, email, total_amount, payment_status, status, metadata')
    .eq('payment_id', orderData.id)
    .maybeSingle();

  if (!order) return;

  const expectedPaise = toPaise(Number(order.total_amount));
  if (orderData.amount_paid >= expectedPaise) {
    await confirmAndMarkOrderPaid({
      order,
      provider: 'razorpay',
      paymentId: orderData.id,
    });
  }
}

async function handleRazorpayRefundEvent(refund: RazorpayRefundEntity | undefined) {
  if (!refund) return;

  // Search paid or partially_refunded orders whose metadata.razorpay_payment_id matches
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('id, total_amount, payment_status, metadata')
    .eq('payment_method', 'razorpay')
    .in('payment_status', ['paid', 'partially_refunded']);

  if (!orders || orders.length === 0) return;

  const order = orders.find((o) => {
    const meta = parseMeta(o.metadata);
    return meta['razorpay_payment_id'] === refund.payment_id;
  });

  if (!order) return;

  const existingMeta = parseMeta(order.metadata);
  const refundedInr = fromPaise(refund.amount);
  const previousRefundedInr = Number(existingMeta['refund_amount'] || 0);
  const cumulativeRefundedInr = Math.min(Number(order.total_amount), Math.max(previousRefundedInr, refundedInr));
  const isFullRefund = cumulativeRefundedInr >= Number(order.total_amount);

  await supabaseAdmin
    .from('orders')
    .update({
      payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
      ...(isFullRefund ? { status: 'cancelled', cancelled_at: new Date().toISOString() } : {}),
      metadata: {
        ...existingMeta,
        refund_id: refund.id,
        refund_amount: cumulativeRefundedInr,
        refund_amount_paise: refund.amount,
        refunded_at: new Date().toISOString(),
      } as unknown as Json,
    })
    .eq('id', order.id);

  if (isFullRefund) {
    await supabaseAdmin.rpc('release_order_inventory', { p_order_id: order.id });
  }
}

// ============================================
// CASHFREE WEBHOOK HANDLER (PG API v2023-08-01)
// ============================================

export interface CashfreeWebhookPayload {
  type?: string;
  event_time?: string;
  data?: {
    order?: {
      order_id?: string;
      order_amount?: number;
      order_currency?: string;
      order_tags?: Record<string, string>;
    };
    payment?: {
      cf_payment_id?: string | number;
      payment_status?: string;
      payment_amount?: number;
      payment_currency?: string;
      payment_message?: string;
      payment_time?: string;
      payment_group?: string;
    };
    refund?: {
      cf_refund_id?: string | number;
      refund_id?: string;
      order_id?: string;
      refund_amount?: number;
      refund_currency?: string;
      refund_status?: string;
      refund_note?: string;
    };
  };
}

export async function handleCashfreeWebhook(
  payload: string,
  signature: string,
  timestamp: string,
  deliveryEventId?: string | null
): Promise<{ success: boolean; error?: string; duplicate?: boolean }> {
  try {
    const webhookSecret =
      getOptionalEnv('CASHFREE_WEBHOOK_SECRET') || getOptionalEnv('CASHFREE_SECRET_KEY');
    if (!webhookSecret) {
      return { success: false, error: 'Cashfree webhook secret not configured' };
    }

    if (!signature || !timestamp) {
      return { success: false, error: 'Invalid signature' };
    }

    const signedPayload = `${timestamp}${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('base64');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const actualBuf = Buffer.from(signature, 'utf8');
    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      console.error('Invalid Cashfree webhook signature');
      return { success: false, error: 'Invalid signature' };
    }

    const event: CashfreeWebhookPayload = JSON.parse(payload);
    const eventType = event.type || 'UNKNOWN_CASHFREE_EVENT';
    const cfOrderId = event.data?.order?.order_id || event.data?.refund?.order_id || '';
    const cfPaymentId = String(
      event.data?.payment?.cf_payment_id ||
        event.data?.refund?.cf_refund_id ||
        event.data?.refund?.refund_id ||
        cfOrderId ||
        timestamp
    );
    const derivedEventId = deliveryEventId || `${eventType}:${cfOrderId}:${cfPaymentId}`;

    const claim = await claimWebhookEvent('cashfree', derivedEventId, eventType, event);
    if (claim.alreadyProcessed) {
      return { success: true, duplicate: true };
    }

    const internalOrderId = event.data?.order?.order_tags?.['internal_order_id'];

    const findOrderForCashfree = async () => {
      if (internalOrderId) {
        const { data: byId } = await supabaseAdmin
          .from('orders')
          .select('id, email, total_amount, payment_status, status, metadata')
          .eq('id', internalOrderId)
          .maybeSingle();
        if (byId) return byId;
      }
      if (cfOrderId) {
        const { data: byPaymentId } = await supabaseAdmin
          .from('orders')
          .select('id, email, total_amount, payment_status, status, metadata')
          .eq('payment_id', cfOrderId)
          .maybeSingle();
        if (byPaymentId) return byPaymentId;
      }
      return null;
    };

    switch (eventType) {
      case 'PAYMENT_SUCCESS_WEBHOOK': {
        const order = await findOrderForCashfree();
        if (order) {
          const paidAmount = Number(
            event.data?.payment?.payment_amount ?? event.data?.order?.order_amount ?? 0
          );
          if (paidAmount >= Number(order.total_amount)) {
            await confirmAndMarkOrderPaid({
              order,
              provider: 'cashfree',
              paymentId: String(event.data?.payment?.cf_payment_id || cfOrderId),
            });
          }
        }
        break;
      }
      case 'PAYMENT_FAILED_WEBHOOK':
      case 'PAYMENT_USER_DROPPED_WEBHOOK': {
        const order = await findOrderForCashfree();
        if (order && order.payment_status !== 'paid' && order.payment_status !== 'refunded') {
          const existingMeta = parseMeta(order.metadata);
          const failureReason =
            event.data?.payment?.payment_message ||
            (eventType === 'PAYMENT_USER_DROPPED_WEBHOOK' ? 'Customer dropped payment' : 'Payment failed');
          await supabaseAdmin
            .from('orders')
            .update({
              payment_status: 'failed',
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
              cancel_reason: failureReason,
              metadata: {
                ...existingMeta,
                payment_failed_at: new Date().toISOString(),
                payment_failure_reason: failureReason,
                cashfree_order_id: cfOrderId,
              } as unknown as Json,
            })
            .eq('id', order.id);

          await supabaseAdmin.rpc('release_order_inventory', { p_order_id: order.id });
        }
        break;
      }
      case 'REFUND_STATUS_WEBHOOK': {
        const refund = event.data?.refund;
        if (refund && refund.refund_status === 'SUCCESS') {
          const order = await findOrderForCashfree();
          if (order) {
            const existingMeta = parseMeta(order.metadata);
            const refundedInr = Number(refund.refund_amount || 0);
            const previousRefundedInr = Number(existingMeta['refund_amount'] || 0);
            const cumulativeRefundedInr = Math.min(
              Number(order.total_amount),
              Math.max(previousRefundedInr, refundedInr)
            );
            const isFullRefund = cumulativeRefundedInr >= Number(order.total_amount);

            await supabaseAdmin
              .from('orders')
              .update({
                payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
                ...(isFullRefund ? { status: 'cancelled', cancelled_at: new Date().toISOString() } : {}),
                metadata: {
                  ...existingMeta,
                  refund_id: String(refund.cf_refund_id || refund.refund_id || ''),
                  refund_amount: cumulativeRefundedInr,
                  refund_amount_paise: toPaise(cumulativeRefundedInr),
                  refunded_at: new Date().toISOString(),
                } as unknown as Json,
              })
              .eq('id', order.id);

            if (isFullRefund) {
              await supabaseAdmin.rpc('release_order_inventory', { p_order_id: order.id });
            }
          }
        }
        break;
      }
      default:
        console.log(`Unhandled Cashfree webhook event: ${eventType}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Cashfree webhook error:', error);
    return { success: false, error: 'Webhook processing failed' };
  }
}

// ============================================
// STRIPE INTEGRATION
// ============================================

interface StripePaymentIntentParams {
  amount: number; // in minor units (paise/cents)
  currency: string;
  orderId: string;
  userId?: string;
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
    const secretKey = getOptionalEnv('STRIPE_SECRET_KEY');
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
        user_id: params.userId || 'guest',
        ...params.metadata,
      },
      receipt_email: params.email,
    });

    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('metadata')
      .eq('id', params.orderId)
      .maybeSingle();
    const existingMeta = parseMeta(existingOrder?.metadata ?? {});

    await supabaseAdmin
      .from('orders')
      .update({
        payment_id: paymentIntent.id,
        metadata: {
          ...existingMeta,
          stripe_payment_intent_id: paymentIntent.id,
        } as unknown as Json,
      })
      .eq('id', params.orderId);

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
    const secretKey = getOptionalEnv('STRIPE_SECRET_KEY');
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

    const { data: orderRow } = await supabaseAdmin
      .from('orders')
      .select('id, email, total_amount, payment_status, status, metadata')
      .eq('id', orderId)
      .maybeSingle();

    if (!orderRow) {
      return { success: false, error: 'Order not found' };
    }

    await confirmAndMarkOrderPaid({
      order: orderRow,
      provider: 'stripe',
      paymentId: paymentIntent.id,
    });

    return { success: true, orderId };
  } catch (error) {
    console.error('Stripe verification error:', error);
    return { success: false, error: 'Payment verification failed' };
  }
}

export async function handleStripeWebhook(
  payload: string,
  signature: string
): Promise<{ success: boolean; error?: string; duplicate?: boolean }> {
  try {
    const webhookSecret = getOptionalEnv('STRIPE_WEBHOOK_SECRET');
    const secretKey = getOptionalEnv('STRIPE_SECRET_KEY');
    if (!webhookSecret || !secretKey) {
      return { success: false, error: 'Stripe webhook not configured' };
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(secretKey, { apiVersion: '2024-04-10' });

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    const claim = await claimWebhookEvent('stripe', event.id, event.type, event);
    if (claim.alreadyProcessed) {
      return { success: true, duplicate: true };
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        const orderId = paymentIntent?.metadata?.['order_id'] as string | undefined;
        if (orderId) {
          const { data: orderRow } = await supabaseAdmin
            .from('orders')
            .select('id, email, total_amount, payment_status, status, metadata')
            .eq('id', orderId)
            .maybeSingle();
          if (orderRow) {
            await confirmAndMarkOrderPaid({
              order: orderRow,
              provider: 'stripe',
              paymentId: paymentIntent.id,
            });
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        const orderId = paymentIntent?.metadata?.['order_id'] as string | undefined;
        if (orderId) {
          const { data: orderRow } = await supabaseAdmin
            .from('orders')
            .select('id, payment_status, metadata')
            .eq('id', orderId)
            .maybeSingle();
          if (orderRow && orderRow.payment_status !== 'paid') {
            const existingMeta = parseMeta(orderRow.metadata);
            await supabaseAdmin
              .from('orders')
              .update({
                payment_status: 'failed',
                status: 'cancelled',
                cancelled_at: new Date().toISOString(),
                cancel_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
                metadata: {
                  ...existingMeta,
                  payment_failed_at: new Date().toISOString(),
                  payment_failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
                } as unknown as Json,
              })
              .eq('id', orderId);
            await supabaseAdmin.rpc('release_order_inventory', { p_order_id: orderId });
          }
        }
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as any;
        const paymentIntentId = charge.payment_intent;
        if (paymentIntentId) {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          const orderId = paymentIntent.metadata['order_id'];
          if (orderId) {
            const { data: orderRow } = await supabaseAdmin
              .from('orders')
              .select('id, total_amount, metadata')
              .eq('id', orderId)
              .maybeSingle();
            if (orderRow) {
              const existingMeta = parseMeta(orderRow.metadata);
              const refundedInr = fromPaise(Number(charge.amount_refunded || 0));
              const totalAmount = Number(orderRow.total_amount || 0);
              const isFullRefund = refundedInr >= totalAmount;
              await supabaseAdmin
                .from('orders')
                .update({
                  payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
                  ...(isFullRefund ? { status: 'cancelled', cancelled_at: new Date().toISOString() } : {}),
                  metadata: {
                    ...existingMeta,
                    refund_amount: refundedInr,
                    refund_amount_paise: charge.amount_refunded,
                    refunded_at: new Date().toISOString(),
                  } as unknown as Json,
                })
                .eq('id', orderId);
              if (isFullRefund) {
                await supabaseAdmin.rpc('release_order_inventory', { p_order_id: orderId });
              }
            }
          }
        }
        break;
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return {
      success: false,
      error: error?.type === 'StripeSignatureVerificationError' ? 'Invalid signature' : 'Webhook processing failed',
    };
  }
}

// ============================================
// ORDER CONFIRMATION NOTIFICATIONS
// ============================================

async function sendOrderConfirmation(orderId: string) {
  try {
    const { data: order } = await supabaseAdmin
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

    await sendOrderEmail(order);

    if (order.whatsapp_opt_in) {
      await sendOrderWhatsApp(order);
    }

    await sendAdminOrderNotification(order);
  } catch (error) {
    console.error('Order confirmation error:', error);
  }
}

async function sendOrderEmail(
  order: OrderRow & { order_items: (OrderItemRow & { product: any })[] }
) {
  const html = generateOrderEmailContent(order);

  if (isResendConfigured()) {
    await sendEmailViaResend({
      to: order.email,
      subject: `Order Confirmed — #${order.order_number} | Angelika Fashions`,
      html,
      text: `Namaste, your Angelika Fashions order #${order.order_number} for ₹${Number(order.total_amount).toLocaleString('en-IN')} is confirmed.`,
    });
  }

  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: order.user_id,
      type: 'order_confirmation',
      channel: 'email',
      subject: `Order Confirmed - ${order.order_number}`,
      content: html,
      status: isResendConfigured() ? 'sent' : 'pending',
      metadata: { order_id: order.id, order_number: order.order_number },
    });
}

async function sendOrderWhatsApp(
  order: OrderRow & { order_items: (OrderItemRow & { product: any })[] }
) {
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: order.user_id,
      type: 'order_confirmation',
      channel: 'whatsapp',
      content: generateWhatsAppOrderContent(order),
      status: 'pending',
      metadata: { order_id: order.id, phone: order.phone },
    });
}

async function sendAdminOrderNotification(
  order: OrderRow & { order_items: (OrderItemRow & { product: any })[] }
) {
  await supabaseAdmin
    .from('notifications')
    .insert({
      type: 'admin_new_order',
      channel: 'email',
      subject: `New Order #${order.order_number}`,
      content: generateAdminOrderEmailContent(order),
      status: 'pending',
      metadata: { order_id: order.id, total: order.total_amount },
    });
}

function generateOrderEmailContent(
  order: OrderRow & { order_items: (OrderItemRow & { product: any })[] }
): string {
  const itemsHtml = order.order_items
    .map((item) => {
      const variantDetails = parseMeta(item.variant_details);
      const size = escapeHtml(variantDetails['size'] || '');
      const color = escapeHtml(variantDetails['color'] || '');
      return `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${escapeHtml(item.product_name)}</strong><br/>
        <small>${size} &bull; ${color}</small>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
        ${Number(item.quantity)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
        ₹${Number(item.unit_price).toLocaleString('en-IN')}
      </td>
    </tr>
  `;
    })
    .join('');

  const addr = normalizeAddress(order.shipping_address);
  const firstName = escapeHtml(addr.firstName || 'Customer');

  return `
    <h1>Order Confirmed!</h1>
    <p>Hi ${firstName},</p>
    <p>Your order <strong>${escapeHtml(order.order_number)}</strong> has been confirmed.</p>
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
      Total: ₹${Number(order.total_amount).toLocaleString('en-IN')}
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
      const variantDetails = parseMeta(item.variant_details);
      const size = String(variantDetails['size'] || '');
      const color = String(variantDetails['color'] || '');
      return `• ${item.product_name} (${size}, ${color}) x${item.quantity} - ₹${Number(item.unit_price).toLocaleString('en-IN')}`;
    })
    .join('\n');

  return `🎉 *Order Confirmed!*

Order: ${order.order_number}
${itemsText}

*Total: ₹${Number(order.total_amount).toLocaleString('en-IN')}*

We'll notify you when your order ships.

Thank you for shopping with Angelika Fashions! 🛍️`;
}

function generateAdminOrderEmailContent(
  order: OrderRow & { order_items: (OrderItemRow & { product: any })[] }
): string {
  const itemsText = order.order_items
    .map((item) => {
      const variantDetails = parseMeta(item.variant_details);
      const size = String(variantDetails['size'] || '');
      const color = String(variantDetails['color'] || '');
      return `${item.product_name} (${size}, ${color}) x${item.quantity} - ₹${Number(item.unit_price).toLocaleString('en-IN')}`;
    })
    .join('\n');

  const addr = normalizeAddress(order.shipping_address);

  return `
New order received!

Order ID: ${order.order_number}
Customer: ${addr.fullName}
Email: ${order.email}
Phone: ${order.phone}
Payment: ${order.payment_method}
Status: ${order.status}

Items:
${itemsText}

Total: ₹${Number(order.total_amount).toLocaleString('en-IN')}
  `;
}

// ============================================
// PAYMENT REFUND (Gateway Execution & RBAC Guarded Action)
// ============================================

export async function executeGatewayRefund(
  orderId: string,
  amountInr?: number,
  reason?: string
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  try {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, payment_method, payment_status, total_amount, metadata, currency, payment_id')
      .eq('id', orderId)
      .single();

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.payment_status !== 'paid' && order.payment_status !== 'partially_refunded') {
      return { success: false, error: 'Order has not been paid' };
    }

    const meta = parseMeta(order.metadata);
    const alreadyRefundedInr = Number(meta['refund_amount'] || 0);
    const maxRefundableInr = Math.max(0, Number(order.total_amount) - alreadyRefundedInr);
    const requestedInr = amountInr !== undefined ? Number(amountInr) : maxRefundableInr;

    if (!Number.isFinite(requestedInr) || requestedInr <= 0) {
      return { success: false, error: 'Refund amount must be positive' };
    }
    if (requestedInr > maxRefundableInr) {
      return { success: false, error: `Refund exceeds remaining refundable amount (₹${maxRefundableInr})` };
    }

    const refundAmountPaise = toPaise(requestedInr);
    const newCumulativeRefunded = alreadyRefundedInr + requestedInr;
    const isFullRefund = newCumulativeRefunded >= Number(order.total_amount);

    const cashfreeOrderId = (meta['cashfree_order_id'] || order.payment_id) as string | undefined;
    const razorpayPaymentId = meta['razorpay_payment_id'] as string | undefined;
    const stripePaymentIntentId = (meta['stripe_payment_intent_id'] || order.payment_id) as string | undefined;

    if (order.payment_method === 'cashfree' && cashfreeOrderId) {
      const appId = getOptionalEnv('CASHFREE_APP_ID');
      const secretKey = getOptionalEnv('CASHFREE_SECRET_KEY');
      if (!appId || !secretKey) return { success: false, error: 'Cashfree not configured' };

      const refundId = `ref_${orderId.replace(/-/g, '').slice(0, 12)}_${Date.now()}`;
      const baseUrl = getCashfreeApiBaseUrl();
      const response = await fetch(`${baseUrl}/orders/${encodeURIComponent(cashfreeOrderId)}/refunds`, {
        method: 'POST',
        headers: {
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          refund_amount: Number(requestedInr.toFixed(2)),
          refund_id: refundId,
          refund_note: reason || 'Customer requested refund',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data?.message || 'Cashfree refund failed' };
      }

      const resolvedRefundId = String(data.cf_refund_id || data.refund_id || refundId);

      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
          ...(isFullRefund ? { status: 'cancelled', cancelled_at: new Date().toISOString() } : {}),
          metadata: {
            ...meta,
            refund_id: resolvedRefundId,
            refund_amount: newCumulativeRefunded,
            refund_amount_paise: toPaise(newCumulativeRefunded),
            refunded_at: new Date().toISOString(),
          } as unknown as Json,
        })
        .eq('id', orderId);

      if (isFullRefund) {
        await supabaseAdmin.rpc('release_order_inventory', { p_order_id: orderId });
      }

      return { success: true, refundId: resolvedRefundId };
    }

    if (order.payment_method === 'razorpay' && razorpayPaymentId) {
      const keySecret = getOptionalEnv('RAZORPAY_KEY_SECRET');
      const keyId = getOptionalEnv('RAZORPAY_KEY_ID');
      if (!keySecret || !keyId) return { success: false, error: 'Razorpay not configured' };

      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch(`https://api.razorpay.com/v1/payments/${razorpayPaymentId}/refund`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: refundAmountPaise,
          notes: { reason: reason || 'Customer requested refund' },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error?.description || 'Refund failed' };
      }

      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
          ...(isFullRefund ? { status: 'cancelled', cancelled_at: new Date().toISOString() } : {}),
          metadata: {
            ...meta,
            refund_id: data.id,
            refund_amount: newCumulativeRefunded,
            refund_amount_paise: toPaise(newCumulativeRefunded),
            refunded_at: new Date().toISOString(),
          } as unknown as Json,
        })
        .eq('id', orderId);

      if (isFullRefund) {
        await supabaseAdmin.rpc('release_order_inventory', { p_order_id: orderId });
      }

      return { success: true, refundId: data.id };
    }

    if (order.payment_method === 'stripe' && stripePaymentIntentId) {
      const secretKey = getOptionalEnv('STRIPE_SECRET_KEY');
      if (!secretKey) return { success: false, error: 'Stripe not configured' };

      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(secretKey, { apiVersion: '2024-04-10' });

      const refund = await stripe.refunds.create({
        payment_intent: stripePaymentIntentId,
        amount: refundAmountPaise,
        reason: 'requested_by_customer',
        metadata: { reason: reason || 'Customer requested refund' },
      });

      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
          ...(isFullRefund ? { status: 'cancelled', cancelled_at: new Date().toISOString() } : {}),
          metadata: {
            ...meta,
            refund_id: refund.id,
            refund_amount: newCumulativeRefunded,
            refund_amount_paise: toPaise(newCumulativeRefunded),
            refunded_at: new Date().toISOString(),
          } as unknown as Json,
        })
        .eq('id', orderId);

      if (isFullRefund) {
        await supabaseAdmin.rpc('release_order_inventory', { p_order_id: orderId });
      }

      return { success: true, refundId: refund.id };
    }

    return { success: false, error: 'Unsupported payment method or missing gateway payment reference for refund' };
  } catch (error) {
    console.error('Refund error:', error);
    return { success: false, error: 'Refund processing failed' };
  }
}

export async function processRefund(
  orderId: string,
  amount?: number,
  reason?: string
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  const auth = await requireAdminRole(OPS_ADMIN_ROLES);
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const res = await executeGatewayRefund(orderId, amount, reason);
  if (res.success) {
    await logAdminAction({
      actorId: auth.userId,
      action: 'process_order_refund',
      entityType: 'order',
      entityId: orderId,
      afterState: { amountInr: amount, reason, refundId: res.refundId },
    });
  }
  return res;
}

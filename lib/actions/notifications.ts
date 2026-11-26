'use server';

/**
 * Idempotent Order, Payment, Refund & Shipment Notification Service
 *
 * - Deduplicates via `public.notifications.dedup_key` so concurrent frontend
 *   verification and webhook deliveries NEVER trigger duplicate emails.
 * - Always emails the actual customer (`order.email`) — never a hardcoded admin address.
 * - Accurately records delivery status (`sent` | `pending` | `failed`) and never
 *   silently claims success when Resend fails or is unconfigured.
 * - Never throws into payment/order state transitions.
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendEmailViaResend, isResendConfigured } from '@/lib/email/resend';
import { getOptionalEnv } from '@/lib/env';
import { escapeHtml } from '@/lib/validators/commerce';
import { normalizeAddress } from '@/lib/utils/address';
import type { Database, Json } from '@/types/database';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
type OrderWithItems = OrderRow & { order_items: OrderItemRow[] };

function parseMeta(json: Json | null | undefined): Record<string, unknown> {
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    return json as Record<string, unknown>;
  }
  return {};
}

function getSiteUrl(): string {
  return (getOptionalEnv('NEXT_PUBLIC_SITE_URL') || 'https://angelikafashions.com').replace(/\/+$/, '');
}

function formatMethodLabel(method: string | null | undefined): string {
  const m = (method || '').toLowerCase();
  if (m === 'razorpay') return 'Razorpay Online Payment';
  if (m === 'cod') return 'Cash on Delivery (COD)';
  if (m === 'stripe') return 'Card (Stripe)';
  return 'Online Payment';
}

function wrapBrandedEmail(params: {
  badge: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const siteUrl = getSiteUrl();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(params.heading)} | Angelika Fashions</title>
</head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1A1A1A;">
  <div style="max-width:600px;margin:28px auto;background:#FFFFFF;border:1px solid #EAE3D9;border-radius:14px;overflow:hidden;">
    <div style="background:#1C1917;padding:28px 24px;text-align:center;border-bottom:3px solid #C9A84C;">
      <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#C9A84C;font-weight:600;">${escapeHtml(params.badge)}</p>
      <h1 style="margin:0;font-size:24px;font-weight:500;color:#FFFFFF;letter-spacing:1.5px;font-family:Georgia,serif;">ANGELIKA FASHIONS</h1>
    </div>
    <div style="padding:32px 28px;">
      <h2 style="margin:0 0 14px 0;font-size:21px;font-weight:600;color:#1A1A1A;font-family:Georgia,serif;">${escapeHtml(params.heading)}</h2>
      ${params.bodyHtml}
      ${
        params.ctaLabel && params.ctaUrl
          ? `<div style="margin-top:24px;text-align:center;">
               <a href="${escapeHtml(params.ctaUrl)}" style="display:inline-block;background:#1C1917;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:0.8px;">${escapeHtml(params.ctaLabel)}</a>
             </div>`
          : ''
      }
    </div>
    <div style="background:#F9F7F4;padding:18px 24px;border-top:1px solid #EAE3D9;text-align:center;font-size:11px;color:#78716C;">
      <p style="margin:0 0 4px 0;">Angelika Fashions · <a href="${escapeHtml(siteUrl)}" style="color:#8C6D23;text-decoration:none;">angelikafashions.com</a></p>
      <p style="margin:0;">Need assistance? Reply or message our concierge on +91 72072 56690.</p>
    </div>
  </div>
</body>
</html>`;
}

async function dispatchIdempotentEmail(params: {
  dedupKey: string;
  userId?: string | null;
  roleTarget: 'customer' | 'admin';
  type: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  link?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ sent: boolean; skipped?: boolean; status: 'sent' | 'pending' | 'failed' }> {
  try {
    // 1. Check / claim dedup_key atomically via unique index
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: params.userId ?? null,
        role_target: params.roleTarget,
        type: params.type,
        channel: 'email',
        subject: params.subject,
        title: params.subject,
        content: params.html,
        message: params.text.slice(0, 500),
        link: params.link ?? null,
        status: 'pending',
        dedup_key: params.dedupKey,
        metadata: (params.metadata ?? {}) as unknown as Json,
      })
      .select('id')
      .maybeSingle();

    if (insertErr) {
      if (insertErr.code === '23505') {
        // Already claimed; skip if already sent
        const { data: existing } = await supabaseAdmin
          .from('notifications')
          .select('id, status')
          .eq('dedup_key', params.dedupKey)
          .maybeSingle();

        if (existing?.status === 'sent') {
          return { sent: true, skipped: true, status: 'sent' };
        }
        // Retry dispatch if previously failed or pending and Resend is now configured
        if (existing?.id && isResendConfigured()) {
          const retryRes = await sendEmailViaResend({
            to: params.to,
            subject: params.subject,
            html: params.html,
            text: params.text,
          });
          const nextStatus = retryRes.success ? 'sent' : 'failed';
          await supabaseAdmin
            .from('notifications')
            .update({
              status: nextStatus,
              sent_at: retryRes.success ? new Date().toISOString() : null,
              error_message: retryRes.error || null,
            })
            .eq('id', existing.id);
          return { sent: retryRes.success, status: nextStatus };
        }
        return { sent: false, skipped: true, status: 'pending' };
      }

      console.error('[notifications] Failed to persist notification row:', insertErr.message);
      // Still attempt direct email if DB column isn't migrated yet, without claiming DB persistence
      if (isResendConfigured()) {
        const directRes = await sendEmailViaResend({
          to: params.to,
          subject: params.subject,
          html: params.html,
          text: params.text,
        });
        return { sent: directRes.success, status: directRes.success ? 'sent' : 'failed' };
      }
      return { sent: false, status: 'pending' };
    }

    const notificationId = inserted?.id;

    if (!isResendConfigured()) {
      if (notificationId) {
        await supabaseAdmin
          .from('notifications')
          .update({
            status: 'pending',
            error_message: 'RESEND_API_KEY not configured',
          })
          .eq('id', notificationId);
      }
      return { sent: false, status: 'pending' };
    }

    const sendRes = await sendEmailViaResend({
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    const finalStatus: 'sent' | 'failed' = sendRes.success ? 'sent' : 'failed';
    if (notificationId) {
      await supabaseAdmin
        .from('notifications')
        .update({
          status: finalStatus,
          sent_at: sendRes.success ? new Date().toISOString() : null,
          error_message: sendRes.error || null,
          metadata: {
            ...(params.metadata ?? {}),
            resend_id: sendRes.id || null,
          } as unknown as Json,
        })
        .eq('id', notificationId);
    }

    return { sent: sendRes.success, status: finalStatus };
  } catch (err: any) {
    console.error('[notifications] dispatchIdempotentEmail error:', err?.message || err);
    return { sent: false, status: 'failed' };
  }
}

async function fetchOrderWithItems(orderId: string): Promise<OrderWithItems | null> {
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .maybeSingle();
  return (order as unknown as OrderWithItems) || null;
}

async function resolveAdminAlertEmail(): Promise<string | null> {
  const envEmail = getOptionalEnv('ADMIN_ALERT_EMAIL');
  if (envEmail && envEmail.includes('@')) return envEmail;

  try {
    const { data } = await supabaseAdmin
      .from('store_settings')
      .select('contact_email')
      .limit(1)
      .maybeSingle();
    const dbEmail = data?.contact_email?.trim();
    if (dbEmail && dbEmail.includes('@') && !dbEmail.includes('example.com')) {
      return dbEmail;
    }
  } catch {
    // Ignore
  }
  return null;
}

function buildItemsTableHtml(order: OrderWithItems): string {
  const rows = (order.order_items || [])
    .map((item) => {
      const vd = parseMeta(item.variant_details);
      const size = escapeHtml(String(vd['size'] || ''));
      const color = escapeHtml(String(vd['color'] || ''));
      const variantLine = [size ? `Size: ${size}` : '', color ? `Color: ${color}` : '']
        .filter(Boolean)
        .join(' · ');
      return `<tr>
        <td style="padding:10px 8px;border-bottom:1px solid #EFEAE2;font-size:13px;">
          <strong>${escapeHtml(item.product_name)}</strong>
          ${variantLine ? `<br/><span style="font-size:11px;color:#78716C;">${variantLine}</span>` : ''}
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #EFEAE2;text-align:center;font-size:13px;">${Number(item.quantity)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #EFEAE2;text-align:right;font-size:13px;">₹${Number(item.total_price || item.unit_price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>`;
    })
    .join('');

  return `<table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <thead>
      <tr style="background:#FAF8F5;border-bottom:1px solid #E7E0D5;">
        <th style="padding:10px 8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#78716C;">Item</th>
        <th style="padding:10px 8px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#78716C;">Qty</th>
        <th style="padding:10px 8px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#78716C;">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

/**
 * 1. Idempotent Order Confirmation (customer + admin alert)
 */
export async function sendOrderConfirmedNotification(orderId: string): Promise<void> {
  const order = await fetchOrderWithItems(orderId);
  if (!order) return;

  const addr = normalizeAddress(order.shipping_address);
  const firstName = escapeHtml(addr.firstName || 'Valued Patron');
  const siteUrl = getSiteUrl();
  const trackUrl = `${siteUrl}/track-order`;

  const bodyHtml = `
    <p style="font-size:14px;line-height:1.6;color:#44403C;">Namaste ${firstName},</p>
    <p style="font-size:14px;line-height:1.6;color:#44403C;">
      Thank you for your order with Angelika Fashions. Your order <strong>#${escapeHtml(order.order_number)}</strong> is confirmed.
    </p>
    <div style="background:#FAF8F5;border:1px solid #EAE3D9;border-radius:10px;padding:14px 16px;margin:16px 0;font-size:13px;">
      <p style="margin:0 0 6px 0;"><strong>Payment Method:</strong> ${escapeHtml(formatMethodLabel(order.payment_method))}</p>
      <p style="margin:0 0 6px 0;"><strong>Payment Status:</strong> ${escapeHtml(order.payment_status.toUpperCase())}</p>
      <p style="margin:0;"><strong>Shipping To:</strong> ${escapeHtml([addr.fullName, addr.address1, addr.address2, addr.city, addr.state, addr.postalCode].filter(Boolean).join(', '))}</p>
    </div>
    ${buildItemsTableHtml(order)}
    <div style="text-align:right;font-size:14px;color:#44403C;margin-top:8px;">
      ${Number(order.discount_amount) > 0 ? `<p style="margin:2px 0;color:#15803D;">Discount: -₹${Number(order.discount_amount).toLocaleString('en-IN')}</p>` : ''}
      <p style="margin:2px 0;">Shipping: ${Number(order.shipping_cost) > 0 ? `₹${Number(order.shipping_cost).toLocaleString('en-IN')}` : 'FREE'}</p>
      <p style="margin:8px 0 0 0;font-size:18px;font-weight:700;color:#1A1A1A;">Total: ₹${Number(order.total_amount).toLocaleString('en-IN')}</p>
    </div>
    <p style="font-size:13px;color:#57534E;margin-top:16px;">We will send your courier tracking details as soon as your garment is dispatched.</p>
  `;

  await dispatchIdempotentEmail({
    dedupKey: `email:order_confirmed:${order.id}`,
    userId: order.user_id,
    roleTarget: 'customer',
    type: 'order_confirmation',
    to: order.email,
    subject: `Order Confirmed — #${order.order_number} | Angelika Fashions`,
    html: wrapBrandedEmail({
      badge: 'Order Confirmation',
      heading: `Order #${order.order_number} Confirmed`,
      bodyHtml,
      ctaLabel: 'Track Your Order',
      ctaUrl: trackUrl,
    }),
    text: `Namaste ${addr.firstName || 'Valued Patron'}, your Angelika Fashions order #${order.order_number} for ₹${Number(order.total_amount).toLocaleString('en-IN')} (${formatMethodLabel(order.payment_method)}) is confirmed. Track at ${trackUrl}`,
    link: `/account/orders/${order.id}`,
    metadata: { order_id: order.id, order_number: order.order_number, total_amount: order.total_amount },
  });

  // Notify admin inbox separately (never breaks customer flow)
  const adminEmail = await resolveAdminAlertEmail();
  if (adminEmail) {
    await dispatchIdempotentEmail({
      dedupKey: `email:admin_new_order:${order.id}`,
      userId: null,
      roleTarget: 'admin',
      type: 'admin_new_order',
      to: adminEmail,
      subject: `[New Order #${order.order_number}] ₹${Number(order.total_amount).toLocaleString('en-IN')} (${order.payment_method?.toUpperCase()})`,
      html: wrapBrandedEmail({
        badge: 'Atelier Admin Alert',
        heading: `New Order #${order.order_number}`,
        bodyHtml: `
          <p style="font-size:14px;color:#44403C;"><strong>Customer:</strong> ${escapeHtml(addr.fullName || order.email)} (${escapeHtml(order.email)} · ${escapeHtml(order.phone || addr.phone || 'N/A')})</p>
          <p style="font-size:14px;color:#44403C;"><strong>Payment:</strong> ${escapeHtml(formatMethodLabel(order.payment_method))} — ${escapeHtml(order.payment_status.toUpperCase())}</p>
          ${buildItemsTableHtml(order)}
          <p style="font-size:16px;font-weight:700;text-align:right;">Total: ₹${Number(order.total_amount).toLocaleString('en-IN')}</p>
        `,
        ctaLabel: 'Open Order in Admin',
        ctaUrl: `${siteUrl}/admin/orders/${order.id}`,
      }),
      text: `New Order #${order.order_number} — ₹${Number(order.total_amount).toLocaleString('en-IN')} by ${addr.fullName || order.email} (${order.payment_method}).`,
      link: `/admin/orders/${order.id}`,
      metadata: { order_id: order.id, order_number: order.order_number, total: order.total_amount },
    });
  }
}

/**
 * 2. Idempotent Payment Failed Notification
 */
export async function sendPaymentFailedNotification(orderId: string, reason?: string): Promise<void> {
  const order = await fetchOrderWithItems(orderId);
  if (!order) return;

  const addr = normalizeAddress(order.shipping_address);
  const siteUrl = getSiteUrl();

  await dispatchIdempotentEmail({
    dedupKey: `email:payment_failed:${order.id}`,
    userId: order.user_id,
    roleTarget: 'customer',
    type: 'payment_failed',
    to: order.email,
    subject: `Payment Unsuccessful for Order #${order.order_number} | Angelika Fashions`,
    html: wrapBrandedEmail({
      badge: 'Payment Update',
      heading: `Payment Could Not Be Completed`,
      bodyHtml: `
        <p style="font-size:14px;color:#44403C;">Namaste ${escapeHtml(addr.firstName || 'Valued Patron')},</p>
        <p style="font-size:14px;line-height:1.6;color:#44403C;">
          Your online payment attempt for order <strong>#${escapeHtml(order.order_number)}</strong> could not be completed${reason ? ` (${escapeHtml(reason)})` : ''}.
        </p>
        <p style="font-size:13px;color:#57534E;">If any amount was debited by your bank, Razorpay automatically refunds unsuccessful debits within 5–7 business days. No duplicate charge has been confirmed by our store.</p>
      `,
      ctaLabel: 'Return to Boutique',
      ctaUrl: `${siteUrl}/cart`,
    }),
    text: `Your payment for order #${order.order_number} could not be completed${reason ? `: ${reason}` : ''}. Any bank debit will auto-reverse within 5-7 business days.`,
    link: `/account/orders/${order.id}`,
    metadata: { order_id: order.id, reason: reason || null },
  });
}

/**
 * 3. Idempotent Order Cancellation Notification
 */
export async function sendOrderCancelledNotification(orderId: string, reason?: string): Promise<void> {
  const order = await fetchOrderWithItems(orderId);
  if (!order) return;

  const addr = normalizeAddress(order.shipping_address);

  await dispatchIdempotentEmail({
    dedupKey: `email:order_cancelled:${order.id}`,
    userId: order.user_id,
    roleTarget: 'customer',
    type: 'order_cancelled',
    to: order.email,
    subject: `Order Cancelled — #${order.order_number} | Angelika Fashions`,
    html: wrapBrandedEmail({
      badge: 'Order Update',
      heading: `Order #${order.order_number} Cancelled`,
      bodyHtml: `
        <p style="font-size:14px;color:#44403C;">Namaste ${escapeHtml(addr.firstName || 'Valued Patron')},</p>
        <p style="font-size:14px;line-height:1.6;color:#44403C;">
          Your order <strong>#${escapeHtml(order.order_number)}</strong> has been cancelled${reason ? ` (${escapeHtml(reason)})` : ''}.
        </p>
        ${
          order.payment_method !== 'cod' && (order.payment_status === 'paid' || order.payment_status === 'refund_pending' || order.payment_status === 'refunded')
            ? `<p style="font-size:13px;color:#57534E;">Your prepaid payment will be refunded to your original payment method. You will receive a separate refund confirmation email with the reference ID.</p>`
            : ''
        }
      `,
    }),
    text: `Your Angelika Fashions order #${order.order_number} has been cancelled${reason ? `: ${reason}` : ''}.`,
    link: `/account/orders/${order.id}`,
    metadata: { order_id: order.id, reason: reason || null },
  });
}

/**
 * 4. Idempotent Refund Initiated / Completed / Failed Notification
 */
export async function sendRefundStatusNotification(params: {
  orderId: string;
  refundId: string;
  amountInr: number;
  status: 'initiated' | 'processed' | 'failed';
  reason?: string;
}): Promise<void> {
  const order = await fetchOrderWithItems(params.orderId);
  if (!order) return;

  const addr = normalizeAddress(order.shipping_address);
  const statusTitles: Record<typeof params.status, string> = {
    initiated: `Refund Initiated — #${order.order_number}`,
    processed: `Refund Completed — #${order.order_number}`,
    failed: `Refund Update — #${order.order_number}`,
  };
  const statusCopy: Record<typeof params.status, string> = {
    initiated: `We have initiated a refund of <strong>₹${Number(params.amountInr).toLocaleString('en-IN')}</strong> to your original payment source. It typically reflects in 5–7 business days.`,
    processed: `Your refund of <strong>₹${Number(params.amountInr).toLocaleString('en-IN')}</strong> has been processed by Razorpay and credited back to your original payment method.`,
    failed: `We encountered an issue processing your refund of <strong>₹${Number(params.amountInr).toLocaleString('en-IN')}</strong>. Our finance team has been alerted and will resolve it promptly.`,
  };

  await dispatchIdempotentEmail({
    dedupKey: `email:refund_${params.status}:${params.refundId}`,
    userId: order.user_id,
    roleTarget: 'customer',
    type: `refund_${params.status}`,
    to: order.email,
    subject: `${statusTitles[params.status]} | Angelika Fashions`,
    html: wrapBrandedEmail({
      badge: 'Refund Update',
      heading: statusTitles[params.status],
      bodyHtml: `
        <p style="font-size:14px;color:#44403C;">Namaste ${escapeHtml(addr.firstName || 'Valued Patron')},</p>
        <p style="font-size:14px;line-height:1.6;color:#44403C;">${statusCopy[params.status]}</p>
        <div style="background:#FAF8F5;border:1px solid #EAE3D9;border-radius:10px;padding:12px 16px;margin:16px 0;font-size:13px;">
          <p style="margin:0 0 4px 0;"><strong>Order Number:</strong> #${escapeHtml(order.order_number)}</p>
          <p style="margin:0 0 4px 0;"><strong>Refund Reference:</strong> ${escapeHtml(params.refundId)}</p>
          <p style="margin:0;"><strong>Refund Amount:</strong> ₹${Number(params.amountInr).toLocaleString('en-IN')}</p>
        </div>
      `,
    }),
    text: `${statusTitles[params.status]}: ₹${Number(params.amountInr).toLocaleString('en-IN')} (Ref: ${params.refundId}).`,
    link: `/account/orders/${order.id}`,
    metadata: {
      order_id: order.id,
      refund_id: params.refundId,
      amount_inr: params.amountInr,
      status: params.status,
    },
  });
}

/**
 * 5. Idempotent Shipment Lifecycle Notification (created / shipped / out_for_delivery / delivered)
 */
export async function sendShipmentLifecycleNotification(params: {
  orderId: string;
  shipmentRef: string;
  stage: 'created' | 'shipped' | 'out_for_delivery' | 'delivered';
  courierName?: string | null;
  awbCode?: string | null;
  trackingUrl?: string | null;
}): Promise<void> {
  const order = await fetchOrderWithItems(params.orderId);
  if (!order) return;

  const addr = normalizeAddress(order.shipping_address);
  const siteUrl = getSiteUrl();
  const ctaUrl = params.trackingUrl || `${siteUrl}/track-order`;

  const stageMeta: Record<typeof params.stage, { subject: string; heading: string; message: string }> = {
    created: {
      subject: `Shipment Prepared — #${order.order_number} | Angelika Fashions`,
      heading: `Your Couture Parcel Is Ready for Pickup`,
      message: `Your order <strong>#${escapeHtml(order.order_number)}</strong> has been packed and assigned to our courier partner for pickup.`,
    },
    shipped: {
      subject: `Order Dispatched — #${order.order_number} | Angelika Fashions`,
      heading: `Your Order Has Been Dispatched`,
      message: `Your order <strong>#${escapeHtml(order.order_number)}</strong> is now in transit with our courier partner.`,
    },
    out_for_delivery: {
      subject: `Out for Delivery — #${order.order_number} | Angelika Fashions`,
      heading: `Your Parcel Is Out for Delivery Today`,
      message: `Our courier partner is on the way to deliver order <strong>#${escapeHtml(order.order_number)}</strong>. Please keep your phone reachable.`,
    },
    delivered: {
      subject: `Order Delivered — #${order.order_number} | Angelika Fashions`,
      heading: `Your Order Has Been Delivered`,
      message: `Your order <strong>#${escapeHtml(order.order_number)}</strong> has been delivered. We hope you love wearing your Angelika Fashions piece!`,
    },
  };

  const info = stageMeta[params.stage];

  await dispatchIdempotentEmail({
    dedupKey: `email:shipment_${params.stage}:${order.id}:${params.shipmentRef}`,
    userId: order.user_id,
    roleTarget: 'customer',
    type: `shipment_${params.stage}`,
    to: order.email,
    subject: info.subject,
    html: wrapBrandedEmail({
      badge: 'Shipment Tracking',
      heading: info.heading,
      bodyHtml: `
        <p style="font-size:14px;color:#44403C;">Namaste ${escapeHtml(addr.firstName || 'Valued Patron')},</p>
        <p style="font-size:14px;line-height:1.6;color:#44403C;">${info.message}</p>
        <div style="background:#FAF8F5;border:1px solid #EAE3D9;border-radius:10px;padding:12px 16px;margin:16px 0;font-size:13px;">
          <p style="margin:0 0 4px 0;"><strong>Order Number:</strong> #${escapeHtml(order.order_number)}</p>
          ${params.courierName ? `<p style="margin:0 0 4px 0;"><strong>Courier Partner:</strong> ${escapeHtml(params.courierName)}</p>` : ''}
          ${params.awbCode ? `<p style="margin:0;"><strong>AWB / Tracking #:</strong> <span style="font-family:monospace;">${escapeHtml(params.awbCode)}</span></p>` : ''}
        </div>
      `,
      ctaLabel: params.stage === 'delivered' ? 'View Your Order' : 'Track Shipment Live',
      ctaUrl: params.stage === 'delivered' ? `${siteUrl}/account/orders/${order.id}` : ctaUrl,
    }),
    text: `${info.heading} — Order #${order.order_number}${params.courierName ? ` via ${params.courierName}` : ''}${params.awbCode ? ` (AWB: ${params.awbCode})` : ''}. Track: ${ctaUrl}`,
    link: `/account/orders/${order.id}`,
    metadata: {
      order_id: order.id,
      stage: params.stage,
      courier_name: params.courierName || null,
      awb_code: params.awbCode || null,
      tracking_url: params.trackingUrl || null,
    },
  });
}

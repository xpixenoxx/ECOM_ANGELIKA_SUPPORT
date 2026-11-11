import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendEmailViaResend } from './resend';
import {
  buildOrderItemsHtml,
  escapeHtml,
  formatAddressLines,
  renderBrandEmailShell,
  type OrderEmailItem,
  type ShippingAddressData,
} from './order-helpers';

export interface OrderShippedEmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
  skipped?: boolean;
}

/**
 * Dispatches an "Order Shipped" notification email with courier and AWB tracking details.
 * Deduplicates repeated calls for the same order and tracking number unless `force` is set.
 */
export async function sendOrderShippedEmail(
  orderId: string,
  options?: { force?: boolean }
): Promise<OrderShippedEmailResult> {
  try {
    if (!orderId) {
      return { success: false, error: 'No order ID provided' };
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      console.error('[sendOrderShippedEmail] Order lookup failed:', orderError);
      return { success: false, error: orderError?.message || 'Order not found' };
    }

    const metadata = (order.metadata as Record<string, any>) || {};
    const trackingNumber = (order.tracking_number || '').trim();
    const sentAt = metadata['shipping_email_sent_at'];
    const sentAwb = String(metadata['shipping_email_sent_awb'] || '').trim();

    if (!options?.force && sentAt && sentAwb === trackingNumber) {
      return { success: true, skipped: true };
    }

    const shipping = (order.shipping_address as unknown as ShippingAddressData) || {};
    const recipientEmail = (order.email || shipping.email || '').trim().toLowerCase();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.warn('[sendOrderShippedEmail] No valid recipient email for order:', order.id);
      return { success: false, error: 'Order does not have a valid email address' };
    }

    const customerName =
      [shipping.firstName, shipping.lastName].filter(Boolean).join(' ') || 'Valued Patron';
    const orderNumber = order.order_number || `ORD-${order.id.slice(0, 8).toUpperCase()}`;
    const courierPartner = (order.courier_partner || 'Shiprocket Express').trim();
    const shippedDate = new Date(order.shipped_at || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] || 'http://localhost:3000';
    const trackPageUrl = `${siteUrl}/track-order`;
    const accountOrderUrl = `${siteUrl}/account/orders/${order.id}`;

    const items = (order.order_items || []) as OrderEmailItem[];
    const itemsHtml = buildOrderItemsHtml(items, siteUrl);
    const addressLines = formatAddressLines(shipping);

    const emailHtml = renderBrandEmailShell(
      `Order Shipped - ${orderNumber} | Angelika Fashions`,
      `
          <!-- Shipped Hero -->
          <tr>
            <td style="padding: 36px 32px 20px 32px; text-align: center; background: linear-gradient(180deg, #FBF4EC 0%, #FFFFFF 100%);">
              <div style="display: inline-block; width: 64px; height: 64px; line-height: 64px; border-radius: 50%; background-color: #111111; border: 2px solid #C9A84C; color: #C9A84C; font-size: 26px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(201,168,76,0.28);">
                ✦
              </div>
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #C9A84C; margin-bottom: 6px;">Order Shipped</div>
              <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; color: #111111; margin: 0 0 10px 0; font-weight: 600;">
                Your Parcel Is On Its Way, ${escapeHtml(customerName)}
              </h1>
              <p style="font-size: 14px; color: #555555; margin: 0 auto; max-width: 480px; line-height: 1.6;">
                Your handcrafted Angelika Fashions order has been dispatched from our atelier and handed over to our courier partner.
              </p>
            </td>
          </tr>

          <!-- Shipment Summary Card -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" style="background-color: #FBF4EC; border-radius: 12px; border: 1px solid #E8DFD5; padding: 18px 20px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #666666;">Order Reference:</td>
                  <td style="padding: 4px 0; font-size: 13px; font-weight: 700; font-family: monospace; color: #111111; text-align: right;">${escapeHtml(orderNumber)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #666666;">Shipped Date:</td>
                  <td style="padding: 4px 0; font-size: 12px; font-weight: 600; color: #111111; text-align: right;">${shippedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #666666;">Courier Partner:</td>
                  <td style="padding: 4px 0; font-size: 12px; font-weight: 600; color: #111111; text-align: right;">${escapeHtml(courierPartner)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #666666;">Tracking / AWB #:</td>
                  <td style="padding: 4px 0; font-size: 13px; font-weight: 700; font-family: monospace; color: #C9A84C; text-align: right;">
                    ${trackingNumber ? escapeHtml(trackingNumber) : 'Updating shortly'}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipped Items Table -->
          ${
            items.length > 0
              ? `
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #C9A84C; margin-bottom: 12px; border-bottom: 1px solid #EBE5DF; padding-bottom: 6px;">
                Items Dispatched (${items.length})
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                ${itemsHtml}
              </table>
            </td>
          </tr>`
              : ''
          }

          <!-- Delivery Address -->
          <tr>
            <td style="padding: 0 32px 30px 32px;">
              <div style="background-color: #FAFAFA; border: 1px solid #EBE5DF; border-radius: 12px; padding: 18px 20px;">
                <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #C9A84C; margin-bottom: 8px;">
                  Shipping Destination
                </div>
                <div style="font-size: 13px; font-weight: 700; color: #111111; margin-bottom: 4px;">
                  ${escapeHtml(customerName)}
                </div>
                <div style="font-size: 12px; color: #555555; line-height: 1.6;">
                  ${addressLines.map((line) => escapeHtml(line)).join('<br/>')}
                </div>
                <div style="font-size: 12px; color: #666666; margin-top: 8px; padding-top: 8px; border-top: 1px solid #EBE5DF;">
                  <strong>Phone:</strong> +91 ${escapeHtml(order.phone || shipping.phone || 'N/A')}
                </div>
              </div>
            </td>
          </tr>

          <!-- Track Order CTA -->
          <tr>
            <td style="padding: 0 32px 36px 32px; text-align: center;">
              <a href="${trackPageUrl}" style="display: inline-block; background-color: #111111; color: #FFFFFF; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 8px; border: 1px solid #C9A84C; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                Track Your Shipment
              </a>
              <div style="font-size: 11px; color: #888888; margin-top: 12px;">
                Enter ${trackingNumber ? `AWB <strong>${escapeHtml(trackingNumber)}</strong> or ` : ''}Order <strong>${escapeHtml(orderNumber)}</strong> on the tracking page, or view <a href="${accountOrderUrl}" style="color: #C9A84C; text-decoration: underline;">your order details</a>.
              </div>
            </td>
          </tr>
      `
    );

    const emailText = `
Namaste ${customerName},

Great news! Your Angelika Fashions order has been shipped!

Order Reference: ${orderNumber}
Shipped Date: ${shippedDate}
Courier Partner: ${courierPartner}
Tracking / AWB #: ${trackingNumber || 'Updating shortly'}

${
  items.length > 0
    ? `ITEMS DISPATCHED:\n${items
        .map((i) => `- ${i.product_name} (${i.variant_details?.size || 'Free Size'}) x ${i.quantity}`)
        .join('\n')}\n`
    : ''
}
SHIPPING DESTINATION:
${customerName}
${addressLines.join(', ')}
Phone: +91 ${order.phone || shipping.phone || ''}

Track your shipment: ${trackPageUrl}
View order details: ${accountOrderUrl}

With Warm Regards,
Angelika Fashions Atelier
support@angelikafashions.com
    `.trim();

    console.log(
      `[sendOrderShippedEmail] Dispatching shipped alert to ${recipientEmail} for order ${orderNumber}...`
    );

    const result = await sendEmailViaResend({
      to: recipientEmail,
      subject: `✦ Order Shipped: ${orderNumber} | Angelika Fashions`,
      html: emailHtml,
      text: emailText,
    });

    // Record notification in database
    try {
      await supabaseAdmin.from('notifications').insert({
        user_id: order.user_id || null,
        type: 'order_shipped',
        channel: 'email',
        subject: `Order Shipped: ${orderNumber}`,
        content: `Shipping alert dispatched to ${recipientEmail} for ${orderNumber} (${courierPartner}${
          trackingNumber ? ` • AWB: ${trackingNumber}` : ''
        })`,
        status: result.success ? 'sent' : 'failed',
      });
    } catch (notifErr) {
      console.warn('[sendOrderShippedEmail] notifications table insert notice:', notifErr);
    }

    if (result.success) {
      await supabaseAdmin
        .from('orders')
        .update({
          metadata: {
            ...metadata,
            shipping_email_sent_at: new Date().toISOString(),
            shipping_email_sent_awb: trackingNumber,
          },
        })
        .eq('id', orderId);

      console.log(
        `[sendOrderShippedEmail] Order shipped email delivered to ${recipientEmail} (ID: ${result.id})`
      );
      return { success: true, messageId: result.id };
    }

    console.warn('[sendOrderShippedEmail] Email dispatch notice:', result.error);
    return { success: false, error: result.error };
  } catch (err: any) {
    console.error('[sendOrderShippedEmail] Unexpected exception:', err);
    return { success: false, error: err?.message || 'Failed to dispatch order shipped email' };
  }
}

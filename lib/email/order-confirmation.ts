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

export interface OrderConfirmationEmailData {
  orderId: string;
}

/**
 * Dispatches an official haute couture order confirmation email to the user.
 * Called immediately upon COD placement or successful online payment verification.
 */
export async function sendOrderConfirmationEmail(orderId: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
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
      console.error('[sendOrderConfirmationEmail] Order lookup failed:', orderError);
      return { success: false, error: orderError?.message || 'Order not found' };
    }

    const shipping = (order.shipping_address as unknown as ShippingAddressData) || {};
    const recipientEmail = (order.email || shipping.email || '').trim().toLowerCase();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.warn('[sendOrderConfirmationEmail] No valid recipient email for order:', order.id);
      return { success: false, error: 'Order does not have a valid email address' };
    }

    const customerName = [shipping.firstName, shipping.lastName].filter(Boolean).join(' ') || 'Valued Patron';
    const orderNumber = order.order_number || `ORD-${order.id.slice(0, 8).toUpperCase()}`;
    const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const isCod = order.payment_method === 'cod';
    const paymentMethodLabel = isCod ? 'Cash on Delivery (COD)' : 'Online Payment (Razorpay)';
    const paymentStatusLabel = order.payment_status === 'paid' ? 'Paid' : (isCod ? 'Payable upon Delivery' : 'Pending');

    const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] || 'http://localhost:3000';
    const trackingUrl = `${siteUrl}/order-success?order_id=${order.id}`;

    const items = (order.order_items || []) as OrderEmailItem[];
    const itemsHtml = buildOrderItemsHtml(items, siteUrl);

    const subtotalFormatted = `₹${Number(order.subtotal || 0).toLocaleString('en-IN')}`;
    const shippingFormatted = order.shipping_cost > 0 ? `₹${Number(order.shipping_cost).toLocaleString('en-IN')}` : 'FREE';
    const discountFormatted = order.discount_amount > 0 ? `-₹${Number(order.discount_amount).toLocaleString('en-IN')}` : null;
    const codFeeFormatted = order.metadata?.cod_fee ? `₹${Number(order.metadata.cod_fee).toLocaleString('en-IN')}` : null;
    const totalFormatted = `₹${Number(order.total_amount || 0).toLocaleString('en-IN')}`;

    const addressLines = formatAddressLines(shipping);

    const emailHtml = renderBrandEmailShell('Order Confirmation - Angelika Fashions', `
          <!-- Confirmation Hero -->
          <tr>
            <td style="padding: 36px 32px 20px 32px; text-align: center; background: linear-gradient(180deg, #FBF4EC 0%, #FFFFFF 100%);">
              <div style="display: inline-block; width: 64px; height: 64px; line-height: 64px; border-radius: 50%; background-color: #C9A84C; color: #FFFFFF; font-size: 28px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(201,168,76,0.35);">
                ✓
              </div>
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #C9A84C; margin-bottom: 6px;">Order Confirmed</div>
              <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; color: #111111; margin: 0 0 10px 0; font-weight: 600;">
                Namaste, ${escapeHtml(customerName)}
              </h1>
              <p style="font-size: 14px; color: #555555; margin: 0 auto; max-width: 480px; line-height: 1.6;">
                Thank you for selecting Angelika Fashions. Your handcrafted couture order has been confirmed and registered in our artisan atelier queue.
              </p>
            </td>
          </tr>

          <!-- Order Summary Card -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" style="background-color: #FBF4EC; border-radius: 12px; border: 1px solid #E8DFD5; padding: 18px 20px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #666666;">Order Reference:</td>
                  <td style="padding: 4px 0; font-size: 13px; font-weight: 700; font-family: monospace; color: #111111; text-align: right;">${escapeHtml(orderNumber)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #666666;">Order Date:</td>
                  <td style="padding: 4px 0; font-size: 12px; font-weight: 600; color: #111111; text-align: right;">${orderDate}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #666666;">Payment Method:</td>
                  <td style="padding: 4px 0; font-size: 12px; font-weight: 600; color: #111111; text-align: right;">${paymentMethodLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #666666;">Payment Status:</td>
                  <td style="padding: 4px 0; font-size: 12px; font-weight: 700; color: ${order.payment_status === 'paid' ? '#15803D' : '#B45309'}; text-align: right;">
                    ${paymentStatusLabel}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Ordered Items Table -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #C9A84C; margin-bottom: 12px; border-bottom: 1px solid #EBE5DF; padding-bottom: 6px;">
                Couture Items Ordered (${items.length})
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Financial Breakdown -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table role="presentation" width="100%" style="border-top: 2px solid #111111; padding-top: 14px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #666666;">Subtotal:</td>
                  <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #111111; text-align: right;">${subtotalFormatted}</td>
                </tr>
                ${discountFormatted ? `
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #15803D;">Discount applied:</td>
                  <td style="padding: 4px 0; font-size: 13px; font-weight: 700; color: #15803D; text-align: right;">${discountFormatted}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #666666;">Standard Shipping:</td>
                  <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #111111; text-align: right;">${shippingFormatted}</td>
                </tr>
                ${codFeeFormatted ? `
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #666666;">COD Handling Fee:</td>
                  <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #111111; text-align: right;">${codFeeFormatted}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: 700; color: #111111; border-top: 1px dashed #E8DFD5;">Total Amount:</td>
                  <td style="padding: 12px 0 0 0; font-size: 18px; font-weight: 800; color: #C9A84C; text-align: right; border-top: 1px dashed #E8DFD5; font-family: monospace;">${totalFormatted}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery Address & Contact Details -->
          <tr>
            <td style="padding: 0 32px 30px 32px;">
              <div style="background-color: #FAFAFA; border: 1px solid #EBE5DF; border-radius: 12px; padding: 18px 20px;">
                <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #C9A84C; margin-bottom: 8px;">
                  Delivery Address &amp; Contact
                </div>
                <div style="font-size: 13px; font-weight: 700; color: #111111; margin-bottom: 4px;">
                  ${escapeHtml(customerName)}
                </div>
                <div style="font-size: 12px; color: #555555; line-height: 1.6;">
                  ${addressLines.map(line => escapeHtml(line)).join('<br/>')}
                </div>
                <div style="font-size: 12px; color: #666666; margin-top: 8px; padding-top: 8px; border-top: 1px solid #EBE5DF;">
                  <strong>Phone:</strong> +91 ${escapeHtml(order.phone || shipping.phone || 'N/A')} &nbsp;•&nbsp; <strong>Email:</strong> ${escapeHtml(recipientEmail)}
                </div>
                ${order.gift_wrap ? `
                <div style="margin-top: 10px; padding: 8px 10px; background-color: #FFFBEB; border-left: 3px solid #C9A84C; font-size: 11px; color: #92400E;">
                  🎁 <strong>Complimentary Luxury Gift Packaging Included</strong>
                  ${order.gift_message ? `<div style="font-style: italic; margin-top: 2px;">"${escapeHtml(order.gift_message)}"</div>` : ''}
                </div>` : ''}
              </div>
            </td>
          </tr>

          <!-- Track Order CTA Button -->
          <tr>
            <td style="padding: 0 32px 36px 32px; text-align: center;">
              <a href="${trackingUrl}" style="display: inline-block; background-color: #111111; color: #FFFFFF; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 8px; border: 1px solid #C9A84C; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                View Order &amp; Live Tracking
              </a>
              <div style="font-size: 11px; color: #888888; margin-top: 12px;">
                You can also view this order anytime in your account at <a href="${siteUrl}/account/orders" style="color: #C9A84C; text-decoration: underline;">angelikafashions.com/account/orders</a>
              </div>
            </td>
          </tr>
    `);

    const emailText = `
Namaste ${customerName},

Thank you for choosing Angelika Fashions. Your order has been confirmed!

Order Reference: ${orderNumber}
Order Date: ${orderDate}
Payment Method: ${paymentMethodLabel}
Payment Status: ${paymentStatusLabel}

ITEMS ORDERED:
${items.map(i => `- ${i.product_name} (${i.variant_details?.size || 'Free Size'}) x ${i.quantity} = ₹${i.total_price || i.unit_price * i.quantity}`).join('\n')}

Subtotal: ${subtotalFormatted}
Shipping: ${shippingFormatted}
${discountFormatted ? `Discount: ${discountFormatted}\n` : ''}${codFeeFormatted ? `COD Fee: ${codFeeFormatted}\n` : ''}Total Amount: ${totalFormatted}

DELIVERY ADDRESS:
${customerName}
${addressLines.join(', ')}
Phone: +91 ${order.phone || shipping.phone || ''}

Track your order: ${trackingUrl}

With Warm Regards,
Angelika Fashions Atelier
support@angelikafashions.com
    `.trim();

    console.log(`[sendOrderConfirmationEmail] Sending confirmation to ${recipientEmail} for order ${orderNumber}...`);

    const result = await sendEmailViaResend({
      to: recipientEmail,
      subject: `✦ Order Confirmed: ${orderNumber} | Angelika Fashions`,
      html: emailHtml,
      text: emailText,
    });

    // Record notification in database
    try {
      await supabaseAdmin.from('notifications').insert({
        user_id: order.user_id || null,
        type: 'order_confirmation',
        channel: 'email',
        subject: `Order Confirmed: ${orderNumber}`,
        content: `Confirmation email dispatched to ${recipientEmail} for ${orderNumber} (${totalFormatted})`,
        status: result.success ? 'sent' : 'failed',
      });
    } catch (notifErr) {
      console.warn('[sendOrderConfirmationEmail] notifications table insert notice:', notifErr);
    }

    if (result.success) {
      console.log(`[sendOrderConfirmationEmail] Confirmation email successfully delivered to ${recipientEmail} (ID: ${result.id})`);
      return { success: true, messageId: result.id };
    } else {
      console.warn(`[sendOrderConfirmationEmail] Email dispatch notice:`, result.error);
      return { success: false, error: result.error };
    }
  } catch (err: any) {
    console.error('[sendOrderConfirmationEmail] Unexpected exception:', err);
    return { success: false, error: err?.message || 'Failed to dispatch confirmation email' };
  }
}

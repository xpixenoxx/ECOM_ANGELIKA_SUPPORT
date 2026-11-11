export interface ShippingAddressData {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
}

export interface OrderEmailItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_details?: { size?: string; color?: string; image?: string } | null;
}

export function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatAddressLines(shipping: ShippingAddressData): string[] {
  const cityState = [shipping.city, shipping.state]
    .filter((s): s is string => Boolean(s && s.trim()))
    .join(', ');
  const cityStatePostal = cityState + (shipping.postalCode ? ` - ${shipping.postalCode}` : '');

  return [
    shipping.address1,
    shipping.address2,
    shipping.landmark,
    cityStatePostal,
    shipping.country || 'India',
  ].filter((line): line is string => typeof line === 'string' && line.trim().length > 0);
}

export function buildOrderItemsHtml(items: OrderEmailItem[], siteUrl: string): string {
  return items
    .map((item) => {
      const vDetails = item.variant_details || {};
      const size = vDetails.size ? `Size: ${vDetails.size}` : '';
      const color = vDetails.color ? `Color: ${vDetails.color}` : '';
      const meta = [size, color].filter(Boolean).join(' • ');
      const img = vDetails.image
        ? vDetails.image.startsWith('http')
          ? vDetails.image
          : `${siteUrl}${vDetails.image}`
        : `${siteUrl}/images/collection-kurtis.jpg`;

      return `
        <tr>
          <td style="padding: 14px 12px; border-bottom: 1px solid #EBE5DF; vertical-align: top; width: 64px;">
            <img src="${img}" alt="${escapeHtml(item.product_name)}" width="56" height="70" style="width: 56px; height: 70px; object-fit: cover; border-radius: 6px; display: block; background-color: #F7F5F0;" />
          </td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #EBE5DF; vertical-align: top;">
            <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 14px; font-weight: 600; color: #111111; line-height: 1.4;">
              ${escapeHtml(item.product_name)}
            </div>
            ${meta ? `<div style="font-size: 12px; color: #6B5E55; margin-top: 4px;">${escapeHtml(meta)}</div>` : ''}
            <div style="font-size: 11px; color: #8C827A; margin-top: 2px;">Qty: ${item.quantity} × ₹${Number(item.unit_price).toLocaleString('en-IN')}</div>
          </td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #EBE5DF; vertical-align: top; text-align: right; font-size: 13px; font-weight: 700; color: #111111; white-space: nowrap;">
            ₹${Number(item.total_price || item.unit_price * item.quantity).toLocaleString('en-IN')}
          </td>
        </tr>
      `;
    })
    .join('');
}

export function renderBrandEmailShell(title: string, bodyRowsHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF4EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #111111; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FBF4EC; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #EBE5DF;">
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #111111; padding: 32px 24px; text-align: center; border-bottom: 2px solid #C9A84C;">
              <div style="letter-spacing: 0.3em; font-size: 11px; color: #C9A84C; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">✦ HAUTE COUTURE ATELIER ✦</div>
              <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; color: #FFFFFF; font-weight: 700; letter-spacing: 0.05em;">ANGELIKA FASHIONS</div>
              <div style="font-size: 11px; color: #D4AF37; margin-top: 4px; letter-spacing: 0.15em; text-transform: uppercase;">Tradition in Every Thread • Bangalore</div>
            </td>
          </tr>
          ${bodyRowsHtml}
          <!-- Footer -->
          <tr>
            <td style="background-color: #F7F5F0; padding: 24px; text-align: center; border-top: 1px solid #EBE5DF; font-size: 11px; color: #8C827A; line-height: 1.6;">
              <div style="font-weight: 700; color: #111111; margin-bottom: 4px;">ANGELIKA FASHIONS CONCIERGE</div>
              <div>Questions about your order? We are here to assist you:</div>
              <div style="margin-top: 4px;">
                Email: <a href="mailto:support@angelikafashions.com" style="color: #C9A84C; text-decoration: none; font-weight: 600;">support@angelikafashions.com</a>
              </div>
              <div style="margin-top: 12px; font-size: 10px; color: #A0968E;">
                © ${new Date().getFullYear()} Angelika Fashions. All rights reserved. Handcrafted luxury ethnic couture.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

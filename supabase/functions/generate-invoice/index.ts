// Supabase Edge Function: generate-invoice
// Replaces pdfkit (Node.js-only) for Cloudflare Workers compatibility.
// Generates a simple HTML-based invoice that can be printed to PDF by the browser,
// or returns structured invoice data as JSON.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, receiptToken } = await req.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: order, error } = await supabase
      .from('orders')
      .select(`*, order_items(*)`)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate HTML invoice
    const html = generateInvoiceHtml(order);

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="invoice-${order.order_number}.html"`,
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function generateInvoiceHtml(order: any): string {
  const items = (order.order_items || []).map((item: any) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #f0ebe1;">${item.product_name}</td>
      <td style="padding:8px;border-bottom:1px solid #f0ebe1;text-align:center;">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #f0ebe1;text-align:right;">${formatCurrency(item.unit_price)}</td>
      <td style="padding:8px;border-bottom:1px solid #f0ebe1;text-align:right;">${formatCurrency(item.total_price)}</td>
    </tr>
  `).join('');

  const shipping = order.shipping_address || {};
  const shippingLine = [
    shipping.firstName, shipping.lastName,
    shipping.address1, shipping.address2,
    shipping.city, shipping.state, shipping.postalCode,
  ].filter(Boolean).join(', ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${order.order_number} — Angelika Fashions</title>
  <style>
    body { font-family: Georgia, serif; color: #1c1917; max-width: 800px; margin: 40px auto; padding: 20px; }
    .header { border-bottom: 2px solid #c9a84c; padding-bottom: 20px; margin-bottom: 30px; }
    .brand { font-size: 28px; color: #c9a84c; letter-spacing: 2px; }
    .tagline { color: #78716c; font-style: italic; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #1c1917; color: #c9a84c; padding: 10px 8px; text-align: left; }
    .totals td { padding: 6px 8px; }
    .grand-total { font-weight: bold; font-size: 16px; color: #c9a84c; border-top: 2px solid #c9a84c; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">ANGELIKA FASHIONS</div>
    <div class="tagline">Luxury Handcrafted Indian Ethnic Wear</div>
    <div style="margin-top:16px;">
      <strong>Invoice / Tax Receipt</strong><br>
      Order: ${order.order_number}<br>
      Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}<br>
      Payment: ${order.payment_status?.toUpperCase()}
    </div>
  </div>
  <div style="margin-bottom:24px;">
    <strong>Ship To:</strong><br>${shippingLine || 'N/A'}
  </div>
  <table>
    <thead>
      <tr>
        <th>Product</th><th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Unit Price</th><th style="text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>${items}</tbody>
  </table>
  <table class="totals" style="max-width:300px;margin-left:auto;">
    <tr><td>Subtotal</td><td style="text-align:right;">${formatCurrency(order.subtotal)}</td></tr>
    <tr><td>Shipping</td><td style="text-align:right;">${formatCurrency(order.shipping_cost)}</td></tr>
    ${order.discount_amount > 0 ? `<tr><td>Discount</td><td style="text-align:right;">-${formatCurrency(order.discount_amount)}</td></tr>` : ''}
    <tr class="grand-total"><td><strong>Total</strong></td><td style="text-align:right;"><strong>${formatCurrency(order.total_amount)}</strong></td></tr>
  </table>
  <p style="margin-top:40px;font-size:12px;color:#78716c;text-align:center;">
    All prices are inclusive of applicable GST. For returns & exchanges: returns@angelikafashions.com<br>
    Angelika Fashions — Luxury Indian Ethnic Couture
  </p>
  <script>window.addEventListener('load', () => window.print());</script>
</body>
</html>`;
}

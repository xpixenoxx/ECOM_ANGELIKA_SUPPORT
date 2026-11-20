// Supabase Edge Function: generate-invoice
// Replaces pdfkit (Node.js-only) for Cloudflare Workers compatibility.
// Generates a simple HTML-based invoice that can be printed to PDF by the browser,
// or returns structured invoice data as JSON.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ADMIN_ROLES = new Set(['admin', 'owner', 'staff', 'ops', 'manager']);

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const configuredSite = Deno.env.get('NEXT_PUBLIC_SITE_URL') || 'https://angelikafashions.com';
  const allowedOrigins = new Set([
    configuredSite,
    'https://angelikafashions.com',
    'https://www.angelikafashions.com',
    'https://angelika-fashions.pages.dev',
  ]);
  const allowOrigin = allowedOrigins.has(origin) ? origin : configuredSite;
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function verifyReceiptToken(
  orderId: string,
  email: string,
  token: string,
  secret: string
): Promise<boolean> {
  if (!token || !orderId || !email || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [expiresStr, providedSig] = parts;
  const expiresAt = Number(expiresStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  if (!providedSig || providedSig.length !== 64) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const payload = `${orderId}:${email.trim().toLowerCase()}:${expiresAt}`;
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expectedSig = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return timingSafeEqualHex(providedSig.toLowerCase(), expectedSig);
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : '';
    const receiptToken = typeof body?.receiptToken === 'string' ? body.receiptToken.trim() : '';

    if (!orderId || !UUID_REGEX.test(orderId)) {
      return new Response(JSON.stringify({ error: 'Valid orderId UUID required' }), {
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

    // Security Gate: Require either a valid HMAC receiptToken OR an authenticated owner/admin Bearer JWT
    let authorized = false;
    const tokenSecret = Deno.env.get('ORDER_TOKEN_SECRET') || serviceKey;

    if (receiptToken && order.email) {
      authorized = await verifyReceiptToken(order.id, order.email, receiptToken, tokenSecret);
    }

    if (!authorized) {
      const authHeader = req.headers.get('authorization') || '';
      const jwt = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (jwt && jwt !== Deno.env.get('SUPABASE_ANON_KEY')) {
        const { data: userRes } = await supabase.auth.getUser(jwt);
        const user = userRes?.user;
        if (user) {
          const isOwner =
            (order.user_id && order.user_id === user.id) ||
            (order.email && user.email && order.email.toLowerCase() === user.email.toLowerCase());
          if (isOwner) {
            authorized = true;
          } else {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .maybeSingle();
            if (profile?.role && ADMIN_ROLES.has(String(profile.role).toLowerCase())) {
              authorized = true;
            }
          }
        }
      }
    }

    if (!authorized) {
      return new Response(JSON.stringify({ error: 'Unauthorized invoice access' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate XSS-safe HTML invoice
    const html = generateInvoiceHtml(order);
    const safeFilenameOrderNum = String(order.order_number || order.id).replace(/[^A-Za-z0-9_-]/g, '');

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="invoice-${safeFilenameOrderNum}.html"`,
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'",
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to generate invoice' }), {
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
      <td style="padding:8px;border-bottom:1px solid #f0ebe1;">${escapeHtml(item.product_name)}</td>
      <td style="padding:8px;border-bottom:1px solid #f0ebe1;text-align:center;">${Number(item.quantity) || 0}</td>
      <td style="padding:8px;border-bottom:1px solid #f0ebe1;text-align:right;">${escapeHtml(formatCurrency(Number(item.unit_price) || 0))}</td>
      <td style="padding:8px;border-bottom:1px solid #f0ebe1;text-align:right;">${escapeHtml(formatCurrency(Number(item.total_price) || 0))}</td>
    </tr>
  `).join('');

  const shipping = order.shipping_address || {};
  const shippingLine = [
    shipping.firstName, shipping.lastName,
    shipping.address1, shipping.address2,
    shipping.city, shipping.state, shipping.postalCode,
  ].filter(Boolean).map((part) => escapeHtml(part)).join(', ');

  const safeOrderNumber = escapeHtml(order.order_number);
  const safePaymentStatus = escapeHtml(order.payment_status?.toUpperCase() || 'PENDING');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${safeOrderNumber} — Angelika Fashions</title>
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
      Order: ${safeOrderNumber}<br>
      Date: ${escapeHtml(new Date(order.created_at).toLocaleDateString('en-IN'))}<br>
      Payment: ${safePaymentStatus}
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
    <tr><td>Subtotal</td><td style="text-align:right;">${escapeHtml(formatCurrency(Number(order.subtotal) || 0))}</td></tr>
    <tr><td>Shipping</td><td style="text-align:right;">${escapeHtml(formatCurrency(Number(order.shipping_cost) || 0))}</td></tr>
    ${Number(order.discount_amount) > 0 ? `<tr><td>Discount</td><td style="text-align:right;">-${escapeHtml(formatCurrency(Number(order.discount_amount) || 0))}</td></tr>` : ''}
    <tr class="grand-total"><td><strong>Total</strong></td><td style="text-align:right;"><strong>${escapeHtml(formatCurrency(Number(order.total_amount) || 0))}</strong></td></tr>
  </table>
  <p style="margin-top:40px;font-size:12px;color:#78716c;text-align:center;">
    All prices are inclusive of applicable GST. For returns & exchanges: returns@angelikafashions.com<br>
    Angelika Fashions — Luxury Indian Ethnic Couture
  </p>
  <script>window.addEventListener('load', () => window.print());</script>
</body>
</html>`;
}

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getOptionalEnv, hasValidServiceRoleKey } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { canTransitionOrderStatus } from '@/lib/orders/state-machine';

export const dynamic = 'force-dynamic';

function timingSafeEquals(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function mapDelhiveryStatus(rawStatus: string): string | null {
  const s = (rawStatus || '').toLowerCase().trim();
  if (!s) return null;
  if (s.includes('delivered')) return 'delivered';
  if (s.includes('out for delivery') || s.includes('dispatched')) return 'out_for_delivery';
  if (s.includes('in transit') || s.includes('manifested')) return 'shipped';
  if (s.includes('rto') || s.includes('return to origin')) return 'rto';
  if (s.includes('undelivered') || s.includes('failed')) return 'delivery_failed';
  return null;
}

export async function POST(request: NextRequest) {
  const secret = getOptionalEnv('DELHIVERY_WEBHOOK_SECRET');
  if (!secret) {
    return NextResponse.json(
      { error: 'DELHIVERY_WEBHOOK_SECRET is not configured' },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const authHeader = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  const customToken = request.headers.get('x-delhivery-token') || '';
  const hmacHeader = request.headers.get('x-delhivery-signature') || '';
  const expectedHmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  const authorized =
    timingSafeEquals(authHeader, secret) ||
    timingSafeEquals(customToken, secret) ||
    timingSafeEquals(hmacHeader, expectedHmac);

  if (!authorized) {
    return NextResponse.json({ error: 'Invalid Delhivery webhook signature' }, { status: 401 });
  }

  if (!hasValidServiceRoleKey()) {
    return NextResponse.json({ error: 'Supabase service role not configured' }, { status: 503 });
  }

  try {
    const payload = JSON.parse(rawBody);
    const shipment = payload?.Shipment || payload;
    const waybill = String(shipment?.AWB || shipment?.waybill || payload?.waybill || '').trim();
    const orderNumber = String(shipment?.ReferenceNo || shipment?.order || payload?.order_number || '').trim();
    const statusText = String(shipment?.Status?.Status || payload?.status || '').trim();
    const scanDate = String(shipment?.Status?.StatusDateTime || new Date().toISOString());

    const eventId = `dlv_${waybill || orderNumber}_${statusText}_${scanDate}`.slice(0, 120);

    const { error: dedupErr } = await supabaseAdmin.from('webhook_events').insert({
      provider: 'delhivery',
      event_id: eventId,
      event_type: statusText || 'scan',
      payload,
      status: 'processing',
    });

    if (dedupErr) {
      if (dedupErr.code === '23505') {
        return NextResponse.json({ received: true, deduplicated: true });
      }
      return NextResponse.json({ error: dedupErr.message }, { status: 500 });
    }

    const mappedStatus = mapDelhiveryStatus(statusText);
    if (mappedStatus && (waybill || orderNumber)) {
      let query = supabaseAdmin.from('orders').select('id, status');
      query = waybill ? query.eq('tracking_number', waybill) : query.ilike('order_number', orderNumber);
      const { data: order } = await query.maybeSingle();

      if (order && canTransitionOrderStatus(order.status, mappedStatus)) {
        const updateData: Record<string, unknown> = {
          status: mappedStatus,
          updated_at: new Date().toISOString(),
        };
        if (mappedStatus === 'delivered') {
          updateData['delivered_at'] = new Date().toISOString();
        }
        await supabaseAdmin.from('orders').update(updateData).eq('id', order.id);
      }
    }

    await supabaseAdmin
      .from('webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('provider', 'delhivery')
      .eq('event_id', eventId);

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Malformed Delhivery payload' }, { status: 400 });
  }
}

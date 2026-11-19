export const runtime = 'edge';

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getOptionalEnv, hasValidServiceRoleKey } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Json } from '@/types/database';

export const dynamic = 'force-dynamic';

/** Meta WhatsApp Cloud API verification challenge */
export async function GET(request: NextRequest) {
  const verifyToken = getOptionalEnv('WHATSAPP_WEBHOOK_VERIFY_TOKEN');
  if (!verifyToken) {
    return NextResponse.json(
      { error: 'WHATSAPP_WEBHOOK_VERIFY_TOKEN is not configured' },
      { status: 503 }
    );
  }

  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const appSecret = getOptionalEnv('WHATSAPP_APP_SECRET');
  if (!appSecret) {
    return NextResponse.json(
      { error: 'WHATSAPP_APP_SECRET is not configured' },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const signatureHeader = request.headers.get('x-hub-signature-256') || '';
  const expectedSig = `sha256=${crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;

  const bufA = Buffer.from(signatureHeader);
  const bufB = Buffer.from(expectedSig);
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return NextResponse.json({ error: 'Invalid Meta webhook signature' }, { status: 401 });
  }

  if (!hasValidServiceRoleKey()) {
    return NextResponse.json({ error: 'Supabase service role not configured' }, { status: 503 });
  }

  try {
    const payload = JSON.parse(rawBody);
    const entries = Array.isArray(payload?.entry) ? payload.entry : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change?.value || {};
        const messages = Array.isArray(value?.messages) ? value.messages : [];

        for (const msg of messages) {
          const waId = String(msg?.id || '').trim();
          const fromPhone = String(msg?.from || '').trim();
          const textBody = String(msg?.text?.body || msg?.button?.text || `[${msg?.type || 'message'}]`);
          if (!waId || !fromPhone) continue;

          const { error: dedupErr } = await supabaseAdmin.from('webhook_events').insert({
            provider: 'whatsapp',
            event_id: waId,
            event_type: String(msg?.type || 'message'),
            payload: msg as Json,
            status: 'processing',
          });

          if (dedupErr?.code === '23505') continue;

          await supabaseAdmin.from('whatsapp_conversations').insert({
            phone: fromPhone,
            type: 'inbound',
            status: 'received',
            wa_message_id: waId,
            metadata: {
              message: textBody,
              profile_name: value?.contacts?.[0]?.profile?.name || null,
            } as Json,
          });

          await supabaseAdmin
            .from('webhook_events')
            .update({ status: 'processed', processed_at: new Date().toISOString() })
            .eq('provider', 'whatsapp')
            .eq('event_id', waId);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Malformed WhatsApp payload' }, { status: 400 });
  }
}

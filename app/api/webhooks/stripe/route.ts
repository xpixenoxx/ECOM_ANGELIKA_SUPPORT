export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/lib/actions/payments';
import { checkRateLimitAsync, getClientIp } from '@/lib/utils/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = await checkRateLimitAsync(`webhook:stripe:${ip}`, 180, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const result = await handleStripeWebhook(payload, signature);

    if (!result.success) {
      if (result.error === 'Invalid signature') {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, duplicate: Boolean(result.duplicate) });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

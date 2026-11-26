export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { handleRazorpayWebhook } from '@/lib/actions/payments';
import { checkRateLimitAsync, getClientIp } from '@/lib/utils/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = await checkRateLimitAsync(`webhook:razorpay:${ip}`, 180, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Read raw request body strictly before JSON parsing for HMAC verification
    const payload = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const deliveryEventId = request.headers.get('x-razorpay-event-id');

    if (!signature) {
      return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
    }

    const result = await handleRazorpayWebhook(payload, signature, deliveryEventId);

    if (!result.success) {
      if (result.error === 'Invalid signature') {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
      if (result.error === 'Razorpay webhook secret not configured') {
        return NextResponse.json({ error: result.error }, { status: 503 });
      }
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, duplicate: Boolean(result.duplicate) });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { verifyStripePayment } from '@/lib/actions/payments';
import { checkRateLimitAsync, getClientIp } from '@/lib/utils/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = await checkRateLimitAsync(`verify_stripe:${ip}`, 25, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many payment verification attempts. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing payment intent ID' }, { status: 400 });
    }

    const result = await verifyStripePayment(paymentIntentId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, orderId: result.orderId });
  } catch (error) {
    console.error('Stripe verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}

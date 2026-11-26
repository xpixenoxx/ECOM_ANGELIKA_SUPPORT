export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayPayment } from '@/lib/actions/checkout';
import { checkRateLimitAsync, getClientIp } from '@/lib/utils/rate-limit';
import { verifySameOrigin } from '@/lib/utils/csrf';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const originCheck = verifySameOrigin(request);
    if (!originCheck.ok) {
      return NextResponse.json({ error: originCheck.reason || 'Forbidden' }, { status: 403 });
    }

    const ip = getClientIp(request);
    const rl = await checkRateLimitAsync(`verify_razorpay:${ip}`, 25, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many payment verification attempts. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

    const body = await request.json();
    const razorpayOrderId = body?.razorpayOrderId || body?.razorpay_order_id;
    const razorpayPaymentId = body?.razorpayPaymentId || body?.razorpay_payment_id;
    const razorpaySignature = body?.razorpaySignature || body?.razorpay_signature;

    if (
      typeof razorpayOrderId !== 'string' ||
      typeof razorpayPaymentId !== 'string' ||
      typeof razorpaySignature !== 'string' ||
      !razorpayOrderId.trim() ||
      !razorpayPaymentId.trim() ||
      !razorpaySignature.trim()
    ) {
      return NextResponse.json({ error: 'Missing payment verification data' }, { status: 400 });
    }

    const result = await verifyRazorpayPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      status: result.status || 'paid',
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      receiptToken: result.receiptToken,
    });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}

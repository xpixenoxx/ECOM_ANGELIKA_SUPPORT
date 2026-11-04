import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayPayment } from '@/lib/actions/checkout';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing payment verification data' }, { status: 400 });
    }

    const result = await verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, orderId: result.orderId });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
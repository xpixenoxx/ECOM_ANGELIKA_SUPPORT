export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { verifyCashfreePayment } from '@/lib/actions/checkout';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cashfreeOrderId } = body;

    if (!cashfreeOrderId || typeof cashfreeOrderId !== 'string') {
      return NextResponse.json({ error: 'Missing cashfreeOrderId' }, { status: 400 });
    }

    const result = await verifyCashfreePayment(cashfreeOrderId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      receiptToken: result.receiptToken,
    });
  } catch (error) {
    console.error('Cashfree verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}

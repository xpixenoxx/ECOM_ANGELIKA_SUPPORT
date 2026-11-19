export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { handleRazorpayWebhook } from '@/lib/actions/payments';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, duplicate: Boolean(result.duplicate) });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { handleCashfreeWebhook } from '@/lib/actions/payments';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-webhook-signature');
    const timestamp = request.headers.get('x-webhook-timestamp');
    const deliveryEventId =
      request.headers.get('x-webhook-id') || request.headers.get('x-idempotency-key');

    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: 'Missing x-webhook-signature or x-webhook-timestamp header' },
        { status: 400 }
      );
    }

    const result = await handleCashfreeWebhook(payload, signature, timestamp, deliveryEventId);

    if (!result.success) {
      if (result.error === 'Invalid signature') {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, duplicate: Boolean(result.duplicate) });
  } catch (error) {
    console.error('Cashfree webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

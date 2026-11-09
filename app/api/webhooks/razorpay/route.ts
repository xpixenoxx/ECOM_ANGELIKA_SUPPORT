import { NextRequest, NextResponse } from 'next/server';
import { handleRazorpayWebhook } from '@/lib/actions/payments';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      // Edge case #7: Missing signature — return 200 so Razorpay doesn't retry
      // (non-2xx responses trigger automatic retries for up to 3 days)
      console.warn('Razorpay webhook: missing x-razorpay-signature header');
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const result = await handleRazorpayWebhook(payload, signature);

    if (!result.success) {
      if (result.error === 'Invalid signature') {
        // Edge case #7: Bad signature means this is not a genuine Razorpay event
        // (or keys are misconfigured). Return 200 to stop retry storms.
        console.warn('Razorpay webhook: invalid signature — dropping event');
        return NextResponse.json({ received: true }, { status: 200 });
      }
      // Genuine server-side failure — return 500 so Razorpay retries
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
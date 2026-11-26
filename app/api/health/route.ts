export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getRazorpayConfig, getServiceHealthFlags } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  const flags = getServiceHealthFlags();
  const rzp = getRazorpayConfig();

  return NextResponse.json(
    {
      ok: true,
      service: 'angelika-fashions',
      timestamp: new Date().toISOString(),
      payments: {
        razorpayReady: flags.razorpayConfigured,
        razorpayMode: rzp.mode,
        razorpayWebhookReady: flags.razorpayWebhookConfigured,
        razorpayMismatch: flags.razorpayModeMismatch,
      },
      logistics: {
        shiprocketReady: flags.shiprocketConfigured,
        shiprocketWebhookReady: flags.shiprocketWebhookConfigured,
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

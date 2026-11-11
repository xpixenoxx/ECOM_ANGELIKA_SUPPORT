import { NextResponse } from 'next/server';
import { getCheckoutAddressPageContent } from '@/lib/actions/site-content';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getCheckoutAddressPageContent();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


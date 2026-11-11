import { NextRequest, NextResponse } from 'next/server';
import { checkCourierServiceability } from '@/lib/shipping/shiprocket';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode')?.trim();
    const isCod = searchParams.get('cod') === '1' || searchParams.get('cod') === 'true';
    const weight = Number(searchParams.get('weight')) || 1.0;

    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 6-digit Indian postal pincode.' },
        { status: 400 }
      );
    }

    const result = await checkCourierServiceability({
      deliveryPincode: pincode,
      isCod,
      weightInKg: weight,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('Shiprocket serviceability error:', err);
    return NextResponse.json(
      {
        success: false,
        serviceable: true,
        estimatedDeliveryDays: '3–5 days',
        codAvailable: true,
        error: err.message || 'Serviceability check failed',
      },
      { status: 500 }
    );
  }
}


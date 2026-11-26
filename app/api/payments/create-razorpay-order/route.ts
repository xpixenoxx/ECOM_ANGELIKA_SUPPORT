export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createOrder, type OrderData } from '@/lib/actions/checkout';
import { checkRateLimitAsync, getClientIp } from '@/lib/utils/rate-limit';
import { verifySameOrigin } from '@/lib/utils/csrf';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/create-razorpay-order
 * Edge-compatible endpoint for creating an authoritative server-priced order
 * and linked Razorpay Standard Checkout order.
 */
export async function POST(request: NextRequest) {
  try {
    const originCheck = verifySameOrigin(request);
    if (!originCheck.ok) {
      return NextResponse.json({ error: originCheck.reason || 'Forbidden' }, { status: 403 });
    }

    const ip = getClientIp(request);
    const rl = await checkRateLimitAsync(`create_razorpay_order:${ip}`, 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many checkout requests. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

    const body = (await request.json()) as Partial<OrderData>;
    const result = await createOrder({
      items: Array.isArray(body.items) ? body.items : [],
      shippingAddress: body.shippingAddress as OrderData['shippingAddress'],
      billingAddress: body.billingAddress,
      paymentMethod: body.paymentMethod === 'cod' ? 'cod' : 'razorpay',
      email: String(body.email || ''),
      phone: String(body.phone || ''),
      notes: body.notes,
      coupon: body.coupon,
      giftWrap: Boolean(body.giftWrap),
      giftMessage: body.giftMessage,
      whatsappOptIn: body.whatsappOptIn,
      idempotencyKey: body.idempotencyKey,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      razorpayOrderId: result.razorpayOrderId,
      razorpayKeyId: result.razorpayKeyId,
      razorpayMode: result.razorpayMode,
      amountPaise: result.amountPaise,
      currency: result.currency || 'INR',
      receiptToken: result.receiptToken,
    });
  } catch (error) {
    console.error('Create Razorpay order API error:', error);
    return NextResponse.json({ error: 'Could not create payment order' }, { status: 500 });
  }
}

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createStripePaymentIntent } from '@/lib/actions/payments';
import { createClient } from '@/lib/supabase/server';
import { toPaise } from '@/lib/pricing';
import { verifyOrderReceiptToken } from '@/lib/utils/order-access-token';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    // Get order details
    const supabase = await createClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_number, user_id, email, total_amount, currency, payment_status')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = Boolean(user && order.user_id && user.id === order.user_id);
    const hasSignedToken = Boolean(
      body.receiptToken && verifyOrderReceiptToken(order.id, order.email, String(body.receiptToken))
    );
    const isGuestOwner = Boolean(
      !order.user_id &&
      body.email &&
      body.orderNumber &&
      String(body.email).toLowerCase() === order.email.toLowerCase() &&
      String(body.orderNumber) === order.order_number
    );
    if (!isOwner && !hasSignedToken && !isGuestOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const amountPaise = toPaise(Number(order.total_amount));
    const result = await createStripePaymentIntent({
      amount: amountPaise,
      currency: order.currency,
      orderId: order.id,
      userId: order.user_id || undefined,
      email: order.email,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
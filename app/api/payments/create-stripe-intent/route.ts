import { NextRequest, NextResponse } from 'next/server';
import { createStripePaymentIntent } from '@/lib/actions/payments';
import { createClient } from '@/lib/supabase/server';

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
      .select('id, user_id, email, total, currency')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== order.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await createStripePaymentIntent({
      amount: order.total,
      currency: order.currency,
      orderId: order.id,
      userId: order.user_id,
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
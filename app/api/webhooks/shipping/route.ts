import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendOrderShippedEmail } from '@/lib/email/order-shipped';

export const dynamic = 'force-dynamic';

/**
 * Shiprocket Webhook Endpoint
 * Note: Shiprocket does not permit keywords like 'shiprocket' or 'sr' in the webhook URL.
 * URL to register in Shiprocket Dashboard: https://yourdomain.com/api/webhooks/shipping
 * Header security token: x-api-key
 */
export async function POST(request: NextRequest) {
  try {
    const incomingApiKey = request.headers.get('x-api-key');
    const configuredSecret = process.env['SHIPROCKET_WEBHOOK_SECRET']?.trim();

    // Verify webhook security token if configured
    if (configuredSecret && incomingApiKey !== configuredSecret) {
      console.warn('[Shiprocket Webhook] Unauthorized request with invalid x-api-key');
      return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 });
    }

    const payload = await request.json();

    const orderNumber = payload.order_id;
    const awb = payload.awb;
    const courierName = payload.courier_name;
    const currentStatus = (payload.current_status || payload.shipment_status || '').toUpperCase();
    const scans = payload.scans || [];

    if (!orderNumber && !awb) {
      // Return 200 OK immediately for ping / test events
      return NextResponse.json({ success: true, message: 'Ping received' });
    }

    // Map Shiprocket status string to internal store order status
    const statusMap: Record<string, string> = {
      AWB_ASSIGNED: 'processing',
      LABEL_GENERATED: 'processing',
      PICKUP_SCHEDULED: 'processing',
      PICKED_UP: 'shipped',
      IN_TRANSIT: 'shipped',
      OUT_FOR_DELIVERY: 'shipped',
      DELIVERED: 'delivered',
      RTO_INITIATED: 'returned',
      RTO_DELIVERED: 'returned',
      CANCELLED: 'cancelled',
      CANCELED: 'cancelled',
    };

    const targetStatus = statusMap[currentStatus];

    // Find order in Supabase
    let query = supabaseAdmin.from('orders').select('*');
    if (orderNumber) {
      query = query.eq('order_number', orderNumber);
    } else if (awb) {
      query = query.eq('tracking_number', awb);
    }

    const { data: order, error: findError } = await query.maybeSingle();

    if (findError || !order) {
      console.warn(`[Shiprocket Webhook] No matching order found for order_number: ${orderNumber}, awb: ${awb}`);
      return NextResponse.json({ success: true, warning: 'Order not found in database' });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
      metadata: {
        ...(order.metadata || {}),
        shiprocket_status: currentStatus,
        last_tracking_update: new Date().toISOString(),
        tracking_scans: scans.length > 0 ? scans : (order.metadata?.tracking_scans || []),
      },
    };

    if (awb && !order.tracking_number) {
      updates['tracking_number'] = awb;
    }
    if (courierName && !order.courier_partner) {
      updates['courier_partner'] = courierName;
    }
    if (targetStatus) {
      updates['status'] = targetStatus;
    }
    if (targetStatus === 'shipped' && !order.shipped_at) {
      updates['shipped_at'] = new Date().toISOString();
    }
    if (targetStatus === 'delivered') {
      if (!order.delivered_at) updates['delivered_at'] = new Date().toISOString();
      if (order.payment_method === 'cod') updates['payment_status'] = 'paid';
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', order.id);

    if (updateError) {
      console.error('[Shiprocket Webhook] Failed to update order status:', updateError);
    } else if (targetStatus === 'shipped') {
      await sendOrderShippedEmail(order.id).catch((emailErr) => {
        console.warn('[Shiprocket Webhook] Order shipped email notice:', emailErr);
      });
    }

    return NextResponse.json({ success: true, order_id: order.id, status: targetStatus || currentStatus });
  } catch (err: any) {
    console.error('[Shiprocket Webhook] Exception:', err);
    // Always return 200 OK so Shiprocket does not endlessly retry failed hooks
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}

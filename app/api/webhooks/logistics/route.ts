export const runtime = 'edge';

/**
 * Shiprocket Logistics Tracking Webhook Receiver
 *
 * Endpoint: POST /api/webhooks/logistics
 * Note: URL intentionally avoids Shiprocket's restricted webhook keywords
 * ("shiprocket", "kartrocket", "sr", "kr") so Shiprocket's dashboard accepts it.
 *
 * Authentication: `x-api-key: <SHIPROCKET_WEBHOOK_TOKEN>` (timing-safe comparison).
 */

import { NextRequest, NextResponse } from 'next/server';
import { hasValidServiceRoleKey } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  canTransitionOrderStatus,
  canTransitionShipmentStatus,
} from '@/lib/orders/state-machine';
import {
  mapShiprocketStatus,
  verifyShiprocketWebhookToken,
} from '@/lib/services/shiprocket';
import { sendShipmentLifecycleNotification } from '@/lib/actions/notifications';
import { checkRateLimitAsync, getClientIp } from '@/lib/utils/rate-limit';
import type { Json } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimitAsync(`webhook:logistics:${ip}`, 180, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Verify Shiprocket security token header (`x-api-key`)
  const apiKeyHeader = request.headers.get('x-api-key');
  const authCheck = verifyShiprocketWebhookToken(apiKeyHeader);
  if (!authCheck.configured) {
    return NextResponse.json(
      { error: 'SHIPROCKET_WEBHOOK_TOKEN is not configured' },
      { status: 503 }
    );
  }
  if (!authCheck.valid) {
    return NextResponse.json({ error: 'Invalid webhook security token' }, { status: 401 });
  }

  if (!hasValidServiceRoleKey()) {
    return NextResponse.json({ error: 'Supabase service role not configured' }, { status: 503 });
  }

  let eventId = '';
  try {
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    const awb = String(payload?.awb || '').trim();
    const srOrderId = payload?.sr_order_id ? String(payload.sr_order_id).trim() : '';
    const srShipmentId = payload?.shipment_id ? String(payload.shipment_id).trim() : '';
    const orderNumber = String(payload?.order_id || '').trim();
    const courierName = String(payload?.courier_name || '').trim();
    const shipmentStatusId =
      payload?.shipment_status_id !== undefined && payload?.shipment_status_id !== null
        ? Number(payload.shipment_status_id)
        : null;
    const currentStatusId =
      payload?.current_status_id !== undefined && payload?.current_status_id !== null
        ? Number(payload.current_status_id)
        : null;
    const shipmentStatusLabel = String(payload?.shipment_status || '').trim();
    const currentStatusLabel = String(payload?.current_status || payload?.['sr-status-label'] || '').trim();
    const eventTimestamp = String(
      payload?.current_timestamp || payload?.timestamp || new Date().toISOString()
    ).trim();
    const etd = payload?.etd ? String(payload.etd).trim() : null;
    const scans = Array.isArray(payload?.scans) ? payload.scans : [];

    if (!awb && !srShipmentId && !srOrderId && !orderNumber) {
      return NextResponse.json(
        { error: 'Webhook payload missing awb, shipment_id, sr_order_id, and order_id' },
        { status: 400 }
      );
    }

    const statusKey = String(shipmentStatusId ?? currentStatusId ?? (shipmentStatusLabel || currentStatusLabel || 'scan'));
    eventId = `ship_${awb || srShipmentId || orderNumber}_${statusKey}_${eventTimestamp}`
      .replace(/\s+/g, '_')
      .slice(0, 140);

    // Claim webhook event durably
    const { error: claimErr } = await supabaseAdmin.from('webhook_events').insert({
      provider: 'shiprocket',
      event_id: eventId,
      event_type: shipmentStatusLabel || currentStatusLabel || 'tracking_update',
      payload: {
        awb,
        sr_order_id: srOrderId,
        shipment_id: srShipmentId,
        order_id: orderNumber,
        shipment_status_id: shipmentStatusId,
        current_status_id: currentStatusId,
        shipment_status: shipmentStatusLabel,
        current_status: currentStatusLabel,
        current_timestamp: eventTimestamp,
      } as unknown as Json,
      status: 'processing',
      attempts: 1,
    });

    if (claimErr) {
      if (claimErr.code === '23505') {
        const { data: existing } = await supabaseAdmin
          .from('webhook_events')
          .select('status, attempts')
          .eq('provider', 'shiprocket')
          .eq('event_id', eventId)
          .maybeSingle();

        if (!existing || existing.status === 'processed' || existing.status === 'processing') {
          return NextResponse.json({ received: true, deduplicated: true });
        }

        await supabaseAdmin
          .from('webhook_events')
          .update({
            status: 'processing',
            attempts: Number(existing.attempts || 1) + 1,
            error_message: null,
            updated_at: new Date().toISOString(),
          })
          .eq('provider', 'shiprocket')
          .eq('event_id', eventId);
      } else {
        console.error('[Logistics Webhook] Failed to log webhook_events:', claimErr.message);
        return NextResponse.json({ error: 'Event persistence failed' }, { status: 500 });
      }
    }

    const mapped = mapShiprocketStatus({
      shipmentStatusId: Number.isFinite(shipmentStatusId) ? shipmentStatusId : null,
      currentStatusId: Number.isFinite(currentStatusId) ? currentStatusId : null,
      shipmentStatus: shipmentStatusLabel,
      currentStatus: currentStatusLabel,
    });

    // Resolve local shipment record (if present) and order record
    let shipmentRow: any = null;
    if (awb) {
      const { data } = await supabaseAdmin
        .from('shipments')
        .select('*')
        .eq('awb_code', awb)
        .maybeSingle();
      shipmentRow = data;
    }
    if (!shipmentRow && srShipmentId) {
      const { data } = await supabaseAdmin
        .from('shipments')
        .select('*')
        .eq('shiprocket_shipment_id', srShipmentId)
        .maybeSingle();
      shipmentRow = data;
    }
    if (!shipmentRow && srOrderId) {
      const { data } = await supabaseAdmin
        .from('shipments')
        .select('*')
        .eq('shiprocket_order_id', srOrderId)
        .maybeSingle();
      shipmentRow = data;
    }

    let orderRow: any = null;
    if (shipmentRow?.order_id) {
      const { data } = await supabaseAdmin
        .from('orders')
        .select('id, order_number, status, payment_status, tracking_number, courier_partner, tracking_url, shipped_at, delivered_at')
        .eq('id', shipmentRow.order_id)
        .maybeSingle();
      orderRow = data;
    }
    if (!orderRow && awb) {
      const { data } = await supabaseAdmin
        .from('orders')
        .select('id, order_number, status, payment_status, tracking_number, courier_partner, tracking_url, shipped_at, delivered_at')
        .eq('tracking_number', awb)
        .maybeSingle();
      orderRow = data;
    }
    if (!orderRow && orderNumber) {
      const { data } = await supabaseAdmin
        .from('orders')
        .select('id, order_number, status, payment_status, tracking_number, courier_partner, tracking_url, shipped_at, delivered_at')
        .ilike('order_number', orderNumber)
        .maybeSingle();
      orderRow = data;
    }

    const trackingUrl = awb
      ? `https://shiprocket.co/tracking/${encodeURIComponent(awb)}`
      : shipmentRow?.tracking_url || orderRow?.tracking_url || null;

    // 1. Update public.shipments monotonically (never revert delivered/cancelled/rto_delivered)
    if (shipmentRow) {
      const canAdvanceShipment = canTransitionShipmentStatus(
        shipmentRow.shipment_status,
        mapped.shipmentStatus
      );

      const shipmentUpdates: Record<string, unknown> = {
        raw_status_code: Number.isFinite(shipmentStatusId ?? currentStatusId)
          ? (shipmentStatusId ?? currentStatusId)
          : shipmentRow.raw_status_code,
        raw_status_label: currentStatusLabel || shipmentStatusLabel || shipmentRow.raw_status_label,
        last_event_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (canAdvanceShipment) {
        shipmentUpdates['shipment_status'] = mapped.shipmentStatus;
      }
      if (mapped.pickupStatus) {
        shipmentUpdates['pickup_status'] = mapped.pickupStatus;
      }
      if (courierName) shipmentUpdates['courier_name'] = courierName;
      if (awb && !shipmentRow.awb_code) shipmentUpdates['awb_code'] = awb;
      if (trackingUrl) shipmentUpdates['tracking_url'] = trackingUrl;
      if (etd) shipmentUpdates['etd'] = etd;
      if (scans.length > 0) shipmentUpdates['scans'] = scans as unknown as Json;
      if (mapped.shipmentStatus === 'cancelled') {
        shipmentUpdates['cancelled_at'] = new Date().toISOString();
      }

      await supabaseAdmin.from('shipments').update(shipmentUpdates).eq('id', shipmentRow.id);
    }

    // 2. Update public.orders monotonically (NEVER touch payment_status!)
    if (orderRow) {
      const orderUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (mapped.shipmentStatus === 'cancelled') {
        // If shipment was cancelled externally on Shiprocket, detach matching AWB so admin can cleanly rebook
        if (awb && orderRow.tracking_number === awb) {
          orderUpdates['tracking_number'] = null;
          orderUpdates['tracking_url'] = null;
        }
      } else {
        if (courierName) orderUpdates['courier_partner'] = courierName;
        if (awb && !orderRow.tracking_number) orderUpdates['tracking_number'] = awb;
        if (trackingUrl && !orderRow.tracking_url) orderUpdates['tracking_url'] = trackingUrl;
      }

      let statusAdvancedTo: string | null = null;
      if (
        mapped.orderStatus &&
        mapped.orderStatus !== orderRow.status &&
        canTransitionOrderStatus(orderRow.status, mapped.orderStatus)
      ) {
        orderUpdates['status'] = mapped.orderStatus;
        statusAdvancedTo = mapped.orderStatus;
        if (
          (mapped.orderStatus === 'shipped' ||
            mapped.orderStatus === 'out_for_delivery' ||
            mapped.orderStatus === 'delivered') &&
          !orderRow.shipped_at
        ) {
          orderUpdates['shipped_at'] = new Date().toISOString();
        }
        if (mapped.orderStatus === 'delivered' && !orderRow.delivered_at) {
          orderUpdates['delivered_at'] = new Date().toISOString();
        }
      }

      await supabaseAdmin.from('orders').update(orderUpdates).eq('id', orderRow.id);

      // Link order_id on webhook_events for traceability
      await supabaseAdmin
        .from('webhook_events')
        .update({ order_id: orderRow.id, status: 'processed', processed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('provider', 'shiprocket')
        .eq('event_id', eventId);

      // Dispatch idempotent customer shipment emails on key customer-facing milestones
      if (
        statusAdvancedTo === 'shipped' ||
        statusAdvancedTo === 'out_for_delivery' ||
        statusAdvancedTo === 'delivered'
      ) {
        await sendShipmentLifecycleNotification({
          orderId: orderRow.id,
          shipmentRef: awb || srShipmentId || orderRow.id,
          stage: statusAdvancedTo,
          courierName: courierName || orderRow.courier_partner,
          awbCode: awb || orderRow.tracking_number,
          trackingUrl,
        });
      }
    } else {
      await supabaseAdmin
        .from('webhook_events')
        .update({ status: 'processed', processed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('provider', 'shiprocket')
        .eq('event_id', eventId);
    }

    return NextResponse.json({
      received: true,
      mappedShipmentStatus: mapped.shipmentStatus,
      mappedOrderStatus: mapped.orderStatus,
    });
  } catch (err: any) {
    console.error('[Logistics Webhook] Error:', err?.message || err);
    if (eventId) {
      await supabaseAdmin
        .from('webhook_events')
        .update({
          status: 'failed',
          error_message: String(err?.message || 'Processing failed').slice(0, 500),
          updated_at: new Date().toISOString(),
        })
        .eq('provider', 'shiprocket')
        .eq('event_id', eventId);
    }
    return NextResponse.json(
      { error: err?.message || 'Malformed Shiprocket webhook payload' },
      { status: 400 }
    );
  }
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const {
  shipmentsMap,
  ordersMap,
  webhookEventsMap,
  notificationsList,
} = vi.hoisted(() => ({
  shipmentsMap: new Map<string, any>(),
  ordersMap: new Map<string, any>(),
  webhookEventsMap: new Map<string, any>(),
  notificationsList: [] as any[],
}));

vi.mock('@/lib/email/resend', () => ({
  sendEmailViaResend: vi.fn(async () => ({ success: true, id: 'email_ship_1' })),
  isResendConfigured: () => false,
}));

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === 'webhook_events') {
        return {
          insert: vi.fn(async (row: any) => {
            const key = `${row.provider}:${row.event_id}`;
            if (webhookEventsMap.has(key)) {
              return { error: { code: '23505', message: 'duplicate' } };
            }
            webhookEventsMap.set(key, { ...row });
            return { error: null };
          }),
          select: vi.fn(() => {
            const filters: Record<string, any> = {};
            const chain: any = {
              eq: vi.fn((c: string, v: any) => {
                filters[c] = v;
                return chain;
              }),
              maybeSingle: vi.fn(async () => ({
                data: webhookEventsMap.get(`${filters['provider']}:${filters['event_id']}`) ?? null,
                error: null,
              })),
            };
            return chain;
          }),
          update: vi.fn((patch: any) => {
            const filters: Record<string, any> = {};
            const chain: any = {
              eq: vi.fn((c: string, v: any) => {
                filters[c] = v;
                const key = `${filters['provider']}:${filters['event_id']}`;
                const existing = webhookEventsMap.get(key);
                if (existing) webhookEventsMap.set(key, { ...existing, ...patch });
                return chain;
              }),
            };
            return chain;
          }),
        };
      }

      if (table === 'shipments') {
        return {
          select: vi.fn(() => {
            const filters: Record<string, any> = {};
            const chain: any = {
              eq: vi.fn((c: string, v: any) => {
                filters[c] = v;
                return chain;
              }),
              maybeSingle: vi.fn(async () => {
                const found = Array.from(shipmentsMap.values()).find((s) =>
                  Object.entries(filters).every(([k, v]) => s[k] === v)
                );
                return { data: found ?? null, error: null };
              }),
            };
            return chain;
          }),
          update: vi.fn((patch: any) => ({
            eq: vi.fn(async (_c: string, id: string) => {
              const existing = shipmentsMap.get(id);
              if (existing) shipmentsMap.set(id, { ...existing, ...patch });
              return { error: null };
            }),
          })),
        };
      }

      if (table === 'orders') {
        return {
          select: vi.fn(() => {
            const filters: Record<string, any> = {};
            const chain: any = {
              eq: vi.fn((c: string, v: any) => {
                filters[c] = v;
                return chain;
              }),
              ilike: vi.fn((c: string, v: string) => {
                filters[c] = v.toLowerCase();
                return chain;
              }),
              maybeSingle: vi.fn(async () => {
                const found = Array.from(ordersMap.values()).find((o) =>
                  Object.entries(filters).every(
                    ([k, v]) => String(o[k] || '').toLowerCase() === String(v).toLowerCase()
                  )
                );
                return { data: found ?? null, error: null };
              }),
            };
            return chain;
          }),
          update: vi.fn((patch: any) => ({
            eq: vi.fn(async (_c: string, id: string) => {
              const existing = ordersMap.get(id);
              if (existing) ordersMap.set(id, { ...existing, ...patch });
              return { error: null };
            }),
          })),
        };
      }

      if (table === 'notifications') {
        return {
          insert: vi.fn((row: any) => {
            const created = { id: `n_${notificationsList.length + 1}`, ...row };
            notificationsList.push(created);
            return {
              select: vi.fn(() => ({
                maybeSingle: vi.fn(async () => ({ data: created, error: null })),
              })),
            };
          }),
          update: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
        };
      }

      return {};
    }),
  },
}));

import {
  resetShiprocketTokenCache,
  getShiprocketAuthToken,
  buildShiprocketAdhocOrderPayload,
  createShiprocketOrder,
  assignShiprocketAwb,
  scheduleShiprocketPickup,
  generateShiprocketLabel,
  generateShiprocketManifest,
  trackShiprocketAwb,
  cancelShiprocketShipment,
  verifyShiprocketWebhookToken,
  mapShiprocketStatus,
} from '@/lib/services/shiprocket';
import { POST as logisticsWebhookPOST } from '@/app/api/webhooks/logistics/route';

describe('Shiprocket API v2 Logistics & /api/webhooks/logistics', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    resetShiprocketTokenCache();
    shipmentsMap.clear();
    ordersMap.clear();
    webhookEventsMap.clear();
    notificationsList.length = 0;

    process.env = { ...originalEnv };
    process.env['SHIPROCKET_EMAIL'] = 'api@angelikafashions.com';
    process.env['SHIPROCKET_PASSWORD'] = 'strong_shiprocket_pass';
    process.env['SHIPROCKET_PICKUP_LOCATION'] = 'Primary';
    process.env['SHIPROCKET_WEBHOOK_TOKEN'] = 'sr_webhook_secret_token_999';
    process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_service_role_key_valid_length_1234567890';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it('caches Shiprocket JWT token, deduplicates concurrent logins, and refreshes once on HTTP 401', async () => {
    let loginCalls = 0;
    let labelCalls = 0;

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.endsWith('/auth/login')) {
          loginCalls++;
          return new Response(JSON.stringify({ token: `jwt_token_${loginCalls}` }), { status: 200 });
        }
        if (url.endsWith('/courier/generate/label')) {
          labelCalls++;
          if (labelCalls === 1) {
            return new Response(JSON.stringify({ message: 'Token expired' }), { status: 401 });
          }
          return new Response(
            JSON.stringify({ label_url: 'https://s3.shiprocket.in/labels/12345.pdf' }),
            { status: 200 }
          );
        }
        return new Response('{}', { status: 404 });
      })
    );

    // Concurrent calls share a single login request
    const [t1, t2] = await Promise.all([getShiprocketAuthToken(), getShiprocketAuthToken()]);
    expect(t1).toBe('jwt_token_1');
    expect(t2).toBe('jwt_token_1');
    expect(loginCalls).toBe(1);

    // HTTP 401 triggers exactly one forced token refresh and retry
    const labelRes = await generateShiprocketLabel('998877');
    expect(labelRes.success).toBe(true);
    expect(labelRes.labelUrl).toBe('https://s3.shiprocket.in/labels/12345.pdf');
    expect(loginCalls).toBe(2);
    expect(labelCalls).toBe(2);
  });

  it('builds authoritative Shiprocket payloads strictly from real customer/item data and rejects missing fields', () => {
    const invalid = buildShiprocketAdhocOrderPayload({
      orderNumber: 'ORD-BAD-1',
      orderDateIso: '2026-11-26T10:00:00Z',
      customerEmail: 'not-an-email',
      customerPhone: '123',
      shippingAddress: {
        firstName: '',
        address1: '',
        city: '',
        state: '',
        postalCode: '12',
      },
      items: [],
      subtotalInr: 0,
      paymentMethod: 'prepaid',
    });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors?.length).toBeGreaterThanOrEqual(5);

    const valid = buildShiprocketAdhocOrderPayload({
      orderNumber: 'AF-2026-1001',
      orderDateIso: '2026-11-26T10:00:00Z',
      customerEmail: 'meera@example.com',
      customerPhone: '+91 9876543210',
      shippingAddress: {
        firstName: 'Meera',
        lastName: 'Kapoor',
        address1: '42 Royal Enclave',
        city: 'Jaipur',
        state: 'Rajasthan',
        postalCode: '302001',
      },
      items: [
        {
          name: 'Chanderi Silk Anarkali',
          sku: 'AF-CHAND-M-GOLD',
          units: 2,
          sellingPrice: 4500,
          tax: 12,
          hsn: '620449',
          weightGrams: 450,
        },
      ],
      subtotalInr: 9000,
      discountInr: 500,
      paymentMethod: 'prepaid',
    });

    expect(valid.valid).toBe(true);
    expect(valid.weightKg).toBe(0.9); // 450g * 2 = 0.9kg
    expect(valid.usedDefaultWeight).toBe(false);
    expect(valid.payload?.['billing_email']).toBe('meera@example.com');
    expect(valid.payload?.['payment_method']).toBe('Prepaid');
    expect(valid.payload?.['order_items']).toEqual([
      {
        name: 'Chanderi Silk Anarkali',
        sku: 'AF-CHAND-M-GOLD',
        units: 2,
        selling_price: 4500,
        discount: 0,
        tax: 12,
        hsn: '620449',
      },
    ]);
  });

  it('supports create order, AWB assignment (real courier name), pickup, manifest, track & cancel', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.endsWith('/auth/login')) {
          return new Response(JSON.stringify({ token: 'jwt_ok' }), { status: 200 });
        }
        if (url.endsWith('/orders/create/adhoc')) {
          return new Response(JSON.stringify({ order_id: 50123, shipment_id: 70456, status: 'NEW' }), { status: 200 });
        }
        if (url.endsWith('/courier/assign/awb')) {
          return new Response(
            JSON.stringify({
              response: {
                data: {
                  awb_code: 'BD99887766',
                  courier_name: 'Blue Dart Air',
                  courier_company_id: 14,
                },
              },
            }),
            { status: 200 }
          );
        }
        if (url.endsWith('/courier/generate/pickup')) {
          return new Response(
            JSON.stringify({
              pickup_status: 1,
              response: { pickup_scheduled_date: '2026-11-27 11:00:00', pickup_token_number: 'PK-77' },
            }),
            { status: 200 }
          );
        }
        if (url.endsWith('/manifests/generate')) {
          return new Response(JSON.stringify({ manifest_url: 'https://s3.shiprocket.in/manifests/70456.pdf' }), {
            status: 200,
          });
        }
        if (url.includes('/courier/track/awb/BD99887766')) {
          return new Response(
            JSON.stringify({
              tracking_data: {
                shipment_status: 17,
                track_url: 'https://shiprocket.co/tracking/BD99887766',
                etd: '2026-11-29',
                shipment_track: [{ current_status: 'Out For Delivery', courier_name: 'Blue Dart Air' }],
                shipment_track_activities: [
                  { date: '2026-11-28 09:00', status: 'OFD', activity: 'Out for delivery', location: 'Jaipur Hub' },
                ],
              },
            }),
            { status: 200 }
          );
        }
        if (url.endsWith('/orders/cancel/shipment/awbs') || url.endsWith('/orders/cancel')) {
          return new Response(JSON.stringify({ message: 'Cancelled' }), { status: 200 });
        }
        return new Response('{}', { status: 404 });
      })
    );

    const created = await createShiprocketOrder({ order_id: 'AF-1' });
    expect(created).toEqual({
      success: true,
      shiprocketOrderId: '50123',
      shiprocketShipmentId: '70456',
      status: 'NEW',
    });

    const awb = await assignShiprocketAwb('70456');
    expect(awb.success).toBe(true);
    expect(awb.awbCode).toBe('BD99887766');
    expect(awb.courierName).toBe('Blue Dart Air');
    expect(awb.trackingUrl).toBe('https://shiprocket.co/tracking/BD99887766');

    const pickup = await scheduleShiprocketPickup('70456');
    expect(pickup.success).toBe(true);
    expect(pickup.pickupTokenNumber).toBe('PK-77');

    const manifest = await generateShiprocketManifest('70456');
    expect(manifest.success).toBe(true);
    expect(manifest.manifestUrl).toMatch(/^https:\/\//);

    const tracked = await trackShiprocketAwb('BD99887766');
    expect(tracked.success).toBe(true);
    expect(tracked.shipmentStatus).toBe('out_for_delivery');
    expect(tracked.orderStatus).toBe('out_for_delivery');
    expect(tracked.scans).toHaveLength(1);

    const cancelled = await cancelShiprocketShipment({ shiprocketOrderId: '50123', awbCode: 'BD99887766' });
    expect(cancelled.success).toBe(true);
  });

  it('verifies Shiprocket x-api-key fail-closed and maps official Shiprocket status codes/labels', () => {
    expect(verifyShiprocketWebhookToken('sr_webhook_secret_token_999')).toEqual({
      valid: true,
      configured: true,
    });
    expect(verifyShiprocketWebhookToken('wrong_token')).toEqual({
      valid: false,
      configured: true,
    });

    delete process.env['SHIPROCKET_WEBHOOK_TOKEN'];
    expect(verifyShiprocketWebhookToken('sr_webhook_secret_token_999')).toEqual({
      valid: false,
      configured: false,
    });

    expect(mapShiprocketStatus({ shipmentStatusId: 6, currentStatus: 'In Transit' }).orderStatus).toBe('shipped');
    expect(mapShiprocketStatus({ shipmentStatusId: 17, currentStatus: 'Out For Delivery' }).orderStatus).toBe('out_for_delivery');
    expect(mapShiprocketStatus({ shipmentStatusId: 7, currentStatus: 'Delivered' }).orderStatus).toBe('delivered');
    expect(mapShiprocketStatus({ shipmentStatusId: 15, currentStatus: 'RTO Delivered' }).orderStatus).toBe('returned');
  });

  it('POST /api/webhooks/logistics enforces x-api-key, deduplicates, blocks regressions, and never mutates payment_status', async () => {
    ordersMap.set('ord-ship-1', {
      id: 'ord-ship-1',
      order_number: 'AF-SHIP-1',
      email: 'kavya@example.com',
      status: 'processing',
      payment_status: 'paid',
      tracking_number: 'AWB123456',
      courier_partner: 'Blue Dart',
      tracking_url: 'https://shiprocket.co/tracking/AWB123456',
    });
    shipmentsMap.set('ship-1', {
      id: 'ship-1',
      order_id: 'ord-ship-1',
      awb_code: 'AWB123456',
      shiprocket_shipment_id: '70456',
      shipment_status: 'awb_assigned',
      pickup_status: 'pending',
    });

    // 1. Invalid token -> 401
    const badReq = new NextRequest('https://angelikafashions.com/api/webhooks/logistics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'wrong' },
      body: JSON.stringify({ awb: 'AWB123456', shipment_status_id: 6, current_status: 'In Transit' }),
    });
    const badRes = await logisticsWebhookPOST(badReq);
    expect(badRes.status).toBe(401);

    // 2. Valid In Transit event -> advances shipment to in_transit and order to shipped
    const transitBody = JSON.stringify({
      awb: 'AWB123456',
      order_id: 'AF-SHIP-1',
      courier_name: 'Blue Dart Air',
      shipment_status_id: 6,
      current_status: 'In Transit',
      current_timestamp: '2026-11-26 15:00:00',
    });
    const okRes = await logisticsWebhookPOST(
      new NextRequest('https://angelikafashions.com/api/webhooks/logistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'sr_webhook_secret_token_999' },
        body: transitBody,
      })
    );
    expect(okRes.status).toBe(200);
    expect(shipmentsMap.get('ship-1').shipment_status).toBe('in_transit');
    expect(ordersMap.get('ord-ship-1').status).toBe('shipped');
    expect(ordersMap.get('ord-ship-1').payment_status).toBe('paid'); // NEVER altered!

    // 3. Replay identical webhook -> deduplicated
    const replayRes = await logisticsWebhookPOST(
      new NextRequest('https://angelikafashions.com/api/webhooks/logistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'sr_webhook_secret_token_999' },
        body: transitBody,
      })
    );
    const replayJson = await replayRes.json();
    expect(replayJson.deduplicated).toBe(true);

    // 4. Advance to Delivered, then send late out-of-order In Transit -> MUST NOT regress!
    const deliveredRes = await logisticsWebhookPOST(
      new NextRequest('https://angelikafashions.com/api/webhooks/logistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'sr_webhook_secret_token_999' },
        body: JSON.stringify({
          awb: 'AWB123456',
          shipment_status_id: 7,
          current_status: 'Delivered',
          current_timestamp: '2026-11-28 12:00:00',
        }),
      })
    );
    expect(deliveredRes.status).toBe(200);
    expect(shipmentsMap.get('ship-1').shipment_status).toBe('delivered');
    expect(ordersMap.get('ord-ship-1').status).toBe('delivered');

    const staleRes = await logisticsWebhookPOST(
      new NextRequest('https://angelikafashions.com/api/webhooks/logistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'sr_webhook_secret_token_999' },
        body: JSON.stringify({
          awb: 'AWB123456',
          shipment_status_id: 6,
          current_status: 'In Transit',
          current_timestamp: '2026-11-28 13:00:00',
        }),
      })
    );
    expect(staleRes.status).toBe(200);
    expect(shipmentsMap.get('ship-1').shipment_status).toBe('delivered');
    expect(ordersMap.get('ord-ship-1').status).toBe('delivered');
  });
});

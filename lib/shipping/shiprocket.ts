/**
 * Shiprocket External REST API Integration Service
 * Base URL: https://apiv2.shiprocket.in/v1/external
 *
 * Implements:
 * 1. Authentication & 10-day JWT Bearer token caching with auto-refresh
 * 2. Real-time Pincode Courier Serviceability & COD Availability Check
 * 3. Automatic Adhoc Order Push (POST /orders/create/adhoc)
 * 4. Courier Allocation & AWB Generation (POST /courier/assign/awb)
 * 5. Courier Pickup Scheduling (POST /courier/generate/pickup)
 * 6. Thermal PDF Shipping Label Generation (POST /courier/generate/label)
 * 7. Live Shipment Tracking (GET /courier/track/awb/{awb_code})
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendOrderShippedEmail } from '@/lib/email/order-shipped';

const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external';

// In-memory token cache (tokens are valid for 10 days / 240 hours)
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export interface ShiprocketCredentials {
  email?: string;
  password?: string;
  pickupLocation?: string;
  pickupPincode?: string;
}

export function isShiprocketConfigured(): boolean {
  const email = process.env['SHIPROCKET_API_EMAIL']?.trim();
  const password = process.env['SHIPROCKET_API_PASSWORD']?.trim();
  return Boolean(email && password);
}

/**
 * Retrieve a valid Bearer authentication token from Shiprocket.
 * Automatically caches token and re-authenticates 12 hours before expiration.
 */
export async function getShiprocketToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 12 * 3600 * 1000) {
    return cachedToken;
  }

  const email = process.env['SHIPROCKET_API_EMAIL']?.trim();
  const password = process.env['SHIPROCKET_API_PASSWORD']?.trim();

  if (!email || !password) {
    throw new Error('SHIPROCKET_API_EMAIL and SHIPROCKET_API_PASSWORD must be configured in .env.local');
  }

  const response = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok || !data.token) {
    throw new Error(data.message || `Shiprocket authentication failed with status ${response.status}`);
  }

  cachedToken = data.token as string;
  // Tokens are valid for 10 days; set cache expiration for 9.5 days
  tokenExpiresAt = now + 9.5 * 24 * 60 * 60 * 1000;
  return data.token as string;
}

/**
 * Generic wrapper for authenticated requests to Shiprocket API
 */
export async function shiprocketRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getShiprocketToken();
  const url = `${SHIPROCKET_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Shiprocket API error: ${response.status}`);
  }
  return data;
}

/**
 * Check Courier Serviceability & Delivery Time for a destination Pincode
 */
export async function checkCourierServiceability(params: {
  deliveryPincode: string;
  isCod?: boolean;
  weightInKg?: number;
}) {
  const { deliveryPincode, isCod = false, weightInKg = 1.0 } = params;

  if (!isShiprocketConfigured()) {
    // Graceful fallback for preview / development mode
    return {
      configured: false,
      serviceable: true,
      estimatedDeliveryDays: '3–5 days',
      codAvailable: true,
      availableCouriers: [
        { courier_name: 'Blue Dart Express', rate: 120, estimated_delivery_days: '3' },
        { courier_name: 'Delhivery Surface', rate: 95, estimated_delivery_days: '4' },
      ],
    };
  }

  const pickupPostcode = process.env['SHIPROCKET_PICKUP_PINCODE'] || '302001';
  const codParam = isCod ? 1 : 0;

  const endpoint = `/courier/serviceability/?pickup_postcode=${pickupPostcode}&delivery_postcode=${deliveryPincode}&weight=${weightInKg}&cod=${codParam}`;
  const result = await shiprocketRequest(endpoint);

  const couriers: any[] = result?.data?.available_courier_companies || [];
  const isServiceable = couriers.length > 0;
  const fastest = couriers.slice().sort(
    (a, b) => Number(a.estimated_delivery_days || 99) - Number(b.estimated_delivery_days || 99)
  )[0];

  return {
    configured: true,
    serviceable: isServiceable,
    estimatedDeliveryDays: fastest?.estimated_delivery_days ? `${fastest.estimated_delivery_days} days` : '3–5 days',
    codAvailable: couriers.some((c) => c.cod === 1),
    availableCouriers: couriers.map((c) => ({
      courier_company_id: c.courier_company_id,
      courier_name: c.courier_name,
      rate: c.rate,
      estimated_delivery_days: c.estimated_delivery_days,
      etd: c.etd,
    })),
  };
}

/**
 * Push an order to Shiprocket (POST /orders/create/adhoc)
 * Automatically called when an order is created or payment verified
 */
export async function createShiprocketOrder(orderId: string) {
  // 1. Fetch order & items from Supabase
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (
        id, product_id, product_name, quantity, unit_price, total_price, variant_details
      )
    `)
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error(`Order ${orderId} not found in database: ${orderError?.message}`);
  }

  // Check if order already has an active Shiprocket ID
  if (order.metadata?.shiprocket_order_id && order.metadata?.shiprocket_shipment_id) {
    return {
      success: true,
      alreadyCreated: true,
      order_id: order.metadata.shiprocket_order_id,
      shipment_id: order.metadata.shiprocket_shipment_id,
    };
  }

  const shipping = (order.shipping_address as Record<string, any>) || {};
  const isCod = order.payment_method === 'cod';

  // If credentials are not yet configured in .env.local, record simulated/pending state
  if (!isShiprocketConfigured()) {
    console.warn(`[Shiprocket] Credentials not configured in .env.local. Order ${order.order_number} recorded in Supabase and marked pending Shiprocket sync.`);
    await supabaseAdmin
      .from('orders')
      .update({
        metadata: {
          ...(order.metadata || {}),
          shiprocket_status: 'pending_credentials',
          shiprocket_pending_sync: true,
        },
      })
      .eq('id', orderId);

    return {
      success: true,
      simulated: true,
      message: 'Order saved in Supabase. Add Shiprocket credentials to .env.local to activate live courier dispatch.',
    };
  }

  // 2. Format order payload according to Shiprocket adhoc order spec
  const orderDate = new Date(order.created_at || Date.now())
    .toISOString()
    .replace('T', ' ')
    .substring(0, 19);

  const fullName = [shipping['firstName'], shipping['lastName']].filter(Boolean).join(' ') || shipping['fullName'] || 'Valued Customer';
  const address1 = shipping['address1'] || shipping['street'] || 'Address Line 1';
  const address2 = [shipping['address2'], shipping['landmark']].filter(Boolean).join(', ') || '';
  const city = shipping['city'] || 'Jaipur';
  const state = shipping['state'] || 'Rajasthan';
  const pincode = shipping['postalCode'] || shipping['pincode'] || '302001';
  const phone = (order.phone || shipping['phone'] || '9876543210').replace(/[^0-9]/g, '').slice(-10);
  const email = order.email || shipping['email'] || 'customer@angelikafashions.com';

  const items = (order.order_items || []).map((it: any) => ({
    name: it.product_name,
    sku: it.variant_details?.sku || it.product_id.slice(0, 10).toUpperCase(),
    units: it.quantity || 1,
    selling_price: Number(it.unit_price) || 0,
    discount: 0,
    tax: 0,
    hsn: 6204, // Indian GST HSN Code for Women's Ethnic Garments
  }));

  const payload = {
    order_id: order.order_number,
    order_date: orderDate,
    pickup_location: process.env['SHIPROCKET_PICKUP_LOCATION'] || 'Primary',
    billing_customer_name: shipping['firstName'] || 'Valued',
    billing_last_name: shipping['lastName'] || 'Customer',
    billing_address: address1,
    billing_address_2: address2,
    billing_city: city,
    billing_pincode: pincode,
    billing_state: state,
    billing_country: 'India',
    billing_email: email,
    billing_phone: phone,
    shipping_is_billing: true,
    order_items: items.length > 0 ? items : [
      {
        name: 'Handcrafted Designer Garment',
        sku: 'AF-COUTURE',
        units: 1,
        selling_price: Number(order.total_amount) || 4999,
        discount: 0,
        tax: 0,
      },
    ],
    payment_method: isCod ? 'COD' : 'Prepaid',
    sub_total: Number(order.total_amount) || 0,
    length: 30, // cm - luxury apparel box
    breadth: 25,
    height: 6,
    weight: 0.9, // kg
  };

  const result = await shiprocketRequest('/orders/create/adhoc', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const srOrderId = result.order_id;
  const srShipmentId = result.shipment_id;

  // 3. Update Supabase order metadata with Shiprocket IDs
  await supabaseAdmin
    .from('orders')
    .update({
      metadata: {
        ...(order.metadata || {}),
        shiprocket_order_id: srOrderId,
        shiprocket_shipment_id: srShipmentId,
        shiprocket_status: 'created',
        shiprocket_created_at: new Date().toISOString(),
      },
    })
    .eq('id', orderId);

  return {
    success: true,
    order_id: srOrderId,
    shipment_id: srShipmentId,
  };
}

/**
 * Assign AWB & Courier partner to a shipment (POST /courier/assign/awb)
 */
export async function assignShiprocketAWB(params: {
  orderId: string;
  shipmentId: number;
  courierId?: number;
}) {
  const { orderId, shipmentId, courierId } = params;

  if (!isShiprocketConfigured()) {
    // Development simulated fallback
    const mockAwb = `SR${Date.now().toString().slice(-9)}`;
    const mockCourier = 'Shiprocket / Blue Dart';

    await supabaseAdmin
      .from('orders')
      .update({
        tracking_number: mockAwb,
        courier_partner: mockCourier,
        status: 'processing',
        metadata: {
          shiprocket_status: 'awb_assigned (demo)',
          awb_code: mockAwb,
        },
      })
      .eq('id', orderId);

    return {
      success: true,
      awb_code: mockAwb,
      courier_name: mockCourier,
      simulated: true,
    };
  }

  const payload: Record<string, any> = { shipment_id: shipmentId };
  if (courierId) payload['courier_id'] = courierId;

  const result = await shiprocketRequest('/courier/assign/awb', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const awbData = result.response?.data;
  const awbCode = awbData?.awb_code;
  const courierName = awbData?.courier_name || 'Shiprocket Courier';

  if (awbCode) {
    await supabaseAdmin
      .from('orders')
      .update({
        tracking_number: awbCode,
        courier_partner: courierName,
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
  }

  return {
    success: true,
    awb_code: awbCode,
    courier_name: courierName,
    data: awbData,
  };
}

/**
 * Schedule Courier Pickup (POST /courier/generate/pickup)
 */
export async function generateShiprocketPickup(params: {
  orderId: string;
  shipmentId: number;
}) {
  const { orderId, shipmentId } = params;
  const configured = isShiprocketConfigured();

  const result = configured
    ? await shiprocketRequest('/courier/generate/pickup', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: [shipmentId] }),
      })
    : null;

  const now = new Date().toISOString();
  await supabaseAdmin
    .from('orders')
    .update({
      status: 'shipped',
      shipped_at: now,
      updated_at: now,
    })
    .eq('id', orderId);

  await sendOrderShippedEmail(orderId).catch((emailErr) => {
    console.warn('[generateShiprocketPickup] Order shipped email notice:', emailErr);
  });

  if (!configured) {
    return {
      success: true,
      simulated: true,
      message: 'Pickup scheduled (demo mode). Order status marked as shipped.',
    };
  }

  return {
    success: true,
    response: result,
  };
}

/**
 * Generate Shipping Label PDF (POST /courier/generate/label)
 */
export async function generateShiprocketLabel(shipmentId: number) {
  if (!isShiprocketConfigured()) {
    return {
      success: true,
      label_url: 'https://shiprocket.co',
      simulated: true,
    };
  }

  const result = await shiprocketRequest('/courier/generate/label', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: [shipmentId] }),
  });

  return {
    success: true,
    label_url: result.label_url,
    response: result,
  };
}

/**
 * Generate Shipping Manifest (POST /manifests/generate)
 */
export async function generateShiprocketManifest(shipmentId: number) {
  if (!isShiprocketConfigured()) {
    return {
      success: true,
      manifest_url: 'https://shiprocket.co',
      simulated: true,
    };
  }

  const result = await shiprocketRequest('/manifests/generate', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: [shipmentId] }),
  });

  return {
    success: true,
    manifest_url: result.manifest_url,
    response: result,
  };
}

/**
 * Track shipment live by AWB code (GET /courier/track/awb/{awb_code})
 */
export async function trackShiprocketAWB(awbCode: string) {
  if (!isShiprocketConfigured()) {
    return {
      configured: false,
      awb: awbCode,
      current_status: 'IN TRANSIT',
      scans: [
        {
          date: new Date().toISOString(),
          activity: 'Package received at central sorting hub',
          location: 'Jaipur Atelier Hub',
          status: 'IN TRANSIT',
        },
        {
          date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          activity: 'Dispatched from atelier & handed to courier partner',
          location: 'Jaipur Atelier Hub',
          status: 'PICKED UP',
        },
      ],
    };
  }

  const cleanAwb = encodeURIComponent(awbCode.trim());
  const result = await shiprocketRequest(`/courier/track/awb/${cleanAwb}`);
  const trackData = result?.tracking_data;

  return {
    configured: true,
    awb: awbCode,
    current_status: trackData?.shipment_track?.[0]?.current_status || 'IN TRANSIT',
    courier_name: trackData?.shipment_track?.[0]?.courier_name || 'Shiprocket',
    etd: trackData?.shipment_track?.[0]?.etd || null,
    scans: trackData?.shipment_track_activities || [],
  };
}

/**
 * Cancel an order in Shiprocket (POST /orders/cancel)
 */
export async function cancelShiprocketOrder(srOrderId: number | string) {
  if (!isShiprocketConfigured()) {
    return { success: true, simulated: true };
  }
  try {
    const result = await shiprocketRequest('/orders/cancel', {
      method: 'POST',
      body: JSON.stringify({ ids: [srOrderId] }),
    });
    return { success: true, response: result };
  } catch (err: any) {
    console.warn('[Shiprocket] Order cancellation notice:', err);
    return { success: false, error: err.message };
  }
}

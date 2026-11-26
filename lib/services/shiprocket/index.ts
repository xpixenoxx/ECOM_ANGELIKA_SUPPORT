/**
 * Official Shiprocket API v2 Integration (Cloudflare Edge & Node.js Compatible)
 *
 * Base URL: https://apiv2.shiprocket.in/v1/external
 * - JWT token authentication via POST /auth/login (cached for 7 days; Shiprocket TTL is 10 days)
 * - Automatic single retry with forced token refresh on HTTP 401
 * - Concurrent login deduplication lock
 * - Zero hardcoded dummy customer/product payloads
 * - Strict input validation prior to API calls
 * - Timing-safe webhook authentication (`x-api-key`)
 * - Never logs credentials, passwords, or auth tokens
 */

import { getShiprocketConfig } from '@/lib/env';
import { timingSafeEqualStrings } from '@/lib/utils/edge-crypto';
import { INDIAN_PHONE_REGEX, INDIAN_PINCODE_REGEX, normalizeIndianPhone } from '@/lib/validators/commerce';
import type { OrderStatus, ShipmentStatus } from '@/lib/orders/state-machine';

const SHIPROCKET_API_BASE = 'https://apiv2.shiprocket.in/v1/external';
const REQUEST_TIMEOUT_MS = 15_000;
const TOKEN_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (Shiprocket tokens expire at 10 days)

let cachedToken: { token: string; expiresAt: number } | null = null;
let inFlightLogin: Promise<string> | null = null;

export function resetShiprocketTokenCache(): void {
  cachedToken = null;
  inFlightLogin = null;
}

function logShiprocketEvent(
  level: 'info' | 'warn' | 'error',
  event: string,
  meta: Record<string, unknown>
) {
  const entry = JSON.stringify({
    service: 'shiprocket',
    event,
    ts: new Date().toISOString(),
    ...meta,
  });
  if (level === 'error') console.error(entry);
  else if (level === 'warn') console.warn(entry);
  else console.log(entry);
}

/**
 * Authenticate with Shiprocket API v2 (`POST /auth/login`) and cache JWT safely.
 */
export async function getShiprocketAuthToken(forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.token;
  }

  if (inFlightLogin && !forceRefresh) {
    return inFlightLogin;
  }

  const cfg = getShiprocketConfig();
  if (!cfg.configured || !cfg.email || !cfg.password) {
    throw new Error('SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be configured.');
  }

  const loginPromise = (async () => {
    const res = await fetch(`${SHIPROCKET_API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: cfg.email,
        password: cfg.password,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const data: any = await res.json().catch(() => ({}));
    if (!res.ok || !data?.token) {
      logShiprocketEvent('error', 'auth_failed', { statusCode: res.status });
      throw new Error(data?.message || `Shiprocket authentication failed (${res.status}).`);
    }

    cachedToken = {
      token: String(data.token),
      expiresAt: Date.now() + TOKEN_CACHE_TTL_MS,
    };

    logShiprocketEvent('info', 'auth_succeeded', { refreshed: forceRefresh });
    return cachedToken.token;
  })();

  inFlightLogin = loginPromise;
  try {
    return await loginPromise;
  } finally {
    if (inFlightLogin === loginPromise) {
      inFlightLogin = null;
    }
  }
}

async function shiprocketRequest<T>(
  path: string,
  options: {
    method: 'GET' | 'POST';
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined>;
  },
  allowAuthRetry = true
): Promise<{ success: boolean; data?: T; error?: string; statusCode?: number }> {
  try {
    const token = await getShiprocketAuthToken(false);
    const url = new URL(`${SHIPROCKET_API_BASE}${path}`);
    if (options.query) {
      for (const [k, v] of Object.entries(options.query)) {
        if (v !== undefined && v !== '') {
          url.searchParams.set(k, String(v));
        }
      }
    }

    const res = await fetch(url.toString(), {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    // Token expired or revoked -> refresh once and retry
    if (res.status === 401 && allowAuthRetry) {
      resetShiprocketTokenCache();
      await getShiprocketAuthToken(true);
      return shiprocketRequest<T>(path, options, false);
    }

    const data: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errMsg =
        data?.message ||
        (data?.errors ? JSON.stringify(data.errors).slice(0, 250) : null) ||
        `Shiprocket API error (${res.status})`;
      logShiprocketEvent('error', 'api_error', {
        path,
        method: options.method,
        statusCode: res.status,
      });
      return { success: false, error: errMsg, statusCode: res.status };
    }

    return { success: true, data: data as T, statusCode: res.status };
  } catch (err: any) {
    logShiprocketEvent('error', 'network_error', {
      path,
      method: options.method,
      message: err?.name === 'TimeoutError' ? 'timeout' : (err?.message || 'network_failure'),
    });
    return {
      success: false,
      error:
        err?.name === 'TimeoutError'
          ? 'Shiprocket API timed out. Please retry.'
          : err?.message || 'Shiprocket API request error',
    };
  }
}

// ============================================
// AUTHORITATIVE PAYLOAD BUILDER (REAL DATA ONLY)
// ============================================

export interface ShiprocketAddressInput {
  firstName: string;
  lastName?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  phone?: string;
  email?: string;
}

export interface ShiprocketOrderItemInput {
  name: string;
  sku: string;
  units: number;
  sellingPrice: number;
  discount?: number;
  tax?: number;
  hsn?: string | null;
  weightGrams?: number | null;
}

export interface BuildShiprocketOrderInput {
  orderNumber: string;
  orderDateIso: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShiprocketAddressInput;
  billingAddress?: ShiprocketAddressInput | null;
  items: ShiprocketOrderItemInput[];
  subtotalInr: number;
  shippingChargesInr?: number;
  discountInr?: number;
  paymentMethod: 'cod' | 'prepaid';
  pickupLocation?: string;
  comment?: string | null;
  weightKgOverride?: number | null;
  dimensionsCm?: { length?: number | null; breadth?: number | null; height?: number | null };
}

export interface BuiltShiprocketPayloadResult {
  valid: boolean;
  payload?: Record<string, unknown>;
  weightKg?: number;
  dimensionsCm?: { length: number; breadth: number; height: number };
  usedDefaultWeight?: boolean;
  usedDefaultDimensions?: boolean;
  errors?: string[];
}

function formatShiprocketOrderDate(isoDate: string): string {
  const parsed = new Date(isoDate);
  const d = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

function addressesEqual(a: ShiprocketAddressInput, b: ShiprocketAddressInput): boolean {
  return (
    a.firstName.trim().toLowerCase() === b.firstName.trim().toLowerCase() &&
    (a.lastName || '').trim().toLowerCase() === (b.lastName || '').trim().toLowerCase() &&
    a.address1.trim().toLowerCase() === b.address1.trim().toLowerCase() &&
    a.city.trim().toLowerCase() === b.city.trim().toLowerCase() &&
    a.state.trim().toLowerCase() === b.state.trim().toLowerCase() &&
    a.postalCode.trim() === b.postalCode.trim()
  );
}

/**
 * Validates and constructs a Shiprocket `/orders/create/adhoc` payload strictly
 * from real order, customer, address, and order_item database records.
 */
export function buildShiprocketAdhocOrderPayload(
  input: BuildShiprocketOrderInput
): BuiltShiprocketPayloadResult {
  const errors: string[] = [];
  const cfg = getShiprocketConfig();

  const orderNumber = (input.orderNumber || '').trim();
  if (!orderNumber) errors.push('Order number is required.');

  const cleanEmail = (input.customerEmail || '').trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    errors.push('A valid customer email address is required for Shiprocket.');
  }

  const cleanPhone = normalizeIndianPhone(input.customerPhone || input.shippingAddress?.phone || '');
  if (!INDIAN_PHONE_REGEX.test(cleanPhone)) {
    errors.push('A valid 10-digit Indian customer phone number is required.');
  }

  const ship = input.shippingAddress;
  if (!ship?.firstName?.trim()) errors.push('Shipping customer name is required.');
  if (!ship?.address1?.trim()) errors.push('Shipping street address is required.');
  if (!ship?.city?.trim()) errors.push('Shipping city is required.');
  if (!ship?.state?.trim()) errors.push('Shipping state is required.');
  const cleanShipPin = String(ship?.postalCode || '').replace(/\D/g, '');
  if (!INDIAN_PINCODE_REGEX.test(cleanShipPin)) {
    errors.push('Shipping 6-digit Indian pincode is required.');
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    errors.push('Order must contain at least one real line item.');
  } else {
    input.items.forEach((it, idx) => {
      if (!it.name?.trim()) errors.push(`Item #${idx + 1} is missing product name.`);
      if (!it.sku?.trim()) errors.push(`Item #${idx + 1} is missing SKU.`);
      if (!Number.isInteger(it.units) || it.units < 1) errors.push(`Item #${idx + 1} has invalid quantity.`);
      if (!Number.isFinite(it.sellingPrice) || it.sellingPrice <= 0) {
        errors.push(`Item #${idx + 1} has invalid selling price.`);
      }
    });
  }

  if (!Number.isFinite(input.subtotalInr) || input.subtotalInr <= 0) {
    errors.push('Order subtotal must be positive.');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Compute weight strictly from product_variants.weight_grams when available;
  // fall back to documented configurable apparel default ONLY if DB weight is null.
  let computedWeightGrams = 0;
  let hasRealWeight = false;
  for (const item of input.items) {
    if (item.weightGrams && Number(item.weightGrams) > 0) {
      computedWeightGrams += Number(item.weightGrams) * item.units;
      hasRealWeight = true;
    }
  }

  const usedDefaultWeight = !(input.weightKgOverride && input.weightKgOverride > 0) && !hasRealWeight;
  const weightKg = Number(
    (
      input.weightKgOverride && input.weightKgOverride > 0
        ? input.weightKgOverride
        : hasRealWeight
          ? Math.max(0.1, computedWeightGrams / 1000)
          : cfg.defaultWeightKg
    ).toFixed(3)
  );

  const hasCustomDims = Boolean(
    input.dimensionsCm?.length && input.dimensionsCm?.breadth && input.dimensionsCm?.height
  );
  const length = Number(input.dimensionsCm?.length || cfg.defaultLengthCm);
  const breadth = Number(input.dimensionsCm?.breadth || cfg.defaultBreadthCm);
  const height = Number(input.dimensionsCm?.height || cfg.defaultHeightCm);

  const bill = input.billingAddress?.address1?.trim() ? input.billingAddress : ship;
  const cleanBillPin = String(bill.postalCode || cleanShipPin).replace(/\D/g, '') || cleanShipPin;
  const shippingIsBilling = addressesEqual(ship, bill);

  const shiprocketItems = input.items.map((item) => ({
    name: item.name.trim().slice(0, 120),
    sku: item.sku.trim().slice(0, 50),
    units: item.units,
    selling_price: Number(item.sellingPrice.toFixed(2)),
    discount: Number((item.discount || 0).toFixed(2)),
    tax: Number((item.tax || 0).toFixed(2)),
    ...(item.hsn ? { hsn: String(item.hsn).replace(/\D/g, '').slice(0, 10) } : {}),
  }));

  const payload: Record<string, unknown> = {
    order_id: orderNumber,
    order_date: formatShiprocketOrderDate(input.orderDateIso),
    pickup_location: (input.pickupLocation || cfg.pickupLocation || 'Primary').trim(),
    ...(input.comment ? { comment: input.comment.slice(0, 200) } : {}),
    billing_customer_name: bill.firstName.trim(),
    billing_last_name: (bill.lastName || '').trim(),
    billing_address: bill.address1.trim(),
    billing_address_2: (bill.address2 || '').trim(),
    billing_city: bill.city.trim(),
    billing_pincode: Number(cleanBillPin),
    billing_state: bill.state.trim(),
    billing_country: bill.country?.trim() || 'India',
    billing_email: cleanEmail,
    billing_phone: normalizeIndianPhone(bill.phone || cleanPhone) || cleanPhone,
    shipping_is_billing: shippingIsBilling,
    ...(shippingIsBilling
      ? {}
      : {
          shipping_customer_name: ship.firstName.trim(),
          shipping_last_name: (ship.lastName || '').trim(),
          shipping_address: ship.address1.trim(),
          shipping_address_2: (ship.address2 || '').trim(),
          shipping_city: ship.city.trim(),
          shipping_pincode: Number(cleanShipPin),
          shipping_country: ship.country?.trim() || 'India',
          shipping_state: ship.state.trim(),
          shipping_email: cleanEmail,
          shipping_phone: cleanPhone,
        }),
    order_items: shiprocketItems,
    payment_method: input.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
    shipping_charges: Number((input.shippingChargesInr || 0).toFixed(2)),
    total_discount: Number((input.discountInr || 0).toFixed(2)),
    sub_total: Number(input.subtotalInr.toFixed(2)),
    length,
    breadth,
    height,
    weight: weightKg,
  };

  return {
    valid: true,
    payload,
    weightKg,
    dimensionsCm: { length, breadth, height },
    usedDefaultWeight,
    usedDefaultDimensions: !hasCustomDims,
  };
}

// ============================================
// SHIPROCKET LIFECYCLE OPERATIONS
// ============================================

export async function checkShiprocketServiceability(params: {
  pickupPincode?: string;
  deliveryPincode: string;
  weightKg: number;
  isCod: boolean;
}) {
  const cfg = getShiprocketConfig();
  const pickupPin = (params.pickupPincode || cfg.pickupPincode || '').replace(/\D/g, '');
  const deliveryPin = (params.deliveryPincode || '').replace(/\D/g, '');

  if (!INDIAN_PINCODE_REGEX.test(pickupPin) || !INDIAN_PINCODE_REGEX.test(deliveryPin)) {
    return {
      success: false,
      serviceable: false,
      couriers: [] as Array<{ courierCompanyId: number; courierName: string; rate: number; etd: string }>,
      error: 'Valid 6-digit pickup and delivery pincodes are required for serviceability check.',
    };
  }

  const res = await shiprocketRequest<any>('/courier/serviceability/', {
    method: 'GET',
    query: {
      pickup_postcode: pickupPin,
      delivery_postcode: deliveryPin,
      weight: Number(params.weightKg.toFixed(3)),
      cod: params.isCod ? 1 : 0,
    },
  });

  if (!res.success || !res.data) {
    return { success: false, serviceable: false, couriers: [], error: res.error };
  }

  const available = Array.isArray(res.data?.data?.available_courier_companies)
    ? res.data.data.available_courier_companies
    : [];

  const couriers = available.map((c: any) => ({
    courierCompanyId: Number(c.courier_company_id),
    courierName: String(c.courier_name || 'Courier Partner'),
    rate: Number(c.rate || 0),
    etd: String(c.etd || ''),
  }));

  return {
    success: true,
    serviceable: couriers.length > 0,
    recommendedCourierId: res.data?.data?.recommended_courier_company_id
      ? Number(res.data.data.recommended_courier_company_id)
      : couriers[0]?.courierCompanyId,
    couriers,
  };
}

export async function createShiprocketOrder(payload: Record<string, unknown>): Promise<{
  success: boolean;
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  status?: string;
  error?: string;
}> {
  const res = await shiprocketRequest<any>('/orders/create/adhoc', {
    method: 'POST',
    body: payload,
  });

  if (!res.success || !res.data) {
    return { success: false, error: res.error || 'Shiprocket order creation failed' };
  }

  const srOrderId = res.data?.order_id ? String(res.data.order_id) : undefined;
  const srShipmentId = res.data?.shipment_id ? String(res.data.shipment_id) : undefined;

  if (!srOrderId || !srShipmentId) {
    return {
      success: false,
      error: res.data?.message || 'Shiprocket did not return order_id and shipment_id.',
    };
  }

  logShiprocketEvent('info', 'order_created', {
    shiprocketOrderId: srOrderId,
    shiprocketShipmentId: srShipmentId,
  });

  return {
    success: true,
    shiprocketOrderId: srOrderId,
    shiprocketShipmentId: srShipmentId,
    status: String(res.data?.status || 'NEW'),
  };
}

export async function assignShiprocketAwb(
  shiprocketShipmentId: string | number,
  courierCompanyId?: number | null
): Promise<{
  success: boolean;
  awbCode?: string;
  courierName?: string;
  courierCompanyId?: number;
  trackingUrl?: string;
  error?: string;
}> {
  const body: Record<string, unknown> = {
    shipment_id: Number(shiprocketShipmentId),
  };
  if (courierCompanyId && Number.isInteger(courierCompanyId)) {
    body['courier_id'] = courierCompanyId;
  }

  const res = await shiprocketRequest<any>('/courier/assign/awb', {
    method: 'POST',
    body,
  });

  if (!res.success || !res.data) {
    return { success: false, error: res.error || 'Shiprocket AWB assignment failed' };
  }

  const payload = res.data?.response?.data || res.data;
  const awbCode = payload?.awb_code ? String(payload.awb_code).trim() : '';
  const courierName = payload?.courier_name ? String(payload.courier_name).trim() : '';
  const assignedCompanyId = payload?.courier_company_id
    ? Number(payload.courier_company_id)
    : undefined;

  if (!awbCode) {
    return {
      success: false,
      error:
        res.data?.response?.data?.awb_assign_error ||
        res.data?.message ||
        'Shiprocket could not assign an AWB for this shipment (check wallet balance or courier serviceability).',
    };
  }

  logShiprocketEvent('info', 'awb_assigned', {
    shiprocketShipmentId: String(shiprocketShipmentId),
    awbCode,
    courierName: courierName || null,
    courierCompanyId: assignedCompanyId || null,
  });

  return {
    success: true,
    awbCode,
    courierName: courierName || 'Assigned Courier',
    courierCompanyId: assignedCompanyId,
    trackingUrl: `https://shiprocket.co/tracking/${encodeURIComponent(awbCode)}`,
  };
}

export async function scheduleShiprocketPickup(
  shiprocketShipmentId: string | number
): Promise<{
  success: boolean;
  pickupStatus?: 'scheduled';
  pickupScheduledDate?: string | null;
  pickupTokenNumber?: string | null;
  alreadyScheduled?: boolean;
  error?: string;
}> {
  const res = await shiprocketRequest<any>('/courier/generate/pickup', {
    method: 'POST',
    body: {
      shipment_id: [Number(shiprocketShipmentId)],
    },
  });

  if (!res.success || !res.data) {
    // Handle idempotent "already in pickup queue" response cleanly
    if ((res.error || '').toLowerCase().includes('already in pickup')) {
      return {
        success: true,
        pickupStatus: 'scheduled',
        alreadyScheduled: true,
      };
    }
    return { success: false, error: res.error || 'Shiprocket pickup scheduling failed' };
  }

  const resp = res.data?.response || res.data;
  const statusFlag = Number(res.data?.pickup_status ?? resp?.status ?? 1);
  if (statusFlag === 0) {
    return {
      success: false,
      error: resp?.data || res.data?.message || 'Pickup scheduling was declined by Shiprocket.',
    };
  }

  const pickupScheduledDate = resp?.pickup_scheduled_date || null;
  const pickupTokenNumber = resp?.pickup_token_number ? String(resp.pickup_token_number) : null;

  logShiprocketEvent('info', 'pickup_scheduled', {
    shiprocketShipmentId: String(shiprocketShipmentId),
    pickupScheduledDate,
    pickupTokenNumber,
  });

  return {
    success: true,
    pickupStatus: 'scheduled',
    pickupScheduledDate,
    pickupTokenNumber,
  };
}

export async function generateShiprocketLabel(
  shiprocketShipmentId: string | number
): Promise<{
  success: boolean;
  labelUrl?: string;
  error?: string;
}> {
  const res = await shiprocketRequest<any>('/courier/generate/label', {
    method: 'POST',
    body: {
      shipment_id: [Number(shiprocketShipmentId)],
    },
  });

  if (!res.success || !res.data) {
    return { success: false, error: res.error || 'Label generation failed' };
  }

  const labelUrl = res.data?.label_url ? String(res.data.label_url).trim() : '';
  if (!labelUrl || !/^https?:\/\//i.test(labelUrl)) {
    return {
      success: false,
      error: res.data?.message || 'Shiprocket did not return a downloadable label URL.',
    };
  }

  return { success: true, labelUrl };
}

export async function generateShiprocketManifest(
  shiprocketShipmentId: string | number
): Promise<{
  success: boolean;
  manifestUrl?: string;
  error?: string;
}> {
  const res = await shiprocketRequest<any>('/manifests/generate', {
    method: 'POST',
    body: {
      shipment_id: [Number(shiprocketShipmentId)],
    },
  });

  if (!res.success || !res.data) {
    return { success: false, error: res.error || 'Manifest generation failed' };
  }

  const manifestUrl = res.data?.manifest_url ? String(res.data.manifest_url).trim() : '';
  if (!manifestUrl || !/^https?:\/\//i.test(manifestUrl)) {
    return {
      success: false,
      error: res.data?.message || 'Shiprocket did not return a manifest URL.',
    };
  }

  return { success: true, manifestUrl };
}

export async function trackShiprocketAwb(awbCode: string): Promise<{
  success: boolean;
  shipmentStatus?: ShipmentStatus;
  orderStatus?: OrderStatus | null;
  rawStatusCode?: number | null;
  rawStatusLabel?: string | null;
  courierName?: string | null;
  etd?: string | null;
  trackingUrl?: string | null;
  scans?: Array<{ date: string; status: string; activity: string; location: string }>;
  error?: string;
}> {
  const cleanAwb = (awbCode || '').trim();
  if (!cleanAwb) {
    return { success: false, error: 'AWB number is required for tracking.' };
  }

  const res = await shiprocketRequest<any>(
    `/courier/track/awb/${encodeURIComponent(cleanAwb)}`,
    { method: 'GET' }
  );

  if (!res.success || !res.data) {
    return { success: false, error: res.error || 'Failed to fetch tracking from Shiprocket' };
  }

  const td = res.data?.tracking_data || res.data;
  const shipmentTrack = Array.isArray(td?.shipment_track) ? td.shipment_track[0] : null;
  const activities = Array.isArray(td?.shipment_track_activities) ? td.shipment_track_activities : [];

  const rawCode =
    td?.shipment_status !== undefined ? Number(td.shipment_status) : null;
  const rawLabel = String(
    shipmentTrack?.current_status || td?.current_status || ''
  ).trim();

  const mapped = mapShiprocketStatus({
    shipmentStatusId: Number.isFinite(rawCode) ? rawCode : null,
    shipmentStatus: rawLabel,
  });

  const scans = activities.map((a: any) => ({
    date: String(a?.date || ''),
    status: String(a?.status || a?.['sr-status-label'] || ''),
    activity: String(a?.activity || ''),
    location: String(a?.location || ''),
  }));

  return {
    success: true,
    shipmentStatus: mapped.shipmentStatus,
    orderStatus: mapped.orderStatus,
    rawStatusCode: Number.isFinite(rawCode) ? rawCode : null,
    rawStatusLabel: rawLabel || null,
    courierName: shipmentTrack?.courier_name ? String(shipmentTrack.courier_name) : null,
    etd: td?.etd || shipmentTrack?.edd || null,
    trackingUrl: td?.track_url || `https://shiprocket.co/tracking/${encodeURIComponent(cleanAwb)}`,
    scans,
  };
}

export async function cancelShiprocketShipment(params: {
  shiprocketOrderId?: string | null;
  awbCode?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  if (params.awbCode) {
    const awbRes = await shiprocketRequest<any>('/orders/cancel/shipment/awbs', {
      method: 'POST',
      body: { awbs: [params.awbCode.trim()] },
    });
    if (!awbRes.success && !params.shiprocketOrderId) {
      return { success: false, error: awbRes.error || 'Failed to cancel AWB on Shiprocket' };
    }
  }

  if (params.shiprocketOrderId) {
    const orderRes = await shiprocketRequest<any>('/orders/cancel', {
      method: 'POST',
      body: { ids: [Number(params.shiprocketOrderId)] },
    });
    if (!orderRes.success) {
      return { success: false, error: orderRes.error || 'Failed to cancel Shiprocket order' };
    }
  }

  return { success: true };
}

// ============================================
// SHIPROCKET WEBHOOK AUTH & STATUS MAPPING
// ============================================

/**
 * Verifies Shiprocket webhook `x-api-key` header using constant-time comparison.
 * Fails closed when `SHIPROCKET_WEBHOOK_TOKEN` is unconfigured.
 */
export function verifyShiprocketWebhookToken(headerToken: string | null): {
  valid: boolean;
  configured: boolean;
} {
  const cfg = getShiprocketConfig();
  if (!cfg.webhookToken) {
    return { valid: false, configured: false };
  }
  if (!headerToken?.trim()) {
    return { valid: false, configured: true };
  }
  return {
    valid: timingSafeEqualStrings(headerToken.trim(), cfg.webhookToken),
    configured: true,
  };
}

/**
 * Maps Shiprocket official webhook `shipment_status_id` / `current_status_id`
 * and textual status labels into internal decoupled ShipmentStatus and OrderStatus.
 */
export function mapShiprocketStatus(input: {
  shipmentStatusId?: number | null;
  currentStatusId?: number | null;
  shipmentStatus?: string | null;
  currentStatus?: string | null;
}): {
  shipmentStatus: ShipmentStatus;
  orderStatus: OrderStatus | null;
  pickupStatus?: 'scheduled' | 'picked_up' | 'failed' | 'cancelled';
} {
  const label = `${input.shipmentStatus || ''} ${input.currentStatus || ''}`.toLowerCase().trim();
  const code = input.shipmentStatusId ?? input.currentStatusId ?? null;

  // Text label matching first when explicit (handles courier-specific variations cleanly)
  if (label.includes('rto delivered')) {
    return { shipmentStatus: 'rto_delivered', orderStatus: 'returned' };
  }
  if (label.includes('rto in transit') || label.includes('rto acknowledged')) {
    return { shipmentStatus: 'rto_in_transit', orderStatus: 'rto' };
  }
  if (label.includes('rto')) {
    return { shipmentStatus: 'rto_initiated', orderStatus: 'rto' };
  }
  if (label.includes('delivered') && !label.includes('undelivered')) {
    return { shipmentStatus: 'delivered', orderStatus: 'delivered', pickupStatus: 'picked_up' };
  }
  if (label.includes('out for delivery')) {
    return { shipmentStatus: 'out_for_delivery', orderStatus: 'out_for_delivery', pickupStatus: 'picked_up' };
  }
  if (label.includes('undelivered') || label.includes('delivery failed') || label.includes('ndr') || label.includes('exception')) {
    if (label.includes('pickup')) {
      return { shipmentStatus: 'pickup_scheduled', orderStatus: null, pickupStatus: 'failed' };
    }
    return { shipmentStatus: 'delivery_failed', orderStatus: 'delivery_failed', pickupStatus: 'picked_up' };
  }
  if (label.includes('lost')) {
    return { shipmentStatus: 'lost', orderStatus: 'delivery_failed' };
  }
  if (label.includes('damaged')) {
    return { shipmentStatus: 'damaged', orderStatus: 'delivery_failed' };
  }
  if (label.includes('cancel')) {
    return { shipmentStatus: 'cancelled', orderStatus: null, pickupStatus: 'cancelled' };
  }
  if (label.includes('in transit') || label.includes('shipped') || label.includes('reached') || label.includes('dispatched')) {
    return { shipmentStatus: 'in_transit', orderStatus: 'shipped', pickupStatus: 'picked_up' };
  }
  if (label.includes('picked up')) {
    return { shipmentStatus: 'picked_up', orderStatus: 'shipped', pickupStatus: 'picked_up' };
  }
  if (label.includes('out for pickup') || label.includes('pickup scheduled') || label.includes('pickup generated') || label.includes('pickup queued')) {
    return { shipmentStatus: 'pickup_scheduled', orderStatus: null, pickupStatus: 'scheduled' };
  }
  if (label.includes('awb assigned')) {
    return { shipmentStatus: 'awb_assigned', orderStatus: null };
  }

  // Fallback to official Shiprocket numeric status codes
  switch (code) {
    case 1:
      return { shipmentStatus: 'created', orderStatus: null };
    case 2:
      return { shipmentStatus: 'awb_assigned', orderStatus: null };
    case 3:
    case 4:
    case 8:
      return { shipmentStatus: 'pickup_scheduled', orderStatus: null, pickupStatus: 'scheduled' };
    case 5:
      return { shipmentStatus: 'cancelled', orderStatus: null, pickupStatus: 'cancelled' };
    case 6:
      return { shipmentStatus: 'in_transit', orderStatus: 'shipped', pickupStatus: 'picked_up' };
    case 7:
      return { shipmentStatus: 'delivered', orderStatus: 'delivered', pickupStatus: 'picked_up' };
    case 9:
      return { shipmentStatus: 'rto_initiated', orderStatus: 'rto' };
    case 10:
    case 14:
      return { shipmentStatus: 'rto_in_transit', orderStatus: 'rto' };
    case 15:
      return { shipmentStatus: 'rto_delivered', orderStatus: 'returned' };
    case 16:
      return { shipmentStatus: 'lost', orderStatus: 'delivery_failed' };
    case 17:
      return { shipmentStatus: 'out_for_delivery', orderStatus: 'out_for_delivery', pickupStatus: 'picked_up' };
    case 18:
    case 20:
      return { shipmentStatus: 'in_transit', orderStatus: 'shipped', pickupStatus: 'picked_up' };
    case 19:
      return { shipmentStatus: 'pickup_scheduled', orderStatus: null, pickupStatus: 'scheduled' };
    case 21:
      return { shipmentStatus: 'delivery_failed', orderStatus: 'delivery_failed' };
    case 22:
      return { shipmentStatus: 'cancelled', orderStatus: null, pickupStatus: 'cancelled' };
    default:
      return { shipmentStatus: 'in_transit', orderStatus: null };
  }
}

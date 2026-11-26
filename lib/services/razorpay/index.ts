/**
 * Official Razorpay REST API v1 Client (Cloudflare Edge & Node.js Compatible)
 *
 * - Uses Web Fetch API + Edge-safe Base64 Basic Auth (zero Node.js built-ins)
 * - Uses constant-time HMAC-SHA256 from lib/utils/edge-crypto
 * - Enforces centralized environment & test/live mode validation via getRazorpayConfig()
 * - Never logs secrets, card details, or sensitive credentials
 */

import { getRazorpayConfig, type RazorpayMode } from '@/lib/env';
import { hmacSha256Hex, timingSafeEqualStrings } from '@/lib/utils/edge-crypto';

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';
const REQUEST_TIMEOUT_MS = 15_000;

/** Official Razorpay minimum transaction amount for INR is ₹1.00 (100 paise). */
export const RAZORPAY_MIN_INR_PAISE = 100;

export interface RazorpayOrderResponse {
  id: string;
  entity: 'order';
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid' | string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayPaymentEntity {
  id: string;
  entity?: 'payment';
  order_id: string;
  amount: number; // in paise
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed' | string;
  method?: string;
  captured?: boolean;
  email?: string;
  contact?: string;
  fee?: number;
  tax?: number;
  error_code?: string | null;
  error_description?: string | null;
  error_reason?: string | null;
  created_at?: number;
}

export interface RazorpayRefundEntity {
  id: string;
  entity?: 'refund';
  payment_id: string;
  amount: number; // in paise
  currency: string;
  status: 'pending' | 'processed' | 'failed' | string;
  speed_processed?: string;
  speed_requested?: string;
  receipt?: string | null;
  notes?: Record<string, string>;
  created_at?: number;
}

export interface RazorpayServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  mode?: RazorpayMode | null;
}

export function isValidRazorpayOrderId(value?: string | null): boolean {
  return Boolean(value && /^order_[A-Za-z0-9]{6,}$/.test(value.trim()));
}

export function isValidRazorpayPaymentId(value?: string | null): boolean {
  return Boolean(value && /^pay_[A-Za-z0-9]{6,}$/.test(value.trim()));
}

export function isValidRazorpaySignature(value?: string | null): boolean {
  return Boolean(value && /^[a-fA-F0-9]{64}$/.test(value.trim()));
}

function encodeBasicAuth(keyId: string, keySecret: string): string {
  return btoa(`${keyId}:${keySecret}`);
}

/**
 * Sanitizes an idempotency key for Razorpay's `X-Refund-Idempotency` header
 * (requires >= 10 characters of letters, numbers, hyphens, or underscores).
 */
export function normalizeRefundIdempotencyKey(rawKey: string): string {
  const cleaned = rawKey.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
  if (cleaned.length >= 10) return cleaned;
  return `ref_${cleaned}_${Date.now()}`.slice(0, 64);
}

function logRazorpayEvent(
  level: 'info' | 'warn' | 'error',
  event: string,
  meta: Record<string, unknown>
) {
  const entry = JSON.stringify({
    service: 'razorpay',
    event,
    ts: new Date().toISOString(),
    ...meta,
  });
  if (level === 'error') console.error(entry);
  else if (level === 'warn') console.warn(entry);
  else console.log(entry);
}

async function razorpayRequest<T>(
  path: string,
  options: {
    method: 'GET' | 'POST';
    body?: Record<string, unknown>;
    extraHeaders?: Record<string, string>;
  }
): Promise<RazorpayServiceResult<T>> {
  const cfg = getRazorpayConfig();
  if (cfg.mismatchError) {
    logRazorpayEvent('error', 'config_mismatch', { reason: cfg.mismatchError });
    return {
      success: false,
      error: 'Payment gateway configuration error. Please contact support.',
      mode: cfg.mode,
    };
  }
  if (!cfg.configured || !cfg.keyId || !cfg.keySecret) {
    return {
      success: false,
      error: 'Razorpay payment gateway is not configured.',
      mode: cfg.mode,
    };
  }

  try {
    const auth = encodeBasicAuth(cfg.keyId, cfg.keySecret);
    const response = await fetch(`${RAZORPAY_API_BASE}${path}`, {
      method: options.method,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.extraHeaders,
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const data: any = await response.json().catch(() => ({}));
    if (!response.ok) {
      const description =
        data?.error?.description || data?.error?.reason || `Razorpay API error (${response.status})`;
      logRazorpayEvent('error', 'api_error', {
        path,
        method: options.method,
        statusCode: response.status,
        errorCode: data?.error?.code || null,
      });
      return {
        success: false,
        error: description,
        statusCode: response.status,
        mode: cfg.mode,
      };
    }

    return {
      success: true,
      data: data as T,
      statusCode: response.status,
      mode: cfg.mode,
    };
  } catch (err: any) {
    logRazorpayEvent('error', 'network_error', {
      path,
      method: options.method,
      message: err?.name === 'TimeoutError' ? 'timeout' : (err?.message || 'network_failure'),
    });
    return {
      success: false,
      error:
        err?.name === 'TimeoutError'
          ? 'Payment gateway timed out. Please try again.'
          : 'Could not connect to Razorpay payment gateway. Please try again.',
      mode: cfg.mode,
    };
  }
}

/**
 * Create a Razorpay Order (`POST /v1/orders`).
 * Enforces integer paise and Razorpay's minimum ₹1 (100 paise) INR rule.
 */
export async function createRazorpayGatewayOrder(params: {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayServiceResult<RazorpayOrderResponse>> {
  const currency = (params.currency || 'INR').toUpperCase();
  if (!Number.isInteger(params.amountPaise) || params.amountPaise < RAZORPAY_MIN_INR_PAISE) {
    return {
      success: false,
      error: 'Order payable amount must be at least ₹1 for online Razorpay payment.',
    };
  }

  const res = await razorpayRequest<RazorpayOrderResponse>('/orders', {
    method: 'POST',
    body: {
      amount: params.amountPaise,
      currency,
      receipt: params.receipt.slice(0, 40),
      notes: params.notes || {},
    },
  });

  if (res.success && res.data) {
    logRazorpayEvent('info', 'order_created', {
      razorpayOrderId: res.data.id,
      amountPaise: res.data.amount,
      currency: res.data.currency,
      mode: res.mode,
    });
  }

  return res;
}

/**
 * Fetch authoritative payment details from Razorpay (`GET /v1/payments/{id}`).
 */
export async function fetchRazorpayPayment(
  paymentId: string
): Promise<RazorpayServiceResult<RazorpayPaymentEntity>> {
  if (!isValidRazorpayPaymentId(paymentId)) {
    return { success: false, error: 'Invalid Razorpay payment ID format.' };
  }
  return razorpayRequest<RazorpayPaymentEntity>(
    `/payments/${encodeURIComponent(paymentId.trim())}`,
    { method: 'GET' }
  );
}

/**
 * Fetch all payment attempts associated with a Razorpay order (`GET /v1/orders/{id}/payments`).
 * Used for reconciliation when frontend redirects fail or webhooks are delayed.
 */
export async function fetchRazorpayOrderPayments(
  razorpayOrderId: string
): Promise<RazorpayServiceResult<{ items: RazorpayPaymentEntity[] }>> {
  if (!isValidRazorpayOrderId(razorpayOrderId)) {
    return { success: false, error: 'Invalid Razorpay order ID format.' };
  }
  return razorpayRequest<{ items: RazorpayPaymentEntity[] }>(
    `/orders/${encodeURIComponent(razorpayOrderId.trim())}/payments`,
    { method: 'GET' }
  );
}

/**
 * Explicitly capture an authorized payment (`POST /v1/payments/{id}/capture`).
 */
export async function captureRazorpayPayment(params: {
  paymentId: string;
  amountPaise: number;
  currency?: string;
}): Promise<RazorpayServiceResult<RazorpayPaymentEntity>> {
  if (!isValidRazorpayPaymentId(params.paymentId)) {
    return { success: false, error: 'Invalid Razorpay payment ID format.' };
  }
  if (!Number.isInteger(params.amountPaise) || params.amountPaise < RAZORPAY_MIN_INR_PAISE) {
    return { success: false, error: 'Invalid capture amount.' };
  }
  return razorpayRequest<RazorpayPaymentEntity>(
    `/payments/${encodeURIComponent(params.paymentId.trim())}/capture`,
    {
      method: 'POST',
      body: {
        amount: params.amountPaise,
        currency: (params.currency || 'INR').toUpperCase(),
      },
    }
  );
}

/**
 * Initiate a full or partial Razorpay refund (`POST /v1/payments/{id}/refund`)
 * with official `X-Refund-Idempotency` header for safe retries.
 */
export async function createRazorpayRefund(params: {
  paymentId: string;
  amountPaise: number;
  idempotencyKey: string;
  speed?: 'normal' | 'optimum';
  notes?: Record<string, string>;
  receipt?: string;
}): Promise<RazorpayServiceResult<RazorpayRefundEntity>> {
  if (!isValidRazorpayPaymentId(params.paymentId)) {
    return { success: false, error: 'Invalid Razorpay payment ID for refund.' };
  }
  if (!Number.isInteger(params.amountPaise) || params.amountPaise <= 0) {
    return { success: false, error: 'Refund amount must be a positive integer in paise.' };
  }

  const safeIdemKey = normalizeRefundIdempotencyKey(params.idempotencyKey);

  const res = await razorpayRequest<RazorpayRefundEntity>(
    `/payments/${encodeURIComponent(params.paymentId.trim())}/refund`,
    {
      method: 'POST',
      extraHeaders: {
        'X-Refund-Idempotency': safeIdemKey,
      },
      body: {
        amount: params.amountPaise,
        speed: params.speed || 'normal',
        ...(params.receipt ? { receipt: params.receipt.slice(0, 40) } : {}),
        ...(params.notes ? { notes: params.notes } : {}),
      },
    }
  );

  if (res.success && res.data) {
    logRazorpayEvent('info', 'refund_created', {
      refundId: res.data.id,
      paymentId: params.paymentId,
      amountPaise: res.data.amount,
      status: res.data.status,
    });
  }

  return res;
}

/**
 * Fetch a single Razorpay refund status (`GET /v1/payments/{payment_id}/refunds/{refund_id}`).
 */
export async function fetchRazorpayRefund(
  paymentId: string,
  refundId: string
): Promise<RazorpayServiceResult<RazorpayRefundEntity>> {
  if (!isValidRazorpayPaymentId(paymentId) || !refundId?.trim()) {
    return { success: false, error: 'Invalid payment or refund identifier.' };
  }
  return razorpayRequest<RazorpayRefundEntity>(
    `/payments/${encodeURIComponent(paymentId.trim())}/refunds/${encodeURIComponent(refundId.trim())}`,
    { method: 'GET' }
  );
}

/**
 * Official Razorpay Standard Checkout signature verification:
 * `HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)`
 */
export function verifyRazorpayCheckoutSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): { valid: boolean; error?: string } {
  const cfg = getRazorpayConfig();
  if (cfg.mismatchError) {
    return { valid: false, error: 'Razorpay environment configuration mismatch' };
  }
  if (!cfg.keySecret) {
    return { valid: false, error: 'Razorpay not configured' };
  }
  if (!isValidRazorpayOrderId(params.razorpayOrderId)) {
    return { valid: false, error: 'Invalid Razorpay order ID format' };
  }
  if (!isValidRazorpayPaymentId(params.razorpayPaymentId)) {
    return { valid: false, error: 'Invalid Razorpay payment ID format' };
  }
  if (!isValidRazorpaySignature(params.razorpaySignature)) {
    return { valid: false, error: 'Invalid payment signature format' };
  }

  const expectedSignature = hmacSha256Hex(
    cfg.keySecret,
    `${params.razorpayOrderId.trim()}|${params.razorpayPaymentId.trim()}`
  );
  const matched = timingSafeEqualStrings(
    expectedSignature,
    params.razorpaySignature.trim().toLowerCase()
  );

  return matched ? { valid: true } : { valid: false, error: 'Invalid payment signature' };
}

/**
 * Official Razorpay Webhook signature verification:
 * `HMAC-SHA256(rawRequestBody, RAZORPAY_WEBHOOK_SECRET)`
 * Never falls back to RAZORPAY_KEY_SECRET.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string
): { valid: boolean; error?: string } {
  const cfg = getRazorpayConfig();
  if (!cfg.webhookSecret) {
    return { valid: false, error: 'Razorpay webhook secret not configured' };
  }
  if (!signature || !isValidRazorpaySignature(signature)) {
    return { valid: false, error: 'Invalid signature' };
  }

  const expectedSignature = hmacSha256Hex(cfg.webhookSecret, rawBody);
  const matched = timingSafeEqualStrings(expectedSignature, signature.trim().toLowerCase());
  return matched ? { valid: true } : { valid: false, error: 'Invalid signature' };
}

import crypto from 'crypto';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRazorpayConfig } from '@/lib/env';
import {
  RAZORPAY_MIN_INR_PAISE,
  createRazorpayGatewayOrder,
  isValidRazorpayOrderId,
  isValidRazorpayPaymentId,
  isValidRazorpaySignature,
  normalizeRefundIdempotencyKey,
  verifyRazorpayCheckoutSignature,
} from '@/lib/services/razorpay';

describe('Razorpay Environment Validation & REST API v1 Client', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env['RAZORPAY_ENV'];
    delete process.env['NEXT_PUBLIC_RAZORPAY_ENV'];
    delete process.env['RAZORPAY_KEY_ID'];
    delete process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'];
    delete process.env['RAZORPAY_KEY_SECRET'];
    delete process.env['RAZORPAY_WEBHOOK_SECRET'];
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it('validates clean Test Mode configuration', () => {
    process.env['RAZORPAY_ENV'] = 'test';
    process.env['NEXT_PUBLIC_RAZORPAY_ENV'] = 'test';
    process.env['RAZORPAY_KEY_ID'] = 'rzp_test_1234567890ABCD';
    process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'] = 'rzp_test_1234567890ABCD';
    process.env['RAZORPAY_KEY_SECRET'] = 'secret_test_value';
    process.env['RAZORPAY_WEBHOOK_SECRET'] = 'whsec_test_value';

    const cfg = getRazorpayConfig();
    expect(cfg.configured).toBe(true);
    expect(cfg.mode).toBe('test');
    expect(cfg.mismatchError).toBeNull();
    expect(cfg.webhookConfigured).toBe(true);
  });

  it('blocks Test/Live mismatch between RAZORPAY_ENV and key prefix', () => {
    process.env['RAZORPAY_ENV'] = 'test';
    process.env['NEXT_PUBLIC_RAZORPAY_ENV'] = 'test';
    process.env['RAZORPAY_KEY_ID'] = 'rzp_live_1234567890ABCD';
    process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'] = 'rzp_live_1234567890ABCD';
    process.env['RAZORPAY_KEY_SECRET'] = 'secret_live_value';

    const cfg = getRazorpayConfig();
    expect(cfg.configured).toBe(false);
    expect(cfg.mismatchError).toMatch(/live.*key/i);
  });

  it('blocks mismatch between NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_ID', () => {
    process.env['RAZORPAY_ENV'] = 'test';
    process.env['NEXT_PUBLIC_RAZORPAY_ENV'] = 'test';
    process.env['RAZORPAY_KEY_ID'] = 'rzp_test_KEY_A_123456';
    process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'] = 'rzp_test_KEY_B_999999';
    process.env['RAZORPAY_KEY_SECRET'] = 'secret_test_value';

    const cfg = getRazorpayConfig();
    expect(cfg.configured).toBe(false);
    expect(cfg.mismatchError).toMatch(/NEXT_PUBLIC_RAZORPAY_KEY_ID/i);
  });

  it('blocks mismatch between RAZORPAY_ENV and NEXT_PUBLIC_RAZORPAY_ENV', () => {
    process.env['RAZORPAY_ENV'] = 'test';
    process.env['NEXT_PUBLIC_RAZORPAY_ENV'] = 'live';
    process.env['RAZORPAY_KEY_ID'] = 'rzp_test_1234567890ABCD';
    process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'] = 'rzp_test_1234567890ABCD';
    process.env['RAZORPAY_KEY_SECRET'] = 'secret_test_value';

    const cfg = getRazorpayConfig();
    expect(cfg.configured).toBe(false);
    expect(cfg.mismatchError).toMatch(/NEXT_PUBLIC_RAZORPAY_ENV/i);
  });

  it('validates Razorpay identifier formats and checkout HMAC-SHA256 signature', () => {
    expect(isValidRazorpayOrderId('order_AbC123456')).toBe(true);
    expect(isValidRazorpayOrderId('bad_123')).toBe(false);
    expect(isValidRazorpayPaymentId('pay_XyZ987654')).toBe(true);
    expect(isValidRazorpayPaymentId('invalid')).toBe(false);
    expect(isValidRazorpaySignature('a'.repeat(64))).toBe(true);
    expect(isValidRazorpaySignature('not-a-hex-sig')).toBe(false);

    process.env['RAZORPAY_KEY_SECRET'] = 'rzp_secret_unit_test';
    const expectedSig = crypto
      .createHmac('sha256', 'rzp_secret_unit_test')
      .update('order_Unit0001|pay_Unit0001')
      .digest('hex');

    expect(
      verifyRazorpayCheckoutSignature({
        razorpayOrderId: 'order_Unit0001',
        razorpayPaymentId: 'pay_Unit0001',
        razorpaySignature: expectedSig,
      }).valid
    ).toBe(true);

    expect(
      verifyRazorpayCheckoutSignature({
        razorpayOrderId: 'order_Unit0001',
        razorpayPaymentId: 'pay_Unit0001',
        razorpaySignature: 'f'.repeat(64),
      }).valid
    ).toBe(false);
  });

  it('enforces minimum INR paise and creates Razorpay order via official REST API v1', async () => {
    process.env['RAZORPAY_ENV'] = 'test';
    process.env['NEXT_PUBLIC_RAZORPAY_ENV'] = 'test';
    process.env['RAZORPAY_KEY_ID'] = 'rzp_test_1234567890ABCD';
    process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'] = 'rzp_test_1234567890ABCD';
    process.env['RAZORPAY_KEY_SECRET'] = 'secret_test_value';

    const tooSmall = await createRazorpayGatewayOrder({
      amountPaise: RAZORPAY_MIN_INR_PAISE - 1,
      receipt: 'ORD-SMALL',
    });
    expect(tooSmall.success).toBe(false);
    expect(tooSmall.error).toMatch(/at least/i);

    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toBe('https://api.razorpay.com/v1/orders');
      expect(init?.method).toBe('POST');
      const authHeader = (init?.headers as Record<string, string>)['Authorization'];
      expect(authHeader).toBe(`Basic ${btoa('rzp_test_1234567890ABCD:secret_test_value')}`);
      const parsedBody = JSON.parse(String(init?.body));
      expect(parsedBody.amount).toBe(250000);
      expect(parsedBody.currency).toBe('INR');

      return new Response(
        JSON.stringify({
          id: 'order_LiveMock12345',
          entity: 'order',
          amount: 250000,
          amount_paid: 0,
          amount_due: 250000,
          currency: 'INR',
          receipt: 'ORD-2500',
          status: 'created',
          attempts: 0,
          notes: {},
          created_at: 1700000000,
        }),
        { status: 200 }
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await createRazorpayGatewayOrder({
      amountPaise: 250000,
      receipt: 'ORD-2500',
    });
    expect(res.success).toBe(true);
    expect(res.data?.id).toBe('order_LiveMock12345');
  });

  it('normalizes X-Refund-Idempotency keys to >= 10 safe characters', () => {
    const shortKey = normalizeRefundIdempotencyKey('ab!@#');
    expect(shortKey.length).toBeGreaterThanOrEqual(10);
    expect(shortKey).toMatch(/^[a-zA-Z0-9_-]+$/);

    const normalKey = normalizeRefundIdempotencyKey('rzp_ref_order123_150000');
    expect(normalKey).toBe('rzp_ref_order123_150000');
  });
});

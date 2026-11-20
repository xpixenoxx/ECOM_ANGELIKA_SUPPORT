import crypto from 'crypto';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const {
  ordersMap,
  webhookEventsSet,
  mockRpc,
  mockAuthUser,
} = vi.hoisted(() => ({
  ordersMap: new Map<string, any>(),
  webhookEventsSet: new Set<string>(),
  mockRpc: vi.fn(),
  mockAuthUser: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockAuthUser },
  })),
}));

vi.mock('@/lib/email/resend', () => ({
  sendEmailViaResend: vi.fn(async () => ({ success: true })),
  isResendConfigured: () => false,
}));

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    rpc: (...args: any[]) => mockRpc(...args),
    from: vi.fn((table: string) => {
      if (table === 'webhook_events') {
        return {
          insert: vi.fn(async (row: any) => {
            const key = `${row.provider}:${row.event_id}`;
            if (webhookEventsSet.has(key)) {
              return { error: { code: '23505', message: 'duplicate key value violates unique constraint' } };
            }
            webhookEventsSet.add(key);
            return { error: null };
          }),
        };
      }
      if (table === 'orders') {
        let filterField = '';
        let filterVal = '';
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn((col: string, val: any) => {
            filterField = col;
            filterVal = val;
            return {
              maybeSingle: vi.fn(async () => {
                const found = Array.from(ordersMap.values()).find((o) => o[filterField] === filterVal);
                return { data: found ?? null, error: null };
              }),
              single: vi.fn(async () => {
                const found = Array.from(ordersMap.values()).find((o) => o[filterField] === filterVal);
                return { data: found ?? null, error: found ? null : { message: 'Not found' } };
              }),
              in: vi.fn(async (_c: string, vals: string[]) => ({
                data: Array.from(ordersMap.values()).filter((o) => o[filterField] === filterVal && vals.includes(o.payment_status)),
                error: null,
              })),
            };
          }),
          ilike: vi.fn((col: string, val: string) => ({
            maybeSingle: vi.fn(async () => {
              const found = Array.from(ordersMap.values()).find(
                (o) => String(o[col] || '').toLowerCase() === val.toLowerCase()
              );
              return { data: found ?? null, error: null };
            }),
          })),
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
        return { insert: vi.fn(async () => ({ error: null })) };
      }
      return {};
    }),
  },
}));

import { handleCashfreeWebhook, handleRazorpayWebhook, executeGatewayRefund } from '@/lib/actions/payments';
import { cancelCustomerOrder, trackOrderPublic } from '@/lib/actions/customer-orders';

describe('Webhooks Idempotency, Paise/INR Refund Bounds, Customer Cancel & Tracking', () => {
  const originalEnv = { ...process.env };
  const WEBHOOK_SECRET = 'whsec_test_secret_key_for_razorpay_123';

  beforeEach(() => {
    vi.clearAllMocks();
    ordersMap.clear();
    webhookEventsSet.clear();
    process.env = { ...originalEnv };
    process.env['RAZORPAY_WEBHOOK_SECRET'] = WEBHOOK_SECRET;
    mockRpc.mockResolvedValue({ data: { confirmed: true, stock_conflict: false }, error: null });

    ordersMap.set('order-1', {
      id: 'order-1',
      order_number: 'ORD-TEST-001',
      user_id: 'user-1',
      email: 'priya@example.com',
      phone: '9876543210',
      payment_method: 'razorpay',
      payment_id: 'order_rzp_1',
      payment_status: 'pending',
      status: 'pending',
      total_amount: 4000, // stored in INR
      currency: 'INR',
      metadata: {},
      shipping_address: { city: 'Jaipur', state: 'Rajasthan', address1: 'Secret Street 99' },
      order_items: [{ product_name: 'Zari Saree', quantity: 1, variant_details: { size: 'Free Size', color: 'Gold' } }],
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  function signRzp(payload: string) {
    return crypto.createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');
  }

  it('verifies RAZORPAY_WEBHOOK_SECRET timing-safely and rejects invalid signatures', async () => {
    const body = JSON.stringify({ event: 'payment.captured', created_at: 123456, payload: {} });
    const bad = await handleRazorpayWebhook(body, '0'.repeat(64));
    expect(bad.success).toBe(false);
    expect(bad.error).toBe('Invalid signature');
  });

  it('deduplicates replayed Razorpay webhooks via webhook_events unique claim', async () => {
    const payload = JSON.stringify({
      event: 'payment.captured',
      created_at: 1700000000,
      payload: {
        payment: {
          entity: {
            id: 'pay_rzp_99',
            order_id: 'order_rzp_1',
            amount: 400000, // 4000 INR in paise
            currency: 'INR',
            status: 'captured',
          },
        },
      },
    });
    const sig = signRzp(payload);

    const first = await handleRazorpayWebhook(payload, sig, 'evt_1');
    expect(first.success).toBe(true);
    expect(first.duplicate).toBeUndefined();
    expect(ordersMap.get('order-1').payment_status).toBe('paid');
    expect(ordersMap.get('order-1').status).toBe('confirmed');
    expect(mockRpc).toHaveBeenCalledWith('confirm_order_inventory', { p_order_id: 'order-1' });

    const replay = await handleRazorpayWebhook(payload, sig, 'evt_1');
    expect(replay.success).toBe(true);
    expect(replay.duplicate).toBe(true);
    expect(mockRpc).toHaveBeenCalledTimes(1);
  });

  it('converts partial Razorpay refund paise (150000 paise = Rs.1500) cleanly against Rs.4000 total', async () => {
    const ord = ordersMap.get('order-1');
    ord.payment_status = 'paid';
    ord.status = 'confirmed';
    ord.metadata = { razorpay_payment_id: 'pay_rzp_99' };

    const payload = JSON.stringify({
      event: 'refund.processed',
      created_at: 1700000050,
      payload: {
        refund: {
          entity: {
            id: 'rfnd_partial_1',
            payment_id: 'pay_rzp_99',
            amount: 150000, // Rs.1,500 in paise (must NOT wrongly become 'refunded'!)
            currency: 'INR',
            status: 'processed',
          },
        },
      },
    });

    const res = await handleRazorpayWebhook(payload, signRzp(payload), 'evt_ref_1');
    expect(res.success).toBe(true);
    expect(ordersMap.get('order-1').payment_status).toBe('partially_refunded');
    expect(ordersMap.get('order-1').metadata.refund_amount).toBe(1500);
    // Partial refund does not release entire order inventory
    expect(mockRpc).not.toHaveBeenCalledWith('release_order_inventory', expect.anything());
  });

  it('allows owner to cancel pre-dispatch order and blocks non-owner IDOR cancellation', async () => {
    mockAuthUser.mockResolvedValueOnce({ data: { user: { id: 'attacker-user', email: 'evil@example.com' } }, error: null });
    const idorCancel = await cancelCustomerOrder('ORD-TEST-001');
    expect(idorCancel.success).toBe(false);
    expect(idorCancel.error).toMatch(/Unauthorized/);

    mockAuthUser.mockResolvedValueOnce({ data: { user: { id: 'user-1', email: 'priya@example.com' } }, error: null });
    const ownerCancel = await cancelCustomerOrder('ORD-TEST-001', 'Changed my mind');
    expect(ownerCancel.success).toBe(true);
    expect(ordersMap.get('order-1').status).toBe('cancelled');
    expect(mockRpc).toHaveBeenCalledWith('release_order_inventory', { p_order_id: 'order-1' });
  });

  it('tracks order publicly only with matching orderNumber + email/phone and omits street address PII', async () => {
    const wrongContact = await trackOrderPublic({ orderNumber: 'ORD-TEST-001', contact: 'stranger@example.com' });
    expect(wrongContact.success).toBe(false);

    const validPhone = await trackOrderPublic({ orderNumber: 'ORD-TEST-001', contact: '+91 98765 43210' });
    expect(validPhone.success).toBe(true);
    expect(validPhone.order?.destination_city).toBe('Jaipur');
    expect((validPhone.order as any)?.address1).toBeUndefined();
    expect((validPhone.order as any)?.email).toBeUndefined();
  });

  it('verifies Cashfree Base64 HMAC-SHA256 webhook signature, confirms inventory, and deduplicates replays', async () => {
    const cfSecret = 'cf_secret_key_prod_test_999';
    process.env['CASHFREE_SECRET_KEY'] = cfSecret;

    ordersMap.set('order-cf-1', {
      id: 'order-cf-1',
      order_number: 'ORD-CF-001',
      user_id: 'user-1',
      email: 'priya@example.com',
      phone: '9876543210',
      payment_method: 'cashfree',
      payment_id: 'cf_order_cf_1',
      payment_status: 'pending',
      status: 'pending',
      total_amount: 5500,
      currency: 'INR',
      metadata: {},
      shipping_address: { city: 'Jaipur', state: 'Rajasthan', address1: 'Secret Street 99' },
      order_items: [{ product_name: 'Banarasi Saree', quantity: 1, variant_details: { size: 'Free Size', color: 'Crimson' } }],
    });

    const timestamp = '1700000123456';
    const payload = JSON.stringify({
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      event_time: '2026-11-19T18:00:00+05:30',
      data: {
        order: {
          order_id: 'cf_order_cf_1',
          order_amount: 5500,
          order_currency: 'INR',
          order_tags: { internal_order_id: 'order-cf-1' },
        },
        payment: {
          cf_payment_id: 'cf_pay_777',
          payment_status: 'SUCCESS',
          payment_amount: 5500,
          payment_currency: 'INR',
        },
      },
    });

    const badRes = await handleCashfreeWebhook(payload, 'invalid_base64_sig', timestamp, 'cf_evt_1');
    expect(badRes.success).toBe(false);
    expect(badRes.error).toBe('Invalid signature');

    const validSig = crypto
      .createHmac('sha256', cfSecret)
      .update(`${timestamp}${payload}`)
      .digest('base64');

    const okRes = await handleCashfreeWebhook(payload, validSig, timestamp, 'cf_evt_1');
    expect(okRes.success).toBe(true);
    expect(ordersMap.get('order-cf-1').payment_status).toBe('paid');
    expect(ordersMap.get('order-cf-1').status).toBe('confirmed');
    expect(mockRpc).toHaveBeenCalledWith('confirm_order_inventory', { p_order_id: 'order-cf-1' });

    const replayRes = await handleCashfreeWebhook(payload, validSig, timestamp, 'cf_evt_1');
    expect(replayRes.success).toBe(true);
    expect(replayRes.duplicate).toBe(true);
  });

  it('blocks unauthenticated or non-owner calls to exported executeGatewayRefund server action', async () => {
    mockAuthUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const unauthRefund = await executeGatewayRefund('order-1', 1000, 'Unauthorized attempt');
    expect(unauthRefund.success).toBe(false);
    expect(unauthRefund.error).toMatch(/Unauthorized/);

    mockAuthUser.mockResolvedValueOnce({ data: { user: { id: 'attacker-99', email: 'evil@example.com' } }, error: null });
    const idorRefund = await executeGatewayRefund('order-1', 1000, 'IDOR attempt');
    expect(idorRefund.success).toBe(false);
    expect(idorRefund.error).toMatch(/Unauthorized/);
  });
});

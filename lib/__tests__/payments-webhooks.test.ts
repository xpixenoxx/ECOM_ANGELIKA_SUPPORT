import crypto from 'crypto';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const {
  ordersMap,
  webhookEventsMap,
  refundsList,
  notificationsList,
  mockRpc,
  mockAuthUser,
  mockRequireAdminRole,
} = vi.hoisted(() => ({
  ordersMap: new Map<string, any>(),
  webhookEventsMap: new Map<string, any>(),
  refundsList: [] as any[],
  notificationsList: [] as any[],
  mockRpc: vi.fn(),
  mockAuthUser: vi.fn(),
  mockRequireAdminRole: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockAuthUser },
  })),
}));

vi.mock('@/lib/supabase/admin-auth', () => ({
  OPS_ADMIN_ROLES: ['super_admin', 'admin', 'ops_manager'],
  requireAdminRole: (...args: any[]) => mockRequireAdminRole(...args),
  logAdminAction: vi.fn(async () => {}),
}));

vi.mock('@/lib/email/resend', () => ({
  sendEmailViaResend: vi.fn(async () => ({ success: true, id: 'email_mock_1' })),
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
            if (webhookEventsMap.has(key)) {
              return { error: { code: '23505', message: 'duplicate key value violates unique constraint' } };
            }
            webhookEventsMap.set(key, { ...row });
            return { error: null };
          }),
          select: vi.fn(() => {
            const filters: Record<string, any> = {};
            const chain: any = {
              eq: vi.fn((col: string, val: any) => {
                filters[col] = val;
                return chain;
              }),
              maybeSingle: vi.fn(async () => {
                const key = `${filters['provider']}:${filters['event_id']}`;
                return { data: webhookEventsMap.get(key) ?? null, error: null };
              }),
            };
            return chain;
          }),
          update: vi.fn((patch: any) => {
            const filters: Record<string, any> = {};
            const chain: any = {
              eq: vi.fn((col: string, val: any) => {
                filters[col] = val;
                if (filters['provider'] && filters['event_id']) {
                  const key = `${filters['provider']}:${filters['event_id']}`;
                  const existing = webhookEventsMap.get(key);
                  if (existing) webhookEventsMap.set(key, { ...existing, ...patch });
                }
                return chain;
              }),
            };
            return chain;
          }),
        };
      }

      if (table === 'order_refunds') {
        return {
          select: vi.fn(() => {
            const filters: Record<string, any> = {};
            const chain: any = {
              eq: vi.fn((col: string, val: any) => {
                filters[col] = val;
                return chain;
              }),
              in: vi.fn(async (col: string, vals: string[]) => {
                const rows = refundsList.filter(
                  (r) =>
                    (!filters['order_id'] || r.order_id === filters['order_id']) &&
                    vals.includes(r[col])
                );
                return { data: rows, error: null };
              }),
            };
            return chain;
          }),
          insert: vi.fn((row: any) => ({
            select: vi.fn(() => ({
              maybeSingle: vi.fn(async () => {
                if (
                  row.idempotency_key &&
                  refundsList.some((r) => r.idempotency_key === row.idempotency_key)
                ) {
                  return { data: null, error: { code: '23505', message: 'duplicate idempotency_key' } };
                }
                const created = { id: `ref_row_${refundsList.length + 1}`, ...row };
                refundsList.push(created);
                return { data: created, error: null };
              }),
            })),
          })),
          upsert: vi.fn(async (row: any) => {
            const idx = refundsList.findIndex(
              (r) => row.gateway_refund_id && r.gateway_refund_id === row.gateway_refund_id
            );
            if (idx >= 0) {
              refundsList[idx] = { ...refundsList[idx], ...row };
            } else {
              refundsList.push({ id: `ref_row_${refundsList.length + 1}`, ...row });
            }
            return { error: null };
          }),
          update: vi.fn((patch: any) => ({
            eq: vi.fn(async (col: string, val: any) => {
              const target = refundsList.find((r) => r[col] === val);
              if (target) Object.assign(target, patch);
              return { error: null };
            }),
          })),
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
                data: Array.from(ordersMap.values()).filter(
                  (o) => o[filterField] === filterVal && vals.includes(o.payment_status)
                ),
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
        return {
          insert: vi.fn((row: any) => {
            const exists =
              row.dedup_key && notificationsList.some((n) => n.dedup_key === row.dedup_key);
            const result = exists
              ? { data: null, error: { code: '23505', message: 'duplicate dedup_key' } }
              : (() => {
                  const created = { id: `notif_${notificationsList.length + 1}`, ...row };
                  notificationsList.push(created);
                  return { data: created, error: null };
                })();
            return {
              select: vi.fn(() => ({
                maybeSingle: vi.fn(async () => result),
              })),
              then: (resolve: any) => resolve(result),
            };
          }),
          update: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
        };
      }

      if (table === 'carts') {
        return {
          delete: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
        };
      }

      return {};
    }),
  },
}));

import {
  handleRazorpayWebhook,
  executeGatewayRefund,
  processRefund,
  reconcileRazorpayOrder,
} from '@/lib/actions/payments';
import { verifyRazorpayPayment } from '@/lib/actions/checkout';
import { cancelCustomerOrder, trackOrderPublic } from '@/lib/actions/customer-orders';
import { checkRateLimitAsync } from '@/lib/utils/rate-limit';
import { createOrderReceiptToken, verifyOrderReceiptToken } from '@/lib/utils/order-access-token';

describe('Razorpay Verification, Webhooks, Refunds, Reconciliation, Cancel & Tracking', () => {
  const originalEnv = { ...process.env };
  const WEBHOOK_SECRET = 'whsec_test_secret_key_for_razorpay_123';
  const KEY_ID = 'rzp_test_AbCdEf12345678';
  const KEY_SECRET = 'rzp_secret_test_key_987654321';

  beforeEach(() => {
    vi.clearAllMocks();
    ordersMap.clear();
    webhookEventsMap.clear();
    refundsList.length = 0;
    notificationsList.length = 0;

    process.env = { ...originalEnv };
    process.env['RAZORPAY_ENV'] = 'test';
    process.env['NEXT_PUBLIC_RAZORPAY_ENV'] = 'test';
    process.env['RAZORPAY_KEY_ID'] = KEY_ID;
    process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'] = KEY_ID;
    process.env['RAZORPAY_KEY_SECRET'] = KEY_SECRET;
    process.env['RAZORPAY_WEBHOOK_SECRET'] = WEBHOOK_SECRET;

    mockRpc.mockResolvedValue({ data: { confirmed: true, stock_conflict: false }, error: null });
    mockRequireAdminRole.mockResolvedValue({ authorized: false, userId: null, error: 'Unauthorized' });

    ordersMap.set('order-1', {
      id: 'order-1',
      order_number: 'ORD-TEST-001',
      user_id: 'user-1',
      email: 'priya@example.com',
      phone: '9876543210',
      payment_method: 'razorpay',
      payment_id: 'order_RzpTest00001',
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
    vi.unstubAllGlobals();
  });

  function signWebhook(payload: string) {
    return crypto.createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');
  }

  function signCheckout(rzpOrderId: string, rzpPaymentId: string) {
    return crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${rzpOrderId}|${rzpPaymentId}`)
      .digest('hex');
  }

  it('verifies RAZORPAY_WEBHOOK_SECRET timing-safely and rejects invalid signatures', async () => {
    const body = JSON.stringify({ event: 'payment.captured', created_at: 123456, payload: {} });
    const bad = await handleRazorpayWebhook(body, '0'.repeat(64));
    expect(bad.success).toBe(false);
    expect(bad.error).toBe('Invalid signature');
  });

  it('fails closed when RAZORPAY_WEBHOOK_SECRET is missing', async () => {
    delete process.env['RAZORPAY_WEBHOOK_SECRET'];
    const body = JSON.stringify({ event: 'payment.captured', created_at: 123456, payload: {} });
    const res = await handleRazorpayWebhook(body, '0'.repeat(64));
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/not configured/i);
  });

  it('deduplicates replayed Razorpay payment.captured webhooks and confirms inventory once', async () => {
    const payload = JSON.stringify({
      event: 'payment.captured',
      created_at: 1700000000,
      payload: {
        payment: {
          entity: {
            id: 'pay_RzpTest00099',
            order_id: 'order_RzpTest00001',
            amount: 400000, // 4000 INR in paise
            currency: 'INR',
            status: 'captured',
            method: 'upi',
          },
        },
      },
    });
    const sig = signWebhook(payload);

    const first = await handleRazorpayWebhook(payload, sig, 'evt_cap_1');
    expect(first.success).toBe(true);
    expect(first.duplicate).toBeUndefined();
    expect(ordersMap.get('order-1').payment_status).toBe('paid');
    expect(ordersMap.get('order-1').status).toBe('confirmed');
    expect(ordersMap.get('order-1').metadata.razorpay_payment_id).toBe('pay_RzpTest00099');
    expect(mockRpc).toHaveBeenCalledWith('confirm_order_inventory', { p_order_id: 'order-1' });

    const replay = await handleRazorpayWebhook(payload, sig, 'evt_cap_1');
    expect(replay.success).toBe(true);
    expect(replay.duplicate).toBe(true);
    expect(mockRpc).toHaveBeenCalledTimes(1);
  });

  it('handles payment.failed by cancelling pending order and releasing stock, but never downgrades paid orders', async () => {
    const failedPayload = JSON.stringify({
      event: 'payment.failed',
      created_at: 1700000010,
      payload: {
        payment: {
          entity: {
            id: 'pay_RzpFail00001',
            order_id: 'order_RzpTest00001',
            amount: 400000,
            currency: 'INR',
            status: 'failed',
            error_description: 'UPI collect timed out',
          },
        },
      },
    });

    const failRes = await handleRazorpayWebhook(failedPayload, signWebhook(failedPayload), 'evt_fail_1');
    expect(failRes.success).toBe(true);
    expect(ordersMap.get('order-1').payment_status).toBe('failed');
    expect(ordersMap.get('order-1').status).toBe('cancelled');
    expect(mockRpc).toHaveBeenCalledWith('release_order_inventory', { p_order_id: 'order-1' });

    // Now test out-of-order protection on an already-paid order
    ordersMap.set('order-paid', {
      ...ordersMap.get('order-1'),
      id: 'order-paid',
      payment_id: 'order_RzpPaid00002',
      payment_status: 'paid',
      status: 'confirmed',
    });
    const lateFailed = JSON.stringify({
      event: 'payment.failed',
      created_at: 1700000020,
      payload: {
        payment: {
          entity: {
            id: 'pay_RzpOldAttempt',
            order_id: 'order_RzpPaid00002',
            amount: 400000,
            currency: 'INR',
            status: 'failed',
          },
        },
      },
    });
    await handleRazorpayWebhook(lateFailed, signWebhook(lateFailed), 'evt_fail_late');
    expect(ordersMap.get('order-paid').payment_status).toBe('paid');
    expect(ordersMap.get('order-paid').status).toBe('confirmed');
  });

  it('verifies Razorpay checkout signature + authoritative GET /v1/payments/{id} and rejects amount tampering', async () => {
    const rzpOrderId = 'order_RzpTest00001';
    const rzpPaymentId = 'pay_RzpVerified01';
    const sig = signCheckout(rzpOrderId, rzpPaymentId);

    // 1. Reject tampered amount returned by gateway (Rs. 100 instead of Rs. 4000)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            id: rzpPaymentId,
            order_id: rzpOrderId,
            amount: 10000, // mismatch!
            currency: 'INR',
            status: 'captured',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    const tampered = await verifyRazorpayPayment(rzpOrderId, rzpPaymentId, sig);
    expect(tampered.success).toBe(false);
    expect(tampered.error).toMatch(/amount does not match/i);
    expect(ordersMap.get('order-1').payment_status).toBe('pending');

    // 2. Accept exact matching captured payment
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            id: rzpPaymentId,
            order_id: rzpOrderId,
            amount: 400000,
            currency: 'INR',
            status: 'captured',
            method: 'card',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    const ok = await verifyRazorpayPayment(rzpOrderId, rzpPaymentId, sig);
    expect(ok.success).toBe(true);
    expect(ok.status).toBe('paid');
    expect(ordersMap.get('order-1').payment_status).toBe('paid');
    expect(ordersMap.get('order-1').status).toBe('confirmed');
  });

  it('attempts server-side capture when verified Razorpay payment is authorized', async () => {
    const rzpOrderId = 'order_RzpTest00001';
    const rzpPaymentId = 'pay_RzpAuth00001';
    const sig = signCheckout(rzpOrderId, rzpPaymentId);

    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith(`/payments/${rzpPaymentId}`) && (!init?.method || init.method === 'GET')) {
        return new Response(
          JSON.stringify({
            id: rzpPaymentId,
            order_id: rzpOrderId,
            amount: 400000,
            currency: 'INR',
            status: 'authorized',
          }),
          { status: 200 }
        );
      }
      if (url.endsWith(`/payments/${rzpPaymentId}/capture`) && init?.method === 'POST') {
        return new Response(
          JSON.stringify({
            id: rzpPaymentId,
            order_id: rzpOrderId,
            amount: 400000,
            currency: 'INR',
            status: 'captured',
          }),
          { status: 200 }
        );
      }
      return new Response('{}', { status: 404 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await verifyRazorpayPayment(rzpOrderId, rzpPaymentId, sig);
    expect(res.success).toBe(true);
    expect(res.status).toBe('paid');
    expect(ordersMap.get('order-1').payment_status).toBe('paid');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('handles partial and cumulative full Razorpay refund webhooks without releasing stock prematurely', async () => {
    const ord = ordersMap.get('order-1');
    ord.payment_status = 'paid';
    ord.status = 'confirmed';
    ord.metadata = { razorpay_payment_id: 'pay_RzpTest00099' };

    const partial1 = JSON.stringify({
      event: 'refund.processed',
      created_at: 1700000050,
      payload: {
        refund: {
          entity: {
            id: 'rfnd_partial_1',
            payment_id: 'pay_RzpTest00099',
            amount: 150000, // Rs.1,500 in paise
            currency: 'INR',
            status: 'processed',
          },
        },
      },
    });

    const res1 = await handleRazorpayWebhook(partial1, signWebhook(partial1), 'evt_ref_1');
    expect(res1.success).toBe(true);
    expect(ordersMap.get('order-1').payment_status).toBe('partially_refunded');
    expect(ordersMap.get('order-1').metadata.refund_amount).toBe(1500);
    expect(mockRpc).not.toHaveBeenCalledWith('release_order_inventory', expect.anything());

    // Second partial refund completes the remaining Rs.2,500 -> becomes 'refunded'
    const partial2 = JSON.stringify({
      event: 'refund.processed',
      created_at: 1700000060,
      payload: {
        refund: {
          entity: {
            id: 'rfnd_partial_2',
            payment_id: 'pay_RzpTest00099',
            amount: 250000, // Rs.2,500 in paise
            currency: 'INR',
            status: 'processed',
          },
        },
      },
    });
    const res2 = await handleRazorpayWebhook(partial2, signWebhook(partial2), 'evt_ref_2');
    expect(res2.success).toBe(true);
    expect(ordersMap.get('order-1').payment_status).toBe('refunded');
    expect(ordersMap.get('order-1').metadata.refund_amount).toBe(4000);
  });

  it('executes admin partial refund with X-Refund-Idempotency, blocks over-refund, and separates restock', async () => {
    const ord = ordersMap.get('order-1');
    ord.payment_status = 'paid';
    ord.status = 'confirmed';
    ord.metadata = { razorpay_payment_id: 'pay_RzpPaid99999' };

    mockRequireAdminRole.mockResolvedValue({ authorized: true, userId: 'admin-1' });

    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const headers = (init?.headers || {}) as Record<string, string>;
      expect(headers['X-Refund-Idempotency']).toBeTruthy();
      return new Response(
        JSON.stringify({
          id: 'rfnd_admin_001',
          payment_id: 'pay_RzpPaid99999',
          amount: 150000,
          currency: 'INR',
          status: 'processed',
        }),
        { status: 200 }
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    // 1. Refund Rs. 1500 without restoring inventory
    const r1 = await processRefund('order-1', 1500, 'Partial goodwill credit', {
      restoreInventory: false,
      idempotencyKey: 'admin_ref_order1_part1',
    });
    expect(r1.success).toBe(true);
    expect(r1.refundId).toBe('rfnd_admin_001');
    expect(ordersMap.get('order-1').payment_status).toBe('partially_refunded');
    expect(mockRpc).not.toHaveBeenCalledWith('release_order_inventory', expect.anything());

    // 2. Attempt to refund Rs. 3000 when only Rs. 2500 remains -> must be blocked
    const over = await processRefund('order-1', 3000, 'Over-refund attempt');
    expect(over.success).toBe(false);
    expect(over.error).toMatch(/exceeds remaining refundable amount/i);
  });

  it('reconciles a pending Razorpay order against GET /v1/orders/{id}/payments and detects duplicates', async () => {
    mockRequireAdminRole.mockResolvedValue({ authorized: true, userId: 'admin-1' });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            items: [
              { id: 'pay_RzpRec0001', order_id: 'order_RzpTest00001', amount: 400000, currency: 'INR', status: 'captured', method: 'upi' },
              { id: 'pay_RzpRec0002', order_id: 'order_RzpTest00001', amount: 400000, currency: 'INR', status: 'captured', method: 'upi' },
            ],
          }),
          { status: 200 }
        )
      )
    );

    const rec = await reconcileRazorpayOrder('order-1');
    expect(rec.success).toBe(true);
    expect(rec.reconciled).toBe(true);
    expect(rec.paymentStatus).toBe('paid');
    expect(rec.duplicatePaymentsFound).toBe(true);
    expect(ordersMap.get('order-1').payment_status).toBe('paid');
    expect(ordersMap.get('order-1').metadata.duplicate_payment_detected).toBe(true);
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

  it('auto-resolves Cloudflare RATE_LIMIT_KV from globalThis in checkRateLimitAsync', async () => {
    const kvStore = new Map<string, string>();
    (globalThis as any).RATE_LIMIT_KV = {
      get: vi.fn(async (k: string) => kvStore.get(k) ?? null),
      put: vi.fn(async (k: string, v: string) => {
        kvStore.set(k, v);
      }),
    };

    try {
      const r1 = await checkRateLimitAsync('test_kv_key', 2, 60_000);
      const r2 = await checkRateLimitAsync('test_kv_key', 2, 60_000);
      const r3 = await checkRateLimitAsync('test_kv_key', 2, 60_000);

      expect(r1.allowed).toBe(true);
      expect(r2.allowed).toBe(true);
      expect(r3.allowed).toBe(false);
      expect((globalThis as any).RATE_LIMIT_KV.put).toHaveBeenCalledTimes(2);
    } finally {
      delete (globalThis as any).RATE_LIMIT_KV;
    }
  });

  it('fails closed for verifyOrderReceiptToken in production if signing secrets are missing', () => {
    process.env['ORDER_TOKEN_SECRET'] = 'super_secret_prod_token_key_999';
    const token = createOrderReceiptToken('order-1', 'priya@example.com');
    expect(verifyOrderReceiptToken('order-1', 'priya@example.com', token)).toBe(true);

    delete process.env['ORDER_TOKEN_SECRET'];
    delete process.env['SUPABASE_SERVICE_ROLE_KEY'];
    (process.env as any).NODE_ENV = 'production';

    expect(verifyOrderReceiptToken('order-1', 'priya@example.com', token)).toBe(false);
  });
});

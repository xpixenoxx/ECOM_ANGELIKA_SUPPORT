import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  variantsMap,
  couponsMap,
  reservationsMap,
  redemptionsMap,
  ordersMap,
  mockGetUser,
} = vi.hoisted(() => ({
  variantsMap: new Map<string, any>(),
  couponsMap: new Map<string, any>(),
  reservationsMap: new Map<string, any>(),
  redemptionsMap: new Map<string, any>(),
  ordersMap: new Map<string, any>(),
  mockGetUser: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock('@/lib/actions/notifications', () => ({
  sendOrderConfirmedNotification: vi.fn(async () => {}),
}));

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    rpc: vi.fn(async (fnName: string, args: any) => {
      if (fnName === 'reserve_order_inventory') {
        const items = Array.isArray(args.p_items) ? args.p_items : [];
        for (const it of items) {
          const v = variantsMap.get(it.variant_id);
          if (!v || !v.is_active) {
            return { data: null, error: { message: `VARIANT_UNAVAILABLE:${it.variant_id}` } };
          }
          if (v.inventory_quantity < it.quantity) {
            return { data: null, error: { message: `INSUFFICIENT_STOCK:${v.product?.name || 'Item'}` } };
          }
        }
        for (const it of items) {
          const v = variantsMap.get(it.variant_id);
          v.inventory_quantity -= it.quantity;
          reservationsMap.set(`${args.p_order_id}:${it.variant_id}`, {
            order_id: args.p_order_id,
            variant_id: it.variant_id,
            quantity: it.quantity,
            status: 'reserved',
          });
        }
        return { data: true, error: null };
      }

      if (fnName === 'reserve_coupon_for_order') {
        const c = couponsMap.get(String(args.p_code).toUpperCase());
        if (!c || !c.is_active) return { data: null, error: { message: 'COUPON_INVALID' } };
        if (c.usage_limit !== null && c.usage_count >= c.usage_limit) {
          return { data: null, error: { message: 'COUPON_EXHAUSTED' } };
        }
        if (args.p_subtotal < (c.min_order_amount || 0)) {
          return { data: null, error: { message: `COUPON_MIN_ORDER:Minimum order Rs.${c.min_order_amount}` } };
        }
        c.usage_count += 1;
        const discount = c.type === 'fixed' ? c.value : Math.round(args.p_subtotal * (c.value / 100));
        redemptionsMap.set(args.p_order_id, { coupon_id: c.id, status: 'reserved', discount_amount: discount });
        return {
          data: { id: c.id, code: c.code, type: c.type, value: c.value, discount_amount: discount },
          error: null,
        };
      }

      if (fnName === 'confirm_order_inventory') {
        for (const r of reservationsMap.values()) {
          if (r.order_id === args.p_order_id) r.status = 'confirmed';
        }
        return { data: { confirmed: true, stock_conflict: false }, error: null };
      }

      if (fnName === 'release_order_inventory') {
        let count = 0;
        for (const r of reservationsMap.values()) {
          if (r.order_id === args.p_order_id && (r.status === 'reserved' || r.status === 'confirmed')) {
            r.status = 'released';
            const v = variantsMap.get(r.variant_id);
            if (v) v.inventory_quantity += r.quantity;
            count++;
          }
        }
        const cr = redemptionsMap.get(args.p_order_id);
        if (cr && cr.status !== 'released') {
          cr.status = 'released';
          for (const c of couponsMap.values()) {
            if (c.id === cr.coupon_id) c.usage_count = Math.max(0, c.usage_count - 1);
          }
        }
        return { data: count, error: null };
      }

      return { data: null, error: null };
    }),
    from: vi.fn((table: string) => {
      if (table === 'product_variants') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn(async (_col: string, ids: string[]) => ({
            data: ids.map((id) => variantsMap.get(id)).filter(Boolean),
            error: null,
          })),
        };
      }
      if (table === 'orders') {
        let eqCol = '';
        let eqVal = '';
        let pendingUpdate: any = null;
        return {
          insert: vi.fn((row: any) => ({
            select: vi.fn(() => ({
              single: vi.fn(async () => {
                const id = `00000000-0000-4000-8000-${String(ordersMap.size + 1).padStart(12, '0')}`;
                const saved = { id, ...row };
                ordersMap.set(id, saved);
                return { data: saved, error: null };
              }),
            })),
          })),
          update: vi.fn((patch: any) => {
            pendingUpdate = patch;
            return {
              eq: vi.fn(async (_c: string, id: string) => {
                const existing = ordersMap.get(id);
                if (existing) ordersMap.set(id, { ...existing, ...pendingUpdate });
                return { error: null };
              }),
            };
          }),
          delete: vi.fn(() => ({
            eq: vi.fn(async (_c: string, id: string) => {
              ordersMap.delete(id);
              return { error: null };
            }),
          })),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn((col: string, val: string) => {
            eqCol = col;
            eqVal = val;
            return {
              maybeSingle: vi.fn(async () => {
                if (eqCol === 'idempotency_key') {
                  const found = Array.from(ordersMap.values()).find((o) => o.idempotency_key === eqVal);
                  return { data: found ?? null, error: null };
                }
                return { data: ordersMap.get(eqVal) ?? null, error: null };
              }),
            };
          }),
        };
      }
      if (table === 'order_items' || table === 'carts') {
        return {
          insert: vi.fn(async () => ({ error: null })),
          delete: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
        };
      }
      return {};
    }),
  },
}));

import { createOrder } from '@/lib/actions/checkout';

describe('Checkout Price Tamper Defense, Atomic Inventory & Coupon Limits', () => {
  const VARIANT_ID = '11111111-1111-4111-8111-111111111111';
  const PRODUCT_ID = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    vi.clearAllMocks();
    variantsMap.clear();
    couponsMap.clear();
    reservationsMap.clear();
    redemptionsMap.clear();
    ordersMap.clear();

    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    variantsMap.set(VARIANT_ID, {
      id: VARIANT_ID,
      product_id: PRODUCT_ID,
      size: 'M',
      price: 4999,
      inventory_quantity: 2,
      is_active: true,
      color: { id: 'c1', name: 'Crimson', hex: '#880011' },
      product: {
        id: PRODUCT_ID,
        name: 'Banarasi Silk Lehenga',
        gst_slab: 12,
        is_active: true,
        images: [{ url: '/images/test.jpg', is_primary: true }],
      },
    });

    couponsMap.set('ROYAL500', {
      id: '33333333-3333-4333-8333-333333333333',
      code: 'ROYAL500',
      type: 'fixed',
      value: 500,
      min_order_amount: 4000,
      usage_limit: 1,
      usage_count: 0,
      is_active: true,
    });
  });

  const baseAddress = {
    firstName: 'Ananya',
    lastName: 'Sharma',
    address1: '12 Heritage Lane, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400050',
    country: 'India',
    phone: '9876543210',
  };

  it('ignores client-manipulated price and discountAmount, computing authoritative DB total', async () => {
    const res = await createOrder({
      items: [
        {
          id: 'item-1',
          product_id: PRODUCT_ID,
          variant_id: VARIANT_ID,
          product_name: 'Fake Cheap Price',
          size: 'M',
          color: 'Crimson',
          color_hex: '#880011',
          price: 1, // Attacker tries Rs.1 instead of Rs.4999!
          quantity: 1,
          image: '/images/test.jpg',
          is_vidyas_pick: false,
          inventory_quantity: 2,
          max_quantity: 10,
        },
      ],
      shippingAddress: baseAddress,
      paymentMethod: 'cod',
      email: 'ananya@example.com',
      phone: '9876543210',
      coupon: { code: 'ROYAL500', type: 'fixed', value: 4998, discountAmount: 4998 }, // Attacker tries Rs.4998 off!
      idempotencyKey: 'idem-price-tamper',
    });

    expect(res.success).toBe(true);
    const saved = ordersMap.get(res.orderId!);
    expect(saved.subtotal).toBe(4999);
    expect(saved.discount_amount).toBe(500);
    // 4999 + 0 shipping + 49 COD fee - 500 discount = 4548
    expect(saved.total_amount).toBe(4548);
  });

  it('prevents overselling under concurrent checkout and honors coupon usage_limit', async () => {
    variantsMap.get(VARIANT_ID).inventory_quantity = 2;

    const attempts = await Promise.all([1, 2, 3, 4].map((n) =>
      createOrder({
        items: [
          {
            id: `c-${n}`,
            product_id: PRODUCT_ID,
            variant_id: VARIANT_ID,
            product_name: 'Banarasi Silk Lehenga',
            size: 'M',
            color: 'Crimson',
            color_hex: '#880011',
            price: 4999,
            quantity: 1,
            image: '/images/test.jpg',
            is_vidyas_pick: false,
            inventory_quantity: 2,
            max_quantity: 10,
          },
        ],
        shippingAddress: baseAddress,
        paymentMethod: 'cod',
        email: `buyer${n}@example.com`,
        phone: '9876543210',
        idempotencyKey: `idem-concurrent-${n}`,
      })
    ));

    const successes = attempts.filter((r) => r.success);
    const failures = attempts.filter((r) => !r.success);
    expect(successes).toHaveLength(2);
    expect(failures).toHaveLength(2);
    expect(variantsMap.get(VARIANT_ID).inventory_quantity).toBe(0);
  });

  it('enforces coupon usage_limit atomically and restores inventory if coupon fails', async () => {
    // First order consumes usage_limit=1
    const first = await createOrder({
      items: [
        {
          id: 'c-first',
          product_id: PRODUCT_ID,
          variant_id: VARIANT_ID,
          product_name: 'Banarasi Silk Lehenga',
          size: 'M',
          color: 'Crimson',
          color_hex: '#880011',
          price: 4999,
          quantity: 1,
          image: '/images/test.jpg',
          is_vidyas_pick: false,
          inventory_quantity: 2,
          max_quantity: 10,
        },
      ],
      shippingAddress: baseAddress,
      paymentMethod: 'cod',
      email: 'first@example.com',
      phone: '9876543210',
      coupon: { code: 'ROYAL500', type: 'fixed', value: 500, discountAmount: 500 },
    });
    expect(first.success).toBe(true);
    expect(variantsMap.get(VARIANT_ID).inventory_quantity).toBe(1);

    // Second order tries exhausted coupon -> must fail AND restore remaining stock = 1
    const second = await createOrder({
      items: [
        {
          id: 'c-second',
          product_id: PRODUCT_ID,
          variant_id: VARIANT_ID,
          product_name: 'Banarasi Silk Lehenga',
          size: 'M',
          color: 'Crimson',
          color_hex: '#880011',
          price: 4999,
          quantity: 1,
          image: '/images/test.jpg',
          is_vidyas_pick: false,
          inventory_quantity: 2,
          max_quantity: 10,
        },
      ],
      shippingAddress: baseAddress,
      paymentMethod: 'cod',
      email: 'second@example.com',
      phone: '9876543210',
      coupon: { code: 'ROYAL500', type: 'fixed', value: 500, discountAmount: 500 },
    });
    expect(second.success).toBe(false);
    expect(second.error).toMatch(/limit/i);
    expect(variantsMap.get(VARIANT_ID).inventory_quantity).toBe(1);
  });

  it('deduplicates idempotency_key retries cleanly without double reserving stock', async () => {
    const payload = {
      items: [
        {
          id: 'i-retry',
          product_id: PRODUCT_ID,
          variant_id: VARIANT_ID,
          product_name: 'Banarasi Silk Lehenga',
          size: 'M',
          color: 'Crimson',
          color_hex: '#880011',
          price: 4999,
          quantity: 1,
          image: '/images/test.jpg',
          is_vidyas_pick: false,
          inventory_quantity: 2,
          max_quantity: 10,
        },
      ],
      shippingAddress: baseAddress,
      paymentMethod: 'cod' as const,
      email: 'retry@example.com',
      phone: '9876543210',
      idempotencyKey: 'same-idempotency-key-123',
    };

    const r1 = await createOrder(payload);
    const r2 = await createOrder(payload);

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r2.orderId).toBe(r1.orderId);
    expect(variantsMap.get(VARIANT_ID).inventory_quantity).toBe(1);
  });
});

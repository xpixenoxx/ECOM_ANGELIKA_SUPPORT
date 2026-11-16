import { describe, it, expect } from 'vitest';
import {
  calculateOrderTotals,
  calculateCouponDiscount,
  computeIncludedApparelGst,
  toPaise,
  fromPaise,
} from '@/lib/pricing';

describe('Shared Pricing, GST & Gateway Currency Conversion', () => {
  it('computes subtotal, free shipping >= 2999, COD fee, and zero extra GST surcharge', () => {
    const res = calculateOrderTotals({
      items: [
        { unitPrice: 2000, quantity: 1 },
        { unitPrice: 1200, quantity: 1 },
      ],
      paymentMethod: 'cod',
    });

    expect(res.subtotal).toBe(3200);
    expect(res.shippingCost).toBe(0);
    expect(res.codFee).toBe(49);
    expect(res.taxAmount).toBe(0);
    expect(res.total).toBe(3249);
  });

  it('adds standard Rs.99 shipping below Rs.2999 unless free_shipping coupon applied', () => {
    const standard = calculateOrderTotals({
      items: [{ unitPrice: 1500, quantity: 1 }],
      paymentMethod: 'razorpay',
    });
    expect(standard.shippingCost).toBe(99);
    expect(standard.total).toBe(1599);

    const freeShipCoupon = calculateOrderTotals({
      items: [{ unitPrice: 1500, quantity: 1 }],
      coupon: { code: 'FREESHIP', type: 'free_shipping', value: 0 },
      paymentMethod: 'razorpay',
    });
    expect(freeShipCoupon.shippingCost).toBe(0);
    expect(freeShipCoupon.total).toBe(1500);
  });

  it('caps percentage discounts at maxDiscountAmount and never yields negative total', () => {
    const pct = calculateCouponDiscount({
      subtotal: 20000,
      coupon: { code: 'COUTURE15', type: 'percentage', value: 15, maxDiscountAmount: 2000 },
    });
    expect(pct).toBe(2000);

    const overFixed = calculateOrderTotals({
      items: [{ unitPrice: 500, quantity: 1 }],
      coupon: { code: 'FLAT2000', type: 'fixed', value: 2000 },
      paymentMethod: 'razorpay',
    });
    expect(overFixed.discountAmount).toBe(500);
    expect(overFixed.total).toBe(99); // only shipping remains non-negative
  });

  it('calculates Indian apparel MRP-included GST at 5% <= Rs.1000 and 12% > Rs.1000', () => {
    expect(computeIncludedApparelGst(1000, 1)).toBeCloseTo(47.62, 2);
    expect(computeIncludedApparelGst(1120, 1)).toBeCloseTo(120, 2);
  });

  it('converts INR <-> Paise losslessly across gateway boundaries', () => {
    expect(toPaise(3999)).toBe(399900);
    expect(fromPaise(399900)).toBe(3999);
    expect(fromPaise(199950)).toBe(1999.5);
  });
});

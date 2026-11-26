/**
 * Canonical Shared Pricing, Coupon, Shipping & Indian Apparel GST Engine
 * Single source of truth for Cart UI, Checkout UI, and Server Checkout/Webhooks.
 */

export const PRICING_CONSTANTS = {
  FREE_SHIPPING_THRESHOLD: 2999,
  STANDARD_SHIPPING_FEE: 99,
  FREE_SHIPPING: 0,
  COD_FEE: 49,
  COD_MAX_AMOUNT: 10000,
  GIFT_WRAP_FEE: 0,
  APPAREL_GST_LOW_THRESHOLD: 1000,
  APPAREL_GST_LOW_RATE: 5,
  APPAREL_GST_HIGH_RATE: 12,
} as const;

export interface PricedLineItem {
  unitPrice: number;
  quantity: number;
  gstSlab?: number | null;
}

export interface CouponSpec {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping' | string;
  value: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
}

export interface OrderPricingBreakdown {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  codFee: number;
  giftWrapFee: number;
  discountAmount: number;
  total: number;
  itemCount: number;
  includedGstAmount: number;
}

export function roundRupees(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

/**
 * Converts Rupees (DB canonical unit) to Paise (Razorpay & Stripe minor unit).
 */
export function toPaise(amountInr: number): number {
  if (!Number.isFinite(amountInr) || amountInr <= 0) return 0;
  return Math.round(amountInr * 100);
}

/**
 * Converts Paise (Razorpay & Stripe minor unit) back to Rupees (DB canonical unit).
 */
export function fromPaise(amountPaise: number): number {
  if (!Number.isFinite(amountPaise) || amountPaise <= 0) return 0;
  return Math.round((amountPaise / 100) * 100) / 100;
}

/**
 * Computes MRP-included GST component per Indian apparel GST slab rules:
 * 5% for garments <= Rs. 1,000 per piece, 12% above Rs. 1,000 per piece.
 */
export function computeIncludedApparelGst(
  unitPriceInr: number,
  quantity: number,
  gstSlabOverride?: number | null
): number {
  const unit = Math.max(0, Number(unitPriceInr) || 0);
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  const rate =
    typeof gstSlabOverride === 'number' && gstSlabOverride > 0
      ? gstSlabOverride
      : unit <= PRICING_CONSTANTS.APPAREL_GST_LOW_THRESHOLD
        ? PRICING_CONSTANTS.APPAREL_GST_LOW_RATE
        : PRICING_CONSTANTS.APPAREL_GST_HIGH_RATE;
  const lineTotal = unit * qty;
  return Math.round(((lineTotal * rate) / (100 + rate)) * 100) / 100;
}

export function calculateCouponDiscount(params: {
  subtotal: number;
  coupon?: CouponSpec | null;
}): number {
  const subtotal = Math.max(0, roundRupees(params.subtotal));
  const coupon = params.coupon;
  if (!coupon || subtotal <= 0) return 0;

  if (
    typeof coupon.minOrderAmount === 'number' &&
    coupon.minOrderAmount > 0 &&
    subtotal < coupon.minOrderAmount
  ) {
    return 0;
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = Math.round(subtotal * (Number(coupon.value || 0) / 100));
    if (typeof coupon.maxDiscountAmount === 'number' && coupon.maxDiscountAmount > 0) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else if (coupon.type === 'fixed') {
    discount = Math.round(Number(coupon.value || 0));
  } else {
    discount = 0;
  }

  return Math.max(0, Math.min(discount, subtotal));
}

export function calculateOrderTotals(params: {
  items: PricedLineItem[];
  coupon?: CouponSpec | null;
  paymentMethod?: 'razorpay' | 'cod' | 'stripe';
  giftWrap?: boolean;
  freeShippingThreshold?: number;
  standardShippingFee?: number;
  codFeeAmount?: number;
}): OrderPricingBreakdown {
  const items = Array.isArray(params.items) ? params.items : [];
  if (items.length === 0) {
    return {
      subtotal: 0,
      shippingCost: 0,
      taxAmount: 0,
      codFee: 0,
      giftWrapFee: 0,
      discountAmount: 0,
      total: 0,
      itemCount: 0,
      includedGstAmount: 0,
    };
  }

  const threshold = params.freeShippingThreshold ?? PRICING_CONSTANTS.FREE_SHIPPING_THRESHOLD;
  const stdShipping = params.standardShippingFee ?? PRICING_CONSTANTS.STANDARD_SHIPPING_FEE;
  const codFeeCfg = params.codFeeAmount ?? PRICING_CONSTANTS.COD_FEE;

  let subtotal = 0;
  let itemCount = 0;
  let includedGstAmount = 0;

  for (const item of items) {
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const unit = Math.max(0, Number(item.unitPrice) || 0);
    subtotal += unit * qty;
    itemCount += qty;
    includedGstAmount += computeIncludedApparelGst(unit, qty, item.gstSlab);
  }

  subtotal = roundRupees(subtotal);
  includedGstAmount = Math.round(includedGstAmount * 100) / 100;

  const isFreeShipping =
    subtotal >= threshold || params.coupon?.type === 'free_shipping';
  const shippingCost = isFreeShipping ? PRICING_CONSTANTS.FREE_SHIPPING : stdShipping;
  const codFee = params.paymentMethod === 'cod' ? codFeeCfg : 0;
  const giftWrapFee = params.giftWrap ? PRICING_CONSTANTS.GIFT_WRAP_FEE : 0;
  const discountAmount = calculateCouponDiscount({ subtotal, coupon: params.coupon });

  // All garment prices are GST-inclusive MRP; taxAmount surcharge is 0
  const taxAmount = 0;
  const total = Math.max(
    0,
    roundRupees(subtotal + shippingCost + codFee + giftWrapFee + taxAmount - discountAmount)
  );

  return {
    subtotal,
    shippingCost,
    taxAmount,
    codFee,
    giftWrapFee,
    discountAmount,
    total,
    itemCount,
    includedGstAmount,
  };
}

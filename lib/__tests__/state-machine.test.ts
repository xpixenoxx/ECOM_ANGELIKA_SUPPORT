import { describe, it, expect } from 'vitest';
import {
  canTransitionOrderStatus,
  assertOrderTransition,
  canTransitionPaymentStatus,
  assertPaymentTransition,
  canCustomerCancelOrder,
} from '@/lib/orders/state-machine';

describe('Order & Payment State Machine', () => {
  it('enforces valid order lifecycle transitions and rejects invalid ones', () => {
    expect(canTransitionOrderStatus('pending', 'confirmed')).toBe(true);
    expect(canTransitionOrderStatus('confirmed', 'shipped')).toBe(true);
    expect(canTransitionOrderStatus('shipped', 'delivered')).toBe(true);
    expect(canTransitionOrderStatus('delivered', 'returned')).toBe(true);

    expect(canTransitionOrderStatus('delivered', 'cancelled')).toBe(false);
    expect(canTransitionOrderStatus('cancelled', 'confirmed')).toBe(false);
    expect(() => assertOrderTransition('cancelled', 'shipped')).toThrow(/Invalid order status transition/);
  });

  it('enforces valid payment status transitions and blocks downgrading paid -> failed', () => {
    expect(canTransitionPaymentStatus('pending', 'paid')).toBe(true);
    expect(canTransitionPaymentStatus('paid', 'partially_refunded')).toBe(true);
    expect(canTransitionPaymentStatus('partially_refunded', 'refunded')).toBe(true);

    expect(canTransitionPaymentStatus('paid', 'failed')).toBe(false);
    expect(canTransitionPaymentStatus('refunded', 'paid')).toBe(false);
    expect(() => assertPaymentTransition('paid', 'pending')).toThrow(/Invalid payment status transition/);
  });

  it('permits customer self-cancellation only prior to dispatch', () => {
    expect(canCustomerCancelOrder('pending')).toBe(true);
    expect(canCustomerCancelOrder('confirmed')).toBe(true);
    expect(canCustomerCancelOrder('processing')).toBe(true);
    expect(canCustomerCancelOrder('shipped')).toBe(false);
    expect(canCustomerCancelOrder('delivered')).toBe(false);
    expect(canCustomerCancelOrder('cancelled')).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import {
  canTransitionOrderStatus,
  assertOrderTransition,
  canTransitionPaymentStatus,
  assertPaymentTransition,
  canTransitionShipmentStatus,
  canCustomerCancelOrder,
  evaluateShipmentEligibility,
} from '@/lib/orders/state-machine';

describe('Order, Payment & Shipment State Machines', () => {
  it('enforces valid order lifecycle transitions and rejects invalid ones', () => {
    expect(canTransitionOrderStatus('pending', 'confirmed')).toBe(true);
    expect(canTransitionOrderStatus('confirmed', 'processing')).toBe(true);
    expect(canTransitionOrderStatus('processing', 'shipped')).toBe(true);
    expect(canTransitionOrderStatus('shipped', 'out_for_delivery')).toBe(true);
    expect(canTransitionOrderStatus('out_for_delivery', 'delivered')).toBe(true);
    expect(canTransitionOrderStatus('delivered', 'returned')).toBe(true);

    expect(canTransitionOrderStatus('delivered', 'cancelled')).toBe(false);
    expect(canTransitionOrderStatus('delivered', 'shipped')).toBe(false);
    expect(canTransitionOrderStatus('cancelled', 'confirmed')).toBe(false);
    expect(() => assertOrderTransition('cancelled', 'shipped')).toThrow(/Invalid order status transition/);
  });

  it('enforces valid payment status transitions including authorized & refund_pending', () => {
    expect(canTransitionPaymentStatus('pending', 'authorized')).toBe(true);
    expect(canTransitionPaymentStatus('authorized', 'paid')).toBe(true);
    expect(canTransitionPaymentStatus('pending', 'paid')).toBe(true);
    expect(canTransitionPaymentStatus('paid', 'refund_pending')).toBe(true);
    expect(canTransitionPaymentStatus('refund_pending', 'partially_refunded')).toBe(true);
    expect(canTransitionPaymentStatus('paid', 'partially_refunded')).toBe(true);
    expect(canTransitionPaymentStatus('partially_refunded', 'refunded')).toBe(true);

    expect(canTransitionPaymentStatus('paid', 'failed')).toBe(false);
    expect(canTransitionPaymentStatus('refunded', 'paid')).toBe(false);
    expect(() => assertPaymentTransition('paid', 'pending')).toThrow(/Invalid payment status transition/);
  });

  it('enforces monotonic shipment status transitions and blocks terminal regressions', () => {
    expect(canTransitionShipmentStatus('created', 'awb_assigned')).toBe(true);
    expect(canTransitionShipmentStatus('awb_assigned', 'pickup_scheduled')).toBe(true);
    expect(canTransitionShipmentStatus('pickup_scheduled', 'in_transit')).toBe(true);
    expect(canTransitionShipmentStatus('in_transit', 'out_for_delivery')).toBe(true);
    expect(canTransitionShipmentStatus('out_for_delivery', 'delivered')).toBe(true);
    expect(canTransitionShipmentStatus('in_transit', 'rto_initiated')).toBe(true);
    expect(canTransitionShipmentStatus('rto_initiated', 'rto_delivered')).toBe(true);

    // Terminal states must never regress on out-of-order webhooks
    expect(canTransitionShipmentStatus('delivered', 'in_transit')).toBe(false);
    expect(canTransitionShipmentStatus('delivered', 'cancelled')).toBe(false);
    expect(canTransitionShipmentStatus('cancelled', 'in_transit')).toBe(false);
    expect(canTransitionShipmentStatus('rto_delivered', 'in_transit')).toBe(false);
  });

  it('evaluates shipment eligibility strictly (blocks unpaid prepaid, cancelled, delivered)', () => {
    // Eligible: paid Razorpay order
    expect(
      evaluateShipmentEligibility({
        status: 'confirmed',
        payment_method: 'razorpay',
        payment_status: 'paid',
      }).eligible
    ).toBe(true);

    // Eligible: COD confirmed order
    expect(
      evaluateShipmentEligibility({
        status: 'confirmed',
        payment_method: 'cod',
        payment_status: 'pending',
      }).eligible
    ).toBe(true);

    // Blocked: unpaid prepaid Razorpay order
    const unpaid = evaluateShipmentEligibility({
      status: 'pending',
      payment_method: 'razorpay',
      payment_status: 'pending',
    });
    expect(unpaid.eligible).toBe(false);
    expect(unpaid.reason).toMatch(/paid/i);

    // Blocked: authorized but not yet captured Razorpay order
    const authOnly = evaluateShipmentEligibility({
      status: 'pending',
      payment_method: 'razorpay',
      payment_status: 'authorized',
    });
    expect(authOnly.eligible).toBe(false);

    // Blocked: cancelled order
    const cancelled = evaluateShipmentEligibility({
      status: 'cancelled',
      payment_method: 'razorpay',
      payment_status: 'paid',
    });
    expect(cancelled.eligible).toBe(false);

    // Blocked: already delivered order
    const delivered = evaluateShipmentEligibility({
      status: 'delivered',
      payment_method: 'cod',
      payment_status: 'paid',
    });
    expect(delivered.eligible).toBe(false);
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

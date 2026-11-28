/**
 * Order, Payment, Return & Shipment Status Transition State Machines
 * Matches PostgreSQL CHECK constraints in 20261116_production_hardening.sql
 * and 20261126_razorpay_shiprocket_production.sql.
 */

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_failed'
  | 'rto'
  | 'returned'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'refund_pending'
  | 'partially_refunded'
  | 'refunded';

export type ShipmentStatus =
  | 'created'
  | 'awb_assigned'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_failed'
  | 'rto_initiated'
  | 'rto_in_transit'
  | 'rto_delivered'
  | 'cancelled'
  | 'lost'
  | 'damaged';

export const ALLOWED_ORDER_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'processing', 'cancelled'],
  confirmed: ['processing', 'shipped', 'out_for_delivery', 'delivered', 'delivery_failed', 'rto', 'cancelled', 'returned'],
  processing: ['shipped', 'out_for_delivery', 'delivered', 'delivery_failed', 'rto', 'returned', 'cancelled'],
  shipped: ['out_for_delivery', 'delivered', 'delivery_failed', 'rto', 'returned'],
  out_for_delivery: ['delivered', 'delivery_failed', 'rto', 'returned'],
  delivery_failed: ['shipped', 'out_for_delivery', 'rto', 'delivered', 'returned', 'cancelled'],
  rto: ['returned', 'cancelled'],
  delivered: ['returned'],
  returned: [],
  cancelled: [],
};

export const ALLOWED_PAYMENT_TRANSITIONS: Record<string, string[]> = {
  pending: ['authorized', 'paid', 'failed', 'refunded'],
  authorized: ['paid', 'failed', 'refund_pending', 'refunded'],
  paid: ['refund_pending', 'partially_refunded', 'refunded'],
  failed: ['pending', 'authorized', 'paid'],
  refund_pending: ['partially_refunded', 'refunded', 'paid'],
  partially_refunded: ['refund_pending', 'partially_refunded', 'refunded'],
  refunded: [],
};

/**
 * Monotonic progression rank for shipment tracking events.
 * Prevents stale or out-of-order courier webhooks from regressing advanced shipment states.
 */
const SHIPMENT_STAGE_RANK: Record<ShipmentStatus, number> = {
  created: 10,
  awb_assigned: 20,
  pickup_scheduled: 30,
  picked_up: 40,
  in_transit: 50,
  out_for_delivery: 60,
  delivery_failed: 65,
  rto_initiated: 70,
  rto_in_transit: 75,
  rto_delivered: 90,
  delivered: 100,
  lost: 95,
  damaged: 95,
  cancelled: 100,
};

export function canTransitionOrderStatus(fromStatus: string, toStatus: string): boolean {
  const from = (fromStatus || '').toLowerCase();
  const to = (toStatus || '').toLowerCase();
  if (!from || !to) return false;
  if (from === to) return true;
  const allowed = ALLOWED_ORDER_TRANSITIONS[from];
  return Array.isArray(allowed) ? allowed.includes(to) : false;
}

export function assertOrderTransition(fromStatus: string, toStatus: string): void {
  if (!canTransitionOrderStatus(fromStatus, toStatus)) {
    throw new Error(`Invalid order status transition: ${fromStatus} -> ${toStatus}`);
  }
}

export function canTransitionPaymentStatus(fromStatus: string, toStatus: string): boolean {
  const from = (fromStatus || '').toLowerCase();
  const to = (toStatus || '').toLowerCase();
  if (!from || !to) return false;
  if (from === to) return true;
  const allowed = ALLOWED_PAYMENT_TRANSITIONS[from];
  return Array.isArray(allowed) ? allowed.includes(to) : false;
}

export function assertPaymentTransition(fromStatus: string, toStatus: string): void {
  if (!canTransitionPaymentStatus(fromStatus, toStatus)) {
    throw new Error(`Invalid payment status transition: ${fromStatus} -> ${toStatus}`);
  }
}

export function canTransitionShipmentStatus(fromStatus: string, toStatus: string): boolean {
  const from = (fromStatus || '').toLowerCase() as ShipmentStatus;
  const to = (toStatus || '').toLowerCase() as ShipmentStatus;
  if (!(from in SHIPMENT_STAGE_RANK) || !(to in SHIPMENT_STAGE_RANK)) return false;
  if (from === to) return true;
  // Terminal states cannot be reverted
  if (from === 'delivered' || from === 'rto_delivered' || from === 'cancelled') {
    return false;
  }
  // Allow redelivery / re-routing attempts (delivery_failed -> in_transit / out_for_delivery -> delivered or rto)
  if (
    from === 'delivery_failed' &&
    (to === 'in_transit' || to === 'out_for_delivery' || to === 'delivered' || to === 'rto_initiated' || to === 'rto_in_transit' || to === 'rto_delivered')
  ) {
    return true;
  }
  return SHIPMENT_STAGE_RANK[to] >= SHIPMENT_STAGE_RANK[from];
}

export function canCustomerCancelOrder(status: string): boolean {
  const s = (status || '').toLowerCase();
  return s === 'pending' || s === 'confirmed' || s === 'processing';
}

/**
 * Determines whether an order is eligible to have a Shiprocket shipment/AWB created.
 * Enforces payment/order separation: unpaid prepaid orders and cancelled/delivered orders are rejected.
 */
export function evaluateShipmentEligibility(order: {
  status: string;
  payment_method: string | null;
  payment_status: string;
}): { eligible: boolean; reason?: string } {
  const orderStatus = (order.status || '').toLowerCase();
  const paymentMethod = (order.payment_method || '').toLowerCase();
  const paymentStatus = (order.payment_status || '').toLowerCase();

  if (orderStatus === 'cancelled') {
    return { eligible: false, reason: 'Cancelled orders cannot be dispatched.' };
  }
  if (orderStatus === 'delivered' || orderStatus === 'returned' || orderStatus === 'rto') {
    return { eligible: false, reason: `Orders in "${orderStatus}" status cannot be re-dispatched.` };
  }
  if (paymentMethod !== 'cod') {
    if (paymentStatus !== 'paid') {
      return {
        eligible: false,
        reason: `Prepaid order payment is "${paymentStatus}" (must be "paid" before shipment creation).`,
      };
    }
  } else if (orderStatus === 'pending') {
    return {
      eligible: false,
      reason: 'COD order must be confirmed before dispatch.',
    };
  }
  return { eligible: true };
}

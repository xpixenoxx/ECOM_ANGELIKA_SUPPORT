/**
 * Order, Payment & Return Status Transition State Machines
 * Matches PostgreSQL CHECK constraints in 20261116_production_hardening.sql.
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
  | 'paid'
  | 'failed'
  | 'partially_refunded'
  | 'refunded';

export const ALLOWED_ORDER_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'processing', 'cancelled'],
  confirmed: ['processing', 'shipped', 'cancelled', 'returned'],
  processing: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'delivered', 'delivery_failed', 'rto', 'returned'],
  out_for_delivery: ['delivered', 'delivery_failed', 'rto', 'returned'],
  delivery_failed: ['out_for_delivery', 'rto', 'delivered', 'cancelled'],
  rto: ['returned', 'cancelled'],
  delivered: ['returned'],
  returned: [],
  cancelled: [],
};

export const ALLOWED_PAYMENT_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'failed', 'refunded'],
  paid: ['partially_refunded', 'refunded'],
  failed: ['pending', 'paid'],
  partially_refunded: ['partially_refunded', 'refunded'],
  refunded: [],
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

export function canCustomerCancelOrder(status: string): boolean {
  const s = (status || '').toLowerCase();
  return s === 'pending' || s === 'confirmed' || s === 'processing';
}

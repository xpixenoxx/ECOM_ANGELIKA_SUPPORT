'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getOrderById, convertGuestToAccount } from '@/lib/actions/checkout';
import { reconcileCustomerOrderPayment } from '@/lib/actions/payments';
import { formatINR } from '@/lib/utils/currency';

function formatPaymentMethodLabel(method?: string | null): string {
  const m = (method || '').toLowerCase();
  if (m === 'cod') return 'Cash on Delivery (COD)';
  if (m === 'razorpay') return 'Razorpay Online Payment';
  if (m === 'stripe') return 'Card Payment (Stripe)';
  return 'Online Payment';
}

function formatFulfillmentStatus(status?: string | null): string {
  const s = (status || 'pending').toLowerCase();
  const labels: Record<string, string> = {
    pending: 'Awaiting Confirmation',
    confirmed: 'Order Confirmed',
    processing: 'Preparing for Shipment',
    shipped: 'Dispatched via Courier',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    delivery_failed: 'Delivery Attempt Pending',
    rto: 'Returning to Atelier',
    returned: 'Returned',
    cancelled: 'Cancelled',
  };
  return labels[s] || s.replace(/_/g, ' ');
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const receiptToken = searchParams.get('token');
  const verifyingParam = searchParams.get('verifying') === '1';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [reconcileNotice, setReconcileNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedTrackLink, setCopiedTrackLink] = useState(false);

  // Guest-to-Account activation state
  const [accountPassword, setAccountPassword] = useState('');
  const [accountSubmitting, setAccountSubmitting] = useState(false);
  const [accountStatus, setAccountStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const clearGuestCart = useCallback(() => {
    try {
      localStorage.removeItem('guest_cart');
      localStorage.setItem('cart_count', '0');
      window.dispatchEvent(
        new CustomEvent('cart:updated', { detail: { items: [], totals: { itemCount: 0, total: 0 } } })
      );
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return null;
    }
    try {
      const data = await getOrderById(orderId, receiptToken);
      setOrder(data || null);
      if (data) {
        const isConfirmed =
          data.payment_method === 'cod'
            ? data.status !== 'cancelled'
            : data.payment_status === 'paid';
        if (isConfirmed) {
          clearGuestCart();
        }
      }
      return data;
    } catch (err) {
      console.error('Failed to load order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [orderId, receiptToken, clearGuestCart]);

  const handleCheckPaymentStatus = useCallback(async () => {
    if (!orderId || reconciling) return;
    setReconciling(true);
    setReconcileNotice(null);
    try {
      const res = await reconcileCustomerOrderPayment(orderId, receiptToken);
      if (res.message) {
        setReconcileNotice(res.message);
      } else if (res.error) {
        setReconcileNotice(res.error);
      }
      await loadOrder();
    } finally {
      setReconciling(false);
    }
  }, [orderId, receiptToken, reconciling, loadOrder]);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function init() {
      const initial = await loadOrder();
      if (!active || !initial || !orderId) return;

      const needsReconcile =
        initial.payment_method !== 'cod' &&
        (initial.payment_status === 'pending' || initial.payment_status === 'authorized');

      if (needsReconcile) {
        // Attempt gentle server-side gateway reconciliation automatically without forcing a duplicate payment
        let attempts = 0;
        const poll = async () => {
          if (!active || attempts >= 4) return;
          attempts += 1;
          setReconciling(true);
          try {
            const res = await reconcileCustomerOrderPayment(orderId, receiptToken);
            const refreshed = await loadOrder();
            if (!active) return;
            if (
              refreshed &&
              (refreshed.payment_status === 'paid' ||
                refreshed.payment_status === 'failed' ||
                refreshed.status === 'cancelled')
            ) {
              setReconciling(false);
              return;
            }
            if (res.message) setReconcileNotice(res.message);
          } finally {
            if (active) setReconciling(false);
          }
          if (active && attempts < 4) {
            timer = setTimeout(poll, 3500);
          }
        };
        timer = setTimeout(poll, verifyingParam ? 800 : 1500);
      }
    }

    init();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, receiptToken, verifyingParam, loadOrder]);

  const copyOrderId = () => {
    const idToCopy = order?.order_number || orderId;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountPassword || accountPassword.length < 8) {
      setAccountStatus({ type: 'error', message: 'Password must be at least 8 characters long.' });
      return;
    }
    const emailToUse = order?.email || order?.shipping_address?.email;
    if (!emailToUse || !orderId) {
      setAccountStatus({ type: 'error', message: 'Missing order contact email.' });
      return;
    }

    setAccountSubmitting(true);
    setAccountStatus(null);
    try {
      const res = await convertGuestToAccount({
        orderId,
        email: emailToUse,
        password: accountPassword,
        receiptToken,
      });

      if (res.success) {
        setAccountStatus({
          type: 'success',
          message: 'Your Angelika Fashions account is active and linked to this order. You can sign in anytime to track orders.',
        });
      } else {
        setAccountStatus({ type: 'error', message: res.error || 'Failed to activate account.' });
      }
    } catch {
      setAccountStatus({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setAccountSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-snow)] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-slate)]">Verifying your order status...</p>
      </div>
    );
  }

  // Missing / Invalid / Unauthorized order -> NEVER claim confirmation
  if (!orderId || !order) {
    return (
      <div className="min-h-screen bg-[var(--color-snow)] py-16 px-4">
        <div className="max-w-lg mx-auto text-center bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-2xl p-8 shadow-sm space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)] font-bold">
            Order Lookup Required
          </p>
          <h1 className="text-2xl font-display font-medium text-[var(--color-ink)]">
            We Could Not Access This Receipt
          </h1>
          <p className="text-sm text-[var(--color-slate)] leading-relaxed">
            This receipt link may have expired, be missing its verification token, or belong to another account. You can check your live order status using your Order Number and registered email or phone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button variant="primary" asChild>
              <Link href="/track-order">Track Order</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/account/orders">Sign In to My Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isCod = (order.payment_method || '').toLowerCase() === 'cod';
  const isStockConflictRefund = Boolean(order.metadata?.stock_conflict);
  const isPaymentConfirmed = isCod
    ? order.status !== 'cancelled'
    : !isStockConflictRefund &&
      order.status !== 'cancelled' &&
      (order.payment_status === 'paid' ||
        order.payment_status === 'partially_refunded' ||
        order.payment_status === 'refunded');
  const isPaymentPending =
    !isCod &&
    order.status !== 'cancelled' &&
    (order.payment_status === 'pending' || order.payment_status === 'authorized');
  const isPaymentFailedOrCancelled =
    order.status === 'cancelled' || order.payment_status === 'failed' || isStockConflictRefund;

  const orderNumber = order.order_number || orderId;
  const customerName = order.shipping_address?.firstName
    ? `${order.shipping_address.firstName} ${order.shipping_address.lastName || ''}`.trim()
    : 'Valued Patron';
  const displayTotal = order.total_amount !== undefined ? formatINR(order.total_amount) : null;
  const shippingCost = Number(order.shipping_cost || 0);
  const razorpayPaymentId = order.metadata?.razorpay_payment_id as string | undefined;

  const directTrackPath = `/track-order?order=${encodeURIComponent(orderNumber)}${
    receiptToken ? `&token=${encodeURIComponent(receiptToken)}` : ''
  }`;
  const fullTrackUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${directTrackPath}`
      : `https://angelikafashions.com${directTrackPath}`;

  const copyTrackingLink = () => {
    navigator.clipboard.writeText(fullTrackUrl);
    setCopiedTrackLink(true);
    setTimeout(() => setCopiedTrackLink(false), 2500);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Angelika Atelier Concierge, I placed order ${orderNumber} (${isCod ? 'COD' : 'Prepaid'}). Customer: ${customerName}. Tracking link: ${fullTrackUrl}`
  );

  // STATE 1: PAYMENT VERIFICATION PENDING (NEVER SHOW FALSE "ORDER CONFIRMED")
  if (isPaymentPending) {
    return (
      <div className="min-h-screen bg-[var(--color-snow)] py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <Card variant="elevated" padding="lg" className="bg-[var(--color-white)] border-amber-200 shadow-sm text-center">
            <CardContent className="p-8 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border border-amber-300 flex items-center justify-center">
                <div className="w-7 h-7 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-amber-700 font-bold">
                  Payment Verification In Progress
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-medium text-[var(--color-ink)] mt-2">
                  Confirming Payment for #{orderNumber}
                </h1>
                <p className="text-sm text-[var(--color-slate)] mt-2 leading-relaxed">
                  We are confirming your Razorpay payment status with the bank.{' '}
                  <strong className="text-[var(--color-ink)]">Please do not pay again</strong> while verification completes — if your payment succeeded, your order will update automatically.
                </p>
              </div>

              {reconcileNotice && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  {reconcileNotice}
                </div>
              )}

              <div className="p-4 rounded-xl bg-[var(--color-snow)] border border-[var(--color-whisper)] text-xs text-left space-y-1">
                <p><strong>Order Reference:</strong> <span className="font-mono">{orderNumber}</span></p>
                <p><strong>Payment Method:</strong> {formatPaymentMethodLabel(order.payment_method)}</p>
                <p><strong>Current Payment Status:</strong> <span className="capitalize font-semibold text-amber-700">{order.payment_status}</span></p>
                {displayTotal && <p><strong>Order Total:</strong> {displayTotal}</p>}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  variant="primary"
                  onClick={handleCheckPaymentStatus}
                  disabled={reconciling}
                >
                  {reconciling ? 'Checking with Razorpay...' : 'Refresh Verification Status'}
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/track-order">Track Order Later</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // STATE 2: PAYMENT FAILED OR ORDER CANCELLED (NEVER SHOW FALSE "ORDER CONFIRMED")
  if (isPaymentFailedOrCancelled && !isPaymentConfirmed) {
    return (
      <div className="min-h-screen bg-[var(--color-snow)] py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <Card variant="elevated" padding="lg" className="bg-[var(--color-white)] border-rose-200 shadow-sm text-center">
            <CardContent className="p-8 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-2xl font-bold">
                !
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-rose-700 font-bold">
                  {isStockConflictRefund ? 'Automatic Refund Initiated' : 'Order Not Confirmed'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-medium text-[var(--color-ink)] mt-2">
                  {isStockConflictRefund
                    ? 'Item Sold Out While Payment Settled'
                    : 'Payment Could Not Be Completed'}
                </h1>
                <p className="text-sm text-[var(--color-slate)] mt-2 leading-relaxed">
                  {isStockConflictRefund ? (
                    <>
                      An item in order <strong className="font-mono text-[var(--color-ink)]">#{orderNumber}</strong> sold out during payment settlement. Your order was automatically cancelled and a full Razorpay refund has been initiated to your original payment method (typically reflected within 5–7 business days).
                    </>
                  ) : (
                    <>
                      Order <strong className="font-mono text-[var(--color-ink)]">#{orderNumber}</strong> was not confirmed
                      {order.cancel_reason ? ` (${order.cancel_reason})` : ''}. If any amount was debited by your bank, Razorpay automatically refunds unsuccessful transactions within 5–7 business days.
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button variant="primary" asChild>
                  <Link href="/checkout">Return to Checkout</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // STATE 3: VERIFIED CONFIRMED ORDER
  return (
    <div className="min-h-screen bg-[var(--color-snow)] py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Verified Confirmation Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 180, delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-[var(--color-gold-hover)] to-[var(--color-gold)] flex items-center justify-center shadow-xl shadow-[var(--color-gold)]/25 mb-6 relative print:hidden"
          >
            <svg
              className="w-10 h-10 text-[var(--color-ink)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)] font-bold">
            ✦ Order Confirmed
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-[var(--color-ink)] mt-2 mb-2">
            Thank You, {customerName}
          </h1>
          <p className="text-[var(--color-slate)] max-w-lg mx-auto text-sm sm:text-base mb-8">
            Your order has been verified and registered in our atelier queue. Order confirmation details are recorded for{' '}
            <strong className="text-[var(--color-ink)] font-semibold">{order.email}</strong>.
          </p>

          {/* Order Reference Pill */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[var(--color-white)] border border-[var(--color-gold)]/40 rounded-full shadow-sm mb-5 text-sm">
            <span className="text-xs uppercase tracking-wider text-[var(--color-slate)] font-semibold">
              Order Reference:
            </span>
            <span className="font-mono font-bold text-[var(--color-ink)] tracking-wider">
              {orderNumber}
            </span>
            <button
              onClick={copyOrderId}
              type="button"
              className="px-2 py-0.5 rounded text-xs font-semibold bg-[var(--color-gold-light)]/60 text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)] transition-colors"
              title="Copy Reference Number"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {/* Direct 1-Click Live Tracking Link Card (works for both Prepaid & COD, with or without login) */}
          <div className="mb-8 print:hidden">
            <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-white)] border border-[var(--color-whisper)] shadow-xs text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
                  ✦ Save Your Live Tracking Link
                </p>
                <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                  Bookmark or copy this private link to check live preparation, payment, and courier status anytime — no login required. You can also visit <strong className="text-[var(--color-ink)]">/track-order</strong> anytime with <strong className="font-mono text-[var(--color-ink)]">{orderNumber}</strong> and your phone or email.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={copyTrackingLink}
                  className="px-3.5 py-2 rounded-lg border border-[var(--color-gold)]/40 bg-[var(--color-gold-light)]/20 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-gold)] hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                >
                  {copiedTrackLink ? '✓ Link Copied' : 'Copy Tracking Link'}
                </button>
                <Link
                  href={directTrackPath}
                  className="px-3.5 py-2 rounded-lg bg-[var(--color-ink)] text-white text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Open Tracker →
                </Link>
              </div>
            </div>
          </div>

          {/* Smart Returning Customer vs First-Time Guest Account Card */}
          {!order.user_id && order.hasExistingAccount && (
            <div className="mb-8 print:hidden">
              <Card variant="elevated" padding="lg" className="border-[var(--color-gold)]/40 bg-gradient-to-br from-[var(--color-white)] to-[var(--color-gold-light)]/15 text-left shadow-sm">
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[var(--color-gold)] text-[var(--color-ink)] text-[10px] font-bold uppercase rounded-full mb-2">
                      ✦ Existing Account Recognized
                    </div>
                    <h3 className="text-lg font-display font-semibold text-[var(--color-ink)]">
                      Welcome Back — This Order Is Matched to Your Email
                    </h3>
                    <p className="text-xs text-[var(--color-slate)] mt-1">
                      You already have an Angelika Fashions account under <strong className="text-[var(--color-ink)]">{order.email}</strong>. Sign in anytime to view all your past &amp; new Prepaid and COD orders together in <strong>My Orders</strong> — no need to register again.
                    </p>
                  </div>
                  <Button variant="primary" asChild className="flex-shrink-0 px-5 text-xs">
                    <Link href="/login?redirect=/account/orders">Sign In to My Orders</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 1-Click Guest Account Activation Card (ONLY for first-time guest orders without an account!) */}
          {!order.user_id && !order.hasExistingAccount && accountStatus?.type !== 'success' && (
            <div className="mb-8 print:hidden">
              <Card variant="elevated" padding="lg" className="border-[var(--color-gold)]/40 bg-gradient-to-br from-[var(--color-white)] to-[var(--color-gold-light)]/15 text-left shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[var(--color-gold)] text-[var(--color-ink)] text-[10px] font-bold uppercase rounded-full mb-2">
                      ✦ Guest Order Account Setup
                    </div>
                    <h3 className="text-lg font-display font-semibold text-[var(--color-ink)]">
                      Save Your Account to Track This Order Easily
                    </h3>
                    <p className="text-xs text-[var(--color-slate)] mt-1">
                      Set a password to link order #{orderNumber} to your personal Angelika Fashions dashboard for real-time tracking, invoices, and returns.
                    </p>
                  </div>

                  {accountStatus && (
                    <div className="mb-3 p-3 rounded-[var(--radius-md)] text-xs font-medium bg-red-50 border border-red-200 text-red-700">
                      {accountStatus.message}
                    </div>
                  )}

                  <form onSubmit={handleCreateAccount} className="space-y-3 pt-1">
                    <div className="grid sm:grid-cols-3 gap-3 items-end">
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-slate)] block mb-1">
                          Account Email
                        </label>
                        <input
                          type="text"
                          value={order.email || ''}
                          disabled
                          className="w-full px-3 py-2 bg-[var(--color-whisper)]/60 border border-[var(--color-whisper)] rounded-[var(--radius-md)] text-xs text-[var(--color-slate)] cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-slate)] block mb-1">
                          Set a Password *
                        </label>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          enterKeyHint="done"
                          value={accountPassword}
                          onChange={(e) => setAccountPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="text-xs py-2"
                          required
                          minLength={8}
                        />
                      </div>
                      <div>
                        <Button
                          type="submit"
                          variant="primary"
                          className="w-full py-2.5 text-xs font-semibold"
                          disabled={accountSubmitting}
                        >
                          {accountSubmitting ? 'Activating...' : 'Create Account'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {accountStatus?.type === 'success' && (
            <div className="mb-8 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium print:hidden">
              {accountStatus.message}
            </div>
          )}

          {/* Full Order & Garment Breakdown Card */}
          <Card variant="elevated" padding="lg" className="text-left mb-8 shadow-sm bg-[var(--color-white)]">
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-[var(--color-whisper)] gap-3">
                <div>
                  <span className="text-xs text-[var(--color-slate)] uppercase tracking-wider block font-medium">
                    Order Reference
                  </span>
                  <span className="font-mono text-base font-semibold text-[var(--color-ink)] mt-0.5 block">
                    {orderNumber}
                  </span>
                  <span className="text-xs text-[var(--color-slate)] block mt-0.5">
                    Payment Method:{' '}
                    <strong className="text-[var(--color-ink)]">
                      {formatPaymentMethodLabel(order.payment_method)}
                    </strong>
                  </span>
                  {razorpayPaymentId && (
                    <span className="text-[11px] text-[var(--color-slate)] block mt-0.5">
                      Transaction ID: <span className="font-mono">{razorpayPaymentId}</span>
                    </span>
                  )}
                </div>

                {displayTotal && (
                  <div className="sm:text-right">
                    <span className="text-xs text-[var(--color-slate)] uppercase tracking-wider block font-medium">
                      {isCod ? 'Total Payable on Delivery' : 'Total Paid'}
                    </span>
                    <span className="text-2xl font-bold text-[var(--color-ink)] mt-0.5 block">
                      {displayTotal}
                    </span>
                    <span className="text-[11px] text-[#137333] font-semibold">
                      GST Inclusive • {shippingCost > 0 ? `Shipping ${formatINR(shippingCost)}` : 'Free Shipping'}
                    </span>
                  </div>
                )}
              </div>

              {/* Destination & Contact Information */}
              {order.shipping_address && (
                <div className="grid sm:grid-cols-2 gap-4 pb-6 border-b border-[var(--color-whisper)] text-xs">
                  <div>
                    <h5 className="font-bold uppercase tracking-wider text-[var(--color-gold)] mb-1.5">
                      Shipping Destination
                    </h5>
                    <p className="font-semibold text-sm text-[var(--color-ink)]">
                      {order.shipping_address.firstName} {order.shipping_address.lastName}
                    </p>
                    <p className="text-[var(--color-slate)] mt-0.5">
                      {order.shipping_address.address1}
                      {order.shipping_address.address2 ? `, ${order.shipping_address.address2}` : ''}
                    </p>
                    <p className="text-[var(--color-slate)]">
                      {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.postalCode}
                    </p>
                    <p className="text-[var(--color-slate)] mt-1">India</p>
                  </div>
                  <div>
                    <h5 className="font-bold uppercase tracking-wider text-[var(--color-gold)] mb-1.5">
                      Contact Details
                    </h5>
                    <p className="text-[var(--color-slate)]">
                      Phone: <strong className="text-[var(--color-ink)]">+91 {order.phone || order.shipping_address.phone}</strong>
                    </p>
                    <p className="text-[var(--color-slate)] mt-0.5">
                      Email: <strong className="text-[var(--color-ink)]">{order.email}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Order items list */}
              {order.order_items && order.order_items.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-slate)]">
                    Purchased Pieces ({order.order_items.length})
                  </h4>
                  <div className="divide-y divide-[var(--color-whisper)]">
                    {order.order_items.map((item: any) => {
                      const image = item.variant_details?.image || item.image;
                      const size = item.variant_details?.size || item.size;
                      const color = item.variant_details?.color || item.color;
                      const price = item.total_price || item.unit_price * item.quantity;
                      return (
                        <div key={item.id} className="py-3 flex items-center justify-between text-sm gap-4">
                          <div className="flex items-center gap-3">
                            {image && (
                              <img
                                src={image}
                                alt={item.product_name}
                                className="w-14 h-16 object-cover rounded-[var(--radius-md)] bg-[var(--color-whisper)] flex-shrink-0"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-[var(--color-ink)]">{item.product_name}</p>
                              <div className="flex items-center gap-2 text-xs text-[var(--color-slate)] mt-0.5">
                                <span>Qty: {item.quantity}</span>
                                {size && <span>• Size: {size}</span>}
                                {color && <span>• Color: {color}</span>}
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-[var(--color-ink)]">
                            {formatINR(price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Summary line (accurate verified statuses only) */}
              <div className="pt-4 border-t border-[var(--color-whisper)] flex flex-wrap items-center justify-between text-xs text-[var(--color-slate)] gap-2">
                <span>
                  Payment Status:{' '}
                  <strong className="capitalize text-[var(--color-gold)] font-bold">
                    {order.payment_status}
                  </strong>
                </span>
                <span>
                  Order Status:{' '}
                  <strong className="text-[var(--color-ink)]">
                    {formatFulfillmentStatus(order.status)}
                  </strong>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden">
            <Button variant="primary" asChild className="w-full sm:w-auto px-8 shadow-md">
              <Link href={directTrackPath}>Track Order Live</Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto px-6 text-xs">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
            <a
              href={`https://wa.me/917207256690?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[var(--radius-md)] bg-[#25D366] text-white font-semibold text-xs hover:bg-[#1ebe5b] transition-colors shadow-sm"
            >
              WhatsApp Concierge
            </a>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 text-xs"
            >
              Print Receipt
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-snow)] flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}

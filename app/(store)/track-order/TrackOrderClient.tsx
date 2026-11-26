'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { trackOrderPublic, type PublicTrackedOrder } from '@/lib/actions/customer-orders';

interface TrackOrderClientProps {
  whatsappNumber?: string;
  initialOrderNumber?: string;
  initialToken?: string;
}

const ORDERED_STAGES = [
  {
    key: 'pending',
    title: 'Order Received & Awaiting Atelier Confirmation',
    description: 'Your bespoke order details have been logged in our atelier queue.',
  },
  {
    key: 'confirmed',
    title: 'Order Confirmed & Handcrafted Quality Check',
    description: 'Verified by master drapers, inspected for fabric & embroidery excellence.',
  },
  {
    key: 'processing',
    title: 'Handcrafted Finishing & Packaging',
    description: 'Steamed, Silk Mark verified & packed in our signature heirloom keepsake box.',
  },
  {
    key: 'shipped',
    title: 'Dispatched from Atelier Hub',
    description: 'Handed over to insured courier partner with airway bill tracking.',
  },
  {
    key: 'out_for_delivery',
    title: 'Out for Delivery',
    description: 'Courier associate is en route and will coordinate delivery.',
  },
  {
    key: 'delivered',
    title: 'Delivered',
    description: 'Package delivered to the destination address.',
  },
] as const;

const STAGE_INDEX_MAP: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  out_for_delivery: 4,
  delivered: 5,
};

const EXCEPTION_STATUS_INFO: Record<string, { label: string; description: string; badgeClass: string }> = {
  cancelled: {
    label: 'Order Cancelled',
    description: 'This order has been cancelled. Any eligible prepaid refund is processed back to the original payment method.',
    badgeClass: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
  },
  delivery_failed: {
    label: 'Delivery Attempt Unsuccessful',
    description: 'Our courier partner attempted delivery. Please contact concierge or courier support to reschedule.',
    badgeClass: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
  },
  rto: {
    label: 'Return to Origin (RTO)',
    description: 'Shipment is returning to our atelier hub after unsuccessful delivery attempts.',
    badgeClass: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
  },
  returned: {
    label: 'Returned to Atelier',
    description: 'Returned shipment has been logged by our returns desk.',
    badgeClass: 'bg-[#F3F4F6] text-[#374151] border-[#D1D5DB]',
  },
};

function formatStatusBadge(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function formatPaymentSummary(order: PublicTrackedOrder): { label: string; detail: string; badgeClass: string } {
  const method = (order.payment_method || '').toLowerCase();
  const status = (order.payment_status || 'pending').toLowerCase();
  const amountText = `₹${Number(order.total_amount || 0).toLocaleString('en-IN')}`;

  if (method === 'cod') {
    return {
      label: 'Cash on Delivery (COD)',
      detail:
        status === 'paid'
          ? `Collected (${amountText})`
          : `${amountText} payable on delivery`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }

  if (status === 'paid') {
    return {
      label: 'Prepaid (Razorpay)',
      detail: `Paid ${amountText}`,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }
  if (status === 'refunded' || status === 'partially_refunded' || status === 'refund_pending') {
    return {
      label: 'Prepaid (Razorpay)',
      detail: formatStatusBadge(status),
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    };
  }
  if (status === 'failed') {
    return {
      label: 'Prepaid (Razorpay)',
      detail: 'Payment Failed',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    };
  }
  return {
    label: 'Prepaid (Razorpay)',
    detail: status === 'authorized' ? 'Payment Authorized (Settling)' : 'Payment Verification Pending',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  };
}

export function TrackOrderClient({
  whatsappNumber,
  initialOrderNumber = '',
  initialToken = '',
}: TrackOrderClientProps) {
  const [orderId, setOrderId] = useState(initialOrderNumber);
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<PublicTrackedOrder | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(initialOrderNumber && initialToken));

  // Auto-load 1-click signed tracking links (?order=ORD-...&token=...) cleanly
  useEffect(() => {
    if (!initialOrderNumber || !initialToken) return;
    let active = true;
    setLoading(true);
    setLookupError(null);
    trackOrderPublic({
      orderNumber: initialOrderNumber,
      receiptToken: initialToken,
    })
      .then((result) => {
        if (!active) return;
        if (result.success && result.order) {
          setTrackedOrder(result.order);
        } else {
          setLookupError(
            'Enter your registered email or 10-digit phone number below to verify and view this order.'
          );
        }
      })
      .catch(() => {
        if (active) {
          setLookupError('Unable to auto-load tracking link. Please verify with your phone or email below.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialOrderNumber, initialToken]);

  const cleanWhatsapp = (whatsappNumber || '').replace(/[^0-9]/g, '');
  const whatsappInquiryUrl = cleanWhatsapp.length >= 8
    ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
        `Hi Vidhya, I need tracking assistance for Order #${trackedOrder?.order_number || orderId || 'my recent order'}`
      )}`
    : null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOrder = orderId.trim();
    const cleanContact = phoneOrEmail.trim();
    if (!cleanOrder || !cleanContact) {
      setLookupError('Please enter both your Order Number and Email or 10-digit Phone Number.');
      return;
    }

    setLoading(true);
    setLookupError(null);
    setTrackedOrder(null);

    try {
      const result = await trackOrderPublic({
        orderNumber: cleanOrder,
        contact: cleanContact,
      });

      if (!result.success || !result.order) {
        setLookupError(
          result.error || 'No matching order found. Please verify your Order Number and contact details.'
        );
      } else {
        setTrackedOrder(result.order);
      }
    } catch {
      setLookupError('Unable to retrieve tracking details right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  const activeStageIndex = trackedOrder ? (STAGE_INDEX_MAP[trackedOrder.status] ?? -1) : -1;
  const exceptionInfo = trackedOrder ? EXCEPTION_STATUS_INFO[trackedOrder.status] : undefined;
  const paymentSummary = trackedOrder ? formatPaymentSummary(trackedOrder) : null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <nav className="text-xs text-[var(--color-slate)] mb-3 flex items-center justify-center gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-medium">Track Order</span>
          </nav>
          <span className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold-text)] block mb-1">
            Real-Time Courier &amp; Atelier Dispatch
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-ink)] font-normal tracking-tight">
            Track Your Order
          </h1>
          <p className="mt-2 text-sm text-[var(--color-slate)] max-w-lg mx-auto font-light leading-relaxed">
            Enter your Order ID and registered phone number or email address to check live preparation, payment, and courier status — works for both Prepaid and COD orders.
          </p>
        </div>

        <div className="bg-white border border-[#EAE4D9] rounded-2xl p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleTrack} name="track-order" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="orderId" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  Order ID / Reference *
                </label>
                <input
                  id="orderId"
                  name="orderId"
                  type="text"
                  required
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  enterKeyHint="next"
                  placeholder="e.g. ORD-MWXV9139-7003"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD5] text-sm text-[var(--color-ink)] placeholder-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-all bg-[#FCFAF7]"
                />
              </div>

              <div>
                <label htmlFor="phoneOrEmail" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  Phone Number or Email *
                </label>
                <input
                  id="phoneOrEmail"
                  name="phoneOrEmail"
                  type="text"
                  required
                  autoComplete="tel email"
                  inputMode="text"
                  spellCheck={false}
                  enterKeyHint="search"
                  placeholder="e.g. 9876543210 or you@example.com"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD5] text-sm text-[var(--color-ink)] placeholder-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-all bg-[#FCFAF7]"
                />
              </div>
            </div>

            {lookupError && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]"
              >
                {lookupError}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[var(--color-mist)]">
                Find your Order Number on your confirmation screen, email, or My Orders page.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[var(--color-ink)] hover:bg-[#25221E] text-white text-xs font-medium tracking-wide border border-[var(--color-gold)]/40 hover:border-[var(--color-gold)] transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Locating Order...' : 'Track Shipment Status'}
              </button>
            </div>
          </form>

          {trackedOrder && (
            <div className="mt-8 pt-8 border-t border-[#EAE4D9] space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#FCFAF7] border border-[#E5DECF]">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-gold)]">
                    Order Verified
                  </span>
                  <p className="font-serif text-lg text-[var(--color-ink)]">
                    Order #{trackedOrder.order_number}
                  </p>
                  {paymentSummary && (
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${paymentSummary.badgeClass}`}>
                        {paymentSummary.label} · {paymentSummary.detail}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-[var(--color-slate)] pt-0.5">
                    {trackedOrder.courier_partner
                      ? `Courier Partner: ${trackedOrder.courier_partner}`
                      : 'Courier assignment pending dispatch'}
                    {trackedOrder.tracking_number
                      ? ` · AWB #${trackedOrder.tracking_number}`
                      : ''}
                  </p>
                  {trackedOrder.etd && (
                    <p className="text-xs text-emerald-700 font-medium">
                      Estimated Delivery: {trackedOrder.etd}
                    </p>
                  )}
                  {(trackedOrder.destination_city || trackedOrder.destination_state) && (
                    <p className="text-xs text-[var(--color-mist)]">
                      Destination: {[trackedOrder.destination_city, trackedOrder.destination_state].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${
                      exceptionInfo
                        ? exceptionInfo.badgeClass
                        : 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        exceptionInfo ? 'bg-current' : 'bg-[#10B981]'
                      }`}
                    />
                    <span>{formatStatusBadge(trackedOrder.status)}</span>
                  </div>

                  {trackedOrder.tracking_url && (
                    <a
                      href={trackedOrder.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[var(--color-gold-hover)] underline hover:text-[var(--color-gold)]"
                    >
                      Open Live Carrier Tracking →
                    </a>
                  )}
                </div>
              </div>

              {exceptionInfo ? (
                <div className="p-4 rounded-xl border border-[#EAE4D9] bg-[#FAF8F5] space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                    {exceptionInfo.label}
                  </p>
                  <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                    {exceptionInfo.description}
                  </p>
                </div>
              ) : (
                <div className="space-y-6 pl-4 border-l-2 border-[#E5DFD5] ml-2">
                  {ORDERED_STAGES.map((stage, idx) => {
                    const completed = idx <= activeStageIndex;
                    const isCurrent = idx === activeStageIndex;
                    return (
                      <div key={stage.key} className={`relative ${completed ? '' : 'opacity-50'}`}>
                        <span
                          className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full ring-4 ring-[#FAF8F5] ${
                            completed
                              ? isCurrent
                                ? 'bg-[var(--color-gold)] animate-pulse'
                                : 'bg-[var(--color-gold)]'
                              : 'bg-[#E5DFD5]'
                          }`}
                        />
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                            {stage.title}
                          </p>
                          <p className="text-xs text-[var(--color-slate)]">{stage.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {Array.isArray(trackedOrder.scans) && trackedOrder.scans.length > 0 && (
                <div className="pt-4 border-t border-[#EAE4D9] space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                    Courier Scan Updates
                  </p>
                  <ul className="space-y-2">
                    {trackedOrder.scans.map((scan, idx) => (
                      <li key={idx} className="text-xs bg-[#FCFAF7] border border-[#EAE4D9] rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div>
                          <span className="font-medium text-[var(--color-ink)]">
                            {scan.activity || scan.status || 'Shipment Update'}
                          </span>
                          {scan.location && (
                            <span className="text-[var(--color-slate)]"> · {scan.location}</span>
                          )}
                        </div>
                        {scan.date && (
                          <span className="text-[11px] font-mono text-[var(--color-mist)] whitespace-nowrap">
                            {scan.date}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {trackedOrder.items.length > 0 && (
                <div className="pt-4 border-t border-[#EAE4D9] space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                    Items in Order ({trackedOrder.items.length})
                  </p>
                  <ul className="space-y-1.5">
                    {trackedOrder.items.map((item, idx) => (
                      <li key={idx} className="text-xs text-[var(--color-slate)] flex items-center justify-between">
                        <span>
                          {item.product_name}
                          {item.size ? ` · Size ${item.size}` : ''}
                          {item.color ? ` · ${item.color}` : ''}
                        </span>
                        <span className="font-medium text-[var(--color-ink)]">Qty {item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <span className="text-[var(--color-slate)]">
                  Need assistance with this shipment?
                </span>
                {whatsappInquiryUrl ? (
                  <a
                    href={whatsappInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--color-gold-hover)] hover:underline"
                  >
                    Message Vidhya&apos;s Concierge →
                  </a>
                ) : (
                  <Link
                    href="/contact"
                    className="font-medium text-[var(--color-gold-hover)] hover:underline"
                  >
                    Contact Concierge Support →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-[var(--color-slate)]">
            Ordered multiple times or want all your orders in one place?
          </p>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink)] hover:text-[var(--color-gold)] underline transition-colors"
          >
            Sign in with your checkout email to view all past Prepaid &amp; COD orders →
          </Link>
        </div>
      </div>
    </div>
  );
}

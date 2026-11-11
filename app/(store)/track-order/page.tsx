'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { trackOrderByIdAction } from '@/lib/actions/shiprocket-actions';
import { Truck, CheckCircle2, Clock, MapPin, Package, ExternalLink, AlertCircle, XCircle } from 'lucide-react';
import DeliveryVanTracker from '@/components/orders/DeliveryVanTracker';

interface TrackedOrder {
  id: string;
  order_number: string;
  status: string;
  courier_partner: string;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  shiprocket_status?: string | null;
  created_at: string;
  destination_city: string;
  destination_state: string;
}

interface ScanEvent {
  date: string;
  activity: string;
  location: string;
  status?: string;
}

export default function TrackOrderPage() {
  const [orderQuery, setOrderQuery] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<TrackedOrder | null>(null);
  const [scans, setScans] = useState<ScanEvent[]>([]);

  const performLookup = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await trackOrderByIdAction(query.trim());
      if (res.success && res.order) {
        setOrderData(res.order);
        setScans(res.liveScans || []);
        setSearched(true);
      } else {
        setErrorMsg(res.error || 'No matching order found for this reference.');
        setSearched(true);
        setOrderData(null);
        setScans([]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to retrieve tracking details right now.');
      setSearched(true);
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('order') || params.get('id') || params.get('awb');
      if (q && q.trim()) {
        setOrderQuery(q.trim());
        performLookup(q.trim());
      }
    }
  }, [performLookup]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLookup(orderQuery);
  };

  const whatsappInquiryUrl = `https://wa.me/919876543210?text=${encodeURIComponent(
    `Hi Vidhya, I would like live tracking updates for Order ${orderData?.order_number || orderQuery || 'ORD-xxx'}.`
  )}`;

  const statusLower = (orderData?.status || '').toLowerCase();
  const isCancelled = statusLower === 'cancelled';
  const isDelivered = statusLower === 'delivered';
  const isShipped = !isCancelled && (statusLower === 'shipped' || isDelivered || Boolean(orderData?.tracking_number));

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Header */}
        <div className="text-center mb-10">
          <nav className="text-xs text-[var(--color-slate)] mb-3 flex items-center justify-center gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-medium">Track Order</span>
          </nav>
          <span className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--color-gold)] block mb-1">
            Real-Time Courier &amp; Atelier Dispatch
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-ink)] font-normal tracking-tight">
            Track Your Order
          </h1>
          <p className="mt-2 text-sm text-[var(--color-slate)] max-w-lg mx-auto font-light leading-relaxed">
            Enter your Order Number (e.g. ORD-MWC4447Q-2328) or courier AWB tracking number to view real-time atelier preparation and live courier transit status.
          </p>
        </div>

        {/* Tracking Lookup Box */}
        <div className="bg-white border border-[#EAE4D9] rounded-2xl p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="orderQuery" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  Order ID or AWB Number *
                </label>
                <input
                  id="orderQuery"
                  type="text"
                  required
                  placeholder="e.g. ORD-MWC4447Q-2328"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD5] text-sm text-[var(--color-ink)] placeholder-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-all bg-[#FCFAF7]"
                />
              </div>

              <div>
                <label htmlFor="phoneOrEmail" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] mb-1.5">
                  Phone Number or Email (Optional)
                </label>
                <input
                  id="phoneOrEmail"
                  type="text"
                  placeholder="e.g. 9876543210 or you@example.com"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD5] text-sm text-[var(--color-ink)] placeholder-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-all bg-[#FCFAF7]"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[var(--color-mist)]">
                You can find your Order Number in your email confirmation or My Orders.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[var(--color-ink)] hover:bg-[#25221E] text-white text-xs font-medium tracking-wide border border-[var(--color-gold)]/40 hover:border-[var(--color-gold)] transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Locating Shipment...' : 'Track Shipment Status'}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {searched && errorMsg && (
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMsg}</p>
                <p className="text-amber-800/80 mt-0.5">
                  Please verify your Order Number (such as ORD-MWBWC14N-3218) or reach out to our concierge for assistance.
                </p>
              </div>
            </div>
          )}

          {/* Results Timeline View (When Order Found) */}
          {searched && orderData && (
            <div className="mt-8 pt-8 border-t border-[#EAE4D9] space-y-6">
              {/* Order Header Summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#FCFAF7] border border-[#E5DECF]">
                <div>
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-gold)]">
                    Verified Order Details
                  </span>
                  <p className="font-serif text-lg text-[var(--color-ink)] font-bold">
                    Order #{orderData.order_number}
                  </p>
                  <p className="text-xs text-[var(--color-slate)] mt-0.5">
                    Carrier Partner: <strong className="text-[var(--color-ink)]">{orderData.courier_partner}</strong>
                    {orderData.tracking_number && (
                      <span> &bull; AWB: <strong className="font-mono text-[var(--color-ink)]">{orderData.tracking_number}</strong></span>
                    )}
                  </p>
                  {orderData.destination_city && (
                    <p className="text-[11px] text-[var(--color-mist)] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[var(--color-gold)]" />
                      <span>Destination: {orderData.destination_city}{orderData.destination_state ? `, ${orderData.destination_state}` : ''}</span>
                    </p>
                  )}
                </div>

                <div>
                  {isCancelled ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-medium">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Order Cancelled</span>
                    </div>
                  ) : isDelivered ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Delivered</span>
                    </div>
                  ) : isShipped ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      <span>In Transit · On Schedule</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Order Confirmed · Preparing in Atelier</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Animated 3D Angelika Delivery Van Route */}
              <DeliveryVanTracker
                status={orderData.status}
                shiprocketStatus={orderData.shiprocket_status}
                courierPartner={orderData.courier_partner}
                trackingNumber={orderData.tracking_number}
                createdAt={orderData.created_at}
                shippedAt={orderData.shipped_at}
                deliveredAt={orderData.delivered_at}
                cancelledAt={orderData.cancelled_at}
                destinationCity={orderData.destination_city || null}
              />

              {/* Cancelled State Notice */}
              {isCancelled ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>This order has been cancelled prior to dispatch.</span>
                  </p>
                  {orderData.cancel_reason && (
                    <p className="text-rose-800">Reason: {orderData.cancel_reason}</p>
                  )}
                  {orderData.cancelled_at && (
                    <p className="text-[11px] text-rose-700">
                      Cancelled on {new Date(orderData.cancelled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              ) : (
                /* Step Progression Timeline */
                <div className="space-y-6 pl-4 border-l-2 border-[var(--color-gold)] ml-2">
                  
                  {/* Step 1: Atelier Preparation */}
                  <div className="relative">
                    <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-[var(--color-gold)] ring-4 ring-[#FAF8F5]" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                        <span>Order Confirmed &amp; Atelier Preparation</span>
                      </p>
                      <p className="text-xs text-[var(--color-slate)]">
                        Inspected by master drapers, passed 100% Silk Mark &amp; textile authentication, carefully packed in keepsake heirloom box.
                      </p>
                      <p className="text-[11px] text-[var(--color-mist)]">
                        Placed on {new Date(orderData.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Dispatched & Handed over to Courier */}
                  <div className={`relative ${isShipped ? '' : 'opacity-50'}`}>
                    <span className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full ring-4 ring-[#FAF8F5] ${
                      isShipped ? 'bg-[var(--color-gold)]' : 'bg-[#E5DFD5]'
                    }`} />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                        <span>Dispatched via Shiprocket ({orderData.courier_partner})</span>
                      </p>
                      <p className="text-xs text-[var(--color-slate)]">
                        {isShipped
                          ? `Handed over to ${orderData.courier_partner} courier network. AWB reference ${orderData.tracking_number || 'assigned'}.`
                          : 'Scheduled for courier pickup from our central Jaipur atelier dispatch hub.'}
                      </p>
                      {orderData.shipped_at && (
                        <p className="text-[11px] text-[var(--color-mist)]">
                          Dispatched on {new Date(orderData.shipped_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step 3: In Transit */}
                  <div className={`relative ${isShipped ? '' : 'opacity-40'}`}>
                    <span className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full ring-4 ring-[#FAF8F5] ${
                      isShipped ? 'bg-[var(--color-gold)]' : 'bg-[#E5DFD5]'
                    }`} />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                        In Transit to Destination
                      </p>
                      <p className="text-xs text-[var(--color-slate)]">
                        En route via express logistics network to {orderData.destination_city || 'your city'}.
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Out for Delivery & Delivered */}
                  <div className={`relative ${isDelivered ? '' : 'opacity-40'}`}>
                    <span className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full ring-4 ring-[#FAF8F5] ${
                      isDelivered ? 'bg-emerald-600' : 'bg-[#E5DFD5]'
                    }`} />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Delivered</span>
                      </p>
                      <p className="text-xs text-[var(--color-slate)]">
                        {isDelivered
                          ? `Successfully delivered on ${orderData.delivered_at ? new Date(orderData.delivered_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'recently'}.`
                          : 'Courier partner will coordinate doorstep delivery with OTP verification.'}
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* Live Shiprocket Scan Checkpoints */}
              {!isCancelled && scans.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[#EAE4D9] space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                    <span>Live Carrier Scan History</span>
                  </h4>
                  <div className="bg-[#FCFAF7] border border-[#E5DECF] rounded-xl p-4 divide-y divide-[#EAE4D9] text-xs">
                    {scans.map((scan, idx) => (
                      <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="font-medium text-[var(--color-ink)]">{scan.activity}</p>
                          {scan.location && (
                            <p className="text-[11px] text-[var(--color-slate)] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[var(--color-mist)]" />
                              <span>{scan.location}</span>
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] text-[var(--color-mist)] whitespace-nowrap">
                          {scan.date ? new Date(scan.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Help Button */}
              <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <span className="text-[var(--color-slate)]">
                  Need to change delivery address or delay delivery date?
                </span>
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--color-gold-hover)] hover:underline inline-flex items-center gap-1"
                >
                  <span>Message Vidhya&apos;s Concierge</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Signed In Quick Links */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-[var(--color-slate)]">
            Already have an Angelika account?
          </p>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink)] hover:text-[var(--color-gold)] underline transition-colors"
          >
            Sign in to view complete order history, past invoices, and saved sizes →
          </Link>
        </div>

      </div>
    </div>
  );
}

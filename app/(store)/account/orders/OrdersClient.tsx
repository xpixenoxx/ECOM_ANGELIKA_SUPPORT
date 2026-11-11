'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, XCircle, AlertTriangle, X, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getCustomerOrders, cancelCustomerOrder, CustomerOrder } from '@/lib/actions/customer-orders';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

interface OrdersClientProps {
  initialOrders: CustomerOrder[];
  initialIsAuthenticated: boolean;
}

interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
  pulse: boolean;
}

const statusConfigMap: Record<string, StatusConfig> = {
  confirmed: {
    label: 'Confirmed',
    badgeClass: 'bg-[#FAF5EC] text-[#8F6A1E] border-[#E8D7B8] shadow-2xs',
    dotClass: 'bg-[#C9A84C]',
    pulse: true,
  },
  processing: {
    label: 'Processing',
    badgeClass: 'bg-[#FFFBEB] text-[#9A5B0B] border-[#FDE68A] shadow-2xs',
    dotClass: 'bg-[#D97706]',
    pulse: true,
  },
  shipped: {
    label: 'Shipped',
    badgeClass: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0] shadow-2xs',
    dotClass: 'bg-[#16A34A]',
    pulse: true,
  },
  delivered: {
    label: 'Delivered',
    badgeClass: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0] shadow-2xs',
    dotClass: 'bg-[#059669]',
    pulse: false,
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]',
    dotClass: 'bg-[#E11D48]',
    pulse: false,
  },
  returned: {
    label: 'Returned',
    badgeClass: 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]',
    dotClass: 'bg-[#64748B]',
    pulse: false,
  },
};

function formatPrice(amount: number): string {
  if (!amount || amount <= 0) return '0';
  return Math.round(amount).toLocaleString('en-IN');
}

export default function OrdersClient({
  initialOrders,
  initialIsAuthenticated,
}: OrdersClientProps) {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>(initialOrders);
  const [isLoading, setIsLoading] = useState(!initialOrders || initialOrders.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Order Cancellation State
  const [cancellingOrder, setCancellingOrder] = useState<CustomerOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('Changed mind / No longer needed');
  const [cancelReasonDetail, setCancelReasonDetail] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setIsCancelling(true);
    try {
      const fullReason = cancelReasonDetail.trim()
        ? `${cancelReason}: ${cancelReasonDetail.trim()}`
        : cancelReason;

      const res = await cancelCustomerOrder({
        orderId: cancellingOrder.id,
        reason: fullReason,
      });

      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === cancellingOrder.id
              ? {
                  ...o,
                  status: 'cancelled',
                  cancelled_at: res.cancelled_at || new Date().toISOString(),
                  cancel_reason: fullReason,
                }
              : o
          )
        );
        setToastMsg({ text: `Order ${cancellingOrder.order_number} has been cancelled successfully.`, type: 'success' });
        setCancellingOrder(null);
      } else {
        setToastMsg({ text: res.error || 'Failed to cancel order.', type: 'error' });
      }
    } catch (err: any) {
      setToastMsg({ text: err.message || 'Error occurred while cancelling order.', type: 'error' });
    } finally {
      setIsCancelling(false);
      setTimeout(() => setToastMsg(null), 5000);
    }
  };

  // Reactively fetch user orders if not already populated from SSR
  useEffect(() => {
    let isMounted = true;

    async function syncOrders() {
      // If we already have initial orders from server and user matches, skip
      if (initialOrders && initialOrders.length > 0 && orders.length > 0) {
        setIsLoading(false);
        return;
      }

      // If auth is still determining, wait briefly but don't hang
      if (authLoading && !user) {
        return;
      }

      const activeUserId = user?.id;
      const activeUserEmail = user?.email;

      if (!activeUserId && !activeUserEmail && !initialIsAuthenticated) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await getCustomerOrders({
          userId: activeUserId,
          userEmail: activeUserEmail,
        });

        if (isMounted && res.success) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.warn('Orders sync notice:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    syncOrders();

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email, authLoading, initialOrders, initialIsAuthenticated]);

  // Safety fallback: ensure spinner never hangs indefinitely
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      selectedStatus === 'all' ||
      order.status.toLowerCase() === selectedStatus.toLowerCase();

    const matchesSearch =
      !searchQuery.trim() ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((item) =>
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[var(--color-snow)]/60 py-10 md:py-14">
      <div className="container-custom max-w-5xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to Account Overview</span>
          </Link>
          <span className="text-xs uppercase tracking-wider text-[var(--color-slate)] font-semibold">
            Angelika Customer Portal
          </span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-[var(--font-display)] text-3xl sm:text-4xl font-normal text-[var(--color-ink)]">
                My Orders
              </h1>
              <p className="mt-2 text-sm text-[var(--color-slate)]">
                View order details, delivery tracking, and invoice history for all your purchases.
              </p>
            </div>
            {orders.length > 0 && (
              <div className="px-4 py-2 bg-white rounded-xl border border-[var(--color-whisper)] text-xs text-[var(--color-slate)] shadow-xs">
                Total Orders Placed: <strong className="text-[var(--color-ink)] font-semibold text-sm">{orders.length}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-white p-4 rounded-2xl border border-[var(--color-whisper)] shadow-xs">
          {/* Status Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: `All Orders (${orders.length})` },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'processing', label: 'Processing' },
              { id: 'shipped', label: 'Shipped' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer',
                  selectedStatus === tab.id
                    ? 'bg-[var(--color-ink)] text-[var(--color-gold)] font-semibold shadow-xs'
                    : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-whisper)]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mist)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by order # or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-[var(--color-snow)]/60 border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-mist)] hover:text-[var(--color-ink)]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-[var(--color-slate)]">Retrieving your order history...</p>
          </div>
        ) : !user && !initialIsAuthenticated && orders.length === 0 ? (
          /* Not Signed In State */
          <div className="bg-white rounded-3xl border border-[var(--color-whisper)] p-12 text-center shadow-xs">
            <div className="w-20 h-20 mx-auto rounded-full bg-[var(--color-gold-light)]/50 border border-[var(--color-gold)]/20 flex items-center justify-center mb-5 text-[var(--color-gold)]">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3 className="text-[var(--font-display)] text-2xl font-medium text-[var(--color-ink)] mb-2">
              Sign In to View Orders
            </h3>
            <p className="text-sm text-[var(--color-slate)] max-w-md mx-auto mb-6 leading-relaxed">
              Please sign in with your registered email to track active shipments, view past purchases, and download official invoices.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/login?redirect=/account/orders"
                className="px-6 py-3 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] font-semibold text-sm hover:bg-[var(--color-gold-hover)] transition-all shadow-sm"
              >
                Sign In Now &rarr;
              </Link>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty / No Matches State */
          <div className="bg-white rounded-3xl border border-[var(--color-whisper)] p-12 text-center shadow-xs">
            <div className="w-20 h-20 mx-auto rounded-full bg-[var(--color-gold-light)]/50 border border-[var(--color-gold)]/20 flex items-center justify-center mb-5 text-[var(--color-gold)]">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1 0 8" />
              </svg>
            </div>
            <h3 className="text-[var(--font-display)] text-2xl font-medium text-[var(--color-ink)] mb-2">
              {orders.length === 0 ? 'No Orders Yet' : 'No Matching Orders'}
            </h3>
            <p className="text-sm text-[var(--color-slate)] max-w-md mx-auto mb-6 leading-relaxed">
              {orders.length === 0
                ? "You haven't placed any orders yet. Discover our latest collection of handcrafted silks, designer kurtis, and festive ensembles."
                : `We couldn't find any orders matching "${searchQuery || selectedStatus}". Try clearing your filters.`}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {orders.length === 0 ? (
                <Link
                  href="/shop"
                  className="px-6 py-3 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] font-semibold text-sm hover:bg-[var(--color-gold-hover)] transition-all shadow-sm flex items-center gap-2"
                >
                  <span>Explore Collections</span>
                  <span>&rarr;</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setSelectedStatus('all');
                    setSearchQuery('');
                  }}
                  className="px-5 py-2.5 rounded-full border border-[var(--color-whisper)] text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-whisper)] transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusKey = (order.status || 'confirmed').toLowerCase();
              const statusConfig = statusConfigMap[statusKey] || {
                label: order.status || 'Confirmed',
                badgeClass: 'bg-[#FAF5EC] text-[#8F6A1E] border-[#E8D7B8] shadow-2xs',
                dotClass: 'bg-[#C9A84C]',
                pulse: true,
              };

              const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <Card
                  key={order.id}
                  variant="elevated"
                  padding="none"
                  className="border border-[#E7DFC6]/60 rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden transition-all hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
                >
                  {/* Order Card Header */}
                  <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#EAE3D5] flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[10.5px] uppercase tracking-wider text-[var(--color-slate)] block font-semibold">Order Number</span>
                        <span className="font-semibold text-[var(--color-ink)] font-mono text-xs sm:text-sm">{order.order_number}</span>
                      </div>
                      <div className="h-6 w-px bg-[#E2D9CB]" />
                      <div>
                        <span className="text-[10.5px] uppercase tracking-wider text-[var(--color-slate)] block font-semibold">Order Date</span>
                        <span className="text-[var(--color-ink)] text-xs sm:text-sm font-medium">{orderDate}</span>
                      </div>
                      <div className="h-6 w-px bg-[#E2D9CB] hidden sm:block" />
                      <div className="hidden sm:block">
                        <span className="text-[10.5px] uppercase tracking-wider text-[var(--color-slate)] block font-semibold">Total Amount</span>
                        <span className="font-semibold text-[var(--color-ink)] text-xs sm:text-sm font-serif">₹{formatPrice(order.total_amount)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Clean Minimalist Luxury Status Pill */}
                      <div
                        className={cn(
                          'inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase border transition-all duration-200 select-none shadow-2xs',
                          statusConfig.badgeClass
                        )}
                      >
                        <span className="relative flex h-2 w-2">
                          {statusConfig.pulse && (
                            <span
                              className={cn(
                                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                                statusConfig.dotClass
                              )}
                            />
                          )}
                          <span
                            className={cn(
                              'relative inline-flex rounded-full h-2 w-2',
                              statusConfig.dotClass
                            )}
                          />
                        </span>
                        <span>{statusConfig.label}</span>
                      </div>

                      {/* Cancel Order Action - ONLY available until shipped */}
                      {['pending', 'confirmed', 'processing'].includes(statusKey) && !order.shipped_at && (
                        <button
                          type="button"
                          onClick={() => {
                            setCancellingOrder(order);
                            setCancelReason('Changed mind / No longer needed');
                            setCancelReasonDetail('');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer shadow-2xs"
                          title="Cancel order prior to courier dispatch"
                        >
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Cancel Order</span>
                        </button>
                      )}

                      {/* Once Shipped - Cancellation Closed Notice */}
                      {statusKey === 'shipped' && (
                        <span
                          className="text-[10.5px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 cursor-help"
                          title="This order has been dispatched and cannot be cancelled. Returns & exchanges available upon delivery."
                        >
                          Shipped &bull; Dispatched
                        </span>
                      )}

                      {/* Luxury Order Details Action Button */}
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="group relative inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white hover:bg-[var(--color-ink)] text-[var(--color-ink)] hover:text-white border border-[#D5C9B7] hover:border-[var(--color-ink)] shadow-2xs hover:shadow-xs transition-all duration-200 text-xs font-semibold tracking-wide cursor-pointer"
                      >
                        <span>Details</span>
                        <span className="text-[var(--color-gold)] font-medium transition-transform duration-200 group-hover:translate-x-0.5">
                          &rarr;
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    {order.items && order.items.length > 0 ? (
                      <div className="divide-y divide-[var(--color-whisper)]">
                        {order.items.map((item) => {
                          const itemImg = item.variant_details?.image || item.variant_details?.image_url || '/images/collection-kurtis.jpg';
                          return (
                            <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-16 rounded-lg bg-[var(--color-whisper)] flex-shrink-0 overflow-hidden relative border border-[var(--color-whisper)]">
                                  <img
                                    src={itemImg}
                                    alt={item.product_name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm text-[var(--color-ink)]">{item.product_name}</h4>
                                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[var(--color-slate)]">
                                    {item.variant_details?.size && (
                                      <span className="bg-[var(--color-snow)] px-2 py-0.5 rounded border border-[var(--color-whisper)]">
                                        Size: {item.variant_details.size}
                                      </span>
                                    )}
                                    {item.variant_details?.color && item.variant_details.color !== 'Default' && (
                                      <span className="bg-[var(--color-snow)] px-2 py-0.5 rounded border border-[var(--color-whisper)]">
                                        Color: {item.variant_details.color}
                                      </span>
                                    )}
                                    <span>Qty: <strong>{item.quantity}</strong></span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-semibold text-[var(--color-ink)]">
                                  ₹{formatPrice(item.total_price || item.unit_price * item.quantity)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-[var(--color-slate)] italic">
                        Order items details available in summary.
                      </div>
                    )}

                    {/* Tracking details if available */}
                    {order.courier_partner && order.tracking_number && (
                      <div className="mt-4 pt-4 border-t border-[var(--color-whisper)] flex items-center justify-between text-xs text-[var(--color-slate)] bg-[var(--color-snow)]/60 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="1" y="3" width="15" height="13" />
                            <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                            <circle cx="5.5" cy="18.5" r="2.5" />
                            <circle cx="18.5" cy="18.5" r="2.5" />
                          </svg>
                          <span>
                            Carrier: <strong>{order.courier_partner}</strong> &bull; Tracking ID: <strong>{order.tracking_number}</strong>
                          </span>
                        </div>
                        <Link
                          href={`/track-order?order=${encodeURIComponent(order.order_number)}`}
                          className="text-[var(--color-gold)] font-medium cursor-pointer hover:underline"
                        >
                          Track Shipment &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast Alert Notice */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2 max-w-md ${
              toastMsg.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : 'bg-rose-900 text-white border-rose-700'
            }`}
          >
            {toastMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customer Order Cancellation Modal */}
      <AnimatePresence>
        {cancellingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => !isCancelling && setCancellingOrder(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[var(--color-whisper)] p-6 sm:p-8 z-10 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-rose-600 block">
                    Order Cancellation Request
                  </span>
                  <h3 className="text-xl font-serif text-[var(--color-ink)] mt-0.5">
                    Cancel Order #{cancellingOrder.order_number}?
                  </h3>
                  <p className="text-xs text-[var(--color-slate)] mt-1">
                    Your order is currently preparing in our atelier and has not yet been handed over to our courier partner. You may cancel it now.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setCancellingOrder(null)}
                  className="p-1.5 rounded-full text-[var(--color-mist)] hover:text-[var(--color-ink)] hover:bg-[var(--color-snow)] transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Summary Snapshot */}
              <div className="p-3.5 bg-[var(--color-snow)] rounded-2xl border border-[var(--color-whisper)] flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-[var(--color-ink)]">
                    {cancellingOrder.items?.length ?? 1} item{((cancellingOrder.items?.length ?? 1) > 1) ? 's' : ''}
                  </p>
                  <p className="text-[11px] text-[var(--color-slate)]">
                    Total Amount: <strong className="text-[var(--color-ink)]">₹{formatPrice(cancellingOrder.total_amount)}</strong>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  Ready to Cancel
                </span>
              </div>

              {/* Reason Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)]">
                  Please select a reason for cancellation *
                </label>
                <div className="space-y-2">
                  {[
                    'Changed mind / No longer needed',
                    'Ordered wrong size or color',
                    'Want to change delivery address or phone',
                    'Found another outfit or design',
                    'Delivery date or processing time takes too long',
                    'Other reason',
                  ].map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        cancelReason === r
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)]/40 text-[var(--color-ink)] font-semibold'
                          : 'border-[var(--color-whisper)] hover:bg-[var(--color-snow)] text-[var(--color-slate)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        checked={cancelReason === r}
                        onChange={() => setCancelReason(r)}
                        className="text-[var(--color-gold)] focus:ring-[var(--color-gold)]"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-slate)] mb-1">
                    Additional notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={cancelReasonDetail}
                    onChange={(e) => setCancelReasonDetail(e.target.value)}
                    placeholder="Provide any feedback for Vidhya's atelier..."
                    className="w-full p-3 rounded-xl border border-[var(--color-whisper)] text-xs text-[var(--color-ink)] placeholder-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] bg-[var(--color-snow)]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-whisper)]">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setCancellingOrder(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-[var(--color-slate)] hover:bg-[var(--color-snow)] transition-colors disabled:opacity-50"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleConfirmCancel}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Cancelling Order...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Confirm Cancellation</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


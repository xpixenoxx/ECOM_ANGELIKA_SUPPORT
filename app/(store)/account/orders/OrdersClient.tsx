'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { getCustomerOrders, CustomerOrder } from '@/lib/actions/customer-orders';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

interface OrdersClientProps {
  initialOrders: CustomerOrder[];
  initialIsAuthenticated: boolean;
}

const statusBadgeStyles: Record<string, { label: string; className: string }> = {
  delivered: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  shipped: { label: 'Shipped', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  processing: { label: 'Processing', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  cancelled: { label: 'Cancelled', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  returned: { label: 'Returned', className: 'bg-slate-100 text-slate-700 border-slate-200' },
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
              const badge = statusBadgeStyles[statusKey] || {
                label: order.status,
                className: 'bg-slate-100 text-slate-700 border-slate-200',
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
                  className="border border-[var(--color-whisper)] rounded-2xl bg-white shadow-xs overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Order Card Header */}
                  <div className="bg-[var(--color-snow)]/60 px-6 py-4 border-b border-[var(--color-whisper)] flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs uppercase text-[var(--color-slate)] block font-medium">Order Number</span>
                        <span className="font-semibold text-[var(--color-ink)] font-mono">{order.order_number}</span>
                      </div>
                      <div className="h-6 w-px bg-[var(--color-whisper)]" />
                      <div>
                        <span className="text-xs uppercase text-[var(--color-slate)] block font-medium">Order Date</span>
                        <span className="text-[var(--color-ink)]">{orderDate}</span>
                      </div>
                      <div className="h-6 w-px bg-[var(--color-whisper)] hidden sm:block" />
                      <div className="hidden sm:block">
                        <span className="text-xs uppercase text-[var(--color-slate)] block font-medium">Total Amount</span>
                        <span className="font-semibold text-[var(--color-ink)]">₹{formatPrice(order.total_amount)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border', badge.className)}>
                        {badge.label}
                      </span>
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="px-3.5 py-1.5 rounded-lg border border-[var(--color-whisper)] text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--color-gold)] hover:bg-[var(--color-gold-light)]/40 transition-all inline-flex items-center gap-1.5"
                      >
                        <span>Details</span>
                        <span>&rarr;</span>
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
                        <span className="text-[var(--color-gold)] font-medium cursor-pointer hover:underline">
                          Track Shipment &rarr;
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


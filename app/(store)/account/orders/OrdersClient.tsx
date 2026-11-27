'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CustomerOrder, getCustomerOrders } from '@/lib/actions/customer-orders';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Search,
  X,
  RotateCcw,
  FileText,
  Copy,
  Check,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  Clock,
  CreditCard,
  Banknote,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';

interface OrdersClientProps {
  initialOrders: CustomerOrder[];
  initialIsAuthenticated: boolean;
}

type SortOption = 'newest' | 'oldest' | 'highest';

const STATUS_TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
] as const;

const STEP_LABELS = ['Confirmed', 'Atelier Prep', 'Dispatched', 'Delivered'] as const;

function getOrderStepIndex(status: string): number {
  const s = (status || '').toLowerCase();
  if (s === 'delivered') return 3;
  if (s === 'shipped' || s === 'out_for_delivery') return 2;
  if (s === 'processing') return 1;
  return 0;
}

function getStatusPill(status: string): { label: string; badgeClass: string; dotClass: string } {
  const s = (status || 'confirmed').toLowerCase();
  switch (s) {
    case 'confirmed':
      return {
        label: 'Confirmed',
        badgeClass: 'bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]',
        dotClass: 'bg-[#4F46E5]',
      };
    case 'processing':
      return {
        label: 'Crafting & QC',
        badgeClass: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
        dotClass: 'bg-[#D97706]',
      };
    case 'shipped':
      return {
        label: 'In Transit',
        badgeClass: 'bg-[#ECFEFF] text-[#155E75] border-[#A5F3FC]',
        dotClass: 'bg-[#0891B2]',
      };
    case 'delivered':
      return {
        label: 'Delivered',
        badgeClass: 'bg-[#ECFDF3] text-[#067647] border-[#A7F3D0]',
        dotClass: 'bg-[#059669]',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        badgeClass: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
        dotClass: 'bg-[#DC2626]',
      };
    default:
      return {
        label: status || 'Pending',
        badgeClass: 'bg-[#F5F1EB] text-[#5A544B] border-[#E5DDD2]',
        dotClass: 'bg-[#8E8477]',
      };
  }
}

function formatRupees(amount: number): string {
  if (!amount || amount <= 0) return '0';
  return Math.round(amount).toLocaleString('en-IN');
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function OrdersClient({
  initialOrders,
  initialIsAuthenticated,
}: OrdersClientProps) {
  const { user, loading: authLoading } = useAuth();
  const { addItem: addToBag } = useCart();

  const [orders, setOrders] = useState<CustomerOrder[]>(initialOrders);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialIsAuthenticated);
  // Only show loading if SSR was NOT authenticated yet and auth is resolving — eliminates redundant client fetch!
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [copiedOrderNum, setCopiedOrderNum] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  // Fallback sync ONLY if SSR returned unauthenticated while client has a live session
  useEffect(() => {
    let active = true;
    if (initialIsAuthenticated || authLoading || !user) return;

    setIsSyncing(true);
    getCustomerOrders()
      .then((res) => {
        if (!active) return;
        if (res.isAuthenticated) {
          setIsAuthenticated(true);
          setOrders(res.orders || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsSyncing(false);
      });

    return () => {
      active = false;
    };
  }, [initialIsAuthenticated, authLoading, user]);

  // Status counts for filter chips
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: orders.length,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const o of orders) {
      const s = (o.status || 'confirmed').toLowerCase();
      if (s in counts) counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  }, [orders]);

  // KPI metrics
  const kpis = useMemo(() => {
    let activeCount = 0;
    let deliveredCount = 0;
    let totalInvested = 0;
    for (const o of orders) {
      const s = (o.status || 'confirmed').toLowerCase();
      if (s === 'delivered') deliveredCount += 1;
      else if (s !== 'cancelled' && s !== 'returned') activeCount += 1;
      if (s !== 'cancelled') totalInvested += Number(o.total_amount || 0);
    }
    return {
      total: orders.length,
      active: activeCount,
      delivered: deliveredCount,
      totalInvested,
    };
  }, [orders]);

  // Filtered + sorted orders
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = orders.filter((order) => {
      const st = (order.status || 'confirmed').toLowerCase();
      if (selectedStatus !== 'all' && st !== selectedStatus) return false;
      if (!q) return true;
      const matchesNum = (order.order_number || '').toLowerCase().includes(q);
      const matchesAwb = (order.tracking_number || '').toLowerCase().includes(q);
      const matchesCourier = (order.courier_partner || '').toLowerCase().includes(q);
      const matchesItem = order.items.some((it) =>
        (it.product_name || '').toLowerCase().includes(q)
      );
      return matchesNum || matchesAwb || matchesCourier || matchesItem;
    });

    const sorted = [...list];
    if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'highest') {
      sorted.sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0));
    } else {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return sorted;
  }, [orders, selectedStatus, searchQuery, sortBy]);

  const handleCopyOrderNumber = async (orderNum: string) => {
    try {
      await navigator.clipboard.writeText(orderNum);
      setCopiedOrderNum(orderNum);
      toast.success(`Copied ${orderNum}`);
      setTimeout(() => setCopiedOrderNum(null), 2000);
    } catch {
      toast.error('Could not copy order number.');
    }
  };

  const handleReorder = async (order: CustomerOrder) => {
    if (!order.items || order.items.length === 0) return;
    setReorderingId(order.id);
    try {
      let addedCount = 0;
      for (const item of order.items) {
        const ok = await addToBag(
          {
            productId: item.product_id || item.id,
            variantId: item.variant_id || item.product_id || item.id,
            product_name: item.product_name,
            price: Number(item.unit_price || 0),
            image: item.variant_details?.image || item.variant_details?.image_url || '/images/collection-kurtis.jpg',
            size: item.variant_details?.size || 'M',
            color: item.variant_details?.color || 'Default',
            color_hex: item.variant_details?.color_hex || '#C9A84C',
            quantity: Math.max(1, item.quantity || 1),
          },
          Math.max(1, item.quantity || 1)
        );
        if (ok) addedCount += 1;
      }

      if (addedCount > 0) {
        toast.success(
          `Added ${addedCount} ${addedCount === 1 ? 'piece' : 'pieces'} from ${order.order_number} to your bag.`
        );
      } else {
        toast.error('Some pieces are currently unavailable for quick reorder.');
      }
    } finally {
      setReorderingId(null);
    }
  };

  if (!isAuthenticated && !isSyncing && !authLoading) {
    return (
      <div className="min-h-screen bg-[#EFEAE2] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl bg-[#FFFFFF] border border-[#E5DDD2] p-8 text-center shadow-[0_20px_50px_rgba(22,19,16,0.08)]">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF4E8] border border-[#E6D5B0] flex items-center justify-center mx-auto mb-5">
            <Package className="w-6 h-6 text-[#947218]" />
          </div>
          <h1 className="font-display text-3xl font-medium text-[#1A1A1A]">Sign In to View Orders</h1>
          <p className="text-sm text-[#5A544B] mt-2 leading-relaxed">
            Access your complete order archive, live Shiprocket delivery milestones, and downloadable GST invoices.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/login?redirect=/account/orders"
              className="w-full py-3 px-6 rounded-xl text-xs font-semibold uppercase tracking-[0.16em] bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520] transition-colors"
            >
              Sign In to Account
            </Link>
            <Link
              href="/track-order"
              className="w-full py-2.5 px-6 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#FAF8F4] text-[#1A1A1A] border border-[#DFD5C8] hover:border-[#C9A84C] transition-colors"
            >
              Track an Order Without Signing In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEAE2] py-8 sm:py-11">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5A544B] hover:text-[#1A1A1A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#A4832E]" />
            Back to Account Overview
          </Link>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#7A7065] font-semibold">
            Angelika Customer Portal
          </span>
        </div>

        {/* Editorial Title + Quick Links */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-medium text-[#1A1A1A] tracking-tight">
              My Orders
            </h1>
            <p className="text-sm text-[#5A544B] mt-1.5">
              Track handcrafted pieces in real time, download GST invoices, or reorder your favorites in one tap.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/track-order"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.12em] bg-[#FFFFFF] text-[#1A1A1A] border border-[#E5DDD2] hover:border-[#C9A84C] transition-colors shadow-xs"
            >
              <Truck className="w-3.5 h-3.5 text-[#947218]" />
              Track by Order #
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.12em] bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520] transition-colors shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#E6C77A]" />
              Shop Boutique
            </Link>
          </div>
        </header>

        {/* Executive KPI Summary Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5" aria-label="Order summary metrics">
          <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7A7065]">
                Total Orders
              </span>
              <Package className="w-4 h-4 text-[#A4832E]" />
            </div>
            <p className="font-display text-3xl font-semibold text-[#1A1A1A] mt-2">{kpis.total}</p>
            <p className="text-[11px] text-[#6B6258] mt-0.5">Lifetime acquisitions</p>
          </div>

          <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7A7065]">
                In Progress
              </span>
              <Truck className="w-4 h-4 text-[#0891B2]" />
            </div>
            <p className="font-display text-3xl font-semibold text-[#1A1A1A] mt-2">{kpis.active}</p>
            <p className="text-[11px] text-[#6B6258] mt-0.5">Confirmed or in transit</p>
          </div>

          <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7A7065]">
                Delivered
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            </div>
            <p className="font-display text-3xl font-semibold text-[#1A1A1A] mt-2">{kpis.delivered}</p>
            <p className="text-[11px] text-[#6B6258] mt-0.5">Successfully received</p>
          </div>

          <div className="rounded-2xl bg-[#161310] text-[#FAF6F0] border border-[#C9A84C]/35 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C9A84C]">
                Total Wardrobe
              </span>
              <Sparkles className="w-4 h-4 text-[#E6C77A]" />
            </div>
            <p className="font-display text-3xl font-semibold text-[#FAF6F0] mt-2">
              ₹{formatRupees(kpis.totalInvested)}
            </p>
            <p className="text-[11px] text-[#BEB5A7] mt-0.5">Completed &amp; active value</p>
          </div>
        </section>

        {/* Filter, Search & Sort Bar */}
        <section className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] p-3.5 sm:p-4 shadow-xs space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Single-row scrollable filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {STATUS_TABS.map((tab) => {
                const count = statusCounts[tab.key] || 0;
                const active = selectedStatus === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedStatus(tab.key)}
                    className={`flex-none inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      active
                        ? 'bg-[#161310] text-[#FAF6F0] border-[#161310] shadow-xs'
                        : 'bg-[#FAF8F4] text-[#5A544B] border-[#EAE2D6] hover:border-[#C9A84C] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        active ? 'bg-[#2C261F] text-[#E6C77A]' : 'bg-[#EFEAE2] text-[#6B6258]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Sort Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#8E8477] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Order #, garment, or AWB..."
                  aria-label="Search orders"
                  className="w-full h-10 pl-9 pr-8 rounded-xl bg-[#FAF8F4] border border-[#E5DDD2] text-xs text-[#1A1A1A] placeholder:text-[#8E8477] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#C9A84C]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A7065] hover:text-[#1A1A1A] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-[#FAF8F4] border border-[#E5DDD2]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#74590E]" />
                <label htmlFor="orders-sort" className="sr-only">
                  Sort orders
                </label>
                <select
                  id="orders-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-xs font-semibold text-[#1A1A1A] focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest Value</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Orders List */}
        {isSyncing ? (
          <div className="space-y-4 animate-pulse">
            {[0, 1].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2]" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl bg-[#FFFFFF] border border-[#E5DDD2] p-12 sm:p-16 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF4E8] border border-[#E6D5B0] flex items-center justify-center mx-auto mb-5">
              <Package className="w-7 h-7 text-[#947218]" />
            </div>
            <h2 className="font-display text-3xl font-medium text-[#1A1A1A]">
              {orders.length === 0 ? 'No Orders Placed Yet' : 'No Matching Orders'}
            </h2>
            <p className="text-sm text-[#5A544B] max-w-md mx-auto mt-2">
              {orders.length === 0
                ? 'Discover handcrafted silk kurtis, heritage sarees, and festive ensembles crafted at our Hyderabad atelier.'
                : 'Try adjusting your status filter or clearing your search term.'}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {orders.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatus('all');
                    setSearchQuery('');
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#161310] text-[#FAF6F0] cursor-pointer"
                >
                  Reset Filters
                </button>
              ) : (
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#161310] text-[#FAF6F0]"
                >
                  Explore Collections <ArrowRight className="w-4 h-4 text-[#E6C77A]" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order, idx) => {
              const pill = getStatusPill(order.status);
              const isCancelled = (order.status || '').toLowerCase() === 'cancelled';
              const stepIdx = getOrderStepIndex(order.status);
              const isCod = (order.payment_method || '').toLowerCase() === 'cod';
              const isPaid = (order.payment_status || '').toLowerCase() === 'paid';
              const isReordering = reorderingId === order.id;

              const internalTrackHref = order.tracking_token
                ? `/track-order?order=${encodeURIComponent(order.order_number)}&token=${encodeURIComponent(order.tracking_token)}`
                : `/account/orders/${order.id}`;
              const hasExternalCourierUrl = Boolean(order.tracking_url);

              return (
                <motion.article
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: Math.min(idx * 0.04, 0.2) }}
                  className="rounded-3xl bg-[#FFFFFF] border border-[#E5DDD2] hover:border-[#C9A84C]/70 shadow-[0_8px_28px_rgba(22,19,16,0.05)] overflow-hidden transition-all"
                >
                  {/* Top Metadata Bar */}
                  <div className="px-5 sm:px-6 py-4 bg-[#FAF8F4] border-b border-[#EAE2D6] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A7065]">
                          Order Number
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-sm font-bold text-[#1A1A1A]">
                            {order.order_number}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyOrderNumber(order.order_number)}
                            aria-label={`Copy order number ${order.order_number}`}
                            className="p-1 rounded-md text-[#7A7065] hover:text-[#1A1A1A] hover:bg-[#EFEAE2] transition-colors cursor-pointer"
                          >
                            {copiedOrderNum === order.order_number ? (
                              <Check className="w-3.5 h-3.5 text-[#067647]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A7065]">
                          Placed On
                        </span>
                        <span className="text-sm font-medium text-[#1A1A1A] mt-0.5 block">
                          {formatDate(order.created_at)}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A7065]">
                          Total Amount
                        </span>
                        <span className="text-sm font-bold text-[#1A1A1A] mt-0.5 block">
                          ₹{formatRupees(order.total_amount)}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A7065]">
                          Payment
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold mt-0.5">
                          {isCod ? (
                            <>
                              <Banknote className="w-3.5 h-3.5 text-[#92400E]" />
                              <span className="text-[#92400E]">Cash on Delivery</span>
                            </>
                          ) : isPaid ? (
                            <>
                              <CreditCard className="w-3.5 h-3.5 text-[#067647]" />
                              <span className="text-[#067647]">Paid · Online</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-[#92400E]" />
                              <span className="text-[#92400E] capitalize">{order.payment_status}</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${pill.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${pill.dotClass}`} />
                        {pill.label}
                      </span>
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520] transition-colors"
                      >
                        Details <ArrowRight className="w-3.5 h-3.5 text-[#E6C77A]" />
                      </Link>
                    </div>
                  </div>

                  {/* Fulfillment Visual Progress Rail */}
                  <div className="px-5 sm:px-6 pt-4 pb-2">
                    {isCancelled ? (
                      <div className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-2.5 flex items-center gap-2.5 text-xs text-[#991B1B]">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>
                          <strong>Order Cancelled</strong>
                          {order.cancel_reason ? ` — ${order.cancel_reason}` : ' · Refund (if prepaid) is processed automatically to your original payment method.'}
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="grid grid-cols-4 gap-2">
                          {STEP_LABELS.map((label, i) => {
                            const reached = i <= stepIdx;
                            const isCurrent = i === stepIdx;
                            return (
                              <div key={label} className="space-y-1.5">
                                <div className="h-1.5 rounded-full bg-[#EFEAE2] overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      reached ? 'bg-[#C9A84C] w-full' : 'w-0'
                                    }`}
                                  />
                                </div>
                                <p
                                  className={`text-[10px] sm:text-[11px] font-semibold truncate ${
                                    isCurrent
                                      ? 'text-[#1A1A1A]'
                                      : reached
                                        ? 'text-[#74590E]'
                                        : 'text-[#9A9083]'
                                  }`}
                                >
                                  {reached ? '✓ ' : ''}
                                  {label}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ordered Items */}
                  <div className="px-5 sm:px-6 py-4 divide-y divide-[#F3ECE2]">
                    {order.items.map((item) => {
                      const img =
                        item.variant_details?.image ||
                        item.variant_details?.image_url ||
                        '/images/collection-kurtis.jpg';
                      const productHref = item.product_slug ? `/product/${item.product_slug}` : null;

                      return (
                        <div
                          key={item.id}
                          className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            {productHref ? (
                              <Link
                                href={productHref}
                                className="w-16 h-20 rounded-xl overflow-hidden bg-[#F5EFE6] border border-[#E5DDD2] shrink-0 block group"
                              >
                                <img
                                  src={img}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </Link>
                            ) : (
                              <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#F5EFE6] border border-[#E5DDD2] shrink-0">
                                <img
                                  src={img}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div className="min-w-0">
                              {productHref ? (
                                <Link
                                  href={productHref}
                                  className="font-display text-lg font-semibold text-[#1A1A1A] hover:text-[#74590E] transition-colors line-clamp-1"
                                >
                                  {item.product_name}
                                </Link>
                              ) : (
                                <h3 className="font-display text-lg font-semibold text-[#1A1A1A] line-clamp-1">
                                  {item.product_name}
                                </h3>
                              )}

                              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#5A544B]">
                                {item.variant_details?.size && (
                                  <span className="px-2.5 py-0.5 rounded-md bg-[#FAF8F4] border border-[#E5DDD2] font-semibold text-[#1A1A1A]">
                                    Size: {item.variant_details.size}
                                  </span>
                                )}
                                {item.variant_details?.color &&
                                  item.variant_details.color !== 'Default' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FAF8F4] border border-[#E5DDD2]">
                                      {item.variant_details.color_hex && (
                                        <span
                                          className="w-2.5 h-2.5 rounded-full border border-black/15"
                                          style={{ backgroundColor: item.variant_details.color_hex }}
                                        />
                                      )}
                                      {item.variant_details.color}
                                    </span>
                                  )}
                                <span className="text-[#6B6258]">Qty: {item.quantity}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-base font-bold text-[#1A1A1A]">
                              ₹{formatRupees(item.total_price)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-[11px] text-[#7A7065]">
                                ₹{formatRupees(item.unit_price)} each
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Shipment Info & Action Footer */}
                  <div className="px-5 sm:px-6 py-3.5 bg-[#FAF8F4] border-t border-[#EAE2D6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-[#5A544B] flex flex-wrap items-center gap-x-4 gap-y-1">
                      {order.courier_partner || order.tracking_number ? (
                        <>
                          <span className="inline-flex items-center gap-1.5 font-medium text-[#1A1A1A]">
                            <Truck className="w-3.5 h-3.5 text-[#947218]" />
                            {order.courier_partner || 'Shiprocket Express'}
                          </span>
                          {order.tracking_number && (
                            <span className="font-mono text-[#4E4840]">
                              AWB: <strong>{order.tracking_number}</strong>
                            </span>
                          )}
                          {order.etd && (
                            <span className="text-[#067647] font-semibold">
                              Est. Delivery: {formatDate(order.etd)}
                            </span>
                          )}
                        </>
                      ) : !isCancelled ? (
                        <span className="inline-flex items-center gap-1.5 text-[#6B6258]">
                          <Sparkles className="w-3.5 h-3.5 text-[#A4832E]" />
                          Atelier quality inspection &amp; Shiprocket dispatch active
                        </span>
                      ) : (
                        <span className="text-[#7A7065]">Order closed</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {!isCancelled &&
                        (hasExternalCourierUrl ? (
                          <a
                            href={order.tracking_url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FAF4E8] text-[#74590E] border border-[#E6D5B0] hover:border-[#C9A84C] transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            Track Shipment
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <Link
                            href={internalTrackHref}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FAF4E8] text-[#74590E] border border-[#E6D5B0] hover:border-[#C9A84C] transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            Track Live →
                          </Link>
                        ))}

                      <button
                        type="button"
                        disabled={isReordering}
                        onClick={() => handleReorder(order)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FFFFFF] text-[#1A1A1A] border border-[#DFD5C8] hover:border-[#C9A84C] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isReordering ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A4832E]" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5 text-[#74590E]" />
                        )}
                        Buy Again
                      </button>

                      <Link
                        href={`/account/orders/${order.id}?print=1`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FFFFFF] text-[#1A1A1A] border border-[#DFD5C8] hover:border-[#C9A84C] transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#74590E]" />
                        Invoice
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  Plus,
  ArrowRight,
  Clock,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  getDashboardData,
  type DashboardData,
  type DashboardTimeRange,
} from '@/lib/actions/admin-dashboard';

function formatCurrency(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border border-amber-200',
    confirmed: 'bg-blue-100 text-blue-700 border border-blue-200',
    shipped: 'bg-violet-100 text-violet-700 border border-violet-200',
    delivered: 'bg-green-100 text-green-700 border border-green-200',
    cancelled: 'bg-red-100 text-red-700 border border-red-200',
    returned: 'bg-orange-100 text-orange-700 border border-orange-200',
  };
  return map[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
}

function CountUp({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevTargetRef = useRef(0);

  useEffect(() => {
    if (!ref.current) return;
    const startVal = prevTargetRef.current;
    const endVal = target;
    prevTargetRef.current = target;

    const start = Date.now();
    const duration = 900;
    let animId: number;

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startVal + (endVal - startVal) * eased);
      if (ref.current) {
        ref.current.textContent = current.toLocaleString('en-IN');
      }
      if (progress < 1) {
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [target]);

  return <span ref={ref}>{target.toLocaleString('en-IN')}</span>;
}

// Interactive SVG bar chart with precise values, tooltips, and scale indicators
function BarChart({
  data,
}: {
  data: Array<{ date: string; revenue: number; ordersCount?: number }>;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.revenue), 1000);

  return (
    <div className="relative pt-4 pb-2">
      {/* Background scale reference lines */}
      <div className="absolute inset-x-0 top-6 bottom-8 pointer-events-none flex flex-col justify-between opacity-35">
        <div className="border-b border-dashed border-gray-300 w-full flex justify-between text-[10px] text-gray-400">
          <span>{formatCurrency(max)}</span>
        </div>
        <div className="border-b border-dashed border-gray-200 w-full flex justify-between text-[10px] text-gray-400">
          <span>{formatCurrency(max / 2)}</span>
        </div>
        <div className="border-b border-gray-200 w-full" />
      </div>

      <div className="relative flex items-end gap-2 sm:gap-3 h-40 w-full px-1 z-10">
        {data.map((d, i) => {
          const height = Math.max((d.revenue / max) * 100, 3);
          // Parse date using noon to avoid timezone shift
          const parsedDate = new Date(`${d.date}T12:00:00`);
          const label = parsedDate.toLocaleDateString('en-IN', { weekday: 'short' });
          const fullDateStr = parsedDate.toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
          const isHovered = hoveredIdx === i;

          return (
            <div
              key={d.date}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end relative cursor-pointer group"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Floating Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: -4, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-stone-900 text-white rounded-lg px-2.5 py-1.5 text-center shadow-xl whitespace-nowrap"
                  >
                    <p className="text-[10px] text-stone-300">{fullDateStr}</p>
                    <p className="text-xs font-bold text-amber-300">
                      {formatCurrency(d.revenue)}
                    </p>
                    {d.ordersCount !== undefined && (
                      <p className="text-[10px] text-stone-400">
                        {d.ordersCount} {d.ordersCount === 1 ? 'order' : 'orders'}
                      </p>
                    )}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bar Container */}
              <div className="relative w-full flex-1 flex items-end">
                <motion.div
                  className={`w-full rounded-t-lg transition-colors duration-200 ${
                    isHovered
                      ? 'bg-[var(--color-gold,#c59b27)] shadow-md shadow-amber-500/20'
                      : d.revenue > 0
                      ? 'bg-[var(--color-gold,#d4af37)] hover:bg-[var(--color-gold-hover,#c59b27)]'
                      : 'bg-amber-100/60'
                  }`}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.04, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>

              {/* Day Label */}
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isHovered
                    ? 'text-[var(--color-ink,#1a1a1a)] font-semibold'
                    : 'text-[var(--color-slate,#666666)]'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 100% Mathematically accurate Donut chart with smooth hover & percentage legend
function DonutChart({ data }: { data: { status: string; count: number }[] }) {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  const colors: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#22c55e',
    cancelled: '#ef4444',
    returned: '#f97316',
  };

  // Accurate total: sum starting at 0
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const size = 124;
  const strokeWidth = 16;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let cumulativeAngle = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
      {/* SVG Donut */}
      <div className="relative flex-shrink-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          {/* Base empty ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {total > 0 &&
            data.map((d, i) => {
              if (d.count <= 0) return null;
              const pct = d.count / total;
              const dashoffset = circumference * (1 - pct);
              const rotation = (cumulativeAngle / total) * 360 - 90;
              cumulativeAngle += d.count;
              const isHovered = hoveredStatus === d.status;

              return (
                <motion.circle
                  key={d.status}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={colors[d.status] || '#94a3b8'}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashoffset}
                  transform={`rotate(${rotation} ${cx} ${cy})`}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashoffset }}
                  transition={{ delay: i * 0.08, duration: 0.55 }}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredStatus(d.status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                />
              );
            })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-[var(--color-ink,#1a1a1a)] leading-tight">
            {total}
          </span>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-slate,#666666)]">
            Orders
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 w-full space-y-2">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
          const isHovered = hoveredStatus === d.status;

          return (
            <div
              key={d.status}
              onMouseEnter={() => setHoveredStatus(d.status)}
              onMouseLeave={() => setHoveredStatus(null)}
              className={`flex items-center gap-2 text-xs py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                isHovered ? 'bg-amber-50/80 font-medium' : 'hover:bg-gray-50'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform"
                style={{
                  backgroundColor: colors[d.status] || '#94a3b8',
                  transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                }}
              />
              <span className="text-[var(--color-slate,#666666)] capitalize">{d.status}</span>
              <span className="text-[10px] text-gray-400 font-normal">({pct}%)</span>
              <span className="font-semibold text-[var(--color-ink,#1a1a1a)] ml-auto">
                {d.count}
              </span>
            </div>
          );
        })}

        {data.length === 0 && (
          <p className="text-xs text-[var(--color-slate,#666666)] py-4 text-center">
            No orders found in this period.
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardClient({ data: initialData }: { data: DashboardData }) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [timeRange, setTimeRange] = useState<DashboardTimeRange>(
    initialData.timeRange || '30d'
  );
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync / refresh logic
  const fetchFreshData = useCallback(
    async (showToastNotice = false, selectedRange = timeRange) => {
      setIsRefreshing(true);
      try {
        const fresh = await getDashboardData(selectedRange);
        if (fresh) {
          setData(fresh);
          setLastSyncedAt(new Date());
          if (showToastNotice) {
            toast.success('Dashboard synced with Supabase', { id: 'dashboard-sync-toast' });
          }
        }
      } catch (err: any) {
        console.error('Failed to sync dashboard data:', err);
        if (showToastNotice) {
          toast.error('Failed to refresh dashboard');
        }
      } finally {
        setIsRefreshing(false);
      }
    },
    [timeRange]
  );

  // Handle switching time range
  const handleRangeChange = (range: DashboardTimeRange) => {
    setTimeRange(range);
    fetchFreshData(false, range);
  };

  // Real-time listener for orders, profiles, products, and variants
  useEffect(() => {
    const supabase = getSupabaseClient();
    const channelName = `realtime:admin_dashboard_${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as any;
            const orderNum = newOrder?.order_number || 'New Order';
            const amount = Number(newOrder?.total_amount || 0);
            toast.success(
              `🎉 ${orderNum} placed (${formatCurrency(amount)})`,
              { duration: 5000, icon: '🛍️' }
            );
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            toast(
              `Order #${updated?.order_number || ''} status: ${updated?.status || 'updated'}`,
              { duration: 3500, icon: '📦' }
            );
          }
          fetchFreshData(false);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_variants' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            if (
              Number(updated.inventory_quantity ?? 99) <=
              Number(updated.low_stock_threshold ?? 5)
            ) {
              toast(
                `Low Stock Alert: Variant at ${updated.inventory_quantity} units remaining`,
                { duration: 4000, icon: '⚠️' }
              );
            }
          }
          fetchFreshData(false);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchFreshData(false);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchFreshData(false);
        }
      )
      .subscribe((status) => {
        setRealtimeStatus(status);
      });

    // Auto-polling fallback every 30 seconds
    const interval = setInterval(() => {
      fetchFreshData(false);
    }, 30000);

    // Refresh on tab visibility return
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchFreshData(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchFreshData]);

  const { stats, recentOrders, ordersByStatus, lowStockItems, revenueByDay } = data;

  const rangeTitleMap: Record<DashboardTimeRange, string> = {
    '7d': 'Last 7 days overview',
    '30d': 'Last 30 days overview',
    '90d': 'Last 90 days overview',
    all: 'All-time performance overview',
  };

  const revenueLabelMap: Record<DashboardTimeRange, string> = {
    '7d': 'Revenue (7d)',
    '30d': 'Revenue (30d)',
    '90d': 'Revenue (90d)',
    all: 'Total Revenue',
  };

  const kpiCards = [
    {
      label: revenueLabelMap[timeRange],
      value: formatCurrency(stats.totalRevenue),
      raw: null,
      change: stats.revenueChange,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-[var(--color-gold,#c59b27)]',
      bg: 'bg-amber-50',
      link: '/admin/analytics',
      badge: null,
    },
    {
      label: 'Total Orders',
      value: null,
      raw: stats.totalOrders,
      change: stats.ordersChange,
      icon: <ShoppingBag className="w-5 h-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/admin/orders',
      badge: stats.pendingOrders > 0 ? `${stats.pendingOrders} pending` : null,
      badgeColor: 'text-amber-700 bg-amber-50 border border-amber-200',
    },
    {
      label: 'Customers',
      value: null,
      raw: stats.totalCustomers,
      change: null,
      icon: <Users className="w-5 h-5" />,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      link: '/admin/customers',
      badge: null,
    },
    {
      label: 'Active Products',
      value: null,
      raw: stats.activeProducts,
      change: null,
      icon: <Package className="w-5 h-5" />,
      color: 'text-green-600',
      bg: 'bg-green-50',
      link: '/admin/products',
      badge: stats.lowStockCount > 0 ? `${stats.lowStockCount} low stock` : null,
      badgeColor: 'text-amber-700 bg-amber-50 border border-amber-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Title, Live Indicator, Time Range, and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-2xl font-semibold text-[var(--color-ink,#1a1a1a)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Dashboard
            </h1>
            <AdminSectionInfo
              title="Executive Overview"
              purpose="Real-time pulse of store health, gross revenue, pending fulfillment counts, and low-inventory warnings aggregated directly from Supabase tables."
              storefrontImpact="Reflects the live state of all customer transactions, inventory availability, and order pipelines across the Angelika storefront."
              targets={[
                { name: 'Storefront Homepage', path: '/', description: 'Public storefront entry' },
                { name: 'Shop All Catalog', path: '/shop', description: 'Public product browsing' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            {rangeTitleMap[timeRange]}
          </p>
        </div>

        {/* Real-time controls & Time Range filter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Real-time Status Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              realtimeStatus === 'SUBSCRIBED'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : realtimeStatus === 'connecting'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
            title={`Supabase Realtime Channel: ${realtimeStatus}`}
          >
            <span className="relative flex h-2 w-2">
              {realtimeStatus === 'SUBSCRIBED' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  realtimeStatus === 'SUBSCRIBED'
                    ? 'bg-emerald-500'
                    : realtimeStatus === 'connecting'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
            </span>
            <span>{realtimeStatus === 'SUBSCRIBED' ? 'Realtime Live' : 'Reconnecting...'}</span>
          </div>

          {/* Sync Button */}
          <button
            onClick={() => fetchFreshData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--color-whisper,#e5e5e5)] hover:border-[var(--color-gold,#d4af37)] text-[var(--color-slate,#666666)] hover:text-[var(--color-ink,#1a1a1a)] rounded-xl text-xs font-medium transition-all shadow-sm disabled:opacity-50"
            title="Force refresh metrics directly from Supabase tables"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing ? 'animate-spin text-[var(--color-gold,#d4af37)]' : ''
              }`}
            />
            <span>Sync</span>
            <span
              suppressHydrationWarning
              className="text-[10px] text-[var(--color-mist,#999999)] hidden md:inline"
            >
              (
              {lastSyncedAt.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
              )
            </span>
          </button>

          {/* Time Range Pills */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
            {(['7d', '30d', '90d', 'all'] as DashboardTimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => handleRangeChange(r)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all uppercase ${
                  timeRange === r
                    ? 'bg-white text-[var(--color-ink,#1a1a1a)] shadow-xs font-semibold'
                    : 'text-[var(--color-slate,#666666)] hover:text-[var(--color-ink,#1a1a1a)]'
                }`}
              >
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>

          {/* Add Product Link */}
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--color-gold,#d4af37)] text-white rounded-xl font-medium text-xs sm:text-sm hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          >
            <Link
              href={card.link}
              className="block p-5 bg-white rounded-2xl border border-[var(--color-whisper,#e5e5e5)] shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${card.bg} ${card.color} transition-transform group-hover:scale-105`}>
                  {card.icon}
                </div>
                {card.change !== null && (
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      card.change >= 0
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                        : 'text-rose-700 bg-rose-50 border border-rose-200'
                    }`}
                  >
                    {card.change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {card.change >= 0 ? '+' : ''}
                    {card.change}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-[var(--color-ink,#1a1a1a)] tracking-tight">
                {card.value ? card.value : <CountUp target={card.raw!} />}
              </p>
              <p className="text-xs text-[var(--color-slate,#666666)] mt-1">{card.label}</p>
              {card.badge && (
                <span
                  className={`mt-2.5 inline-block text-xs font-medium px-2 py-0.5 rounded-md ${
                    card.badgeColor || 'text-amber-700 bg-amber-50'
                  }`}
                >
                  {card.badge}
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="lg:col-span-2 p-6 bg-white rounded-2xl border border-[var(--color-whisper,#e5e5e5)] shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-ink,#1a1a1a)]">
                Revenue — Last 7 Days
              </h2>
              <p className="text-xs text-[var(--color-slate,#666666)] mt-0.5">
                Daily sales distribution across recent transaction dates
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-[var(--color-ink,#1a1a1a)]">
                {formatCurrency(stats.totalRevenue)}
              </span>
              <p className="text-[11px] text-[var(--color-slate,#666666)]">
                {timeRange === 'all' ? 'All-time total' : `total (${timeRange})`}
              </p>
            </div>
          </div>
          <BarChart data={revenueByDay} />
        </motion.div>

        {/* Orders by Status Donut */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          className="p-6 bg-white rounded-2xl border border-[var(--color-whisper,#e5e5e5)] shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-[var(--color-ink,#1a1a1a)]">
                Orders by Status
              </h2>
              <Link
                href="/admin/orders"
                className="text-xs text-[var(--color-gold,#d4af37)] hover:underline flex items-center gap-0.5"
              >
                Pipeline <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-[var(--color-slate,#666666)] mb-2">
              Fulfillment pipeline status breakdown
            </p>
          </div>
          <DonutChart data={ordersByStatus} />
        </motion.div>
      </div>

      {/* Bottom row: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
          className="p-6 bg-white rounded-2xl border border-[var(--color-whisper,#e5e5e5)] shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-ink,#1a1a1a)]">
                Recent Orders
              </h2>
              <p className="text-xs text-[var(--color-slate,#666666)] mt-0.5">
                Latest customer purchases processed through checkout
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-[var(--color-gold,#d4af37)] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-[var(--color-whisper,#e5e5e5)] hover:bg-stone-50/70 transition-all group"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--color-ink,#1a1a1a)] group-hover:text-[var(--color-gold,#d4af37)] transition-colors truncate">
                      {order.order_number}
                    </p>
                    {order.payment_status === 'paid' && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                        Paid
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-slate,#666666)] truncate mt-0.5">
                    {order.email}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-right">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink,#1a1a1a)]">
                      {formatCurrency(Number(order.total_amount))}
                    </p>
                    <p className="text-[11px] text-[var(--color-mist,#999999)] flex items-center gap-1 justify-end mt-0.5">
                      <Clock className="w-3 h-3" />
                      {timeAgo(order.created_at)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            {recentOrders.length === 0 && (
              <div className="text-center py-10">
                <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-[var(--color-slate,#666666)]">No orders received yet.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          className="p-6 bg-white rounded-2xl border border-[var(--color-whisper,#e5e5e5)] shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-ink,#1a1a1a)]">
                Low Stock Alerts
              </h2>
              <p className="text-xs text-[var(--color-slate,#666666)] mt-0.5">
                Garments at or below critical inventory replenishment threshold
              </p>
            </div>
            <Link
              href="/admin/products/inventory"
              className="text-xs font-medium text-[var(--color-gold,#d4af37)] hover:underline flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-[var(--color-ink,#1a1a1a)]">
                All inventory well stocked!
              </p>
              <p className="text-xs text-[var(--color-slate,#666666)] mt-1">
                No garments currently below low-stock threshold.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item, i) => (
                <Link
                  key={i}
                  href="/admin/products/inventory"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-[var(--color-whisper,#e5e5e5)] hover:bg-stone-50/70 transition-all group"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-sm font-semibold text-[var(--color-ink,#1a1a1a)] group-hover:text-[var(--color-gold,#d4af37)] transition-colors truncate">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-[var(--color-slate,#666666)] mt-0.5">
                      {item.sku || 'SKU-N/A'} {item.size ? `· Size ${item.size}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        item.inventory_quantity === 0 ? 'text-rose-500' : 'text-amber-500'
                      }`}
                    />
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        item.inventory_quantity === 0
                          ? 'text-rose-700 bg-rose-50 border border-rose-200'
                          : 'text-amber-700 bg-amber-50 border border-amber-200'
                      }`}
                    >
                      {item.inventory_quantity === 0
                        ? 'Out of stock'
                        : `${item.inventory_quantity} left`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.35 }}
        className="p-6 bg-white rounded-2xl border border-[var(--color-whisper,#e5e5e5)] shadow-xs"
      >
        <h2 className="text-base font-semibold text-[var(--color-ink,#1a1a1a)] mb-1">
          Quick Actions
        </h2>
        <p className="text-xs text-[var(--color-slate,#666666)] mb-4">
          Common workflows to manage catalog, orders, and sales promotions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: 'Add Product',
              href: '/admin/products/new',
              color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60',
            },
            {
              label: 'View Orders Pipeline',
              href: '/admin/orders',
              color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60',
            },
            {
              label: 'Manage Promo Coupons',
              href: '/admin/products/coupons',
              color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60',
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all shadow-2xs hover:shadow-xs ${action.color}`}
            >
              <span>{action.label}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

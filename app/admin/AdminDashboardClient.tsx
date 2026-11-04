'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Package, ShoppingBag, Users, AlertTriangle, Plus, ArrowRight, Clock } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import type { DashboardData } from '@/lib/actions/admin-dashboard';

function formatCurrency(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-violet-100 text-violet-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    returned: 'bg-orange-100 text-orange-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

function CountUp({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const start = Date.now();
    const duration = 1200;
    const raf = requestAnimationFrame(function tick() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      if (ref.current) ref.current.textContent = Math.floor(eased * target).toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <span ref={ref}>0</span>;
}

// Simple SVG bar chart
function BarChart({ data }: { data: { date: string; revenue: number }[] }) {
  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="flex items-end gap-1 h-32 w-full">
      {data.map((d, i) => {
        const height = Math.max((d.revenue / max) * 100, 4);
        const label = new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' });
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full" style={{ height: '7rem' }}>
              <motion.div
                className="absolute bottom-0 w-full rounded-t-md bg-[var(--color-gold)] group-hover:bg-[var(--color-gold-hover)] transition-colors"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                title={formatCurrency(d.revenue)}
              />
            </div>
            <span className="text-[10px] text-[var(--color-mist)]">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Simple donut chart
function DonutChart({ data }: { data: { status: string; count: number }[] }) {
  const colors: Record<string, string> = {
    pending: '#f59e0b', confirmed: '#3b82f6', shipped: '#8b5cf6',
    delivered: '#22c55e', cancelled: '#ef4444', returned: '#f97316',
  };
  const total = data.reduce((s, d) => s + d.count, 1);
  let cumulative = 0;
  const size = 120;
  const r = 40;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((d, i) => {
          const pct = d.count / total;
          const offset = circumference * (1 - pct);
          const rotation = (cumulative / total) * 360 - 90;
          cumulative += d.count;
          return (
            <motion.circle
              key={d.status}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={colors[d.status] || '#94a3b8'}
              strokeWidth={16}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform={`rotate(${rotation} ${cx} ${cy})`}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            />
          );
        })}
        <text x={cx} y={cy + 5} textAnchor="middle" className="text-sm font-bold" fill="currentColor">{total}</text>
      </svg>
      <div className="space-y-1.5">
        {data.map(d => (
          <div key={d.status} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[d.status] || '#94a3b8' }} />
            <span className="text-[var(--color-slate)] capitalize">{d.status}</span>
            <span className="font-semibold text-[var(--color-ink)] ml-auto">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const kpiCards = (stats: DashboardData['stats']) => [
  {
    label: 'Revenue (30d)',
    value: formatCurrency(stats.totalRevenue),
    raw: null,
    change: stats.revenueChange,
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'text-[var(--color-gold)]',
    bg: 'bg-amber-50',
    link: '/admin/analytics',
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
    badgeColor: 'text-amber-600 bg-amber-50',
  },
];

export default function AdminDashboardClient({ data }: { data: DashboardData }) {
  const { stats, recentOrders, ordersByStatus, lowStockItems, revenueByDay } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
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
          <p className="text-sm text-[var(--color-slate)] mt-1">Last 30 days overview</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/new" className="flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards(stats).map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <Link href={card.link} className="block p-5 bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm hover:-translate-y-0.5 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                  {card.icon}
                </div>
                {card.change !== null && (
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                    card.change >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                  }`}>
                    {card.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(card.change)}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-[var(--color-ink)]">
                {card.value ? card.value : <CountUp target={card.raw!} />}
              </p>
              <p className="text-sm text-[var(--color-slate)] mt-1">{card.label}</p>
              {card.badge && (
                <span className={`mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${card.badgeColor || 'text-amber-600 bg-amber-50'}`}>
                  {card.badge}
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="lg:col-span-2 p-6 bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[var(--color-ink)]">Revenue — Last 7 Days</h2>
            <span className="text-sm text-[var(--color-slate)]">{formatCurrency(stats.totalRevenue)} total (30d)</span>
          </div>
          <BarChart data={revenueByDay} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="p-6 bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[var(--color-ink)]">Orders by Status</h2>
          </div>
          {ordersByStatus.length > 0
            ? <DonutChart data={ordersByStatus} />
            : <p className="text-sm text-[var(--color-slate)] py-8 text-center">No orders yet</p>
          }
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="p-6 bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[var(--color-ink)]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-[var(--color-gold)] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.slice(0, 5).map(order => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between py-2.5 border-b border-[var(--color-whisper)] last:border-0 hover:opacity-80 transition-opacity"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{order.order_number}</p>
                  <p className="text-xs text-[var(--color-slate)] truncate">{order.email}</p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{formatCurrency(Number(order.total_amount))}</p>
                    <p className="text-xs text-[var(--color-mist)] flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />{timeAgo(order.created_at)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-sm text-[var(--color-slate)] text-center py-8">No orders yet</p>
            )}
          </div>
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="p-6 bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[var(--color-ink)]">Low Stock Alerts</h2>
            <Link href="/admin/products/inventory" className="text-sm text-[var(--color-gold)] hover:underline flex items-center gap-1">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm text-[var(--color-slate)]">All products well stocked!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-[var(--color-whisper)] last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{item.product_name}</p>
                    <p className="text-xs text-[var(--color-slate)]">{item.sku} · Size {item.size}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <AlertTriangle className={`w-4 h-4 ${item.inventory_quantity === 0 ? 'text-red-500' : 'text-amber-500'}`} />
                    <span className={`text-sm font-bold ${item.inventory_quantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {item.inventory_quantity} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="p-6 bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm"
      >
        <h2 className="text-base font-semibold text-[var(--color-ink)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Product', href: '/admin/products/new', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
            { label: 'View Orders', href: '/admin/orders', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
            { label: 'Manage Coupons', href: '/admin/products/coupons', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
            { label: 'Store Settings', href: '/admin/settings', color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
          ].map(action => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors ${action.color}`}
            >
              {action.label}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

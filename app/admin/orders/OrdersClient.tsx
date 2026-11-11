'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, Eye, Copy, Check, Gift, RefreshCw, AlertCircle, Package } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import type { AdminOrder } from '@/lib/actions/admin-orders';
import { updateOrderStatus, updatePaymentStatus, getOrders } from '@/lib/actions/admin-orders';
import toast from 'react-hot-toast';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

function statusBadge(s: string) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border border-amber-300',
    confirmed: 'bg-blue-100 text-blue-800 border border-blue-300',
    shipped: 'bg-purple-100 text-purple-800 border border-purple-300',
    delivered: 'bg-green-100 text-green-800 border border-green-300',
    cancelled: 'bg-red-100 text-red-800 border border-red-300',
    returned: 'bg-orange-100 text-orange-800 border border-orange-300',
  };
  return map[s] || 'bg-gray-100 text-gray-700 border border-gray-300';
}

function payBadge(s: string) {
  const map: Record<string, string> = {
    paid: 'bg-green-100 text-green-800 border border-green-300',
    pending: 'bg-amber-100 text-amber-800 border border-amber-300',
    refunded: 'bg-gray-100 text-gray-700 border border-gray-300',
    failed: 'bg-red-100 text-red-800 border border-red-300',
  };
  return map[s] || 'bg-gray-100 text-gray-700 border border-gray-300';
}

function fmt(n: number) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function formatOrderDate(d: string | null | undefined): string {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function timeAgo(d: string) {
  if (!d) return '—';
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

export default function OrdersClient({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filtered = orders.filter(o => {
    const matchTab = activeTab === 'all' || o.status === activeTab;
    const s = search.toLowerCase().trim();
    if (!s) return matchTab;

    const matchOrderNum = (o.order_number || '').toLowerCase().includes(s);
    const matchEmail = (o.email || '').toLowerCase().includes(s);
    const matchName = (o.customer_name || '').toLowerCase().includes(s);
    const matchPhone = (o.phone || '').includes(s);
    const matchProduct = (o.items || []).some(it => (it.product_name || '').toLowerCase().includes(s));

    return matchTab && (matchOrderNum || matchEmail || matchName || matchPhone || matchProduct);
  });

  const counts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const handleStatusChange = async (id: string, newStatus: string, orderNumber: string) => {
    const prevStatus = orders.find(o => o.id === id)?.status || 'confirmed';
    setUpdatingId(id);
    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

    try {
      const res = await updateOrderStatus(id, newStatus);
      if (!res.success) {
        // Revert
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: prevStatus } : o));
        toast.error(res.error || 'Failed to update order status');
      } else {
        toast.success(`Order #${orderNumber} status changed to ${newStatus}`);
      }
    } catch {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: prevStatus } : o));
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentChange = async (id: string, newPayStatus: string, orderNumber: string) => {
    const prevPay = orders.find(o => o.id === id)?.payment_status || 'pending';
    setUpdatingId(id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: newPayStatus } : o));

    try {
      const res = await updatePaymentStatus(id, newPayStatus);
      if (!res.success) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: prevPay } : o));
        toast.error(res.error || 'Failed to update payment status');
      } else {
        toast.success(`Order #${orderNumber} payment marked as ${newPayStatus}`);
      }
    } catch {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: prevPay } : o));
      toast.error('Failed to update payment status');
    } finally {
      setUpdatingId(null);
    }
  };

  const copyOrderNumber = (num: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(num);
      setCopiedId(num);
      toast.success(`Order #${num} copied to clipboard!`);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const refreshOrdersList = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await getOrders();
      setOrders(refreshed);
      toast.success('Orders list refreshed');
    } catch {
      toast.error('Failed to refresh orders');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>Orders</h1>
            <AdminSectionInfo
              title="Order Fulfillment & Dispatch"
              purpose="Manage customer order statuses (pending, confirmed, shipped, delivered, cancelled), assign courier AWB tracking codes, and add bespoke tailoring notes."
              storefrontImpact="Updates the customer order history on /account/orders, the live order tracking timeline on /track-order, and fires WhatsApp dispatch alerts."
              targets={[
                { name: 'Customer Order History', path: '/account/orders', description: 'Customer portal view of order status' },
                { name: 'Live Order Tracking', path: '/track-order', description: 'Public tracking by order number & phone' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate)] mt-0.5">{orders.length} total orders in database</p>
        </div>
        <button
          type="button"
          onClick={refreshOrdersList}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--color-whisper)] rounded-xl text-sm font-medium text-[var(--color-slate)] hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[var(--color-gold)]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 bg-[var(--color-snow)] p-1.5 rounded-xl border border-[var(--color-whisper)] overflow-x-auto">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-white text-[var(--color-gold)] shadow-sm border border-[var(--color-whisper)]'
                : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
            }`}
          >
            {tab}
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              activeTab === tab
                ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]'
                : 'bg-gray-200/80 text-gray-600'
            }`}>
              {counts[tab] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mist)]" />
        <input
          className="w-full pl-9 pr-4 py-2 text-sm border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 shadow-sm bg-white"
          placeholder="Search order #, customer, email, or item…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)]">
                {['Order', 'Customer', 'Items', 'Amount', 'Status', 'Payment', 'Date', ''].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-[var(--color-slate)] uppercase tracking-wider first:pl-6 last:pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-whisper)]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-sm text-[var(--color-slate)]">
                    <AlertCircle className="w-8 h-8 mx-auto text-[var(--color-mist)] mb-2 opacity-50" />
                    <p className="font-medium text-[var(--color-ink)]">No orders found</p>
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="mt-2 text-xs text-[var(--color-gold)] hover:underline"
                      >
                        Clear search filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
              {filtered.map((order, i) => {
                const itemCount = order.items_count || order.items?.length || 1;
                const firstItem = order.items?.[0];
                const otherCount = (order.items?.length || 1) - 1;

                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-[var(--color-snow)]/60 transition-colors"
                  >
                    {/* Order Column */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-xs text-[var(--color-ink)] bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                          {order.order_number}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyOrderNumber(order.order_number)}
                          className="text-[var(--color-mist)] hover:text-[var(--color-gold)] transition-colors p-0.5"
                          title="Copy order number"
                        >
                          {copiedId === order.order_number ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {order.gift_wrap && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-pink-700 bg-pink-50 border border-pink-200 px-1.5 py-0.2 rounded-full">
                            <Gift className="w-2.5 h-2.5" /> Gift Wrap
                          </span>
                        )}
                        {order.metadata?.['coupon_code'] && (
                          <span className="text-[10px] font-mono text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded-full">
                            {order.metadata['coupon_code']}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Customer Column */}
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-xs text-[var(--color-ink)] truncate max-w-[160px]">
                        {order.customer_name || 'Customer'}
                      </p>
                      <p className="text-xs text-[var(--color-slate)] truncate max-w-[160px]">
                        {order.email}
                      </p>
                      {order.phone && (
                        <p className="text-[10px] text-[var(--color-mist)]">{order.phone}</p>
                      )}
                    </td>

                    {/* Items Column */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <Package className="w-3 h-3 text-amber-600" />
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      {firstItem && (
                        <p className="text-[11px] text-[var(--color-slate)] truncate max-w-[150px] mt-1" title={firstItem.product_name}>
                          {firstItem.product_name}
                          {otherCount > 0 && ` +${otherCount} more`}
                        </p>
                      )}
                    </td>

                    {/* Amount Column */}
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-sm text-[var(--color-ink)]">{fmt(order.total_amount)}</p>
                      <span className="text-[10px] text-[var(--color-mist)] uppercase font-semibold">
                        {order.payment_method === 'cod' ? 'Cash on Delivery' : (order.payment_method || 'Online')}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-4 py-3.5">
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value, order.order_number)}
                        disabled={updatingId === order.id}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer capitalize shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/40 ${statusBadge(order.status)}`}
                      >
                        {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                          <option key={s} value={s} className="bg-white text-gray-800 capitalize">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Payment Status Dropdown */}
                    <td className="px-4 py-3.5">
                      <select
                        value={order.payment_status}
                        onChange={e => handlePaymentChange(order.id, e.target.value, order.order_number)}
                        disabled={updatingId === order.id}
                        className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer capitalize shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/40 ${payBadge(order.payment_status)}`}
                      >
                        {['pending', 'paid', 'refunded', 'failed'].map(p => (
                          <option key={p} value={p} className="bg-white text-gray-800 capitalize">
                            {p}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Date Column */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className="text-xs font-medium text-[var(--color-slate)] font-mono"
                        title={`${new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} (${timeAgo(order.created_at)})`}
                      >
                        {formatOrderDate(order.created_at)}
                      </span>
                    </td>

                    {/* Action Column */}
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] hover:underline p-1.5 rounded-lg hover:bg-[var(--color-whisper)]/50 transition-colors"
                        title="View order details"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Link>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

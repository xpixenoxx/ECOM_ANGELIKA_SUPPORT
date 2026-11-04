'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Filter, Eye, ChevronRight } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import type { AdminOrder } from '@/lib/actions/admin-orders';
import { updateOrderStatus } from '@/lib/actions/admin-orders';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

function statusBadge(s: string) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-violet-100 text-violet-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    returned: 'bg-orange-100 text-orange-700',
  };
  return map[s] || 'bg-gray-100 text-gray-600';
}

function payBadge(s: string) {
  return s === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';
}

function fmt(n: number) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

export default function OrdersClient({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [, startTransition] = useTransition();

  const filtered = orders.filter(o => {
    const matchTab = activeTab === 'all' || o.status === activeTab;
    const matchSearch = !search ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const handleStatusChange = (id: string, status: string) => {
    startTransition(async () => {
      await updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    });
  };

  return (
    <div className="space-y-5">
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
          <p className="text-sm text-[var(--color-slate)]">{orders.length} total orders in database</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-[var(--color-snow)] p-1 rounded-xl border border-[var(--color-whisper)] overflow-x-auto">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-white text-[var(--color-gold)] shadow-sm border border-[var(--color-whisper)]'
                : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
            }`}
          >
            {tab}
            {(counts[tab] ?? 0) > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${activeTab === tab ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]' : 'bg-gray-100 text-gray-500'}`}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mist)]" />
        <input
          className="w-full pl-9 pr-4 py-2 text-sm border border-[var(--color-whisper)] rounded-lg focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20"
          placeholder="Search order # or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--color-snow)] border-b border-[var(--color-whisper)]">
              {['Order', 'Customer', 'Items', 'Amount', 'Status', 'Payment', 'Date', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-slate)] uppercase tracking-wider first:pl-6 last:pr-6">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-sm text-[var(--color-slate)]">No orders found</td></tr>
            )}
            {filtered.map((order, i) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-[var(--color-whisper)] last:border-0 hover:bg-[var(--color-snow)]/50 transition-colors"
              >
                <td className="px-6 py-3">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{order.order_number}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-[var(--color-ink)] truncate max-w-[160px]">{order.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--color-slate)]">—</td>
                <td className="px-4 py-3 text-sm font-semibold text-[var(--color-ink)]">{fmt(order.total_amount)}</td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer capitalize ${statusBadge(order.status)}`}
                  >
                    {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${payBadge(order.payment_status)}`}>
                    {order.payment_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[var(--color-slate)]">{timeAgo(order.created_at)}</td>
                <td className="px-6 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] transition-colors">
                    <Eye className="w-4 h-4" />
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

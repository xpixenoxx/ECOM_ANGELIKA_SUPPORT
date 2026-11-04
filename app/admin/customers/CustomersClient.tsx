'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { updateCustomerRole, updateLoyaltyPoints, updateCustomerTier } from '@/lib/actions/admin-customers';
import type { CustomerProfile } from '@/lib/actions/admin-customers';
import { Search, Users, Crown, ShoppingBag, Star } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-blue-100 text-blue-700',
  designer: 'bg-purple-100 text-purple-700',
  customer: 'bg-gray-100 text-gray-600',
};

const TIER_COLORS: Record<string, string> = {
  Bronze: 'bg-amber-100 text-amber-700',
  Silver: 'bg-slate-100 text-slate-700',
  Gold: 'bg-yellow-100 text-yellow-700',
  Platinum: 'bg-indigo-100 text-indigo-700',
};

const ROLES = ['all', 'customer', 'admin', 'manager', 'designer'];

function getInitials(name: string | null, email: string): string {
  if (name) return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

interface Props {
  initialCustomers: CustomerProfile[];
}

export default function CustomersClient({ initialCustomers }: Props) {
  const [, startTransition] = useTransition();
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = customers.filter(c => {
    const matchesRole = roleFilter === 'all' || c.role === roleFilter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      (c.full_name ?? '').toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone ?? '').includes(q);
    return matchesRole && matchesSearch;
  });

  function handleRoleChange(id: string, role: string) {
    setSavingId(id);
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, role } : c));
    startTransition(async () => {
      await updateCustomerRole(id, role);
      setSavingId(null);
    });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium" style={{ fontFamily: 'var(--font-display)' }}>
              Customers &amp; Client Profiles
            </h1>
            <AdminSectionInfo
              title="Customer CRM & Role Management"
              purpose="Manage customer accounts, assign administrative roles (admin, manager, designer), monitor customer lifetime spend, and update VIP loyalty tiers."
              storefrontImpact="Changes take effect on customer account pages (/account), VIP tier discounts, and administrative dashboard access."
              targets={[
                { name: 'Customer Account Page', path: '/account', description: 'Customer portal view' },
                { name: 'Loyalty Rewards Page', path: '/account/loyalty', description: 'Customer loyalty tier status' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate)] mt-0.5">{customers.length} total customers registered in Supabase</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: customers.length, icon: Users, color: 'blue' },
          { label: 'Admins', value: customers.filter(c => c.role === 'admin').length, icon: Crown, color: 'red' },
          { label: 'With Orders', value: customers.filter(c => (c.order_count ?? 0) > 0).length, icon: ShoppingBag, color: 'green' },
          { label: 'Loyalty Points Avg', value: Math.round(customers.reduce((s, c) => s + (c.loyalty_points ?? 0), 0) / Math.max(customers.length, 1)), icon: Star, color: 'yellow' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--color-slate)]">{label}</p>
              <div className={`w-8 h-8 rounded-lg bg-${color}-100 flex items-center justify-center`}>
                <Icon className={`w-4 h-4 text-${color}-600`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--color-ink)] mt-2">{value.toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mist)]" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-whisper)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  roleFilter === r
                    ? 'bg-[var(--color-gold)] text-white'
                    : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:bg-[var(--color-whisper)]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-whisper)] bg-[var(--color-snow)]">
                <th className="text-left py-3 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">Tier</th>
                <th className="text-right py-3 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">Points</th>
                <th className="text-right py-3 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">Orders</th>
                <th className="text-right py-3 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">Spent</th>
                <th className="text-left py-3 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">Joined</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-whisper)]">
              <AnimatePresence>
                {filtered.map((c) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-[var(--color-snow)] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center flex-shrink-0">
                          <span className="text-[var(--color-gold)] font-bold text-xs">
                            {getInitials(c.full_name, c.email)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--color-ink)] truncate">{c.full_name || '—'}</p>
                          <p className="text-xs text-[var(--color-slate)] truncate">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={c.role}
                        onChange={e => handleRoleChange(c.id, e.target.value)}
                        disabled={savingId === c.id}
                        className={`text-xs font-medium px-2 py-1 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 cursor-pointer ${ROLE_COLORS[c.role] ?? 'bg-gray-100 text-gray-600'} disabled:opacity-50`}
                      >
                        <option value="customer">Customer</option>
                        <option value="manager">Manager</option>
                        <option value="designer">Designer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${TIER_COLORS[c.loyalty_tier ?? 'Bronze'] ?? 'bg-gray-100 text-gray-600'}`}>
                        {c.loyalty_tier ?? 'Bronze'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-[var(--color-ink)]">
                      {(c.loyalty_points ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right text-[var(--color-slate)]">
                      {c.order_count ?? 0}
                    </td>
                    <td className="py-3 px-4 text-right text-[var(--color-ink)] font-medium">
                      ₹{(c.total_spent ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--color-mist)]">
                      {new Date(c.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="text-xs text-[var(--color-gold)] hover:underline font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-[var(--color-mist)]">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No customers found</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

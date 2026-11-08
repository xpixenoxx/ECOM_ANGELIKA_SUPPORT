'use client';

import { useState, useTransition, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  updateCustomerRole,
  updateLoyaltyPoints,
  updateCustomerTier,
  getCustomers,
  CustomerProfile,
} from '@/lib/actions/admin-customers';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  Search,
  Users,
  Crown,
  ShoppingBag,
  Star,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  Shield,
  Filter,
  X,
  Sparkles,
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-rose-50 text-rose-700 border-rose-200',
  manager: 'bg-blue-50 text-blue-700 border-blue-200',
  designer: 'bg-purple-50 text-purple-700 border-purple-200',
  customer: 'bg-slate-50 text-slate-700 border-slate-200',
};

const TIER_COLORS: Record<string, string> = {
  Bronze: 'bg-amber-50 text-amber-700 border-amber-200',
  Silver: 'bg-slate-100 text-slate-700 border-slate-300',
  Gold: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  Platinum: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const ROLES = ['all', 'customer', 'admin', 'manager', 'designer'] as const;
type RoleFilterType = typeof ROLES[number];
type SortOption = 'newest' | 'oldest' | 'name_asc' | 'spent_desc' | 'orders_desc' | 'points_desc';

function getInitials(name: string | null, email: string): string {
  if (name && name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  return (email || 'CU').slice(0, 2).toUpperCase();
}

interface Props {
  initialCustomers: CustomerProfile[];
}

export default function CustomersClient({ initialCustomers }: Props) {
  const [, startTransition] = useTransition();
  const [customers, setCustomers] = useState<CustomerProfile[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilterType>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'admins' | 'with_orders' | 'loyalty'>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Realtime & Action States
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [flashingId, setFlashingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  }, []);

  // Supabase Real-time Listener for Profiles & Orders
  useEffect(() => {
    const supabase = getSupabaseClient();
    const channelName = `realtime:admin_customers_${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            if (!updated?.id) return;

            setCustomers((prev) =>
              prev.map((c) => {
                if (c.id === updated.id) {
                  const rawTier = updated.loyalty_tier || c.loyalty_tier || 'Bronze';
                  const normalizedTier =
                    rawTier.charAt(0).toUpperCase() + rawTier.slice(1).toLowerCase();

                  return {
                    ...c,
                    full_name: updated.full_name ?? c.full_name,
                    email: updated.email ?? c.email,
                    phone: updated.phone ?? c.phone,
                    role: updated.role ?? c.role,
                    loyalty_points: Number(updated.loyalty_points ?? c.loyalty_points),
                    loyalty_tier: normalizedTier,
                    updated_at: updated.updated_at || new Date().toISOString(),
                  };
                }
                return c;
              })
            );

            setFlashingId(updated.id);
            setTimeout(() => setFlashingId(null), 3000);
            setLastSyncedAt(new Date());
          } else if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            handleManualRefresh(false);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          // When orders change, re-sync to get fresh order count & spent totals
          handleManualRefresh(false);
        }
      )
      .subscribe((status) => {
        setRealtimeStatus(status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Manual Sync with Supabase
  const handleManualRefresh = useCallback(async (showNotice = true) => {
    setIsRefreshing(true);
    try {
      const { customers: freshCustomers, error } = await getCustomers();
      if (error) {
        if (showNotice) showToast(`Sync failed: ${error}`, 'error');
      } else if (freshCustomers) {
        setCustomers(freshCustomers);
        setLastSyncedAt(new Date());
        if (showNotice) showToast('Customers synced with Supabase', 'success');
      }
    } catch {
      if (showNotice) showToast('Failed to sync customers', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  // Handle Role Change
  function handleRoleChange(id: string, newRole: string) {
    const originalCustomer = customers.find((c) => c.id === id);
    const originalRole = originalCustomer?.role || 'customer';

    setSavingId(id);
    // Optimistic update
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, role: newRole } : c))
    );

    startTransition(async () => {
      const res = await updateCustomerRole(id, newRole);
      setSavingId(null);

      if (res.error) {
        // Rollback
        setCustomers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, role: originalRole } : c))
        );
        showToast(`Failed to update role: ${res.error}`, 'error');
      } else {
        setFlashingId(id);
        const name = originalCustomer?.full_name || originalCustomer?.email || 'Customer';
        showToast(`Role updated to ${newRole} for ${name}`, 'success');
        setTimeout(() => setFlashingId(null), 2500);
      }
    });
  }

  // Calculate Metrics across all customers
  const totalCount = customers.length;
  const adminCount = useMemo(() => customers.filter((c) => c.role === 'admin').length, [customers]);
  const withOrdersCount = useMemo(() => customers.filter((c) => (c.order_count ?? 0) > 0).length, [customers]);
  const avgLoyaltyPoints = useMemo(() => {
    if (customers.length === 0) return 0;
    const sum = customers.reduce((acc, c) => acc + (c.loyalty_points ?? 0), 0);
    return Math.round(sum / customers.length);
  }, [customers]);

  // Role Counts for Pills
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: customers.length };
    customers.forEach((c) => {
      counts[c.role] = (counts[c.role] || 0) + 1;
    });
    return counts;
  }, [customers]);

  // Unique Tiers
  const availableTiers = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.loyalty_tier) set.add(c.loyalty_tier);
    });
    return Array.from(set).sort();
  }, [customers]);

  // Filter & Sort Customers
  const filtered = useMemo(() => {
    return customers
      .filter((c) => {
        // Quick Card Filter
        if (quickFilter === 'admins' && c.role !== 'admin') return false;
        if (quickFilter === 'with_orders' && (c.order_count ?? 0) <= 0) return false;
        if (quickFilter === 'loyalty' && (c.loyalty_points ?? 0) <= 0) return false;

        // Role Filter Pill
        if (roleFilter !== 'all' && c.role !== roleFilter) return false;

        // Tier Filter
        if (tierFilter !== 'all' && c.loyalty_tier !== tierFilter) return false;

        // Search Query
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const name = (c.full_name ?? '').toLowerCase();
          const email = (c.email ?? '').toLowerCase();
          const phone = (c.phone ?? '').toLowerCase();
          const tier = (c.loyalty_tier ?? '').toLowerCase();
          if (!name.includes(q) && !email.includes(q) && !phone.includes(q) && !tier.includes(q)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === 'name_asc') {
          return (a.full_name || a.email).localeCompare(b.full_name || b.email);
        }
        if (sortBy === 'spent_desc') {
          return (b.total_spent ?? 0) - (a.total_spent ?? 0);
        }
        if (sortBy === 'orders_desc') {
          return (b.order_count ?? 0) - (a.order_count ?? 0);
        }
        if (sortBy === 'points_desc') {
          return (b.loyalty_points ?? 0) - (a.loyalty_points ?? 0);
        }
        return 0;
      });
  }, [customers, quickFilter, roleFilter, tierFilter, search, sortBy]);

  // Export CSV
  const exportToCSV = useCallback(() => {
    const headers = ['Full Name', 'Email', 'Phone', 'Role', 'Tier', 'Loyalty Points', 'Order Count', 'Total Spent (INR)', 'Joined Date'];
    const rows = filtered.map((c) => [
      `"${(c.full_name || '').replace(/"/g, '""')}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      c.role,
      c.loyalty_tier || 'Bronze',
      c.loyalty_points ?? 0,
      c.order_count ?? 0,
      c.total_spent ?? 0,
      `"${new Date(c.created_at).toISOString().slice(0, 10)}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.join('\n')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customers-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Customer roster downloaded', 'success');
  }, [filtered, showToast]);

  const hasActiveFilters = roleFilter !== 'all' || quickFilter !== 'all' || tierFilter !== 'all' || search.trim() !== '';

  function resetFilters() {
    setRoleFilter('all');
    setQuickFilter('all');
    setTierFilter('all');
    setSearch('');
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : 'bg-rose-900 text-white border-rose-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
              Customers &amp; Client Profiles
            </h1>
            <AdminSectionInfo
              title="Customer CRM & Role Management"
              purpose="Manage customer accounts, assign administrative roles (admin, manager, designer), monitor customer lifetime spend, and update VIP loyalty tiers with 100% database accuracy."
              storefrontImpact="Changes take effect on customer account pages (/account), VIP tier discounts, and administrative dashboard access."
              targets={[
                { name: 'Customer Account Page', path: '/account', description: 'Customer portal view' },
                { name: 'Loyalty Rewards Page', path: '/account/loyalty', description: 'Customer loyalty tier status' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate)] mt-0.5">
            {totalCount} total customer profiles registered in Supabase
          </p>
        </div>

        {/* Real-time Indicator & Sync Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  realtimeStatus === 'SUBSCRIBED'
                    ? 'bg-emerald-500'
                    : realtimeStatus === 'connecting'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              ></span>
            </span>
            <span>{realtimeStatus === 'SUBSCRIBED' ? 'Realtime Live' : 'Reconnecting...'}</span>
          </div>

          <button
            onClick={() => handleManualRefresh(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--color-whisper)] hover:border-[var(--color-gold)] text-[var(--color-slate)] hover:text-[var(--color-ink)] rounded-xl text-xs font-medium transition-all shadow-sm disabled:opacity-50"
            title="Force refresh customer records directly from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[var(--color-gold)]' : ''}`} />
            <span>Sync</span>
            <span className="text-[10px] text-[var(--color-mist)] hidden sm:inline">
              ({lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
            </span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--color-whisper)] hover:border-[var(--color-gold)] text-[var(--color-slate)] hover:text-[var(--color-ink)] rounded-xl text-xs font-medium transition-all shadow-sm"
            title="Export filtered customer roster to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>
        </div>
      </div>

      {/* Stats Cards with Quick Filtering */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <button
          type="button"
          onClick={() => setQuickFilter((prev) => (prev === 'all' ? 'all' : 'all'))}
          className={`text-left bg-white rounded-2xl border p-5 transition-all shadow-sm cursor-pointer ${
            quickFilter === 'all'
              ? 'border-[var(--color-gold)] ring-2 ring-[var(--color-gold)]/20'
              : 'border-[var(--color-whisper)] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-slate)]">Total</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--color-ink)] mt-2">{totalCount.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[var(--color-mist)] mt-1">All registered accounts</p>
        </button>

        {/* Admins */}
        <button
          type="button"
          onClick={() => setQuickFilter((prev) => (prev === 'admins' ? 'all' : 'admins'))}
          className={`text-left bg-white rounded-2xl border p-5 transition-all shadow-sm cursor-pointer ${
            quickFilter === 'admins'
              ? 'border-rose-400 ring-2 ring-rose-500/20 bg-rose-50/30'
              : 'border-[var(--color-whisper)] hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-slate)]">Admins</p>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-2">{adminCount.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[var(--color-mist)] mt-1">Full dashboard permissions</p>
        </button>

        {/* With Orders */}
        <button
          type="button"
          onClick={() => setQuickFilter((prev) => (prev === 'with_orders' ? 'all' : 'with_orders'))}
          className={`text-left bg-white rounded-2xl border p-5 transition-all shadow-sm cursor-pointer ${
            quickFilter === 'with_orders'
              ? 'border-emerald-400 ring-2 ring-emerald-500/20 bg-emerald-50/30'
              : 'border-[var(--color-whisper)] hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-slate)]">With Orders</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{withOrdersCount.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[var(--color-mist)] mt-1">Purchasing customers</p>
        </button>

        {/* Loyalty Points Avg */}
        <button
          type="button"
          onClick={() => setQuickFilter((prev) => (prev === 'loyalty' ? 'all' : 'loyalty'))}
          className={`text-left bg-white rounded-2xl border p-5 transition-all shadow-sm cursor-pointer ${
            quickFilter === 'loyalty'
              ? 'border-amber-400 ring-2 ring-amber-500/20 bg-amber-50/30'
              : 'border-[var(--color-whisper)] hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-slate)]">Loyalty Points Avg</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-800 mt-2">{avgLoyaltyPoints.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[var(--color-mist)] mt-1">Average per customer</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mist)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-9 py-2 border border-[var(--color-whisper)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)] bg-[var(--color-snow)] focus:bg-white text-[var(--color-ink)] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-mist)] hover:text-[var(--color-ink)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter Pills */}
          <div className="flex gap-1.5 flex-wrap items-center">
            {ROLES.map((r) => {
              const count = roleCounts[r] || 0;
              const isActive = roleFilter === r;
              return (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[var(--color-gold)] text-white shadow-xs'
                      : 'bg-[var(--color-snow)] text-[var(--color-slate)] hover:bg-[var(--color-whisper)]'
                  }`}
                >
                  <span>{r}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-[var(--color-slate)] border border-[var(--color-whisper)]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tier and Sort Dropdowns */}
          <div className="flex items-center gap-2">
            {availableTiers.length > 0 && (
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)] text-xs font-medium text-[var(--color-slate)] focus:outline-none focus:border-[var(--color-gold)]"
              >
                <option value="all">All Tiers</option>
                {availableTiers.map((t) => (
                  <option key={t} value={t}>
                    {t} Tier
                  </option>
                ))}
              </select>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)] text-xs font-medium text-[var(--color-slate)] focus:outline-none focus:border-[var(--color-gold)]"
            >
              <option value="newest">Joined: Newest First</option>
              <option value="oldest">Joined: Oldest First</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="spent_desc">Spent: Highest First</option>
              <option value="orders_desc">Orders: Most First</option>
              <option value="points_desc">Points: Most First</option>
            </select>
          </div>
        </div>

        {/* Active Filters Notification */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-whisper)] text-xs text-[var(--color-slate)]">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Showing <strong>{filtered.length}</strong> of {totalCount} customers</span>
              {roleFilter !== 'all' && (
                <span className="bg-[var(--color-snow)] border border-[var(--color-whisper)] px-2 py-0.5 rounded-full capitalize">
                  Role: {roleFilter}
                </span>
              )}
              {quickFilter !== 'all' && (
                <span className="bg-[var(--color-snow)] border border-[var(--color-whisper)] px-2 py-0.5 rounded-full capitalize">
                  Filter: {quickFilter.replace(/_/g, ' ')}
                </span>
              )}
              {tierFilter !== 'all' && (
                <span className="bg-[var(--color-snow)] border border-[var(--color-whisper)] px-2 py-0.5 rounded-full capitalize">
                  Tier: {tierFilter}
                </span>
              )}
              {search && (
                <span className="bg-[var(--color-snow)] border border-[var(--color-whisper)] px-2 py-0.5 rounded-full">
                  Query: &ldquo;{search}&rdquo;
                </span>
              )}
            </div>

            <button
              onClick={resetFilters}
              className="text-[var(--color-gold)] hover:underline font-medium text-xs whitespace-nowrap ml-2"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Main Customers Table */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-whisper)] bg-[var(--color-snow)]">
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Customer
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Role
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Tier
                </th>
                <th className="text-right py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Points
                </th>
                <th className="text-right py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Orders
                </th>
                <th className="text-right py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Spent
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Joined
                </th>
                <th className="py-3.5 px-4 text-right font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-whisper)]">
              {filtered.map((c) => {
                const isFlashing = flashingId === c.id;
                const isSaving = savingId === c.id;
                const initials = getInitials(c.full_name, c.email);
                const roleClass = ROLE_COLORS[c.role] || 'bg-slate-50 text-slate-700 border-slate-200';
                const tierClass = TIER_COLORS[c.loyalty_tier || 'Bronze'] || 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <tr
                    key={c.id}
                    className={`transition-colors duration-300 ${
                      isFlashing ? 'bg-amber-100/60' : 'hover:bg-[var(--color-snow)]'
                    }`}
                  >
                    {/* Customer Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {c.avatar_url ? (
                          <img
                            src={c.avatar_url}
                            alt={c.full_name || 'Customer'}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-[var(--color-whisper)]"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[var(--color-gold-light,#FDF8ED)] border border-[var(--color-gold)]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-[var(--color-gold)] font-bold text-xs tracking-wider">
                              {initials}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/admin/customers/${c.id}`}
                            className="font-medium text-[var(--color-ink)] hover:text-[var(--color-gold)] truncate max-w-[200px] block transition-colors"
                            title={`View ${c.full_name || c.email}`}
                          >
                            {c.full_name || 'Unnamed Client'}
                          </Link>
                          <p className="text-xs text-[var(--color-slate)] truncate max-w-[200px]">
                            {c.email}
                          </p>
                          {c.phone && (
                            <p className="text-[11px] text-[var(--color-mist)] truncate max-w-[200px]">
                              {c.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role Dropdown */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={c.role}
                          onChange={(e) => handleRoleChange(c.id, e.target.value)}
                          disabled={isSaving}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/40 cursor-pointer disabled:opacity-50 transition-all ${roleClass}`}
                          title="Change customer role"
                        >
                          <option value="customer">Customer</option>
                          <option value="manager">Manager</option>
                          <option value="designer">Designer</option>
                          <option value="admin">Admin</option>
                        </select>
                        {isSaving && <RefreshCw className="w-3 h-3 animate-spin text-[var(--color-gold)]" />}
                      </div>
                    </td>

                    {/* Tier Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-block ${tierClass}`}>
                        {c.loyalty_tier || 'Bronze'}
                      </span>
                    </td>

                    {/* Loyalty Points */}
                    <td className="py-3.5 px-4 text-right font-medium text-[var(--color-ink)]">
                      {(c.loyalty_points ?? 0).toLocaleString('en-IN')}
                    </td>

                    {/* Orders Count */}
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          (c.order_count ?? 0) > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-[var(--color-mist)]'
                        }`}
                      >
                        {c.order_count ?? 0}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="py-3.5 px-4 text-right text-[var(--color-ink)] font-semibold">
                      ₹{(c.total_spent ?? 0).toLocaleString('en-IN')}
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 text-xs text-[var(--color-slate)] whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-gold)] hover:underline"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-[var(--color-mist)]">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30 text-[var(--color-gold)]" />
              <p className="font-medium text-base text-[var(--color-ink)]">No customer profiles found</p>
              <p className="text-xs text-[var(--color-slate)] mt-1">
                {hasActiveFilters
                  ? 'Try clearing your search query or role filter.'
                  : 'Customer accounts will appear here automatically when users register.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-1.5 bg-[var(--color-snow)] hover:bg-[var(--color-whisper)] text-xs font-medium text-[var(--color-ink)] rounded-xl border border-[var(--color-whisper)] transition-colors"
                >
                  Reset all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

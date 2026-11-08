'use client';

import { useState, useTransition, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  Crown,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  Download,
  Copy,
  Check,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  Filter,
  ArrowUpDown,
  X,
  Target,
  UserCheck,
  UserX,
  Repeat,
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getCustomers, CustomerProfile } from '@/lib/actions/admin-customers';

type SegmentKey = 'all' | 'vip' | 'repeat' | 'first_time' | 'at_risk' | 'prospects';
type SortField = 'spent_desc' | 'orders_desc' | 'recent_order' | 'name_asc';

interface SegmentMeta {
  key: SegmentKey;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  color: {
    bg: string;
    border: string;
    activeBorder: string;
    text: string;
    badge: string;
  };
}

const SEGMENT_DEFINITIONS: SegmentMeta[] = [
  {
    key: 'all',
    title: 'All Profiles',
    subtitle: 'Full Customer Base',
    description: 'All registered customer accounts in your database.',
    icon: Users,
    color: {
      bg: 'bg-white',
      border: 'border-[var(--color-whisper)]',
      activeBorder: 'border-[var(--color-gold)] ring-2 ring-[var(--color-gold)]/30',
      text: 'text-[var(--color-ink)]',
      badge: 'bg-slate-100 text-slate-800',
    },
  },
  {
    key: 'vip',
    title: 'VIP High Spenders',
    subtitle: 'Top-tier Luxury Buyers',
    description: 'Lifetime spend ≥ ₹15,000, 3+ orders, or Gold/Platinum loyalty tier.',
    icon: Crown,
    color: {
      bg: 'bg-amber-50/60',
      border: 'border-amber-200',
      activeBorder: 'border-amber-400 ring-2 ring-amber-500/30 bg-amber-50',
      text: 'text-amber-900',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
    },
  },
  {
    key: 'repeat',
    title: 'Repeat Shoppers',
    subtitle: 'Multi-order Loyalty',
    description: 'Customers who have placed 2 or more successful orders.',
    icon: Repeat,
    color: {
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-200',
      activeBorder: 'border-emerald-400 ring-2 ring-emerald-500/30 bg-emerald-50',
      text: 'text-emerald-900',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
  },
  {
    key: 'first_time',
    title: 'First-Time Buyers',
    subtitle: 'Initial Purchase Made',
    description: 'Completed exactly 1 order; ready for second purchase nurture campaigns.',
    icon: ShoppingBag,
    color: {
      bg: 'bg-blue-50/60',
      border: 'border-blue-200',
      activeBorder: 'border-blue-400 ring-2 ring-blue-500/30 bg-blue-50',
      text: 'text-blue-900',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
    },
  },
  {
    key: 'at_risk',
    title: 'At-Risk / Lapsed',
    subtitle: 'Win-back Opportunity',
    description: 'Previous buyers with no order activity in the last 30+ days.',
    icon: Clock,
    color: {
      bg: 'bg-rose-50/60',
      border: 'border-rose-200',
      activeBorder: 'border-rose-400 ring-2 ring-rose-500/30 bg-rose-50',
      text: 'text-rose-900',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
    },
  },
  {
    key: 'prospects',
    title: 'Prospects (0 Orders)',
    subtitle: 'Unconverted Registrations',
    description: 'Registered account with zero completed purchases.',
    icon: Target,
    color: {
      bg: 'bg-slate-50/70',
      border: 'border-slate-200',
      activeBorder: 'border-slate-400 ring-2 ring-slate-500/30 bg-slate-100',
      text: 'text-slate-800',
      badge: 'bg-slate-200 text-slate-800 border-slate-300',
    },
  },
];

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

function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return 'Never purchased';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month ago';
  if (diffMonths < 12) return `${diffMonths} months ago`;
  return `${Math.floor(diffMonths / 12)} years ago`;
}

interface Props {
  initialCustomers: CustomerProfile[];
}

export default function SegmentsClient({ initialCustomers }: Props) {
  const [, startTransition] = useTransition();
  const [customers, setCustomers] = useState<CustomerProfile[]>(initialCustomers);
  const [activeSegment, setActiveSegment] = useState<SegmentKey>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('spent_desc');

  // Real-time State
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  }, []);

  // Supabase Real-time Listener on profiles and orders
  useEffect(() => {
    const supabase = getSupabaseClient();
    const channelName = `realtime:admin_segments_${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          handleManualRefresh(false);
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

  // Refresh data from Supabase
  const handleManualRefresh = useCallback(async (showNotice = true) => {
    setIsRefreshing(true);
    try {
      const { customers: fresh, error } = await getCustomers();
      if (error) {
        if (showNotice) showToast(`Sync failed: ${error}`, 'error');
      } else if (fresh) {
        setCustomers(fresh);
        setLastSyncedAt(new Date());
        if (showNotice) showToast('Segments synced with Supabase', 'success');
      }
    } catch {
      if (showNotice) showToast('Failed to sync segments', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  // Determine which segments a customer belongs to
  const getCustomerSegmentBadges = useCallback((c: CustomerProfile): string[] => {
    const badges: string[] = [];
    const orders = c.order_count ?? 0;
    const spent = c.total_spent ?? 0;
    const tier = c.loyalty_tier || '';

    const isVip = spent >= 15000 || orders >= 3 || ['Gold', 'Platinum'].includes(tier);
    if (isVip) badges.push('VIP');

    if (orders >= 2) badges.push('Repeat');
    else if (orders === 1) badges.push('First-Time');
    else badges.push('Prospect');

    if (orders >= 1 && c.last_order_at) {
      const diffDays = (Date.now() - new Date(c.last_order_at).getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 30) badges.push('At-Risk');
    }

    return badges;
  }, []);

  // Filter customers by segment
  const matchesSegment = useCallback((c: CustomerProfile, segmentKey: SegmentKey): boolean => {
    const orders = c.order_count ?? 0;
    const spent = c.total_spent ?? 0;
    const tier = c.loyalty_tier || '';

    switch (segmentKey) {
      case 'all':
        return true;
      case 'vip':
        return spent >= 15000 || orders >= 3 || ['Gold', 'Platinum'].includes(tier);
      case 'repeat':
        return orders >= 2;
      case 'first_time':
        return orders === 1;
      case 'at_risk': {
        if (orders < 1) return false;
        const lastOrderTime = c.last_order_at ? new Date(c.last_order_at).getTime() : new Date(c.created_at).getTime();
        const diffDays = (Date.now() - lastOrderTime) / (1000 * 60 * 60 * 24);
        return diffDays > 30;
      }
      case 'prospects':
        return orders === 0;
      default:
        return true;
    }
  }, []);

  // Compute Cohort Metrics
  const segmentStats = useMemo(() => {
    const stats: Record<SegmentKey, { count: number; revenue: number; aov: number; percent: number }> = {
      all: { count: 0, revenue: 0, aov: 0, percent: 100 },
      vip: { count: 0, revenue: 0, aov: 0, percent: 0 },
      repeat: { count: 0, revenue: 0, aov: 0, percent: 0 },
      first_time: { count: 0, revenue: 0, aov: 0, percent: 0 },
      at_risk: { count: 0, revenue: 0, aov: 0, percent: 0 },
      prospects: { count: 0, revenue: 0, aov: 0, percent: 0 },
    };

    const totalCust = Math.max(customers.length, 1);

    (Object.keys(stats) as SegmentKey[]).forEach((key) => {
      const matching = customers.filter((c) => matchesSegment(c, key));
      const count = matching.length;
      const revenue = matching.reduce((sum, c) => sum + (c.total_spent ?? 0), 0);
      const totalOrders = matching.reduce((sum, c) => sum + (c.order_count ?? 0), 0);
      const aov = totalOrders > 0 ? Math.round(revenue / totalOrders) : 0;
      const percent = Math.round((count / totalCust) * 100);
      stats[key] = { count, revenue, aov, percent };
    });

    return stats;
  }, [customers, matchesSegment]);

  // Filtered & Sorted Customer Table for Active Segment
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        if (!matchesSegment(c, activeSegment)) return false;

        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const name = (c.full_name || '').toLowerCase();
          const email = (c.email || '').toLowerCase();
          const phone = (c.phone || '').toLowerCase();
          const tier = (c.loyalty_tier || '').toLowerCase();
          if (!name.includes(q) && !email.includes(q) && !phone.includes(q) && !tier.includes(q)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'spent_desc') {
          return (b.total_spent ?? 0) - (a.total_spent ?? 0);
        }
        if (sortBy === 'orders_desc') {
          return (b.order_count ?? 0) - (a.order_count ?? 0);
        }
        if (sortBy === 'recent_order') {
          const timeA = a.last_order_at ? new Date(a.last_order_at).getTime() : 0;
          const timeB = b.last_order_at ? new Date(b.last_order_at).getTime() : 0;
          return timeB - timeA;
        }
        if (sortBy === 'name_asc') {
          return (a.full_name || a.email).localeCompare(b.full_name || b.email);
        }
        return 0;
      });
  }, [customers, activeSegment, matchesSegment, search, sortBy]);

  // Copy Email List
  function copyEmailList() {
    const emails = filteredCustomers.map((c) => c.email).filter(Boolean).join(', ');
    if (!emails) {
      showToast('No emails found in this cohort', 'error');
      return;
    }
    navigator.clipboard.writeText(emails);
    showToast(`Copied ${filteredCustomers.length} email addresses`, 'success');
  }

  // Copy Phone List
  function copyPhoneList() {
    const phones = filteredCustomers.map((c) => c.phone).filter(Boolean).join(', ');
    if (!phones) {
      showToast('No phone numbers recorded in this cohort', 'error');
      return;
    }
    navigator.clipboard.writeText(phones);
    showToast(`Copied ${filteredCustomers.length} phone numbers`, 'success');
  }

  // Export Segment CSV
  const exportToCSV = useCallback(() => {
    const headers = [
      'Customer Name',
      'Email',
      'Phone',
      'Role',
      'Loyalty Tier',
      'Loyalty Points',
      'Orders Count',
      'Lifetime Spent (INR)',
      'Last Order Date',
      'Joined Date',
      'Cohort Segment',
    ];

    const rows = filteredCustomers.map((c) => [
      `"${(c.full_name || '').replace(/"/g, '""')}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      c.role,
      c.loyalty_tier || 'Bronze',
      c.loyalty_points ?? 0,
      c.order_count ?? 0,
      c.total_spent ?? 0,
      c.last_order_at ? `"${new Date(c.last_order_at).toISOString().slice(0, 10)}"` : '"Never"',
      `"${new Date(c.created_at).toISOString().slice(0, 10)}"`,
      `"${activeSegment.toUpperCase()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer-segment-${activeSegment}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredCustomers.length} segment records`, 'success');
  }, [filteredCustomers, activeSegment, showToast]);

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
              Customer Segments &amp; Audiences
            </h1>
            <AdminSectionInfo
              title="Automated Customer Segmentation & Cohorts"
              purpose="Categorize customers by lifetime spend, order frequency, and recency. Target VIPs, repeat clients, and win-back prospects for personalized WhatsApp/email marketing and bridal styling previews."
              storefrontImpact="Powers dynamic tier rewards, targeted marketing discounts, and personalized client styling recommendations."
              targets={[
                { name: 'Customer Account Page', path: '/account', description: 'Customer portal view' },
                { name: 'Loyalty Rewards Page', path: '/account/loyalty', description: 'Loyalty tier progression' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate)] mt-0.5">
            Behavior-based audience cohorts computed live from Supabase customer orders
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
            title="Force refresh customer segments directly from Supabase"
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
            title="Download CSV of current cohort for marketing broadcast"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span> Cohort
          </button>
        </div>
      </div>

      {/* Cohort Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {SEGMENT_DEFINITIONS.map((def) => {
          const stats = segmentStats[def.key];
          const Icon = def.icon;
          const isSelected = activeSegment === def.key;

          return (
            <button
              key={def.key}
              type="button"
              onClick={() => setActiveSegment(def.key)}
              className={`text-left rounded-2xl border p-4 transition-all shadow-sm cursor-pointer flex flex-col justify-between ${
                def.color.bg
              } ${isSelected ? def.color.activeBorder : def.color.border}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-white/80 border border-black/5 flex items-center justify-center text-[var(--color-ink)] shadow-2xs">
                    <Icon className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/80 border border-black/5 text-[var(--color-slate)]">
                    {stats.percent}%
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[var(--color-ink)] mt-2.5 truncate">{def.title}</h4>
                <p className="text-[11px] text-[var(--color-mist)] truncate">{def.subtitle}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-black/5">
                <p className="text-xl font-bold text-[var(--color-ink)]">{stats.count}</p>
                <p className="text-[10px] text-[var(--color-slate)] mt-0.5">
                  ₹{stats.revenue.toLocaleString('en-IN')} rev
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter and Audience Action Controls */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mist)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name, email, phone, or loyalty tier..."
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

          {/* Quick Audience Campaign Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={copyEmailList}
              className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-snow)] hover:bg-[var(--color-whisper)] text-[var(--color-ink)] rounded-xl text-xs font-medium border border-[var(--color-whisper)] transition-colors"
              title="Copy comma-separated email list for email newsletter campaigns"
            >
              <Mail className="w-3.5 h-3.5 text-[var(--color-gold)]" />
              <span>Copy Emails</span>
            </button>

            <button
              onClick={copyPhoneList}
              className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-snow)] hover:bg-[var(--color-whisper)] text-[var(--color-ink)] rounded-xl text-xs font-medium border border-[var(--color-whisper)] transition-colors"
              title="Copy comma-separated phone numbers for WhatsApp marketing broadcasts"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copy Phones</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="px-3 py-2 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)] text-xs font-medium text-[var(--color-slate)] focus:outline-none focus:border-[var(--color-gold)]"
            >
              <option value="spent_desc">Spend: Highest First</option>
              <option value="orders_desc">Orders: Most First</option>
              <option value="recent_order">Recency: Latest Order First</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Active Filter Notice */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-whisper)] text-xs text-[var(--color-slate)]">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Viewing <strong>{filteredCustomers.length}</strong> clients in cohort:{' '}
              <span className="font-semibold text-[var(--color-ink)] capitalize">
                {activeSegment.replace(/_/g, ' ')}
              </span>
            </span>
            {search && (
              <span className="bg-[var(--color-snow)] border border-[var(--color-whisper)] px-2 py-0.5 rounded-full">
                Query: &ldquo;{search}&rdquo;
              </span>
            )}
          </div>

          {activeSegment !== 'all' && (
            <button
              onClick={() => setActiveSegment('all')}
              className="text-[var(--color-gold)] hover:underline font-medium text-xs whitespace-nowrap ml-2"
            >
              Reset to all profiles
            </button>
          )}
        </div>
      </div>

      {/* Main Customers in Segment Table */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-whisper)] bg-[var(--color-snow)]">
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Customer
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Contact
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Loyalty Tier
                </th>
                <th className="text-right py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Orders
                </th>
                <th className="text-right py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Lifetime Spent
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Last Order
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Audience Tags
                </th>
                <th className="py-3.5 px-4 text-right font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Profile
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-whisper)]">
              {filteredCustomers.map((c) => {
                const initials = getInitials(c.full_name, c.email);
                const badges = getCustomerSegmentBadges(c);
                const tier = c.loyalty_tier || 'Bronze';

                return (
                  <tr key={c.id} className="hover:bg-[var(--color-snow)] transition-colors">
                    {/* Customer Profile */}
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
                            className="font-medium text-[var(--color-ink)] hover:text-[var(--color-gold)] truncate max-w-[180px] block transition-colors"
                            title={`View customer profile`}
                          >
                            {c.full_name || 'Unnamed Client'}
                          </Link>
                          <span className="text-[11px] text-[var(--color-mist)] block">
                            Joined {new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="py-3.5 px-4">
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs text-[var(--color-slate)] truncate max-w-[200px] flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[var(--color-mist)] flex-shrink-0" />
                          <span>{c.email}</span>
                        </p>
                        {c.phone ? (
                          <p className="text-xs text-[var(--color-mist)] truncate max-w-[200px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[var(--color-mist)] flex-shrink-0" />
                            <span>{c.phone}</span>
                          </p>
                        ) : (
                          <span className="text-[10px] text-[var(--color-mist)]">—</span>
                        )}
                      </div>
                    </td>

                    {/* Loyalty Tier */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border inline-block ${
                          tier === 'Platinum'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : tier === 'Gold'
                            ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                            : tier === 'Silver'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {tier}
                      </span>
                    </td>

                    {/* Orders Count */}
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          (c.order_count ?? 0) > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-[var(--color-mist)]'
                        }`}
                      >
                        {c.order_count ?? 0}
                      </span>
                    </td>

                    {/* Lifetime Spend */}
                    <td className="py-3.5 px-4 text-right font-semibold text-[var(--color-ink)] text-sm">
                      ₹{Number(c.total_spent ?? 0).toLocaleString('en-IN')}
                    </td>

                    {/* Last Order Relative Time */}
                    <td className="py-3.5 px-4 text-xs text-[var(--color-slate)] whitespace-nowrap">
                      {formatRelativeTime(c.last_order_at)}
                    </td>

                    {/* Audience Segment Badges */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {badges.map((b) => (
                          <span
                            key={b}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                              b === 'VIP'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : b === 'Repeat'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : b === 'First-Time'
                                ? 'bg-blue-100 text-blue-900 border-blue-300'
                                : b === 'At-Risk'
                                ? 'bg-rose-100 text-rose-900 border-rose-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Profile Link */}
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
          {filteredCustomers.length === 0 && (
            <div className="py-16 text-center text-[var(--color-mist)]">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30 text-[var(--color-gold)]" />
              <p className="font-medium text-base text-[var(--color-ink)]">No customers in this cohort</p>
              <p className="text-xs text-[var(--color-slate)] mt-1">
                {search ? 'Try clearing your search query.' : 'Customers will populate here as their buying habits match this segment.'}
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-4 px-4 py-1.5 bg-[var(--color-snow)] hover:bg-[var(--color-whisper)] text-xs font-medium text-[var(--color-ink)] rounded-xl border border-[var(--color-whisper)] transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}


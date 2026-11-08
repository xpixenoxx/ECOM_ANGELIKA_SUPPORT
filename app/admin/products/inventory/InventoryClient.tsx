'use client';

import { useState, useTransition, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Package,
  AlertTriangle,
  Check,
  Edit2,
  X,
  RefreshCw,
  Search,
  ArrowUpDown,
  ExternalLink,
  Plus,
  Minus,
  Download,
  Filter,
  CheckCircle2,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';
import { updateVariantInventory, getInventoryAlerts, AdminInventoryVariant } from '@/lib/actions/admin-products';
import { getSupabaseClient } from '@/lib/supabase/client';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

interface Props {
  initialVariants: AdminInventoryVariant[];
}

type StockFilterType = 'all' | 'out_of_stock' | 'critical' | 'low' | 'healthy';
type ScopeType = 'alerts' | 'all';
type SortField = 'stock_asc' | 'stock_desc' | 'name_asc' | 'name_desc' | 'updated';

const CARD_STYLES = {
  outOfStock: {
    bg: 'bg-rose-50/70 hover:bg-rose-50',
    border: 'border-rose-200',
    activeRing: 'ring-2 ring-rose-500 border-rose-400 bg-rose-50',
    title: 'text-rose-700',
    count: 'text-rose-900',
    pill: 'bg-rose-100 text-rose-800',
  },
  critical: {
    bg: 'bg-orange-50/70 hover:bg-orange-50',
    border: 'border-orange-200',
    activeRing: 'ring-2 ring-orange-500 border-orange-400 bg-orange-50',
    title: 'text-orange-700',
    count: 'text-orange-900',
    pill: 'bg-orange-100 text-orange-800',
  },
  low: {
    bg: 'bg-amber-50/70 hover:bg-amber-50',
    border: 'border-amber-200',
    activeRing: 'ring-2 ring-amber-500 border-amber-400 bg-amber-50',
    title: 'text-amber-700',
    count: 'text-amber-900',
    pill: 'bg-amber-100 text-amber-800',
  },
  healthy: {
    bg: 'bg-emerald-50/70 hover:bg-emerald-50',
    border: 'border-emerald-200',
    activeRing: 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50',
    title: 'text-emerald-700',
    count: 'text-emerald-900',
    pill: 'bg-emerald-100 text-emerald-800',
  },
};

export default function InventoryClient({ initialVariants }: Props) {
  const [isPending, startTransition] = useTransition();
  const [variants, setVariants] = useState<AdminInventoryVariant[]>(initialVariants);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [flashingRowId, setFlashingRowId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filters & Search State
  const [scope, setScope] = useState<ScopeType>('all');
  const [stockFilter, setStockFilter] = useState<StockFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortField>('stock_asc');

  // Real-time State
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Trigger brief toast message
  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 3500);
  }, []);

  // Realtime Supabase Subscription
  useEffect(() => {
    const supabase = getSupabaseClient();
    const channelName = `realtime:inventory_${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_variants',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            if (!updated?.id) return;

            setVariants((prev) =>
              prev.map((v) => {
                if (v.id === updated.id) {
                  return {
                    ...v,
                    inventory_quantity: Number(updated.inventory_quantity ?? v.inventory_quantity),
                    updated_at: updated.updated_at || new Date().toISOString(),
                    low_stock_threshold: Number(updated.low_stock_threshold ?? v.low_stock_threshold),
                  };
                }
                return v;
              })
            );

            // Highlight the row that changed in real-time
            setFlashingRowId(updated.id);
            setTimeout(() => setFlashingRowId((current) => (current === updated.id ? null : current)), 3000);
            setLastSyncedAt(new Date());
          } else if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            // Re-fetch complete variant tree
            handleManualRefresh(false);
          }
        }
      )
      .subscribe((status) => {
        setRealtimeStatus(status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Manual Refresh Handler
  const handleManualRefresh = useCallback(async (showNotice = true) => {
    setIsRefreshing(true);
    try {
      const { variants: freshVariants, error } = await getInventoryAlerts({ scope: 'all' });
      if (error) {
        if (showNotice) showToast(`Sync error: ${error}`, 'error');
      } else if (freshVariants) {
        setVariants(freshVariants);
        setLastSyncedAt(new Date());
        if (showNotice) showToast('Inventory synced with Supabase', 'success');
      }
    } catch (err: any) {
      if (showNotice) showToast('Failed to sync inventory with Supabase', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  // Inline Stock Edit Controls
  function startEdit(v: AdminInventoryVariant) {
    setEditingId(v.id);
    setEditValue(String(v.inventory_quantity));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue('');
  }

  function handleSave(id: string, overrideQty?: number) {
    const rawVal = overrideQty !== undefined ? overrideQty : Number(editValue);
    if (isNaN(rawVal) || rawVal < 0) {
      showToast('Quantity must be 0 or higher', 'error');
      return;
    }

    const qty = Math.floor(rawVal);
    const originalVariant = variants.find((v) => v.id === id);
    const originalQty = originalVariant?.inventory_quantity ?? 0;

    // Optimistically update
    setSavingId(id);
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, inventory_quantity: qty } : v)));

    startTransition(async () => {
      const res = await updateVariantInventory(id, qty);
      setSavingId(null);

      if (res.error) {
        // Rollback on error
        setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, inventory_quantity: originalQty } : v)));
        showToast(`Failed to update: ${res.error}`, 'error');
      } else {
        setSavedId(id);
        setEditingId(null);
        setFlashingRowId(id);
        const name = originalVariant?.products?.name || 'Item';
        const size = originalVariant?.size ? ` (${originalVariant.size})` : '';
        showToast(`${name}${size} stock set to ${qty}`, 'success');
        setTimeout(() => setSavedId(null), 2500);
        setTimeout(() => setFlashingRowId(null), 3000);
      }
    });
  }

  // Quick adjustment (+1, -1, +5, +10)
  function handleQuickAdjust(v: AdminInventoryVariant, delta: number) {
    const nextQty = Math.max(0, v.inventory_quantity + delta);
    handleSave(v.id, nextQty);
  }

  // Metrics Calculations across all variants
  const outOfStockCount = useMemo(() => variants.filter((v) => v.inventory_quantity === 0).length, [variants]);
  const criticalCount = useMemo(() => variants.filter((v) => v.inventory_quantity > 0 && v.inventory_quantity <= 3).length, [variants]);
  const lowCount = useMemo(() => variants.filter((v) => v.inventory_quantity > 3 && v.inventory_quantity <= 10).length, [variants]);
  const healthyCount = useMemo(() => variants.filter((v) => v.inventory_quantity > 10).length, [variants]);
  const totalCount = variants.length;

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v) => {
      if (v.products?.category_name) set.add(v.products.category_name);
    });
    return Array.from(set).sort();
  }, [variants]);

  // Filtered and Sorted Variants
  const filteredVariants = useMemo(() => {
    return variants
      .filter((v) => {
        // Scope filter (Alerts: <= 10 vs All)
        if (scope === 'alerts' && v.inventory_quantity > 10) return false;

        // Stock status card filter
        if (stockFilter === 'out_of_stock' && v.inventory_quantity !== 0) return false;
        if (stockFilter === 'critical' && (v.inventory_quantity === 0 || v.inventory_quantity > 3)) return false;
        if (stockFilter === 'low' && (v.inventory_quantity <= 3 || v.inventory_quantity > 10)) return false;
        if (stockFilter === 'healthy' && v.inventory_quantity <= 10) return false;

        // Category filter
        if (categoryFilter !== 'all' && v.products?.category_name !== categoryFilter) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const name = v.products?.name?.toLowerCase() || '';
          const sku = (v.sku || '').toLowerCase();
          const barcode = (v.barcode || '').toLowerCase();
          const size = (v.size || '').toLowerCase();
          const color = (v.color || '').toLowerCase();
          const match = name.includes(q) || sku.includes(q) || barcode.includes(q) || size.includes(q) || color.includes(q);
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'stock_asc') return a.inventory_quantity - b.inventory_quantity;
        if (sortBy === 'stock_desc') return b.inventory_quantity - a.inventory_quantity;
        if (sortBy === 'name_asc') return (a.products?.name || '').localeCompare(b.products?.name || '');
        if (sortBy === 'name_desc') return (b.products?.name || '').localeCompare(a.products?.name || '');
        if (sortBy === 'updated') {
          const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
          const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
          return timeB - timeA;
        }
        return 0;
      });
  }, [variants, scope, stockFilter, categoryFilter, searchQuery, sortBy]);

  // Export to CSV for warehouse operations
  const exportToCSV = useCallback(() => {
    const headers = ['Product Name', 'SKU', 'Barcode', 'Size', 'Color', 'Stock', 'Threshold', 'Category', 'Status'];
    const rows = filteredVariants.map((v) => {
      let status = 'Healthy';
      if (v.inventory_quantity === 0) status = 'Out of Stock';
      else if (v.inventory_quantity <= 3) status = 'Critical';
      else if (v.inventory_quantity <= 10) status = 'Low';

      return [
        `"${(v.products?.name || 'Unknown').replace(/"/g, '""')}"`,
        `"${v.sku || ''}"`,
        `"${v.barcode || ''}"`,
        `"${v.size || ''}"`,
        `"${v.color || ''}"`,
        v.inventory_quantity,
        v.low_stock_threshold,
        `"${v.products?.category_name || ''}"`,
        status,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Inventory report downloaded', 'success');
  }, [filteredVariants, showToast]);

  const hasActiveFilters = stockFilter !== 'all' || categoryFilter !== 'all' || searchQuery.trim() !== '' || scope !== 'all';

  function resetFilters() {
    setStockFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
    setScope('all');
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border text-sm font-medium ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : 'bg-rose-900 text-white border-rose-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
              Inventory &amp; Low Stock Alerts
            </h1>
            <AdminSectionInfo
              title="Inventory Replenishment Alerts"
              purpose="Monitor real-time physical warehouse stock across all garment sizes. Inline-edit stock quantities to immediately unblock or restrict customer purchases with 100% database accuracy."
              storefrontImpact="Prevents out-of-stock orders by disabling size buttons on Product Detail Pages and showing 'Only X Left' urgency counters live."
              targets={[
                { name: 'Shop All Catalog', path: '/shop', description: 'Real-time in-stock filtering' },
                { name: 'Product Detail Page', path: '/shop', description: 'Size selection stock availability' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate)] mt-0.5">
            Real-time Supabase stock synchronization across {totalCount} total variants
          </p>
        </div>

        {/* Real-time Indicator & Sync Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Live Badge */}
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

          {/* Sync Button */}
          <button
            onClick={() => handleManualRefresh(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--color-whisper)] hover:border-[var(--color-gold)] text-[var(--color-slate)] hover:text-[var(--color-ink)] rounded-xl text-xs font-medium transition-all shadow-sm disabled:opacity-50"
            title="Force refresh data directly from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[var(--color-gold)]' : ''}`} />
            <span>Sync</span>
            <span className="text-[10px] text-[var(--color-mist)] hidden sm:inline">
              ({lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
            </span>
          </button>

          {/* Export CSV */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--color-whisper)] hover:border-[var(--color-gold)] text-[var(--color-slate)] hover:text-[var(--color-ink)] rounded-xl text-xs font-medium transition-all shadow-sm"
            title="Download CSV report of current table view"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>
        </div>
      </div>

      {/* Summary Metric Cards with Interactive Filtering */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Out of Stock Card */}
        <button
          type="button"
          onClick={() => setStockFilter(prev => (prev === 'out_of_stock' ? 'all' : 'out_of_stock'))}
          className={`text-left rounded-2xl border p-5 transition-all shadow-sm cursor-pointer ${
            CARD_STYLES.outOfStock.bg
          } ${
            stockFilter === 'out_of_stock' ? CARD_STYLES.outOfStock.activeRing : CARD_STYLES.outOfStock.border
          }`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${CARD_STYLES.outOfStock.title}`}>Out of Stock</p>
            {stockFilter === 'out_of_stock' && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CARD_STYLES.outOfStock.pill}`}>
                Filtered
              </span>
            )}
          </div>
          <p className={`text-3xl font-bold mt-1 ${CARD_STYLES.outOfStock.count}`}>{outOfStockCount}</p>
          <p className="text-xs text-rose-600/80 mt-1">0 units remaining</p>
        </button>

        {/* Critical Stock Card */}
        <button
          type="button"
          onClick={() => setStockFilter(prev => (prev === 'critical' ? 'all' : 'critical'))}
          className={`text-left rounded-2xl border p-5 transition-all shadow-sm cursor-pointer ${
            CARD_STYLES.critical.bg
          } ${
            stockFilter === 'critical' ? CARD_STYLES.critical.activeRing : CARD_STYLES.critical.border
          }`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${CARD_STYLES.critical.title}`}>Critical (≤3)</p>
            {stockFilter === 'critical' && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CARD_STYLES.critical.pill}`}>
                Filtered
              </span>
            )}
          </div>
          <p className={`text-3xl font-bold mt-1 ${CARD_STYLES.critical.count}`}>{criticalCount}</p>
          <p className="text-xs text-orange-600/80 mt-1">1 to 3 units left</p>
        </button>

        {/* Low Stock Card */}
        <button
          type="button"
          onClick={() => setStockFilter(prev => (prev === 'low' ? 'all' : 'low'))}
          className={`text-left rounded-2xl border p-5 transition-all shadow-sm cursor-pointer ${
            CARD_STYLES.low.bg
          } ${
            stockFilter === 'low' ? CARD_STYLES.low.activeRing : CARD_STYLES.low.border
          }`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${CARD_STYLES.low.title}`}>Low (4–10)</p>
            {stockFilter === 'low' && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CARD_STYLES.low.pill}`}>
                Filtered
              </span>
            )}
          </div>
          <p className={`text-3xl font-bold mt-1 ${CARD_STYLES.low.count}`}>{lowCount}</p>
          <p className="text-xs text-amber-600/80 mt-1">Reorder threshold</p>
        </button>

        {/* Healthy Stock Card */}
        <button
          type="button"
          onClick={() => setStockFilter(prev => (prev === 'healthy' ? 'all' : 'healthy'))}
          className={`text-left rounded-2xl border p-5 transition-all shadow-sm cursor-pointer ${
            CARD_STYLES.healthy.bg
          } ${
            stockFilter === 'healthy' ? CARD_STYLES.healthy.activeRing : CARD_STYLES.healthy.border
          }`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${CARD_STYLES.healthy.title}`}>Healthy (&gt;10)</p>
            {stockFilter === 'healthy' && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CARD_STYLES.healthy.pill}`}>
                Filtered
              </span>
            )}
          </div>
          <p className={`text-3xl font-bold mt-1 ${CARD_STYLES.healthy.count}`}>{healthyCount}</p>
          <p className="text-xs text-emerald-600/80 mt-1">Sufficient stock</p>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper)] p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-mist)]" />
            <input
              type="text"
              placeholder="Search by product name, SKU, size, or color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-[var(--color-whisper)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)] transition-all bg-[var(--color-snow)] focus:bg-white text-[var(--color-ink)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-mist)] hover:text-[var(--color-ink)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scope Toggle & Dropdowns */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Scope Tabs */}
            <div className="flex items-center bg-[var(--color-snow)] p-1 rounded-xl border border-[var(--color-whisper)] text-xs">
              <button
                type="button"
                onClick={() => setScope('alerts')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  scope === 'alerts'
                    ? 'bg-white text-[var(--color-ink)] shadow-xs'
                    : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
                }`}
              >
                Alerts (≤10)
              </button>
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  scope === 'all'
                    ? 'bg-white text-[var(--color-ink)] shadow-xs'
                    : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
                }`}
              >
                All Variants ({totalCount})
              </button>
            </div>

            {/* Category Dropdown */}
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)] text-xs font-medium text-[var(--color-slate)] focus:outline-none focus:border-[var(--color-gold)]"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="px-3 py-2 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)] text-xs font-medium text-[var(--color-slate)] focus:outline-none focus:border-[var(--color-gold)]"
            >
              <option value="stock_asc">Stock: Lowest First</option>
              <option value="stock_desc">Stock: Highest First</option>
              <option value="name_asc">Product: A to Z</option>
              <option value="name_desc">Product: Z to A</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicator & Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-whisper)] text-xs text-[var(--color-slate)]">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Showing <strong>{filteredVariants.length}</strong> of {totalCount} variants</span>
              {stockFilter !== 'all' && (
                <span className="bg-[var(--color-snow)] border border-[var(--color-whisper)] px-2 py-0.5 rounded-full capitalize">
                  Filter: {stockFilter.replace(/_/g, ' ')}
                </span>
              )}
              {categoryFilter !== 'all' && (
                <span className="bg-[var(--color-snow)] border border-[var(--color-whisper)] px-2 py-0.5 rounded-full">
                  Category: {categoryFilter}
                </span>
              )}
              {searchQuery && (
                <span className="bg-[var(--color-snow)] border border-[var(--color-whisper)] px-2 py-0.5 rounded-full">
                  Query: &ldquo;{searchQuery}&rdquo;
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

      {/* Main Inventory Table */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-whisper)] bg-[var(--color-snow)]">
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Product
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  SKU
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Variant
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Stock
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-whisper)]">
              {filteredVariants.map((v) => {
                const isFlashing = flashingRowId === v.id;
                const isEditing = editingId === v.id;
                const isSaving = savingId === v.id;
                const isJustSaved = savedId === v.id;
                const primaryImage = v.products?.images?.[0] || null;

                return (
                  <tr
                    key={v.id}
                    className={`transition-colors duration-300 ${
                      isFlashing
                        ? 'bg-amber-100/60'
                        : isEditing
                        ? 'bg-[var(--color-gold-light,#FDF8ED)]/50'
                        : 'hover:bg-[var(--color-snow)]'
                    }`}
                  >
                    {/* Product Name & Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={v.products?.name || 'Product'}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-[var(--color-whisper)] bg-[var(--color-snow)] shadow-2xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[var(--color-snow)] border border-[var(--color-whisper)] flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-[var(--color-mist)]" />
                          </div>
                        )}
                        <div className="min-w-0">
                          {v.products?.id ? (
                            <Link
                              href={`/admin/products/${v.products.id}/edit`}
                              className="font-medium text-[var(--color-ink)] hover:text-[var(--color-gold)] truncate max-w-[220px] block transition-colors group flex items-center gap-1.5"
                              title={`Edit product ${v.products.name}`}
                            >
                              <span className="truncate">{v.products.name}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-[var(--color-gold)]" />
                            </Link>
                          ) : (
                            <span className="font-medium text-[var(--color-ink)] truncate max-w-[220px] block">
                              {v.products?.name ?? 'Unknown Product'}
                            </span>
                          )}
                          {v.products?.category_name && (
                            <span className="text-[11px] text-[var(--color-mist)] block truncate">
                              {v.products.category_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs text-[var(--color-slate)] bg-[var(--color-snow)] px-2.5 py-1 rounded-md border border-[var(--color-whisper)] inline-block">
                        {v.sku || v.barcode || '—'}
                      </span>
                    </td>

                    {/* Variant (Size & Color) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {v.size && (
                          <span className="font-medium text-xs text-[var(--color-ink)] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {v.size}
                          </span>
                        )}
                        {v.color && (
                          <div className="flex items-center gap-1.5 text-xs text-[var(--color-slate)]">
                            {v.color_hex && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/20 flex-shrink-0"
                                style={{ backgroundColor: v.color_hex }}
                              />
                            )}
                            <span>{v.color}</span>
                          </div>
                        )}
                        {!v.size && !v.color && <span className="text-xs text-[var(--color-mist)]">—</span>}
                      </div>
                    </td>

                    {/* Stock Status & Quantity Badge */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              min={0}
                              className="w-20 border border-[var(--color-gold)] rounded-lg px-2.5 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/40 bg-white"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave(v.id);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setEditValue((prev) => String(Math.max(0, Number(prev || 0) - 1)))}
                              className="p-1 rounded bg-[var(--color-snow)] border border-[var(--color-whisper)] hover:bg-[var(--color-whisper)] text-[var(--color-slate)]"
                              title="Decrease 1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditValue((prev) => String(Number(prev || 0) + 1))}
                              className="p-1 rounded bg-[var(--color-snow)] border border-[var(--color-whisper)] hover:bg-[var(--color-whisper)] text-[var(--color-slate)]"
                              title="Increase 1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Quick Preset Restock Pills */}
                          <div className="flex items-center gap-1">
                            {[0, 5, 10, 25].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setEditValue(String(preset))}
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--color-snow)] hover:bg-[var(--color-gold)] hover:text-white border border-[var(--color-whisper)] transition-colors"
                              >
                                {preset === 0 ? '0' : `+${preset}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(v)}
                            className={`font-bold px-3 py-1 rounded-full text-xs transition-all border ${
                              v.inventory_quantity === 0
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : v.inventory_quantity <= 3
                                ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                                : v.inventory_quantity <= 10
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title="Click to edit stock quantity"
                          >
                            {v.inventory_quantity === 0 ? 'OUT' : v.inventory_quantity}
                          </button>

                          {/* Quick inline +1 / -1 buttons on hover */}
                          <div className="hidden group-hover:flex items-center gap-0.5">
                            <button
                              onClick={() => handleQuickAdjust(v, -1)}
                              disabled={v.inventory_quantity <= 0 || isSaving}
                              className="p-1 rounded hover:bg-[var(--color-whisper)] text-[var(--color-slate)] disabled:opacity-30"
                              title="-1 unit"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => handleQuickAdjust(v, 1)}
                              disabled={isSaving}
                              className="p-1 rounded hover:bg-[var(--color-whisper)] text-[var(--color-slate)]"
                              title="+1 unit"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          {isJustSaved && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center text-emerald-600 text-xs gap-0.5 font-medium"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </motion.span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSave(v.id)}
                            disabled={isSaving}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-gold)] text-white rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-xs"
                          >
                            {isSaving ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={isSaving}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-whisper)] text-[var(--color-slate)] transition-colors"
                            title="Cancel edit"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(v)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-slate)] hover:text-[var(--color-gold)] hover:bg-[var(--color-snow)] rounded-lg transition-colors border border-transparent hover:border-[var(--color-whisper)]"
                        >
                          <Edit2 className="w-3 h-3" /> Update
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredVariants.length === 0 && (
            <div className="py-16 text-center text-[var(--color-mist)]">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-500" />
              <p className="font-medium text-base text-[var(--color-ink)]">No inventory records found</p>
              <p className="text-xs text-[var(--color-slate)] mt-1">
                {hasActiveFilters
                  ? 'Try clearing your search query or adjusting your filters.'
                  : 'All products currently have healthy inventory levels.'}
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

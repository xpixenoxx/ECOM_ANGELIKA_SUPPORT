'use client';

import { useState, useTransition, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Truck,
  Package,
  Search,
  RefreshCw,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Copy,
  Check,
  X,
  Filter,
  ChevronRight,
  Edit2,
  Sparkles,
  ArrowUpDown,
  Send,
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  getOrders,
  updateShipmentFulfillment,
  AdminOrder,
} from '@/lib/actions/admin-orders';

const COURIER_OPTIONS = [
  'Blue Dart',
  'Delhivery',
  'DTDC',
  'Shiprocket',
  'FedEx',
  'India Post',
  'DHL Express',
];

function getAddressFields(addr: Record<string, any> | undefined | null) {
  if (!addr) return { city: '', state: '', postalCode: '', address1: '', phone: '' };
  return {
    city: String(addr['city'] || ''),
    state: String(addr['state'] || ''),
    postalCode: String(addr['postalCode'] || ''),
    address1: String(addr['address1'] || ''),
    phone: String(addr['phone'] || ''),
  };
}

function getCourierTrackingUrl(courier: string | null, awb: string | null): string | null {
  if (!courier || !awb) return null;
  const c = courier.toLowerCase();
  const cleanAwb = encodeURIComponent(awb.trim());
  if (c.includes('blue dart') || c.includes('bluedart')) return `https://www.bluedart.com/tracking?trackNumber=${cleanAwb}`;
  if (c.includes('delhivery')) return `https://www.delhivery.com/track/package/${cleanAwb}`;
  if (c.includes('dtdc')) return `https://www.dtdc.in/tracking/shipment-tracking.asp?searchType=awbNo&strAwbNo=${cleanAwb}`;
  if (c.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${cleanAwb}`;
  if (c.includes('dhl')) return `https://www.dhl.com/en/express/tracking.html?AWB=${cleanAwb}`;
  if (c.includes('post') || c.includes('speed')) return 'https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx';
  return null;
}

type TabType = 'all' | 'needs_dispatch' | 'in_transit' | 'delivered';
type SortField = 'newest' | 'oldest' | 'amount_desc' | 'customer_asc';

interface Props {
  initialOrders: AdminOrder[];
}

export default function ShipmentsClient({ initialOrders }: Props) {
  const [, startTransition] = useTransition();
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [courierFilter, setCourierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortField>('newest');

  // Real-time & Status
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [flashingOrderId, setFlashingOrderId] = useState<string | null>(null);
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Dispatch / Edit Tracking Modal
  const [activeModalOrder, setActiveModalOrder] = useState<AdminOrder | null>(null);
  const [modalCourier, setModalCourier] = useState('Delhivery');
  const [modalTracking, setModalTracking] = useState('');
  const [modalStatus, setModalStatus] = useState<'shipped' | 'delivered'>('shipped');
  const [isSaving, setIsSaving] = useState(false);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  }, []);

  // Supabase Real-time Subscription on orders
  useEffect(() => {
    const supabase = getSupabaseClient();
    const channelName = `realtime:admin_shipments_${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            if (!updated?.id) return;

            setOrders((prev) =>
              prev.map((o) => {
                if (o.id === updated.id) {
                  return {
                    ...o,
                    status: updated.status || o.status,
                    courier_partner: updated.courier_partner ?? o.courier_partner,
                    tracking_number: updated.tracking_number ?? o.tracking_number,
                    shipped_at: updated.shipped_at ?? o.shipped_at,
                    delivered_at: updated.delivered_at ?? o.delivered_at,
                    updated_at: updated.updated_at || new Date().toISOString(),
                  };
                }
                return o;
              })
            );

            setFlashingOrderId(updated.id);
            setTimeout(() => setFlashingOrderId(null), 3000);
            setLastSyncedAt(new Date());
          } else if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
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

  // Manual Sync with Supabase
  const handleManualRefresh = useCallback(async (showNotice = true) => {
    setIsRefreshing(true);
    try {
      const fresh = await getOrders();
      if (fresh) {
        setOrders(fresh);
        setLastSyncedAt(new Date());
        if (showNotice) showToast('Shipments synced with Supabase', 'success');
      }
    } catch {
      if (showNotice) showToast('Failed to sync shipments', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  // Copy AWB to Clipboard
  function copyToClipboard(awb: string) {
    navigator.clipboard.writeText(awb);
    setCopiedAwb(awb);
    showToast(`AWB ${awb} copied to clipboard`, 'success');
    setTimeout(() => setCopiedAwb(null), 2000);
  }

  // Open Modal to Dispatch or Edit
  function openFulfillmentModal(order: AdminOrder) {
    setActiveModalOrder(order);
    setModalCourier(order.courier_partner || 'Delhivery');
    setModalTracking(order.tracking_number || '');
    setModalStatus(order.status === 'delivered' ? 'delivered' : 'shipped');
  }

  // Submit Fulfillment Form
  async function handleFulfillmentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeModalOrder) return;

    if (!modalTracking.trim()) {
      showToast('Please enter an AWB / tracking number', 'error');
      return;
    }

    setIsSaving(true);
    const orderId = activeModalOrder.id;
    const targetStatus = modalStatus;
    const courier = modalCourier;
    const awb = modalTracking.trim();

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: targetStatus,
              courier_partner: courier,
              tracking_number: awb,
              shipped_at: targetStatus === 'shipped' ? new Date().toISOString() : o.shipped_at,
              delivered_at: targetStatus === 'delivered' ? new Date().toISOString() : o.delivered_at,
            }
          : o
      )
    );

    const res = await updateShipmentFulfillment(orderId, {
      courierPartner: courier,
      trackingNumber: awb,
      status: targetStatus,
    });

    setIsSaving(false);

    if (res.error) {
      showToast(`Fulfillment error: ${res.error}`, 'error');
      handleManualRefresh(false);
    } else {
      setActiveModalOrder(null);
      setFlashingOrderId(orderId);
      showToast(
        `Order ${activeModalOrder.order_number} marked as ${targetStatus} via ${courier}`,
        'success'
      );
      setTimeout(() => setFlashingOrderId(null), 3000);
    }
  }

  // Quick One-Click Mark as Delivered
  async function handleQuickMarkDelivered(order: AdminOrder) {
    const courier = order.courier_partner || 'Delhivery';
    const awb = order.tracking_number || '';

    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              status: 'delivered',
              delivered_at: new Date().toISOString(),
            }
          : o
      )
    );

    const res = await updateShipmentFulfillment(order.id, {
      courierPartner: courier,
      trackingNumber: awb,
      status: 'delivered',
    });

    if (res.error) {
      showToast(`Error: ${res.error}`, 'error');
      handleManualRefresh(false);
    } else {
      setFlashingOrderId(order.id);
      showToast(`Order ${order.order_number} marked as Delivered`, 'success');
      setTimeout(() => setFlashingOrderId(null), 3000);
    }
  }

  // Metrics Calculations
  const needsDispatchCount = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status === 'confirmed' ||
          o.status === 'pending' ||
          (!o.tracking_number && o.status !== 'cancelled' && o.status !== 'delivered')
      ).length,
    [orders]
  );
  const inTransitCount = useMemo(
    () => orders.filter((o) => o.status === 'shipped').length,
    [orders]
  );
  const deliveredCount = useMemo(
    () => orders.filter((o) => o.status === 'delivered').length,
    [orders]
  );
  const totalShipments = orders.length;

  // Extract Couriers in Data
  const availableCouriers = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.courier_partner) set.add(o.courier_partner);
    });
    return Array.from(set).sort();
  }, [orders]);

  // Filtered and Sorted Shipments
  const filtered = useMemo(() => {
    return orders
      .filter((o) => {
        // Tab Filter
        if (activeTab === 'needs_dispatch') {
          const isPending =
            o.status === 'confirmed' ||
            o.status === 'pending' ||
            (!o.tracking_number && o.status !== 'cancelled' && o.status !== 'delivered');
          if (!isPending) return false;
        } else if (activeTab === 'in_transit') {
          if (o.status !== 'shipped') return false;
        } else if (activeTab === 'delivered') {
          if (o.status !== 'delivered') return false;
        }

        // Courier Filter
        if (courierFilter !== 'all' && o.courier_partner !== courierFilter) {
          return false;
        }

        // Search Query
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const addr = getAddressFields(o.shipping_address);
          const orderNum = (o.order_number || '').toLowerCase();
          const customerName = (o.customer_name || '').toLowerCase();
          const email = (o.email || '').toLowerCase();
          const phone = (o.phone || '').toLowerCase();
          const tracking = (o.tracking_number || '').toLowerCase();
          const courier = (o.courier_partner || '').toLowerCase();
          const city = addr.city.toLowerCase();
          const pincode = addr.postalCode.toLowerCase();

          const match =
            orderNum.includes(q) ||
            customerName.includes(q) ||
            email.includes(q) ||
            phone.includes(q) ||
            tracking.includes(q) ||
            courier.includes(q) ||
            city.includes(q) ||
            pincode.includes(q);

          if (!match) return false;
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
        if (sortBy === 'amount_desc') {
          return Number(b.total_amount || 0) - Number(a.total_amount || 0);
        }
        if (sortBy === 'customer_asc') {
          return (a.customer_name || '').localeCompare(b.customer_name || '');
        }
        return 0;
      });
  }, [orders, activeTab, courierFilter, search, sortBy]);

  // Export CSV Manifest
  const exportToCSV = useCallback(() => {
    const headers = [
      'Order Number',
      'Customer Name',
      'Phone',
      'Email',
      'Address',
      'City',
      'State',
      'Pincode',
      'Status',
      'Courier Partner',
      'Tracking AWB',
      'Total Amount (INR)',
      'Order Date',
      'Shipped Date',
    ];

    const rows = filtered.map((o) => {
      const addr = getAddressFields(o.shipping_address);
      return [
        `"${o.order_number}"`,
        `"${(o.customer_name || '').replace(/"/g, '""')}"`,
        `"${o.phone || addr.phone || ''}"`,
        `"${o.email || ''}"`,
        `"${addr.address1.replace(/"/g, '""')}"`,
        `"${addr.city}"`,
        `"${addr.state}"`,
        `"${addr.postalCode}"`,
        o.status,
        `"${o.courier_partner || 'Unassigned'}"`,
        `"${o.tracking_number || ''}"`,
        o.total_amount,
        `"${new Date(o.created_at).toISOString().slice(0, 10)}"`,
        o.shipped_at ? `"${new Date(o.shipped_at).toISOString().slice(0, 10)}"` : '""',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shipping-manifest-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Shipping manifest exported', 'success');
  }, [filtered, showToast]);

  const hasActiveFilters = activeTab !== 'all' || courierFilter !== 'all' || search.trim() !== '';

  function resetFilters() {
    setActiveTab('all');
    setCourierFilter('all');
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
              Shipments &amp; Logistics Center
            </h1>
            <AdminSectionInfo
              title="Order Fulfillment & Dispatch Logistics"
              purpose="Manage warehouse parcel dispatches, assign courier tracking numbers (AWB), track real-time delivery milestones, and generate shipping manifests with 100% database accuracy."
              storefrontImpact="Dispatches immediately trigger customer tracking notifications, update order status in customer account (/account/orders), and unlock live carrier tracking."
              targets={[
                { name: 'Customer Order History', path: '/account/orders', description: 'Customer shipment tracking portal' },
                { name: 'Order Details Page', path: '/account/orders', description: 'Real-time carrier AWB & status' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate)] mt-0.5">
            Real-time Supabase courier dispatch &amp; delivery tracking across {totalShipments} total orders
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
            title="Force refresh shipments directly from Supabase"
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
            title="Download CSV shipping manifest for courier handoff"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span> Manifest
          </button>
        </div>
      </div>

      {/* Metric Cards with Quick Interactive Filtering */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Needs Dispatch */}
        <button
          type="button"
          onClick={() => setActiveTab((prev) => (prev === 'needs_dispatch' ? 'all' : 'needs_dispatch'))}
          className={`text-left bg-white rounded-2xl border p-5 transition-all shadow-sm cursor-pointer ${
            activeTab === 'needs_dispatch'
              ? 'border-amber-400 ring-2 ring-amber-500/20 bg-amber-50/40'
              : 'border-[var(--color-whisper)] hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-amber-800">Ready to Ship</p>
            <div className="w-8 h-8 rounded-lg bg-amber-100/80 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-900 mt-2">{needsDispatchCount}</p>
          <p className="text-xs text-amber-700/80 mt-1">Pending parcel dispatch</p>
        </button>

        {/* In Transit */}
        <button
          type="button"
          onClick={() => setActiveTab((prev) => (prev === 'in_transit' ? 'all' : 'in_transit'))}
          className={`text-left bg-white rounded-2xl border p-5 transition-all shadow-sm cursor-pointer ${
            activeTab === 'in_transit'
              ? 'border-blue-400 ring-2 ring-blue-500/20 bg-blue-50/40'
              : 'border-[var(--color-whisper)] hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-800">In Transit</p>
            <div className="w-8 h-8 rounded-lg bg-blue-100/80 flex items-center justify-center text-blue-700">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-900 mt-2">{inTransitCount}</p>
          <p className="text-xs text-blue-700/80 mt-1">Dispatched with courier</p>
        </button>

        {/* Delivered */}
        <button
          type="button"
          onClick={() => setActiveTab((prev) => (prev === 'delivered' ? 'all' : 'delivered'))}
          className={`text-left bg-white rounded-2xl border p-5 transition-all shadow-sm cursor-pointer ${
            activeTab === 'delivered'
              ? 'border-emerald-400 ring-2 ring-emerald-500/20 bg-emerald-50/40'
              : 'border-[var(--color-whisper)] hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-emerald-800">Delivered</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-900 mt-2">{deliveredCount}</p>
          <p className="text-xs text-emerald-700/80 mt-1">Successfully fulfilled</p>
        </button>

        {/* Total Active */}
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`text-left bg-white rounded-2xl border p-5 transition-all shadow-sm cursor-pointer ${
            activeTab === 'all'
              ? 'border-[var(--color-gold)] ring-2 ring-[var(--color-gold)]/20'
              : 'border-[var(--color-whisper)] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-slate)]">Total Shipments</p>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-ink)] mt-2">{totalShipments}</p>
          <p className="text-xs text-[var(--color-mist)] mt-1">Lifetime logistics volume</p>
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
              placeholder="Search by Order #, Customer, AWB Tracking, Courier, City, Pincode..."
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

          {/* Status Tabs */}
          <div className="flex items-center bg-[var(--color-snow)] p-1 rounded-xl border border-[var(--color-whisper)] text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-[var(--color-ink)] shadow-xs'
                  : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
              }`}
            >
              All ({totalShipments})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('needs_dispatch')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'needs_dispatch'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
              }`}
            >
              Ready to Ship ({needsDispatchCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('in_transit')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'in_transit'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
              }`}
            >
              In Transit ({inTransitCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('delivered')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'delivered'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-[var(--color-slate)] hover:text-[var(--color-ink)]'
              }`}
            >
              Delivered ({deliveredCount})
            </button>
          </div>

          {/* Courier Filter & Sort */}
          <div className="flex items-center gap-2">
            {availableCouriers.length > 0 && (
              <select
                value={courierFilter}
                onChange={(e) => setCourierFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)] text-xs font-medium text-[var(--color-slate)] focus:outline-none focus:border-[var(--color-gold)]"
              >
                <option value="all">All Carriers</option>
                {availableCouriers.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="px-3 py-2 rounded-xl border border-[var(--color-whisper)] bg-[var(--color-snow)] text-xs font-medium text-[var(--color-slate)] focus:outline-none focus:border-[var(--color-gold)]"
            >
              <option value="newest">Order: Newest First</option>
              <option value="oldest">Order: Oldest First</option>
              <option value="amount_desc">Value: High to Low</option>
              <option value="customer_asc">Customer: A to Z</option>
            </select>
          </div>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-whisper)] text-xs text-[var(--color-slate)]">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Showing <strong>{filtered.length}</strong> of {totalShipments} shipments</span>
              {activeTab !== 'all' && (
                <span className="bg-[var(--color-snow)] border border-[var(--color-whisper)] px-2 py-0.5 rounded-full capitalize">
                  Tab: {activeTab.replace(/_/g, ' ')}
                </span>
              )}
              {courierFilter !== 'all' && (
                <span className="bg-[var(--color-snow)] border border-[var(--color-whisper)] px-2 py-0.5 rounded-full">
                  Carrier: {courierFilter}
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

      {/* Main Shipments Table */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-whisper)] bg-[var(--color-snow)]">
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Order
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Customer &amp; Destination
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Carrier &amp; AWB Tracking
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Amount
                </th>
                <th className="py-3.5 px-4 text-right font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wide">
                  Fulfillment Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-whisper)]">
              {filtered.map((order) => {
                const isFlashing = flashingOrderId === order.id;
                const addr = getAddressFields(order.shipping_address);
                const trackingUrl = getCourierTrackingUrl(order.courier_partner, order.tracking_number);
                const hasAwb = Boolean(order.tracking_number);

                let statusBadge = (
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold uppercase">
                    {order.status}
                  </span>
                );

                if (order.status === 'confirmed' || order.status === 'pending') {
                  statusBadge = (
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Ready to Ship
                    </span>
                  );
                } else if (order.status === 'shipped') {
                  statusBadge = (
                    <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                      <Truck className="w-3 h-3" /> In Transit
                    </span>
                  );
                } else if (order.status === 'delivered') {
                  statusBadge = (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Delivered
                    </span>
                  );
                } else if (order.status === 'cancelled') {
                  statusBadge = (
                    <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                      Cancelled
                    </span>
                  );
                }

                return (
                  <tr
                    key={order.id}
                    className={`transition-colors duration-300 ${
                      isFlashing ? 'bg-amber-100/60' : 'hover:bg-[var(--color-snow)]'
                    }`}
                  >
                    {/* Order Details */}
                    <td className="py-3.5 px-4">
                      <div>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-xs font-bold text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors inline-flex items-center gap-1 group"
                        >
                          <span>{order.order_number}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-gold)]" />
                        </Link>
                        <p className="text-xs text-[var(--color-slate)] mt-0.5">
                          {order.items_count ?? 1} item{(order.items_count ?? 1) > 1 ? 's' : ''} &bull;{' '}
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </td>

                    {/* Customer & Destination */}
                    <td className="py-3.5 px-4">
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--color-ink)] truncate max-w-[200px]">
                          {order.customer_name || 'Customer'}
                        </p>
                        <p className="text-xs text-[var(--color-slate)] truncate max-w-[220px] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0 text-[var(--color-mist)]" />
                          <span>
                            {[addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ') || 'No address'}
                          </span>
                        </p>
                        {addr.phone && (
                          <p className="text-[11px] text-[var(--color-mist)] mt-0.5">
                            Tel: {addr.phone}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">{statusBadge}</td>

                    {/* Carrier & Tracking */}
                    <td className="py-3.5 px-4">
                      {hasAwb ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-xs text-[var(--color-ink)] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {order.courier_partner || 'Carrier'}
                            </span>
                            {trackingUrl && (
                              <a
                                href={trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-medium text-[var(--color-gold)] hover:underline inline-flex items-center gap-0.5"
                                title="Open Live Carrier Tracking"
                              >
                                <span>Track</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs text-[var(--color-slate)] bg-[var(--color-snow)] px-2 py-0.5 rounded border border-[var(--color-whisper)]">
                              {order.tracking_number}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(order.tracking_number!)}
                              className="p-1 rounded text-[var(--color-mist)] hover:text-[var(--color-ink)] hover:bg-[var(--color-snow)]"
                              title="Copy AWB number"
                            >
                              {copiedAwb === order.tracking_number ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-700 font-medium bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block">
                          AWB Unassigned
                        </span>
                      )}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 font-semibold text-[var(--color-ink)] text-sm">
                      ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Fulfillment Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => openFulfillmentModal(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-gold)] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-all shadow-xs"
                          >
                            <Send className="w-3 h-3" />
                            <span>{hasAwb ? 'Update AWB' : 'Dispatch'}</span>
                          </button>
                        )}

                        {order.status === 'shipped' && (
                          <button
                            type="button"
                            onClick={() => handleQuickMarkDelivered(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition-all"
                            title="Mark as Delivered"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Delivered</span>
                          </button>
                        )}

                        {order.status === 'delivered' && (
                          <button
                            type="button"
                            onClick={() => openFulfillmentModal(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-snow)] rounded-md border border-transparent hover:border-[var(--color-whisper)]"
                            title="Edit shipping notes or AWB"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-[var(--color-mist)]">
              <Truck className="w-10 h-10 mx-auto mb-3 opacity-30 text-[var(--color-gold)]" />
              <p className="font-medium text-base text-[var(--color-ink)]">No shipments found</p>
              <p className="text-xs text-[var(--color-slate)] mt-1">
                {hasActiveFilters
                  ? 'Try clearing your search query or adjusting your carrier/status filter.'
                  : 'New orders will automatically appear here ready for warehouse fulfillment.'}
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

      {/* Dispatch / Fulfillment Modal Dialog */}
      <AnimatePresence>
        {activeModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setActiveModalOrder(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[var(--color-whisper)] p-6 z-10 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[var(--color-whisper)]">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-ink)] flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[var(--color-gold)]" />
                    <span>Dispatch Fulfillment</span>
                  </h3>
                  <p className="text-xs text-[var(--color-slate)] mt-0.5">
                    Order: <strong className="font-mono text-[var(--color-ink)]">{activeModalOrder.order_number}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setActiveModalOrder(null)}
                  className="p-1 rounded-lg text-[var(--color-mist)] hover:text-[var(--color-ink)] hover:bg-[var(--color-snow)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order Delivery Preview */}
              {(() => {
                const addr = getAddressFields(activeModalOrder.shipping_address);
                return (
                  <div className="p-3 bg-[var(--color-snow)] rounded-xl border border-[var(--color-whisper)] text-xs space-y-1">
                    <p className="font-medium text-[var(--color-ink)]">
                      Deliver to: {activeModalOrder.customer_name || 'Customer'}
                    </p>
                    <p className="text-[var(--color-slate)]">
                      {[addr.address1, addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}
                    </p>
                    {addr.phone && (
                      <p className="text-[var(--color-mist)]">
                        Tel: {addr.phone}
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Fulfillment Form */}
              <form onSubmit={handleFulfillmentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-slate)] uppercase tracking-wider mb-1.5">
                    Courier Partner
                  </label>
                  <select
                    value={modalCourier}
                    onChange={(e) => setModalCourier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-whisper)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                    required
                  >
                    {COURIER_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-slate)] uppercase tracking-wider mb-1.5">
                    Airway Bill / Tracking AWB #
                  </label>
                  <input
                    type="text"
                    value={modalTracking}
                    onChange={(e) => setModalTracking(e.target.value)}
                    placeholder="e.g. DEL7291839210 or 128394821"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-whisper)] bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30 focus:border-[var(--color-gold)]"
                    required
                    autoFocus
                  />
                  <p className="text-[11px] text-[var(--color-mist)] mt-1">
                    Customer receives immediate notification with this tracking link.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-slate)] uppercase tracking-wider mb-1.5">
                    Logistics Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setModalStatus('shipped')}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                        modalStatus === 'shipped'
                          ? 'bg-blue-50 text-blue-800 border-blue-300 ring-2 ring-blue-500/20'
                          : 'bg-white text-[var(--color-slate)] border-[var(--color-whisper)]'
                      }`}
                    >
                      In Transit (Shipped)
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalStatus('delivered')}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                        modalStatus === 'delivered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-white text-[var(--color-slate)] border-[var(--color-whisper)]'
                      }`}
                    >
                      Delivered
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-whisper)]">
                  <button
                    type="button"
                    onClick={() => setActiveModalOrder(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-slate)] hover:bg-[var(--color-snow)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-[var(--color-gold)] text-white hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm &amp; Update Dispatch</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

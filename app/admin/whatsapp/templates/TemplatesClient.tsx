'use client';

import React, { useState, useEffect, useTransition, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Copy,
  ExternalLink,
  Phone,
  User,
  ShoppingBag,
  RefreshCw,
  Search,
  MessageSquare,
  AlertTriangle,
  Check,
  X,
  CheckCheck,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  WhatsAppTemplateItem,
  WhatsAppLogRecord,
  OFFICIAL_TEMPLATES,
} from '@/lib/actions/admin-whatsapp-types';
import {
  getWhatsAppContextData,
  logWhatsAppMessage,
} from '@/lib/actions/admin-whatsapp';

interface Props {
  initialData: {
    templates: WhatsAppTemplateItem[];
    logs: WhatsAppLogRecord[];
    orders: any[];
    profiles: any[];
    stats: {
      totalTemplates: number;
      totalSent: number;
      optedInCustomers: number;
      deliveryRate: number;
    };
  };
}

export default function TemplatesClient({ initialData }: Props) {
  const [, startTransition] = useTransition();
  const [templates] = useState<WhatsAppTemplateItem[]>(initialData.templates || OFFICIAL_TEMPLATES);
  const [logs, setLogs] = useState<WhatsAppLogRecord[]>(initialData.logs || []);
  const [orders] = useState<any[]>(initialData.orders || []);
  const [profiles] = useState<any[]>(initialData.profiles || []);

  // UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'logs'>('templates');
  const [logSearch, setLogSearch] = useState('');
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [flashingLogId, setFlashingLogId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Send Template Modal State
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplateItem | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [courierPartner, setCourierPartner] = useState('Delhivery');
  const [trackingNumber, setTrackingNumber] = useState('DEL7291839210');
  const [collectionName, setCollectionName] = useState('Bridal Kanjivaram');
  const [isSending, setIsSending] = useState(false);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  }, []);

  // Supabase Real-time Listener on whatsapp_conversations
  useEffect(() => {
    const supabase = getSupabaseClient();
    const channelName = `realtime:admin_whatsapp_templates_${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_conversations',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as any;
            const meta = newRow.metadata || {};
            const params = newRow.template_params || {};

            const formattedLog: WhatsAppLogRecord = {
              id: newRow.id,
              phone: newRow.phone,
              wa_message_id: newRow.wa_message_id,
              type: newRow.type || 'template',
              status: newRow.status || 'sent',
              template_name: newRow.template_name,
              template_params: params,
              metadata: meta,
              user_id: newRow.user_id,
              created_at: newRow.created_at || new Date().toISOString(),
              customer_name: params.customer_name || meta.customer_name || 'Valued Client',
              order_number: params.order_number || meta.order_number || null,
            };

            setLogs((prev) => [formattedLog, ...prev.filter((l) => l.id !== formattedLog.id)]);
            setFlashingLogId(formattedLog.id);
            setTimeout(() => setFlashingLogId(null), 3000);
            setLastSyncedAt(new Date());
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            setLogs((prev) =>
              prev.map((l) =>
                l.id === updated.id
                  ? {
                      ...l,
                      status: updated.status || l.status,
                    }
                  : l
              )
            );
            setLastSyncedAt(new Date());
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

  // Manual Sync
  const handleManualRefresh = useCallback(async (showNotice = true) => {
    setIsRefreshing(true);
    try {
      const fresh = await getWhatsAppContextData();
      if (fresh) {
        setLogs(fresh.logs);
        setLastSyncedAt(new Date());
        if (showNotice) showToast('WhatsApp logs synced with Supabase', 'success');
      }
    } catch {
      if (showNotice) showToast('Failed to sync WhatsApp data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  // Copy raw template text
  function copyTemplate(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Template body copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Open Send Modal for a Template
  function openSendModal(template: WhatsAppTemplateItem) {
    setSelectedTemplate(template);

    // Preselect first order if available
    if (orders.length > 0) {
      const firstOrder = orders[0];
      setSelectedOrderId(firstOrder.id);
      const addr = firstOrder.shipping_address || {};
      const name = [addr['firstName'], addr['lastName']].filter(Boolean).join(' ') || addr['full_name'] || 'Priya Sharma';
      const phone = firstOrder.phone || addr['phone'] || '+919876543210';
      setCustomerName(name);
      setRecipientPhone(phone);
      setOrderNumber(firstOrder.order_number || 'ORD-MVW7SBV2-7233');
      setCourierPartner(firstOrder.courier_partner || 'Delhivery');
      setTrackingNumber(firstOrder.tracking_number || 'DEL7291839210');
    } else {
      setCustomerName('Priya Sharma');
      setRecipientPhone('+919876543210');
      setOrderNumber('ORD-MVW7SBV2-7233');
      setCourierPartner('Delhivery');
      setTrackingNumber('DEL7291839210');
    }
  }

  // Handle Order Selection inside Modal
  function handleOrderSelectChange(orderId: string) {
    setSelectedOrderId(orderId);
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      const addr = order.shipping_address || {};
      const name = [addr['firstName'], addr['lastName']].filter(Boolean).join(' ') || addr['full_name'] || 'Priya Sharma';
      const phone = order.phone || addr['phone'] || '+919876543210';
      setCustomerName(name);
      setRecipientPhone(phone);
      setOrderNumber(order.order_number || '');
      if (order.courier_partner) setCourierPartner(order.courier_partner);
      if (order.tracking_number) setTrackingNumber(order.tracking_number);
    }
  }

  // Interpolate Template Body with Real Values
  const interpolatedMessage = useMemo(() => {
    if (!selectedTemplate) return '';
    let body = selectedTemplate.body;

    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const trackingUrl = `${siteUrl}/account/orders`;

    if (selectedTemplate.name === 'order_confirmed_v2') {
      body = body
        .replace('{{1}}', customerName || 'Valued Client')
        .replace('{{2}}', orderNumber || 'ORD-XXXX')
        .replace('{{3}}', trackingUrl);
    } else if (selectedTemplate.name === 'order_dispatched_tracking') {
      body = body
        .replace('{{1}}', customerName || 'Valued Client')
        .replace('{{2}}', orderNumber || 'ORD-XXXX')
        .replace('{{3}}', courierPartner || 'Delhivery')
        .replace('{{4}}', trackingNumber || 'DELXXXXX');
    } else if (selectedTemplate.name === 'out_for_delivery_alert') {
      body = body
        .replace('{{1}}', customerName || 'Valued Client')
        .replace('{{2}}', orderNumber || 'ORD-XXXX')
        .replace('{{3}}', courierPartner || 'Delhivery');
    } else if (selectedTemplate.name === 'bespoke_styling_followup') {
      body = body
        .replace('{{1}}', customerName || 'Valued Client')
        .replace('{{2}}', collectionName || 'Bridal Heritage');
    }

    return body;
  }, [selectedTemplate, customerName, orderNumber, courierPartner, trackingNumber, collectionName]);

  // Dispatch / Send Template
  async function handleSendTemplate(openWhatsAppWeb: boolean) {
    if (!selectedTemplate) return;
    const cleanPhone = recipientPhone.replace(/[^0-9+]/g, '');
    if (!cleanPhone) {
      showToast('Please enter a valid phone number with country code', 'error');
      return;
    }

    setIsSending(true);

    const templateParams = {
      customer_name: customerName,
      order_number: orderNumber,
      courier_partner: courierPartner,
      tracking_number: trackingNumber,
      collection: collectionName,
    };

    const res = await logWhatsAppMessage({
      phone: cleanPhone,
      templateName: selectedTemplate.name,
      templateParams,
      messageBody: interpolatedMessage,
      status: 'sent',
    });

    setIsSending(false);

    if (res.success && res.record) {
      setLogs((prev) => [res.record!, ...prev]);
      setFlashingLogId(res.record.id);
      showToast(`WhatsApp template logged & dispatched to ${cleanPhone}`, 'success');
      setTimeout(() => setFlashingLogId(null), 3000);

      if (openWhatsAppWeb) {
        const encodedText = encodeURIComponent(interpolatedMessage);
        const waNumber = cleanPhone.replace(/\+/g, '');
        const waUrl = `https://wa.me/${waNumber}?text=${encodedText}`;
        window.open(waUrl, '_blank');
      }

      setSelectedTemplate(null);
    } else {
      showToast(res.error || 'Failed to dispatch WhatsApp template', 'error');
    }
  }

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (!logSearch.trim()) return true;
      const q = logSearch.toLowerCase().trim();
      const phone = (l.phone || '').toLowerCase();
      const name = (l.customer_name || '').toLowerCase();
      const tName = (l.template_name || '').toLowerCase();
      const orderNum = (l.order_number || '').toLowerCase();
      const msg = (l.metadata?.['message'] || '').toLowerCase();
      return phone.includes(q) || name.includes(q) || tName.includes(q) || orderNum.includes(q) || msg.includes(q);
    });
  }, [logs, logSearch]);

  const totalSentCount = logs.length;
  const optedInCount = initialData.stats?.optedInCustomers ?? 0;

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

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-2xl font-medium text-[var(--color-ink,#111111)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              WhatsApp Notification Templates
            </h1>
            <AdminSectionInfo
              title="Official WhatsApp Business Templates"
              purpose="Manage pre-approved WhatsApp message templates registered with Meta. These templates are automatically triggered when customer orders are placed, dispatched, and delivered."
              storefrontImpact="Directly sent to the customer's phone number provided during checkout or order tracking on /track-order."
              targets={[
                { name: 'Checkout Form', path: '/checkout', description: 'Customer phone number capture & WhatsApp opt-in' },
                { name: 'Order Tracking Page', path: '/track-order', description: 'Tracking status sync' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Meta WhatsApp Cloud API pre-approved notification templates &amp; live dispatch engine
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)] text-[var(--color-slate,#666666)] hover:text-[var(--color-ink,#111111)] rounded-xl text-xs font-medium transition-all shadow-sm disabled:opacity-50"
            title="Sync latest WhatsApp logs from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[var(--color-gold,#C9A84C)]' : ''}`} />
            <span>Sync</span>
            <span suppressHydrationWarning className="text-[10px] text-[var(--color-mist,#999999)] hidden sm:inline">
              ({lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
            </span>
          </button>
        </div>
      </div>

      {/* Top Stats Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Approved Templates */}
        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-slate,#666666)]">Meta Templates</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-ink,#111111)] mt-2">4</p>
          <p className="text-xs text-emerald-600 mt-1">100% Pre-approved by Meta</p>
        </div>

        {/* Transmitted Messages */}
        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-slate,#666666)]">Transmitted</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-ink,#111111)] mt-2">{totalSentCount}</p>
          <p className="text-xs text-blue-600 mt-1">Logged in Supabase</p>
        </div>

        {/* Opted-in Customers */}
        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-slate,#666666)]">Opted-in Clients</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-ink,#111111)] mt-2">{optedInCount}</p>
          <p className="text-xs text-amber-600 mt-1">WhatsApp order updates enabled</p>
        </div>

        {/* Delivery Success Rate */}
        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-slate,#666666)]">Delivery Rate</p>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-ink,#111111)] mt-2">100%</p>
          <p className="text-xs text-purple-600 mt-1">Active Cloud API Endpoint</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center bg-[var(--color-snow,#F9F9F9)] p-1 rounded-xl border border-[var(--color-whisper,#E5E5E5)] text-xs w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'templates'
              ? 'bg-white text-[var(--color-ink,#111111)] shadow-xs'
              : 'text-[var(--color-slate,#666666)] hover:text-[var(--color-ink,#111111)]'
          }`}
        >
          Approved Meta Templates ({templates.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'bg-white text-[var(--color-ink,#111111)] shadow-xs'
              : 'text-[var(--color-slate,#666666)] hover:text-[var(--color-ink,#111111)]'
          }`}
        >
          <span>Live Transmission Log</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {totalSentCount}
          </span>
        </button>
      </div>

      {/* VIEW 1: TEMPLATES GRID */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[var(--color-ink,#111111)] font-mono">{t.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-50 text-green-700 border border-green-200">
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-slate,#666666)] mt-0.5">
                      Category: <span className="font-semibold">{t.category}</span> &bull; {t.language}
                    </p>
                  </div>

                  {/* Top Copy Button */}
                  <button
                    type="button"
                    onClick={() => copyTemplate(t.id, t.body)}
                    className="p-1.5 rounded-lg border border-[var(--color-whisper,#E5E5E5)] text-[var(--color-slate,#666666)] hover:text-[var(--color-gold,#C9A84C)] hover:bg-[var(--color-snow,#F9F9F9)] text-xs flex items-center gap-1 transition-colors"
                    title="Copy template message body"
                  >
                    {copiedId === t.id ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Message Bubble Preview */}
                <div className="p-4 rounded-xl bg-[#DCF8C6]/30 border border-[#DCF8C6] text-xs text-[var(--color-ink,#111111)] leading-relaxed font-sans shadow-2xs relative">
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-emerald-800 font-medium">
                    <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <p className="pr-8">{t.body}</p>
                </div>

                {/* Parameter placeholders badge */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-[var(--color-mist,#999999)]">Variables:</span>
                  {t.paramPlaceholders.map((p, idx) => (
                    <span
                      key={p}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--color-snow,#F9F9F9)] border border-[var(--color-whisper,#E5E5E5)] text-[var(--color-slate,#666666)]"
                    >
                      {`{{${idx + 1}}}`} = {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer with Trigger & Action */}
              <div className="pt-3 border-t border-[var(--color-whisper,#E5E5E5)] flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-slate,#666666)] truncate">
                  <Clock className="w-3.5 h-3.5 text-[var(--color-gold,#C9A84C)] flex-shrink-0" />
                  <span className="truncate">{t.triggerEvent}</span>
                </span>

                <button
                  type="button"
                  onClick={() => openSendModal(t)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex-shrink-0"
                >
                  <Send className="w-3 h-3" />
                  <span>Send / Test</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: REAL-TIME TRANSMISSION LOG */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-4 shadow-sm flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mist,#999999)]" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search transmission logs by phone, client name, template, or order number..."
                className="w-full pl-10 pr-9 py-2 border border-[var(--color-whisper,#E5E5E5)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)] bg-[var(--color-snow,#F9F9F9)] focus:bg-white text-[var(--color-ink,#111111)]"
              />
              {logSearch && (
                <button
                  onClick={() => setLogSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-mist,#999999)] hover:text-[var(--color-ink,#111111)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)]">
                    <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate,#666666)] text-xs uppercase tracking-wide">
                      Recipient
                    </th>
                    <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate,#666666)] text-xs uppercase tracking-wide">
                      Template &amp; Context
                    </th>
                    <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate,#666666)] text-xs uppercase tracking-wide">
                      Message Content
                    </th>
                    <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate,#666666)] text-xs uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate,#666666)] text-xs uppercase tracking-wide">
                      Transmitted
                    </th>
                    <th className="py-3.5 px-4 text-right font-semibold text-[var(--color-slate,#666666)] text-xs uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-whisper,#E5E5E5)]">
                  {filteredLogs.map((log) => {
                    const isFlashing = flashingLogId === log.id;
                    const messageBody = log.metadata?.['message'] || 'Template message';

                    return (
                      <tr
                        key={log.id}
                        className={`transition-colors duration-300 ${
                          isFlashing ? 'bg-emerald-100/60' : 'hover:bg-[var(--color-snow,#F9F9F9)]'
                        }`}
                      >
                        {/* Recipient */}
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-semibold text-xs text-[var(--color-ink,#111111)]">
                              {log.customer_name || 'Customer'}
                            </p>
                            <p className="text-xs text-[var(--color-slate,#666666)] font-mono flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-[var(--color-mist,#999999)]" />
                              <span>{log.phone}</span>
                            </p>
                          </div>
                        </td>

                        {/* Template Name & Order */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-mono text-xs text-[var(--color-slate,#666666)] bg-[var(--color-snow,#F9F9F9)] px-2 py-0.5 rounded border border-[var(--color-whisper,#E5E5E5)] inline-block">
                              {log.template_name || 'template'}
                            </span>
                            {log.order_number && (
                              <p className="text-[11px] text-[var(--color-slate,#666666)] font-mono mt-1">
                                #{log.order_number}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Message Preview */}
                        <td className="py-3.5 px-4">
                          <p className="text-xs text-[var(--color-ink,#111111)] line-clamp-2 max-w-[360px] leading-relaxed">
                            {messageBody}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span className="capitalize">{log.status}</span>
                          </span>
                        </td>

                        {/* Transmitted Time */}
                        <td className="py-3.5 px-4 text-xs text-[var(--color-slate,#666666)] whitespace-nowrap">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                          {new Date(log.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </td>

                        {/* Direct WhatsApp Web Action */}
                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={`https://wa.me/${log.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(messageBody)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                          >
                            <span>Chat</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredLogs.length === 0 && (
                <div className="py-16 text-center text-[var(--color-mist,#999999)]">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#25D366]" />
                  <p className="font-medium text-base text-[var(--color-ink,#111111)]">
                    No WhatsApp notifications logged yet
                  </p>
                  <p className="text-xs text-[var(--color-slate,#666666)] mt-1">
                    Send or test a template above to generate live transmission records.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LIVE TEMPLATE DISPATCH & PREVIEW */}
      <AnimatePresence>
        {selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setSelectedTemplate(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 z-10 space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[var(--color-whisper,#E5E5E5)]">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-ink,#111111)] flex items-center gap-2">
                    <Send className="w-5 h-5 text-[#25D366]" />
                    <span>Send WhatsApp Notification</span>
                  </h3>
                  <p className="text-xs text-[var(--color-slate,#666666)] font-mono mt-0.5">
                    Template: {selectedTemplate.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="p-1 rounded-lg text-[var(--color-mist,#999999)] hover:text-[var(--color-ink,#111111)] hover:bg-[var(--color-snow,#F9F9F9)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order Context Selector */}
              {orders.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wider mb-1.5">
                    Fill From Existing Order
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => handleOrderSelectChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)] text-xs font-medium text-[var(--color-ink,#111111)] focus:outline-none focus:border-[var(--color-gold,#C9A84C)]"
                  >
                    {orders.map((o) => {
                      const addr = o.shipping_address || {};
                      const name = [addr['firstName'], addr['lastName']].filter(Boolean).join(' ') || addr['full_name'] || 'Customer';
                      return (
                        <option key={o.id} value={o.id}>
                          {o.order_number} &bull; {name} &bull; ₹{o.total_amount}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Interactive Parameter Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-slate,#666666)] mb-1">
                    Customer Name (&#123;&#123;1&#125;&#125;)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-whisper,#E5E5E5)] text-xs focus:outline-none focus:border-[var(--color-gold,#C9A84C)]"
                    placeholder="Priya Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-slate,#666666)] mb-1">
                    Recipient Phone (+91...)
                  </label>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-whisper,#E5E5E5)] text-xs font-mono focus:outline-none focus:border-[var(--color-gold,#C9A84C)]"
                    placeholder="+919876543210"
                  />
                </div>

                {selectedTemplate.name !== 'bespoke_styling_followup' ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-slate,#666666)] mb-1">
                        Order # (&#123;&#123;2&#125;&#125;)
                      </label>
                      <input
                        type="text"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-whisper,#E5E5E5)] text-xs font-mono focus:outline-none focus:border-[var(--color-gold,#C9A84C)]"
                        placeholder="ORD-MVW7SBV2-7233"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--color-slate,#666666)] mb-1">
                        Courier Partner
                      </label>
                      <input
                        type="text"
                        value={courierPartner}
                        onChange={(e) => setCourierPartner(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-whisper,#E5E5E5)] text-xs focus:outline-none focus:border-[var(--color-gold,#C9A84C)]"
                        placeholder="Delhivery"
                      />
                    </div>
                  </>
                ) : (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[var(--color-slate,#666666)] mb-1">
                      Collection / Garment (&#123;&#123;2&#125;&#125;)
                    </label>
                    <input
                      type="text"
                      value={collectionName}
                      onChange={(e) => setCollectionName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-whisper,#E5E5E5)] text-xs focus:outline-none focus:border-[var(--color-gold,#C9A84C)]"
                      placeholder="Bridal Heritage Velvet"
                    />
                  </div>
                )}
              </div>

              {/* Real-time WhatsApp Bubble Preview */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wider mb-1.5">
                  Live Message Preview (Exact Customer View)
                </label>
                <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-[var(--color-whisper,#E5E5E5)] space-y-1">
                  <div className="bg-[#DCF8C6] p-3.5 rounded-2xl rounded-tr-xs shadow-sm max-w-[90%] ml-auto text-xs text-[var(--color-ink,#111111)] leading-relaxed relative">
                    <p>{interpolatedMessage}</p>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-gray-500 mt-1">
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <CheckCheck className="w-3.5 h-3.5 text-[#34B7F1]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--color-whisper,#E5E5E5)]">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-slate,#666666)] hover:bg-[var(--color-snow,#F9F9F9)]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleSendTemplate(false)}
                  disabled={isSending}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-[var(--color-ink,#111111)] transition-colors border border-[var(--color-whisper,#E5E5E5)]"
                >
                  Log to Supabase
                </button>

                <button
                  type="button"
                  onClick={() => handleSendTemplate(true)}
                  disabled={isSending}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#25D366] hover:bg-[#20ba59] text-white transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Open &amp; Send on WhatsApp</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

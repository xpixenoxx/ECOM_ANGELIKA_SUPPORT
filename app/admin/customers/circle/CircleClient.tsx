'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Mail,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  X,
  FileDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  Bell,
  Clock,
  Radio,
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  CircleSubscriber,
  CircleUpdate,
  CircleDashboardData,
  CIRCLE_QUICK_TEMPLATES,
} from '@/lib/actions/circle-types';
import {
  getCircleDashboardData,
  publishCircleUpdate,
  toggleSubscriberStatus,
  deleteCircleUpdate,
  resendCircleUpdate,
} from '@/lib/actions/circle';

interface Props {
  initialData: CircleDashboardData;
}

export default function CircleClient({ initialData }: Props) {
  const [subscribers, setSubscribers] = useState<CircleSubscriber[]>(
    initialData.subscribers || []
  );
  const [updates, setUpdates] = useState<CircleUpdate[]>(initialData.updates || []);
  const [activeTab, setActiveTab] = useState<'subscribers' | 'updates'>('subscribers');
  const [search, setSearch] = useState('');
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [flashingSubscriberId, setFlashingSubscriberId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [ctaText, setCtaText] = useState('Explore Collection');
  const [ctaLink, setCtaLink] = useState('/shop');
  const [bannerImage, setBannerImage] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  }, []);

  // Supabase Real-time Subscription on content_blocks
  useEffect(() => {
    const supabase = getSupabaseClient();
    const channelName = `realtime:admin_angelika_circle_${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_blocks',
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row = payload.new as any;
            const settings = (row.settings as Record<string, any>) || {};
            const contentData = (row.content as Record<string, any>) || {};

            if (settings['kind'] === 'circle_subscriber' || row.key?.startsWith('circle_sub_')) {
              const newSub: CircleSubscriber = {
                id: row.id,
                email: contentData['email'] || row.title || 'subscriber@example.com',
                name: contentData['name'] || null,
                status: contentData['status'] === 'unsubscribed' ? 'unsubscribed' : 'active',
                subscribed_at: contentData['subscribed_at'] || row.created_at,
                source: contentData['source'] || 'homepage_circle',
                updates_received_count: contentData['updates_received_count'] || 0,
              };

              setSubscribers((prev) => {
                const existing = prev.filter((s) => s.id !== newSub.id && s.email !== newSub.email);
                return [newSub, ...existing];
              });

              setFlashingSubscriberId(newSub.id);
              setTimeout(() => setFlashingSubscriberId(null), 3000);
              showToast(`New Angelika Circle subscriber: ${newSub.email}`, 'success');
              setLastSyncedAt(new Date());
            } else if (settings['kind'] === 'circle_update' || row.key?.startsWith('circle_update_')) {
              const newUpd: CircleUpdate = {
                id: row.id,
                title: contentData['title'] || row.title || 'Atelier Update',
                subject: contentData['subject'] || 'Angelika Circle Update',
                content: contentData['content'] || '',
                cta_text: contentData['cta_text'] || null,
                cta_link: contentData['cta_link'] || null,
                banner_image: contentData['banner_image'] || null,
                status: (contentData['status'] as any) || 'published',
                published_at: contentData['published_at'] || row.created_at,
                recipients_count: contentData['recipients_count'] || 0,
                author_name: contentData['author_name'] || 'Vidhya | Angelika Fashions',
              };

              setUpdates((prev) => {
                const existing = prev.filter((u) => u.id !== newUpd.id);
                return [newUpd, ...existing];
              });
              setLastSyncedAt(new Date());
            }
          }
        }
      )
      .subscribe((status) => {
        setRealtimeStatus(status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showToast]);

  // Manual Sync
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const fresh = await getCircleDashboardData();
      if (fresh) {
        setSubscribers(fresh.subscribers);
        setUpdates(fresh.updates);
        setLastSyncedAt(new Date());
        showToast('Angelika Circle data synced with Supabase', 'success');
      }
    } catch {
      showToast('Failed to sync Angelika Circle data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  // Copy email
  function copyEmail(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Email address copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Toggle status
  async function handleToggleStatus(sub: CircleSubscriber) {
    const nextStatus = sub.status === 'active' ? 'unsubscribed' : 'active';
    setSubscribers((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, status: nextStatus } : s))
    );

    const res = await toggleSubscriberStatus(sub.id, nextStatus);
    if (res.success) {
      showToast(`Subscriber marked as ${nextStatus}`, 'success');
    } else {
      showToast(res.error || 'Failed to update subscriber', 'error');
      handleManualRefresh();
    }
  }

  // Load Template into Composer
  function applyTemplate(tpl: (typeof CIRCLE_QUICK_TEMPLATES)[0]) {
    setTitle(tpl.title);
    setSubject(tpl.subject);
    setContent(tpl.content);
    setCtaText(tpl.cta_text || 'Explore Collection');
    setCtaLink(tpl.cta_link || '/shop');
    showToast('Template loaded into composer', 'success');
  }

  // Publish Update
  async function handlePublishUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !content.trim()) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    setIsPublishing(true);

    const res = await publishCircleUpdate({
      title,
      subject,
      content,
      cta_text: ctaText,
      cta_link: ctaLink,
      banner_image: bannerImage,
    });

    setIsPublishing(false);

    if (res.success && res.update) {
      setUpdates((prev) => [res.update!, ...prev]);
      // Optimistically increment updates received count
      setSubscribers((prev) =>
        prev.map((s) =>
          s.status === 'active'
            ? { ...s, updates_received_count: s.updates_received_count + 1 }
            : s
        )
      );

      if (res.dispatchReport?.sent) {
        showToast(`Update published & delivered via SMTP to ${res.recipientsCount} subscriber(s)!`, 'success');
      } else if (res.dispatchReport?.status === 'pending_credentials') {
        showToast('Update saved! Notice: SMTP_PASSWORD is not set in .env.local for Gmail delivery.', 'success');
      } else {
        showToast(`Update saved to database! (${res.dispatchReport?.error || 'Awaiting SMTP delivery'})`, 'success');
      }

      setIsComposeOpen(false);
      setTitle('');
      setSubject('');
      setContent('');
    } else {
      showToast(res.error || 'Failed to publish update', 'error');
    }
  }

  // Resend / Dispatch update via Email
  async function handleResendUpdate(upd: CircleUpdate) {
    setResendingId(upd.id);
    try {
      const res = await resendCircleUpdate(upd.id);
      if (res.success && res.dispatchReport) {
        if (res.dispatchReport.sent) {
          showToast(`Email broadcast successfully sent to ${res.dispatchReport.recipientsCount} recipient(s)!`, 'success');
        } else if (res.dispatchReport.status === 'pending_credentials') {
          showToast('Notice: SMTP_PASSWORD is blank in .env.local. Add Google App Password to deliver to Gmail.', 'error');
        } else {
          showToast(`Delivery attempt failed: ${res.dispatchReport.error || 'SMTP error'}`, 'error');
        }
        handleManualRefresh();
      } else {
        showToast(res.error || 'Failed to dispatch broadcast', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error triggering broadcast dispatch', 'error');
    } finally {
      setResendingId(null);
    }
  }

  // Delete Update
  async function handleDeleteUpdate(id: string) {
    if (!confirm('Are you sure you want to remove this published update?')) return;
    setUpdates((prev) => prev.filter((u) => u.id !== id));
    await deleteCircleUpdate(id);
    showToast('Update removed from archive', 'success');
  }

  // Export CSV
  function exportSubscribersCSV() {
    const headers = ['Email', 'Name', 'Status', 'Joined Date', 'Updates Received', 'Source'];
    const rows = subscribers.map((s) => [
      s.email,
      s.name || '',
      s.status,
      new Date(s.subscribed_at).toISOString(),
      s.updates_received_count,
      s.source,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `angelika_circle_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Subscribers CSV exported', 'success');
  }

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((s) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return s.email.toLowerCase().includes(q) || (s.name && s.name.toLowerCase().includes(q));
    });
  }, [subscribers, search]);

  const activeSubscribersCount = subscribers.filter((s) => s.status === 'active').length;

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
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
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
              Angelika Circle &amp; Broadcast Updates
            </h1>
            <AdminSectionInfo
              title="Angelika Circle VIP Subscribers & Updates"
              purpose="Manage store visitors who submitted their email in the 'Angelika Circle' subscription box on the website. Compose and broadcast private collection drops, festive discount codes, and styling announcements directly to all subscribers."
              storefrontImpact="Directly receives emails submitted in the homepage 'Join the Angelika Circle' box and dispatches broadcasts to their inboxes."
              targets={[
                { name: 'Homepage Angelika Circle', path: '/', description: 'Storefront email capture section' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Real-time subscriber capture &amp; atelier announcement broadcast engine
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
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)] text-[var(--color-slate,#666666)] hover:text-[var(--color-ink,#111111)] rounded-xl text-xs font-medium transition-all shadow-sm disabled:opacity-50"
            title="Sync latest subscribers from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[var(--color-gold,#C9A84C)]' : ''}`} />
            <span>Sync</span>
            <span suppressHydrationWarning className="text-[10px] text-[var(--color-mist,#999999)] hidden sm:inline">
              ({lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow-sm transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>Compose New Update</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--color-slate,#666666)]">Total Subscribers</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-[var(--color-gold,#C9A84C)]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-ink,#111111)] mt-2">
            {subscribers.length}
          </p>
          <p className="text-xs text-[var(--color-gold,#C9A84C)] mt-1">Submitted on homepage</p>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--color-slate,#666666)]">Active Recipients</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-700 mt-2">
            {activeSubscribersCount}
          </p>
          <p className="text-xs text-emerald-600 mt-1">Ready to receive updates</p>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--color-slate,#666666)]">Updates Broadcasted</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-700 mt-2">
            {updates.length}
          </p>
          <p className="text-xs text-blue-600 mt-1">Published by admin</p>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--color-slate,#666666)]">Delivery Channel</p>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-700 mt-2">Email</p>
          <div className="mt-1">
            {initialData.stats?.smtpConfigured ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live SMTP Active
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"
                title="Add SMTP_PASSWORD to .env.local to enable live delivery to customer inboxes"
              >
                <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                Requires SMTP_PASSWORD in .env.local
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center bg-[var(--color-snow,#F9F9F9)] p-1 rounded-xl border border-[var(--color-whisper,#E5E5E5)] text-xs w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('subscribers')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'subscribers'
              ? 'bg-white text-[var(--color-ink,#111111)] shadow-xs'
              : 'text-[var(--color-slate,#666666)] hover:text-[var(--color-ink,#111111)]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Subscribers ({subscribers.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('updates')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'updates'
              ? 'bg-white text-[var(--color-ink,#111111)] shadow-xs'
              : 'text-[var(--color-slate,#666666)] hover:text-[var(--color-ink,#111111)]'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Published Updates ({updates.length})</span>
        </button>
      </div>

      {/* VIEW 1: SUBSCRIBERS LIST */}
      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mist,#999999)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subscribers by email address..."
                className="w-full pl-10 pr-9 py-2 border border-[var(--color-whisper,#E5E5E5)] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 bg-[var(--color-snow,#F9F9F9)] focus:bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-mist,#999999)] hover:text-[var(--color-ink,#111111)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={exportSubscribersCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)] rounded-xl text-xs font-medium text-[var(--color-slate,#666666)] hover:text-[var(--color-ink,#111111)] bg-white transition-colors shadow-2xs whitespace-nowrap self-end sm:self-auto"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Subscribers Table */}
          <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)]">
                    <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wide">
                      Subscriber Email
                    </th>
                    <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wide">
                      Source
                    </th>
                    <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wide">
                      Updates Received
                    </th>
                    <th className="text-left py-3.5 px-4 font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wide">
                      Joined Date
                    </th>
                    <th className="py-3.5 px-4 text-right font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-whisper,#E5E5E5)]">
                  {filteredSubscribers.map((sub) => {
                    const isFlashing = flashingSubscriberId === sub.id;
                    const isActive = sub.status === 'active';

                    return (
                      <tr
                        key={sub.id}
                        className={`transition-colors duration-300 ${
                          isFlashing ? 'bg-emerald-100/60' : 'hover:bg-[var(--color-snow,#F9F9F9)]'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[var(--color-gold-light,#FDF8ED)] text-[var(--color-gold,#C9A84C)] font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                              {sub.email.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-[var(--color-ink,#111111)]">
                              {sub.email}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyEmail(sub.id, sub.email)}
                              className="text-[var(--color-mist,#999999)] hover:text-[var(--color-ink,#111111)] p-1 rounded"
                              title="Copy email"
                            >
                              {copiedId === sub.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                              Unsubscribed
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-[var(--color-slate,#666666)] font-mono text-[11px]">
                          {sub.source}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-[var(--color-snow,#F9F9F9)] border border-[var(--color-whisper,#E5E5E5)] font-semibold text-[var(--color-ink,#111111)]">
                            {sub.updates_received_count} updates
                          </span>
                        </td>

                        <td suppressHydrationWarning className="py-3.5 px-4 text-[var(--color-slate,#666666)] whitespace-nowrap">
                          {new Date(sub.subscribed_at).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(sub)}
                            className="text-xs text-[var(--color-slate,#666666)] hover:text-[var(--color-ink,#111111)] hover:underline"
                          >
                            {isActive ? 'Unsubscribe' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredSubscribers.length === 0 && (
                <div className="py-16 text-center text-[var(--color-mist,#999999)]">
                  <Mail className="w-10 h-10 mx-auto mb-2 opacity-30 text-[var(--color-gold,#C9A84C)]" />
                  <p className="font-medium text-sm text-[var(--color-ink,#111111)]">
                    No subscribers found
                  </p>
                  <p className="text-xs text-[var(--color-slate,#666666)] mt-1">
                    When visitors enter their email on the homepage Angelika Circle form, they appear here instantly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PUBLISHED UPDATES */}
      {activeTab === 'updates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {updates.map((upd) => (
              <div
                key={upd.id}
                className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-5 shadow-sm space-y-3.5 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-[var(--color-gold,#C9A84C)] border border-amber-200">
                          Broadcast Update
                        </span>
                        <span suppressHydrationWarning className="text-[11px] text-[var(--color-mist,#999999)]">
                          {new Date(upd.published_at).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-[var(--color-ink,#111111)] mt-1.5">
                        {upd.title}
                      </h3>
                      <p className="text-xs text-[var(--color-slate,#666666)] font-medium">
                        Subject: {upd.subject}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteUpdate(upd.id)}
                      className="p-1 rounded text-[var(--color-mist,#999999)] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete update"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Message body preview */}
                  <div className="p-3 rounded-xl bg-[var(--color-snow,#F9F9F9)] border border-[var(--color-whisper,#E5E5E5)] text-xs text-[var(--color-ink,#111111)] leading-relaxed">
                    <p className="line-clamp-3">{upd.content}</p>
                  </div>

                  {upd.cta_link && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-gold,#C9A84C)] font-medium">
                      <span>CTA: {upd.cta_text || 'Explore'}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="text-[11px] font-mono text-[var(--color-mist,#999999)] truncate">
                        ({upd.cta_link})
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--color-whisper,#E5E5E5)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs text-[var(--color-slate,#666666)]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Send className="w-3 h-3 text-blue-600" />
                      <span>{upd.recipients_count} recipient(s)</span>
                    </span>

                    {upd.delivery_status === 'sent' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Dispatched via SMTP
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                        title={upd.delivery_note || 'Awaiting SMTP_PASSWORD in .env.local'}
                      >
                        <Clock className="w-3 h-3 text-amber-500" />
                        {upd.delivery_note?.includes('SMTP_PASSWORD') ? 'Awaiting SMTP_PASSWORD' : upd.delivery_note || 'Awaiting SMTP_PASSWORD'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleResendUpdate(upd)}
                      disabled={resendingId === upd.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--color-snow,#F9F9F9)] hover:bg-[var(--color-gold,#C9A84C)] hover:text-white border border-[var(--color-whisper,#E5E5E5)] transition-colors disabled:opacity-50"
                      title="Dispatch or resend email broadcast to all active subscribers"
                    >
                      <RefreshCw className={`w-3 h-3 ${resendingId === upd.id ? 'animate-spin' : ''}`} />
                      <span>{resendingId === upd.id ? 'Sending...' : 'Dispatch / Resend Email'}</span>
                    </button>
                    <span className="text-[11px] text-[var(--color-mist,#999999)]">
                      {upd.author_name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {updates.length === 0 && (
            <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-12 text-center text-[var(--color-mist,#999999)]">
              <Radio className="w-10 h-10 mx-auto mb-2 opacity-30 text-[var(--color-gold,#C9A84C)]" />
              <p className="font-medium text-sm text-[var(--color-ink,#111111)]">
                No updates published yet
              </p>
              <p className="text-xs text-[var(--color-slate,#666666)] mt-1 mb-4">
                Click Compose New Update to send your first broadcast to all Angelika Circle subscribers.
              </p>
              <button
                type="button"
                onClick={() => setIsComposeOpen(true)}
                className="px-4 py-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl text-xs font-semibold hover:opacity-90"
              >
                Compose First Update
              </button>
            </div>
          )}
        </div>
      )}

      {/* COMPOSE UPDATE MODAL */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setIsComposeOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 z-10 space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between pb-3 border-b border-[var(--color-whisper,#E5E5E5)]">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-ink,#111111)] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--color-gold,#C9A84C)]" />
                    <span>Broadcast Update to Angelika Circle</span>
                  </h3>
                  <p className="text-xs text-[var(--color-slate,#666666)] mt-0.5">
                    Will be delivered directly to all {activeSubscribersCount} active email subscribers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="p-1 rounded-lg text-[var(--color-mist,#999999)] hover:text-[var(--color-ink,#111111)] hover:bg-[var(--color-snow,#F9F9F9)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Template Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[var(--color-slate,#666666)]">
                  Quick Starter Templates:
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {CIRCLE_QUICK_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className="whitespace-nowrap px-3 py-1.5 rounded-lg border border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)] bg-[var(--color-snow,#F9F9F9)] hover:bg-white text-[11px] font-medium text-[var(--color-ink,#111111)] transition-colors"
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handlePublishUpdate} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink,#111111)] mb-1">
                    Internal Campaign Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Festive Bridal Couture Drop"
                    required
                    className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink,#111111)] mb-1">
                    Email Subject Line (What subscribers see in their inbox) *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Namaste from Vidhya: Exclusive Early Access to Our Festive Collection"
                    required
                    className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink,#111111)] mb-1">
                    Atelier Message / Styling Update *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    placeholder="Write your styling advice, new collection preview, or festive discount code..."
                    required
                    className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl p-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-ink,#111111)] mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="e.g. Explore Collection"
                      className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-ink,#111111)] mb-1">
                      Button Destination Link
                    </label>
                    <input
                      type="text"
                      value={ctaLink}
                      onChange={(e) => setCtaLink(e.target.value)}
                      placeholder="e.g. /shop/lehengas"
                      className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 font-mono"
                    />
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE4D9] space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-gold,#C9A84C)]">
                    Subscriber Email Preview
                  </p>
                  <p className="text-xs font-bold text-[var(--color-ink,#111111)]">
                    {subject || 'Subject line preview...'}
                  </p>
                  <p className="text-xs text-[var(--color-slate,#666666)] leading-relaxed">
                    {content || 'Message content preview will appear here...'}
                  </p>
                  {ctaText && (
                    <div className="pt-2">
                      <span className="inline-block px-4 py-1.5 bg-[var(--color-gold,#C9A84C)] text-white text-[11px] font-semibold rounded-lg shadow-2xs">
                        {ctaText}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-[var(--color-whisper,#E5E5E5)] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-4 py-2 border border-[var(--color-whisper,#E5E5E5)] rounded-xl text-xs font-medium text-[var(--color-slate,#666666)] hover:bg-[var(--color-snow,#F9F9F9)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="flex items-center gap-1.5 px-5 py-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isPublishing
                        ? 'Broadcasting...'
                        : `Publish & Broadcast to ${activeSubscribersCount} Subscribers`}
                    </span>
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


'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Phone,
  User,
  CheckCheck,
  Clock,
  Sparkles,
  ExternalLink,
  Bot,
  UserCheck,
  Search,
  Filter,
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Smile,
  Info,
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  WhatsAppConversationsData,
  WhatsAppConversationThread,
  WhatsAppChatMessage,
} from '@/lib/actions/admin-whatsapp-types';
import {
  sendWhatsAppConciergeMessage,
  getWhatsAppConversationsData,
} from '@/lib/actions/admin-whatsapp';

interface Props {
  initialData: WhatsAppConversationsData;
}

const QUICK_RESPONSES = [
  'Namaste! How may I assist you with sizing or styling today?',
  'Can you share your bust, waist, and hip measurements in inches?',
  'Your handcrafted order is being carefully curated and prepared for dispatch.',
  'Would you like a complimentary 1-on-1 blouse customization styling session?',
];

export default function WhatsAppClient({ initialData }: Props) {
  const [threads, setThreads] = useState<WhatsAppConversationThread[]>(initialData.threads || []);
  const [activeThreadId, setActiveThreadId] = useState<string>(
    initialData.threads?.[0]?.id || ''
  );
  const [inputMessage, setInputMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  }, []);

  const activeThread = useMemo(() => {
    return threads.find((t) => t.id === activeThreadId) || threads[0] || null;
  }, [threads, activeThreadId]);

  // Auto scroll messages to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages, scrollToBottom]);

  // Real-time Supabase Subscription on whatsapp_conversations
  useEffect(() => {
    const supabase = getSupabaseClient();
    const channelName = `realtime:admin_whatsapp_conversations_${Date.now()}`;

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
            const row = payload.new as any;
            const cleanPhone = (row.phone || '').replace(/[^0-9]/g, '');
            const meta = (row.metadata as Record<string, any>) || {};
            const senderType: 'customer' | 'concierge' | 'bot' =
              row.type === 'inbound'
                ? 'customer'
                : row.type === 'template'
                ? 'bot'
                : 'concierge';

            const text =
              meta['message'] ||
              (row.template_name ? `Template: ${row.template_name}` : 'WhatsApp message');

            const newMsg: WhatsAppChatMessage = {
              id: row.id || `msg-${Date.now()}`,
              sender: senderType,
              text,
              time: new Date(row.created_at || Date.now()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              timestamp: row.created_at || new Date().toISOString(),
              status: row.status,
            };

            setThreads((prev) => {
              const exists = prev.some(
                (t) => t.phone.replace(/[^0-9]/g, '') === cleanPhone
              );

              if (exists) {
                return prev.map((t) => {
                  if (t.phone.replace(/[^0-9]/g, '') === cleanPhone) {
                    const alreadyHas = t.messages.some((m) => m.id === newMsg.id);
                    return {
                      ...t,
                      lastMessage: newMsg.text,
                      lastMessageTime: newMsg.time,
                      messages: alreadyHas ? t.messages : [...t.messages, newMsg],
                    };
                  }
                  return t;
                });
              } else {
                // New inbound conversation
                const newThread: WhatsAppConversationThread = {
                  id: `thread_${cleanPhone}`,
                  phone: `+${cleanPhone}`,
                  name: meta['customer_name'] || 'New Client',
                  avatarInitials: 'WA',
                  lastMessage: newMsg.text,
                  lastMessageTime: newMsg.time,
                  unread: 1,
                  status: 'active',
                  messages: [newMsg],
                  recentOrder: null,
                };
                return [newThread, ...prev];
              }
            });

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

  // Manual Refresh
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const fresh = await getWhatsAppConversationsData();
      if (fresh && fresh.threads) {
        setThreads(fresh.threads);
        setLastSyncedAt(new Date());
        showToast('Conversations synced with Supabase', 'success');
      }
    } catch {
      showToast('Failed to refresh WhatsApp conversations', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  // Send Message as Concierge
  async function handleSendMessage(e?: React.FormEvent, openInWAWeb = false) {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeThread) return;

    const textToSend = inputMessage.trim();
    setIsSending(true);

    const res = await sendWhatsAppConciergeMessage({
      phone: activeThread.phone,
      message: textToSend,
      userId: activeThread.userId,
      customerName: activeThread.name,
    });

    setIsSending(false);

    if (res.success) {
      const newMsg: WhatsAppChatMessage = {
        id: res.record?.id || `msg-${Date.now()}`,
        sender: 'concierge',
        text: textToSend,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThread.id
            ? {
                ...t,
                lastMessage: textToSend,
                lastMessageTime: newMsg.time,
                messages: [...t.messages, newMsg],
              }
            : t
        )
      );

      setInputMessage('');
      showToast(`Message logged & sent to ${activeThread.name}`, 'success');

      if (openInWAWeb) {
        const cleanDigits = activeThread.phone.replace(/[^0-9]/g, '');
        const waUrl = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(textToSend)}`;
        window.open(waUrl, '_blank');
      }
    } else {
      showToast(res.error || 'Failed to send message', 'error');
    }
  }

  // Toggle thread resolution status
  function toggleStatus() {
    if (!activeThread) return;
    const nextStatus = activeThread.status === 'active' ? 'resolved' : 'active';
    setThreads((prev) =>
      prev.map((t) => (t.id === activeThread.id ? { ...t, status: nextStatus } : t))
    );
    showToast(`Conversation marked as ${nextStatus}`, 'success');
  }

  // Filtered threads list
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.phone.includes(search) ||
        t.lastMessage.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && t.status === 'active') ||
        (statusFilter === 'resolved' && t.status === 'resolved');

      return matchSearch && matchStatus;
    });
  }, [threads, search, statusFilter]);

  const activeCount = threads.filter((t) => t.status === 'active').length;
  const resolvedCount = threads.filter((t) => t.status === 'resolved').length;

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
              WhatsApp Concierge
            </h1>
            <AdminSectionInfo
              title="WhatsApp Client Support & Styling"
              purpose="Manage live WhatsApp conversations with customers. Provide bespoke size recommendations, fabric advice, bridal consultations, and order shipment updates."
              storefrontImpact="Directly receives customer conversations from the website's floating WhatsApp Concierge button (bottom right) and the 'Styling Consultation' buttons on product detail pages."
              targets={[
                { name: 'Storefront WhatsApp Widget', path: '/', description: 'Floating green WhatsApp concierge icon' },
                { name: 'Product Styling Consultation', path: '/shop', description: 'Product page bespoke styling inquiry' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Real-time client conversations, styling consultations &amp; order support hotline
          </p>
        </div>

        {/* Realtime Status & Sync Controls */}
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
            title="Sync latest WhatsApp messages from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[var(--color-gold,#C9A84C)]' : ''}`} />
            <span>Sync</span>
            <span suppressHydrationWarning className="text-[10px] text-[var(--color-mist,#999999)] hidden sm:inline">
              ({lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
            </span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--color-slate,#666666)]">Total Conversations</p>
          <p className="text-2xl font-bold text-[var(--color-ink,#111111)] mt-1">{threads.length}</p>
          <p className="text-[11px] text-[var(--color-mist,#999999)] mt-0.5">Customer channels</p>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--color-slate,#666666)]">Active Inquiries</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{activeCount}</p>
          <p className="text-[11px] text-amber-700 mt-0.5">Awaiting response</p>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--color-slate,#666666)]">Resolved Chats</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Completed inquiries</p>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--color-slate,#666666)]">Connected API</p>
          <p className="text-2xl font-bold text-[#25D366] mt-1">Cloud API</p>
          <p className="text-[11px] text-[var(--color-mist,#999999)] mt-0.5">Meta Business Verified</p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[720px]">
        {/* Left Column: Chat Threads (4 cols) */}
        <div className="md:col-span-4 border-r border-[var(--color-whisper,#E5E5E5)] flex flex-col h-full bg-[var(--color-snow,#F9F9F9)]/50">
          {/* Search & Filter */}
          <div className="p-3.5 border-b border-[var(--color-whisper,#E5E5E5)] space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mist,#999999)]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client or phone..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-[var(--color-whisper,#E5E5E5)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 bg-white"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-[var(--color-gold,#C9A84C)] text-white'
                    : 'bg-white text-[var(--color-slate,#666666)] hover:bg-gray-100'
                }`}
              >
                All ({threads.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-[var(--color-slate,#666666)] hover:bg-gray-100'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('resolved')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'resolved'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-[var(--color-slate,#666666)] hover:bg-gray-100'
                }`}
              >
                Resolved ({resolvedCount})
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-whisper,#E5E5E5)]">
            {filteredThreads.map((c) => {
              const isActive = activeThread?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveThreadId(c.id)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                    isActive
                      ? 'bg-white shadow-xs border-l-4 border-l-[var(--color-gold,#C9A84C)]'
                      : 'hover:bg-white/70'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--color-gold-light,#FDF8ED)] text-[var(--color-gold,#C9A84C)] font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs border border-[var(--color-gold,#C9A84C)]/20">
                    {c.avatarInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-semibold text-[var(--color-ink,#111111)] truncate">
                        {c.name}
                      </p>
                      <span className="text-[10px] text-[var(--color-mist,#999999)] whitespace-nowrap">
                        {c.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-slate,#666666)] truncate">
                      {c.lastMessage}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] font-mono text-[var(--color-mist,#999999)]">
                        {c.phone}
                      </span>
                      {c.status === 'resolved' ? (
                        <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Resolved
                        </span>
                      ) : (
                        <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredThreads.length === 0 && (
              <div className="p-8 text-center text-xs text-[var(--color-mist,#999999)]">
                No matching conversations found
              </div>
            )}
          </div>
        </div>

        {/* Center & Right Columns: Chat Thread & Client Context (8 cols) */}
        {activeThread ? (
          <div className="md:col-span-8 grid grid-cols-1 lg:grid-cols-12 h-full bg-white divide-y lg:divide-y-0 lg:divide-x divide-[var(--color-whisper,#E5E5E5)]">
            {/* Messages Area (8 cols on lg) */}
            <div className="lg:col-span-8 flex flex-col h-full bg-white">
              {/* Thread Header */}
              <div className="p-3.5 border-b border-[var(--color-whisper,#E5E5E5)] flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-gold-light,#FDF8ED)] text-[var(--color-gold,#C9A84C)] font-bold text-xs flex items-center justify-center border border-[var(--color-gold,#C9A84C)]/30">
                    {activeThread.avatarInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink,#111111)] leading-tight">
                      {activeThread.name}
                    </p>
                    <p className="text-xs text-[var(--color-slate,#666666)] flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[var(--color-mist,#999999)]" />
                      <span>{activeThread.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleStatus}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-colors ${
                      activeThread.status === 'resolved'
                        ? 'bg-gray-100 text-[var(--color-slate,#666666)] border-gray-200 hover:bg-gray-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {activeThread.status === 'resolved' ? 'Reopen Inquiry' : 'Mark Resolved'}
                  </button>

                  <a
                    href={`https://wa.me/${activeThread.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-[var(--color-whisper,#E5E5E5)] text-[#25D366] hover:bg-[#25D366]/10 text-xs flex items-center gap-1 transition-colors"
                    title="Open chat on WhatsApp Web"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[var(--color-snow,#F9F9F9)]/30">
                {activeThread.messages.map((m) => {
                  const isMe = m.sender === 'concierge';
                  const isBot = m.sender === 'bot';

                  return (
                    <div
                      key={m.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                          isMe
                            ? 'bg-[var(--color-gold,#C9A84C)] text-white rounded-br-xs'
                            : isBot
                            ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-bl-xs'
                            : 'bg-white border border-[var(--color-whisper,#E5E5E5)] text-[var(--color-ink,#111111)] rounded-bl-xs'
                        }`}
                      >
                        {isBot && (
                          <p className="text-[10px] font-semibold text-amber-700 flex items-center gap-1 mb-1">
                            <Bot className="w-3 h-3" /> Automated Notification
                          </p>
                        )}
                        <p>{m.text}</p>
                        <div
                          className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                            isMe ? 'text-white/80' : 'text-[var(--color-mist,#999999)]'
                          }`}
                        >
                          <span>{m.time}</span>
                          {isMe && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Response Chips */}
              <div className="px-3 py-2 border-t border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)]/60 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
                <span className="text-[10px] text-[var(--color-mist,#999999)] whitespace-nowrap flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[var(--color-gold,#C9A84C)]" /> Quick reply:
                </span>
                {QUICK_RESPONSES.map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputMessage(qr)}
                    className="whitespace-nowrap px-2.5 py-1 bg-white border border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)] text-[var(--color-slate,#666666)] hover:text-[var(--color-ink,#111111)] rounded-lg text-[10px] transition-colors"
                  >
                    {qr.substring(0, 32)}...
                  </button>
                ))}
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={(e) => handleSendMessage(e, false)}
                className="p-3 border-t border-[var(--color-whisper,#E5E5E5)] flex gap-2 bg-white"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Reply to ${activeThread.name} as Vidhya Concierge...`}
                  className="flex-1 border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, true)}
                  disabled={!inputMessage.trim() || isSending}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium disabled:opacity-40 transition-opacity flex items-center gap-1 shadow-xs"
                  title="Send & Open in WhatsApp Web"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WA Web</span>
                </button>
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="px-4 py-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1.5 shadow-sm"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Client Context & Order Panel (4 cols on lg) */}
            <div className="lg:col-span-4 p-4 space-y-4 bg-white overflow-y-auto">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-slate,#666666)]">
                Client Profile
              </h3>

              {/* Profile Card */}
              <div className="p-3.5 rounded-xl border border-[var(--color-whisper,#E5E5E5)] bg-[var(--color-snow,#F9F9F9)] space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-gold-light,#FDF8ED)] text-[var(--color-gold,#C9A84C)] font-bold text-xs flex items-center justify-center">
                    {activeThread.avatarInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[var(--color-ink,#111111)] truncate">
                      {activeThread.name}
                    </p>
                    <p className="text-[10px] text-[var(--color-slate,#666666)] truncate">
                      {activeThread.email || 'Guest Storefront User'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--color-whisper,#E5E5E5)] flex items-center justify-between text-[11px]">
                  <span className="text-[var(--color-slate,#666666)]">Loyalty Tier:</span>
                  <span className="font-semibold text-[var(--color-gold,#C9A84C)]">
                    {activeThread.loyaltyTier || 'Member'}
                  </span>
                </div>
              </div>

              {/* Latest Order Card */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-slate,#666666)] mb-2">
                  Latest Order Context
                </h4>
                {activeThread.recentOrder ? (
                  <div className="p-3.5 rounded-xl border border-[var(--color-whisper,#E5E5E5)] bg-white space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[var(--color-ink,#111111)]">
                        #{activeThread.recentOrder.orderNumber}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold capitalize bg-blue-50 text-blue-700 border border-blue-200">
                        {activeThread.recentOrder.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[var(--color-slate,#666666)]">Amount:</span>
                      <span className="font-semibold text-[var(--color-ink,#111111)]">
                        ₹{activeThread.recentOrder.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <a
                      href={`/admin/orders/${activeThread.recentOrder.id}`}
                      className="block w-full text-center py-1.5 rounded-lg border border-[var(--color-whisper,#E5E5E5)] hover:border-[var(--color-gold,#C9A84C)] text-[11px] font-medium text-[var(--color-slate,#666666)] hover:text-[var(--color-ink,#111111)] transition-colors mt-2"
                    >
                      View Order Details
                    </a>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border border-dashed border-[var(--color-whisper,#E5E5E5)] text-center text-xs text-[var(--color-mist,#999999)]">
                    No orders linked to this client yet
                  </div>
                )}
              </div>

              {/* Concierge Guidelines */}
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5 text-amber-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600" /> Concierge Protocol
                </p>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Offer tailored styling advice, verify blouse stitching measurements, and send direct tracking updates.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="md:col-span-8 flex items-center justify-center h-full text-xs text-[var(--color-mist,#999999)]">
            Select a conversation to view chat thread
          </div>
        )}
      </div>
    </motion.div>
  );
}

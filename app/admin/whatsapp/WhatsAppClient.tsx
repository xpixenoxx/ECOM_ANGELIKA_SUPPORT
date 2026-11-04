'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

interface Chat {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: 'active' | 'resolved' | 'bot';
  avatarInitials: string;
  messages: Array<{
    id: string;
    sender: 'customer' | 'concierge' | 'bot';
    text: string;
    time: string;
  }>;
}

const INITIAL_CHATS: Chat[] = [
  {
    id: '1',
    name: 'Ananya Sharma',
    phone: '+91 98201 44521',
    lastMessage: 'Can you customize the sleeve length on the Lucknowi Kurti?',
    time: '10:42 AM',
    unread: 2,
    status: 'active',
    avatarInitials: 'AS',
    messages: [
      { id: 'm1', sender: 'customer', text: 'Hello Vidhya! I love your Pristine White Lucknowi Kurti.', time: '10:38 AM' },
      { id: 'm2', sender: 'concierge', text: 'Hello Ananya! Thank you so much. How can we style it for you today?', time: '10:40 AM' },
      { id: 'm3', sender: 'customer', text: 'Can you customize the sleeve length on the Lucknowi Kurti to 3/4th?', time: '10:42 AM' },
    ],
  },
  {
    id: '2',
    name: 'Priyanka Reddy',
    phone: '+91 98490 12890',
    lastMessage: 'Thank you so much! The Banarasi saree arrived in stunning condition.',
    time: 'Yesterday',
    unread: 0,
    status: 'resolved',
    avatarInitials: 'PR',
    messages: [
      { id: 'm4', sender: 'bot', text: 'Your order #AF-8902 has been delivered! Tap to view tracking.', time: 'Yesterday 2:15 PM' },
      { id: 'm5', sender: 'customer', text: 'Thank you so much! The Banarasi saree arrived in stunning condition.', time: 'Yesterday 3:30 PM' },
    ],
  },
  {
    id: '3',
    name: 'Kavita Mehta',
    phone: '+91 99870 33412',
    lastMessage: 'Bridal consultation inquiry for December wedding',
    time: '2 days ago',
    unread: 0,
    status: 'bot',
    avatarInitials: 'KM',
    messages: [
      { id: 'm6', sender: 'customer', text: 'Hi, I need bridal lehenga styling for December.', time: '2 days ago' },
      { id: 'm7', sender: 'bot', text: 'Welcome to Vidhya’s Bridal Atelier. What is your wedding date and venue?', time: '2 days ago' },
    ],
  },
];

export default function WhatsAppClient() {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>(INITIAL_CHATS[0].id);
  const [inputMessage, setInputMessage] = useState('');
  const [search, setSearch] = useState('');

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'concierge' as const,
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? {
              ...c,
              lastMessage: inputMessage.trim(),
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );
    setInputMessage('');
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
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
            Real-time client conversations &amp; bespoke styling hotline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Meta WhatsApp Cloud API Connected
          </span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[680px]">
        {/* Chat List Column */}
        <div className="border-r border-[var(--color-whisper,#E5E5E5)] flex flex-col h-full bg-[var(--color-snow,#F9F9F9)]/40">
          {/* Search */}
          <div className="p-3.5 border-b border-[var(--color-whisper,#E5E5E5)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mist,#999999)]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-[var(--color-whisper,#E5E5E5)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 bg-white"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-whisper,#E5E5E5)]">
            {chats.map((c) => {
              const isActive = c.id === activeChat.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveChatId(c.id)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                    isActive ? 'bg-white shadow-sm border-l-4 border-l-[var(--color-gold,#C9A84C)]' : 'hover:bg-white/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--color-gold-light,#FDF8ED)] text-[var(--color-gold,#C9A84C)] font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {c.avatarInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-semibold text-[var(--color-ink,#111111)] truncate">{c.name}</p>
                      <span className="text-[10px] text-[var(--color-mist,#999999)]">{c.time}</span>
                    </div>
                    <p className="text-xs text-[var(--color-slate,#666666)] truncate">{c.lastMessage}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] font-mono text-[var(--color-mist,#999999)]">{c.phone}</span>
                      {c.unread > 0 && (
                        <span className="ml-auto bg-[var(--color-gold,#C9A84C)] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Thread Column (2 Cols) */}
        <div className="md:col-span-2 flex flex-col h-full bg-white">
          {/* Thread Header */}
          <div className="p-4 border-b border-[var(--color-whisper,#E5E5E5)] flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--color-gold-light,#FDF8ED)] text-[var(--color-gold,#C9A84C)] font-bold text-xs flex items-center justify-center">
                {activeChat.avatarInitials}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-ink,#111111)]">{activeChat.name}</p>
                <p className="text-xs text-[var(--color-slate,#666666)] flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {activeChat.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 text-green-700 border border-green-200">
                Online Concierge
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-[var(--color-snow,#F9F9F9)]/30">
            {activeChat.messages.map((m) => {
              const isMe = m.sender === 'concierge';
              const isBot = m.sender === 'bot';

              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
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
                    <p
                      className={`text-[10px] mt-1 text-right ${
                        isMe ? 'text-white/70' : 'text-[var(--color-mist,#999999)]'
                      }`}
                    >
                      {m.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3.5 border-t border-[var(--color-whisper,#E5E5E5)] flex gap-2 bg-white">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type message to client as Vidhya Concierge..."
              className="flex-1 border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 focus:border-[var(--color-gold,#C9A84C)]"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-4 py-2.5 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1.5 shadow-sm"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Copy,
  Edit2,
  ExternalLink,
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

interface Template {
  id: string;
  name: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  language: string;
  body: string;
  triggerEvent: string;
}

const TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'order_confirmed_v2',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_IN',
    body: 'Namaste {{1}}! Your luxury order #{{2}} from Angelika Fashions has been confirmed. Vidhya is personally curating your pieces with love. Track your order: {{3}}',
    triggerEvent: 'Fired immediately on checkout payment success',
  },
  {
    id: 't2',
    name: 'order_dispatched_tracking',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_IN',
    body: 'Greetings {{1}}! Your handcrafted ensemble for order #{{2}} has been dispatched via {{3}}. Tracking AWB: {{4}}. Delivery expected in 2-4 business days.',
    triggerEvent: 'Fired when order status changes to "shipped" in Admin',
  },
  {
    id: 't3',
    name: 'out_for_delivery_alert',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_IN',
    body: 'Dear {{1}}, your Angelika package for order #{{2}} is out for delivery today with {{3}} courier partner! Please ensure someone is available at your address.',
    triggerEvent: 'Fired on courier delivery partner out-for-delivery webhook',
  },
  {
    id: 't4',
    name: 'bespoke_styling_followup',
    category: 'MARKETING',
    status: 'APPROVED',
    language: 'en_IN',
    body: 'Namaste {{1}}! Designer Vidhya noticed you explored our festive {{2}} collection. Would you like a personalized 1-on-1 virtual styling session or blouse customization?',
    triggerEvent: 'VIP cart drop-off or concierge consultation request',
  },
];

export default function TemplatesClient() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyTemplate(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
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
            Meta WhatsApp Cloud API pre-approved notification templates
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-5 shadow-sm space-y-3.5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[var(--color-ink,#111111)] font-mono">{t.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-50 text-green-700 border border-green-200">
                    {t.status}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-slate,#666666)] mt-0.5">Category: {t.category} · {t.language}</p>
              </div>

              <button
                type="button"
                onClick={() => copyTemplate(t.id, t.body)}
                className="p-1.5 rounded-lg border border-[var(--color-whisper,#E5E5E5)] text-[var(--color-slate,#666666)] hover:text-[var(--color-gold,#C9A84C)] hover:bg-[var(--color-snow,#F9F9F9)] text-xs flex items-center gap-1"
                title="Copy template message body"
              >
                {copiedId === t.id ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Message Bubble Preview */}
            <div className="p-3.5 rounded-xl bg-[var(--color-snow,#F9F9F9)] border border-[var(--color-whisper,#E5E5E5)] text-xs text-[var(--color-ink,#111111)] leading-relaxed font-sans">
              {t.body}
            </div>

            {/* Trigger info */}
            <div className="pt-2 border-t border-[var(--color-whisper,#E5E5E5)] flex items-center justify-between text-[11px] text-[var(--color-slate,#666666)]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[var(--color-gold,#C9A84C)]" />
                {t.triggerEvent}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

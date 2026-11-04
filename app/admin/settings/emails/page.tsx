'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, Send } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

export default function EmailSettingsPage() {
  const [senderName, setSenderName] = useState('Vidhya | Angelika Fashions');
  const [senderEmail, setSenderEmail] = useState('orders@angelikafashions.com');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 600);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
              Transactional Email Delivery
            </h1>
            <AdminSectionInfo
              title="Transactional Emails & Notifications"
              purpose="Manage customer notification emails for order confirmation receipts, dispatch AWB alerts, and password resets."
              storefrontImpact="Sent to customer email addresses on /checkout, /order-success, and /auth/reset-password."
              targets={[
                { name: 'Checkout Page', path: '/checkout', description: 'Email address entry & receipt dispatch' },
                { name: 'Password Reset', path: '/auth/reset-password', description: 'Auth recovery notifications' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            SMTP &amp; transactional email sender configuration
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 shadow-sm transition-opacity self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Email Settings'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] flex items-center gap-2">
          <Mail className="w-4 h-4 text-[var(--color-gold,#C9A84C)]" />
          Sender Identity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
              From Sender Name
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
              From Email Address
            </label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

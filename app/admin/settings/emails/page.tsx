'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import {
  getExtendedStoreSettings,
  saveExtendedStoreSettings,
} from '@/lib/actions/store-settings';

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendConfigured, setResendConfigured] = useState(false);

  const [senderName, setSenderName] = useState('Angelika Fashions');
  const [senderEmail, setSenderEmail] = useState('');
  const [orderConfirmationEnabled, setOrderConfirmationEnabled] = useState(true);
  const [shipmentNotificationEnabled, setShipmentNotificationEnabled] = useState(true);

  useEffect(() => {
    getExtendedStoreSettings()
      .then((res) => {
        setResendConfigured(res.serviceHealth.resendConfigured);
        setSenderName(res.extended.emails.senderName);
        setSenderEmail(res.extended.emails.senderEmail || '');
        setOrderConfirmationEnabled(res.extended.emails.orderConfirmationEnabled);
        setShipmentNotificationEnabled(res.extended.emails.shipmentNotificationEnabled);
        if (!res.success && res.error) setErrorMsg(res.error);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await saveExtendedStoreSettings('emails', {
        senderName: senderName.trim() || 'Angelika Fashions',
        senderEmail: senderEmail.trim().toLowerCase(),
        orderConfirmationEnabled,
        shipmentNotificationEnabled,
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to save email settings.');
        toast.error(res.error || 'Failed to save email settings.');
        return;
      }
      toast.success('Email settings persisted to Supabase!');
    } finally {
      setSaving(false);
    }
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
              purpose="Configure sender name/email preferences and inspect Resend API delivery configuration."
              storefrontImpact="Controls transactional emails triggered by /checkout and shipment fulfillment."
              targets={[
                { name: 'Checkout Page', path: '/checkout', description: 'Order confirmation receipt dispatch' },
                { name: 'Password Reset', path: '/auth/reset-password', description: 'Auth recovery notifications' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Resend delivery status &amp; sender preferences
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 shadow-sm transition-opacity self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Email Settings'}
        </button>
      </div>

      {errorMsg && (
        <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-whisper,#E5E5E5)]">
          <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[var(--color-gold,#C9A84C)]" />
            Sender Identity
          </h2>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
              resendConfigured
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {resendConfigured ? 'RESEND_API_KEY Active' : 'RESEND_API_KEY Missing'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="senderName" className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
              From Sender Name
            </label>
            <input
              id="senderName"
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
            />
          </div>

          <div>
            <label htmlFor="senderEmail" className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
              From Email Address (Verified Domain)
            </label>
            <input
              id="senderEmail"
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="Configure verified Resend domain email"
              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-[var(--color-whisper,#E5E5E5)] text-sm">
          <label className="flex items-center justify-between cursor-pointer">
            <span>Send Order Confirmation Receipt Emails</span>
            <input
              type="checkbox"
              checked={orderConfirmationEnabled}
              onChange={(e) => setOrderConfirmationEnabled(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-gold)]"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span>Send Shipment &amp; AWB Dispatch Emails</span>
            <input
              type="checkbox"
              checked={shipmentNotificationEnabled}
              onChange={(e) => setShipmentNotificationEnabled(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-gold)]"
            />
          </label>
        </div>
      </form>
    </motion.div>
  );
}

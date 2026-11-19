'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import {
  getExtendedStoreSettings,
  saveExtendedStoreSettings,
} from '@/lib/actions/store-settings';

export default function PaymentsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [cashfreeConfigured, setCashfreeConfigured] = useState(false);
  const [cashfreeWebhookConfigured, setCashfreeWebhookConfigured] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState(false);

  const [codEnabled, setCodEnabled] = useState(true);
  const [codMaxAmount, setCodMaxAmount] = useState('10000');
  const [codFee, setCodFee] = useState('49');
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [intlEnabled, setIntlEnabled] = useState(false);

  useEffect(() => {
    getExtendedStoreSettings()
      .then((res) => {
        setCashfreeConfigured(res.serviceHealth.cashfreeConfigured);
        setCashfreeWebhookConfigured(res.serviceHealth.cashfreeWebhookConfigured);
        setStripeConfigured(res.serviceHealth.stripeConfigured);
        setCodMaxAmount(String(res.codMaxAmount));
        setCodEnabled(res.extended.payments.codEnabled);
        setCodFee(String(res.extended.payments.codFee));
        setUpiEnabled(res.extended.payments.upiEnabled);
        setIntlEnabled(res.extended.payments.intlEnabled);
        if (!res.success && res.error) setErrorMsg(res.error);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await saveExtendedStoreSettings('payments', {
        codEnabled,
        codMaxAmount: Number(codMaxAmount) || 0,
        codFee: Number(codFee) || 0,
        upiEnabled,
        intlEnabled,
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Could not save payment settings.');
        toast.error(res.error || 'Could not save payment settings.');
        return;
      }
      toast.success('Payment configuration saved to Supabase!');
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
              Payment Gateways &amp; Methods
            </h1>
            <AdminSectionInfo
              title="Payment Processing Configuration"
              purpose="View server environment gateway status (Razorpay, Stripe) and configure Cash on Delivery limits, UPI, and international card availability."
              storefrontImpact="Controls payment rules enforced during checkout order validation (/checkout)."
              targets={[
                { name: 'Storefront Checkout', path: '/checkout', description: 'Payment method options & COD limits' },
                { name: 'Webhook Listeners', path: '/admin/settings/webhooks', description: 'Payment webhook signature verification' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Gateway credentials are stored strictly in server environment variables; checkout rules persist in Supabase
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 shadow-sm transition-opacity self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Payment Settings'}
        </button>
      </div>

      {errorMsg && (
        <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--color-whisper,#E5E5E5)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                CF
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-ink,#111111)]">Cashfree Payment Gateway (Primary INR)</h3>
                <p className="text-xs text-[var(--color-slate,#666666)]">UPI, Credit/Debit Cards, Net Banking, Wallets &amp; EMI (PG API v2023-08-01)</p>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                cashfreeConfigured
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {cashfreeConfigured ? 'ENV Keys Configured' : 'Needs ENV Credentials'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--color-snow,#F9F9F9)] border border-[var(--color-whisper,#E5E5E5)]">
              <p className="font-semibold text-[var(--color-ink)]">CASHFREE_APP_ID / SECRET_KEY</p>
              <p className="text-[var(--color-slate)] mt-1">
                {cashfreeConfigured
                  ? 'Cashfree PG credentials detected in server environment.'
                  : 'Set CASHFREE_APP_ID, CASHFREE_SECRET_KEY & NEXT_PUBLIC_CASHFREE_ENV in Cloudflare Pages.'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--color-snow,#F9F9F9)] border border-[var(--color-whisper,#E5E5E5)]">
              <p className="font-semibold text-[var(--color-ink)]">CASHFREE WEBHOOK &amp; Stripe</p>
              <p className="text-[var(--color-slate)] mt-1">
                Webhook Secret: <strong>{cashfreeWebhookConfigured ? 'Configured' : 'Missing'}</strong> · Stripe Intl: <strong>{stripeConfigured ? 'Configured' : 'Not Configured'}</strong>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-5">
          <h3 className="text-sm font-semibold text-[var(--color-ink,#111111)]">
            Checkout Method Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="codMaxAmount" className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                Maximum COD Order Total (₹)
              </label>
              <input
                id="codMaxAmount"
                type="number"
                min={0}
                value={codMaxAmount}
                onChange={(e) => setCodMaxAmount(e.target.value)}
                className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
              />
            </div>
            <div>
              <label htmlFor="codFee" className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                Cash on Delivery Convenience Fee (₹)
              </label>
              <input
                id="codFee"
                type="number"
                min={0}
                value={codFee}
                onChange={(e) => setCodFee(e.target.value)}
                className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-[var(--color-whisper,#E5E5E5)] text-sm">
            <label className="flex items-center justify-between cursor-pointer">
              <span>Enable Cash on Delivery (COD)</span>
              <input type="checkbox" checked={codEnabled} onChange={(e) => setCodEnabled(e.target.checked)} className="h-4 w-4 accent-[var(--color-gold)]" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Enable UPI Payments</span>
              <input type="checkbox" checked={upiEnabled} onChange={(e) => setUpiEnabled(e.target.checked)} className="h-4 w-4 accent-[var(--color-gold)]" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Enable International Card Checkout (requires Stripe ENV keys)</span>
              <input type="checkbox" checked={intlEnabled} onChange={(e) => setIntlEnabled(e.target.checked)} className="h-4 w-4 accent-[var(--color-gold)]" />
            </label>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

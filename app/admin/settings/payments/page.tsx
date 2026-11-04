'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Save,
  Check,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

export default function PaymentsSettingsPage() {
  const [razorpayKey, setRazorpayKey] = useState('rzp_live_9281a8c9b');
  const [codEnabled, setCodEnabled] = useState(true);
  const [codMaxAmount, setCodMaxAmount] = useState('10000');
  const [codFee, setCodFee] = useState('0');
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [intlEnabled, setIntlEnabled] = useState(true);

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
              Payment Gateways &amp; Methods
            </h1>
            <AdminSectionInfo
              title="Payment Processing Configuration"
              purpose="Configure domestic Indian gateways (Razorpay, UPI, Net Banking), Cash on Delivery risk controls, and international card processors."
              storefrontImpact="Directly controls the available payment options on the checkout page (/checkout) and payment verification during order placement."
              targets={[
                { name: 'Storefront Checkout', path: '/checkout', description: 'Payment method options & COD validation' },
                { name: 'Cart Summary', path: '/cart', description: 'Payment trust badges' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Configure Razorpay, UPI QR, and Cash on Delivery rules
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 shadow-sm transition-opacity self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Payment Settings'}
        </button>
      </div>

      <div className="space-y-5">
        {/* Razorpay Integration */}
        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-whisper,#E5E5E5)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                R
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-ink,#111111)]">Razorpay Payment Gateway</h3>
                <p className="text-xs text-[var(--color-slate,#666666)]">Credit/Debit Cards, Net Banking &amp; Wallets</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-green-50 text-green-700 border border-green-200">
              Active / Live
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                Razorpay Key ID
              </label>
              <input
                type="text"
                value={razorpayKey}
                onChange={(e) => setRazorpayKey(e.target.value)}
                className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                Razorpay Key Secret
              </label>
              <input
                type="password"
                value="••••••••••••••••••••••••••••"
                readOnly
                className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm font-mono bg-[var(--color-snow,#F9F9F9)] text-[var(--color-mist,#999999)]"
              />
            </div>
          </div>
        </div>

        {/* Cash on Delivery (COD) */}
        <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-whisper,#E5E5E5)]">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-ink,#111111)]">Cash on Delivery (COD)</h3>
              <p className="text-xs text-[var(--color-slate,#666666)]">Customer pays cash to courier agent upon doorstep delivery</p>
            </div>
            <button
              type="button"
              onClick={() => setCodEnabled(!codEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                codEnabled ? 'bg-[var(--color-gold,#C9A84C)]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  codEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                Maximum COD Order Amount (₹)
              </label>
              <input
                type="number"
                value={codMaxAmount}
                onChange={(e) => setCodMaxAmount(e.target.value)}
                placeholder="10000"
                className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
              />
              <p className="text-[11px] text-[var(--color-slate,#666666)] mt-1">Orders above this amount must pay online</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
                Additional COD Handling Fee (₹)
              </label>
              <input
                type="number"
                value={codFee}
                onChange={(e) => setCodFee(e.target.value)}
                placeholder="0"
                className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
              />
              <p className="text-[11px] text-[var(--color-slate,#666666)] mt-1">Leave 0 for free COD</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

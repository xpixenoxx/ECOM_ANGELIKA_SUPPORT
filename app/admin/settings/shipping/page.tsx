'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Check, Save } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

export default function ShippingSettingsPage() {
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('999');
  const [standardRate, setStandardRate] = useState('150');
  const [expressRate, setExpressRate] = useState('250');
  const [defaultPartner, setDefaultPartner] = useState('Delhivery Express');
  const [estimatedDays, setEstimatedDays] = useState('3-5 business days');

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
              Shipping &amp; Delivery Logistics
            </h1>
            <AdminSectionInfo
              title="Pan-India Logistics & Delivery"
              purpose="Configure Pan-India shipping rates, free shipping thresholds, courier integration (Delhivery, BlueDart), and estimated delivery timeframes."
              storefrontImpact="Drives the Free Shipping progress bar in the Cart Drawer, shipping calculation on the checkout page, and estimated delivery dates on Product Detail Pages."
              targets={[
                { name: 'Cart Drawer', path: '/cart', description: 'Free shipping progress calculator' },
                { name: 'Storefront Checkout', path: '/checkout', description: 'Shipping fee and address validation' },
                { name: 'Shipping Policy Page', path: '/shipping', description: 'Official customer delivery policies' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Free shipping threshold, courier partners, and transit timeframes
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 shadow-sm transition-opacity self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Shipping Settings'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] flex items-center gap-2">
          <Truck className="w-4 h-4 text-[var(--color-gold,#C9A84C)]" />
          Pan-India Shipping Rules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
              Free Shipping Order Threshold (₹)
            </label>
            <input
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              placeholder="999"
              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
            />
            <p className="text-[11px] text-[var(--color-slate,#666666)] mt-1">Orders above this qualify for 100% Free Shipping</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
              Standard Shipping Fee (₹)
            </label>
            <input
              type="number"
              value={standardRate}
              onChange={(e) => setStandardRate(e.target.value)}
              placeholder="150"
              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
            />
            <p className="text-[11px] text-[var(--color-slate,#666666)] mt-1">Applied when cart total is below threshold</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
              Primary Courier Partner
            </label>
            <select
              value={defaultPartner}
              onChange={(e) => setDefaultPartner(e.target.value)}
              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30 bg-white"
            >
              <option value="Delhivery Express">Delhivery Express</option>
              <option value="Blue Dart Express">Blue Dart Express</option>
              <option value="DTDC Air">DTDC Air</option>
              <option value="India Post Speed Post">India Post Speed Post</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
              Estimated Delivery Time Displayed
            </label>
            <input
              type="text"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value)}
              placeholder="3-5 business days"
              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

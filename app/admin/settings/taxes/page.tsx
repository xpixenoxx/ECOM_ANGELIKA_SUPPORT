'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Percent, Check, Save } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

export default function TaxesSettingsPage() {
  const [gstin, setGstin] = useState('29AAAAA0000A1Z5');
  const [pricesIncludeTax, setPricesIncludeTax] = useState(true);
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
              GST &amp; Taxation Settings
            </h1>
            <AdminSectionInfo
              title="Goods & Services Tax (GST) Architecture"
              purpose="Configure statutory Indian GST slabs for apparel, HSN codes for handloom & silk garments, and automated tax invoicing."
              storefrontImpact="Ensures legal compliance on invoice generation, order receipts, and displays 'Prices inclusive of all taxes' badge on Product Detail Pages."
              targets={[
                { name: 'Product Detail Pages', path: '/shop', description: 'Tax inclusive pricing disclaimer' },
                { name: 'Customer Invoices', path: '/account/orders', description: 'Downloadable GST tax invoices' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Indian GST slabs, HSN classification, and tax invoices
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 shadow-sm transition-opacity self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Tax Settings'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
            Business GSTIN Number *
          </label>
          <input
            type="text"
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            placeholder="29AAAAA0000A1Z5"
            className="w-full sm:w-80 border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
          />
        </div>

        {/* GST Slabs Table */}
        <div className="pt-2">
          <h3 className="text-sm font-semibold text-[var(--color-ink,#111111)] mb-2">Applicable Apparel Slabs</h3>
          <div className="border border-[var(--color-whisper,#E5E5E5)] rounded-xl overflow-hidden text-xs">
            <div className="grid grid-cols-3 bg-[var(--color-snow,#F9F9F9)] p-3 font-semibold text-[var(--color-slate,#666666)]">
              <span>Garment Category</span>
              <span>HSN Code</span>
              <span className="text-right">GST Rate</span>
            </div>
            <div className="grid grid-cols-3 p-3 border-t border-[var(--color-whisper,#E5E5E5)]">
              <span>Kurtis, Salwars, Lehengas (&gt; ₹1,000)</span>
              <span className="font-mono">6204</span>
              <span className="text-right font-bold text-green-700">12%</span>
            </div>
            <div className="grid grid-cols-3 p-3 border-t border-[var(--color-whisper,#E5E5E5)]">
              <span>Pure Mulberry &amp; Banarasi Silk Sarees</span>
              <span className="font-mono">5007</span>
              <span className="text-right font-bold text-green-700">5%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import {
  getExtendedStoreSettings,
  saveExtendedStoreSettings,
} from '@/lib/actions/store-settings';

export default function TaxesSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [gstin, setGstin] = useState('');
  const [pricesIncludeTax, setPricesIncludeTax] = useState(true);
  const [apparelLowRate, setApparelLowRate] = useState('5');
  const [apparelHighRate, setApparelHighRate] = useState('12');
  const [thresholdAmount, setThresholdAmount] = useState('1000');

  useEffect(() => {
    getExtendedStoreSettings()
      .then((res) => {
        setGstin(res.extended.taxes.gstin || '');
        setPricesIncludeTax(res.extended.taxes.pricesIncludeTax);
        setApparelLowRate(String(res.extended.taxes.apparelLowRate));
        setApparelHighRate(String(res.extended.taxes.apparelHighRate));
        setThresholdAmount(String(res.extended.taxes.thresholdAmount));
        if (!res.success && res.error) setErrorMsg(res.error);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const cleanGstin = gstin.trim().toUpperCase();
      const res = await saveExtendedStoreSettings('taxes', {
        gstin: cleanGstin ? cleanGstin : null,
        pricesIncludeTax,
        apparelLowRate: Number(apparelLowRate) || 5,
        apparelHighRate: Number(apparelHighRate) || 12,
        thresholdAmount: Number(thresholdAmount) || 1000,
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to save tax settings.');
        toast.error(res.error || 'Failed to save tax settings.');
        return;
      }
      toast.success('GST & Tax settings saved to Supabase!');
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
              GST &amp; Taxation Settings
            </h1>
            <AdminSectionInfo
              title="Goods & Services Tax (GST) Architecture"
              purpose="Configure statutory Indian GST registration (GSTIN when issued) and apparel tax slab thresholds."
              storefrontImpact="Applies inclusive Indian apparel GST breakdowns across Checkout and downloadable invoices."
              targets={[
                { name: 'Storefront Checkout', path: '/checkout', description: 'Tax inclusive calculation' },
                { name: 'Customer Invoices', path: '/account/orders', description: 'Official GST breakdown' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Leave GSTIN empty if not yet registered; only valid 15-character Indian GSTINs are accepted
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 shadow-sm transition-opacity self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Tax Settings'}
        </button>
      </div>

      {errorMsg && (
        <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gstinInput" className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
              Business GSTIN Number (Optional)
            </label>
            <input
              id="gstinInput"
              type="text"
              maxLength={15}
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="Enter verified 15-char GSTIN or leave blank"
              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
            />
          </div>

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={pricesIncludeTax}
                onChange={(e) => setPricesIncludeTax(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-gold)]"
              />
              <span>Catalog prices are inclusive of GST</span>
            </label>
          </div>
        </div>

        <div className="pt-2">
          <h3 className="text-sm font-semibold text-[var(--color-ink,#111111)] mb-2">Statutory Apparel GST Slabs (INR)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">Threshold (₹)</label>
              <input
                type="number"
                value={thresholdAmount}
                onChange={(e) => setThresholdAmount(e.target.value)}
                className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">Slab &le; Threshold (%)</label>
              <input
                type="number"
                value={apparelLowRate}
                onChange={(e) => setApparelLowRate(e.target.value)}
                className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate)] mb-1">Slab &gt; Threshold (%)</label>
              <input
                type="number"
                value={apparelHighRate}
                onChange={(e) => setApparelHighRate(e.target.value)}
                className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm"
              />
            </div>
          </div>

          <div className="border border-[var(--color-whisper,#E5E5E5)] rounded-xl overflow-hidden text-xs">
            <div className="grid grid-cols-3 bg-[var(--color-snow,#F9F9F9)] p-3 font-semibold text-[var(--color-slate,#666666)]">
              <span>Garment Category</span>
              <span>HSN Code</span>
              <span className="text-right">GST Rate</span>
            </div>
            <div className="grid grid-cols-3 p-3 border-t border-[var(--color-whisper,#E5E5E5)]">
              <span>Apparel above ₹{Number(thresholdAmount || 1000).toLocaleString('en-IN')}</span>
              <span className="font-mono">6204</span>
              <span className="text-right font-bold text-green-700">{apparelHighRate}%</span>
            </div>
            <div className="grid grid-cols-3 p-3 border-t border-[var(--color-whisper,#E5E5E5)]">
              <span>Apparel up to ₹{Number(thresholdAmount || 1000).toLocaleString('en-IN')}</span>
              <span className="font-mono">5007 / 6204</span>
              <span className="text-right font-bold text-green-700">{apparelLowRate}%</span>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import {
  getExtendedStoreSettings,
  saveExtendedStoreSettings,
} from '@/lib/actions/store-settings';

export default function ShippingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [freeShippingThreshold, setFreeShippingThreshold] = useState('2999');
  const [standardRate, setStandardRate] = useState('99');
  const [expressRate, setExpressRate] = useState('249');
  const [defaultPartner, setDefaultPartner] = useState('Shiprocket');
  const [estimatedDays, setEstimatedDays] = useState('5-7 business days');

  const [shiprocketConfigured, setShiprocketConfigured] = useState(false);
  const [shiprocketWebhookConfigured, setShiprocketWebhookConfigured] = useState(false);

  useEffect(() => {
    getExtendedStoreSettings()
      .then((res) => {
        setFreeShippingThreshold(String(res.freeShippingThreshold));
        setStandardRate(String(res.extended.shipping.standardRate));
        setExpressRate(String(res.extended.shipping.expressRate));
        setDefaultPartner(res.extended.shipping.defaultPartner || 'Shiprocket');
        setEstimatedDays(res.extended.shipping.estimatedDays);
        setShiprocketConfigured(res.serviceHealth.shiprocketConfigured);
        setShiprocketWebhookConfigured(res.serviceHealth.shiprocketWebhookConfigured);
        if (!res.success && res.error) setErrorMsg(res.error);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await saveExtendedStoreSettings('shipping', {
        freeShippingThreshold: Number(freeShippingThreshold) || 0,
        standardRate: Number(standardRate) || 0,
        expressRate: Number(expressRate) || 0,
        defaultPartner: defaultPartner.trim(),
        estimatedDays: estimatedDays.trim(),
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to save shipping settings.');
        toast.error(res.error || 'Failed to save shipping settings.');
        return;
      }
      toast.success('Shipping settings persisted to Supabase!');
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
              Shipping &amp; Delivery Logistics
            </h1>
            <AdminSectionInfo
              title="Pan-India Logistics & Delivery"
              purpose="Configure Pan-India shipping rates, free shipping thresholds, courier partners, and estimated delivery timeframes."
              storefrontImpact="Persists shipping threshold and rates in Supabase store_settings for Cart and Checkout calculations."
              targets={[
                { name: 'Cart Page', path: '/cart', description: 'Free shipping progress calculator' },
                { name: 'Storefront Checkout', path: '/checkout', description: 'Shipping fee calculation' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Free shipping threshold, flat rates, and courier integrations
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 shadow-sm transition-opacity self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Shipping Settings'}
        </button>
      </div>

      {errorMsg && (
        <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--color-whisper,#E5E5E5)]">
          <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[var(--color-gold,#C9A84C)]" />
            Pan-India Shipping Rules
          </h2>
          <span className="text-xs text-[var(--color-slate)]">
            Shiprocket API: <strong>{shiprocketConfigured ? 'Configured' : 'Not Configured'}</strong> · Tracking Webhook: <strong>{shiprocketWebhookConfigured ? 'Configured' : 'Not Configured'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="freeThreshold" className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
              Free Shipping Order Threshold (₹)
            </label>
            <input
              id="freeThreshold"
              type="number"
              min={0}
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
            />
          </div>

          <div>
            <label htmlFor="standardRate" className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
              Standard Shipping Fee (₹)
            </label>
            <input
              id="standardRate"
              type="number"
              min={0}
              value={standardRate}
              onChange={(e) => setStandardRate(e.target.value)}
              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
            />
          </div>

          <div>
            <label htmlFor="expressRate" className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
              Express Air Shipping Fee (₹)
            </label>
            <input
              id="expressRate"
              type="number"
              min={0}
              value={expressRate}
              onChange={(e) => setExpressRate(e.target.value)}
              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
            />
          </div>

          <div>
            <label htmlFor="defaultPartner" className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
              Primary Courier Partner
            </label>
            <input
              id="defaultPartner"
              type="text"
              value={defaultPartner}
              onChange={(e) => setDefaultPartner(e.target.value)}
              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="estimatedDays" className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
              Estimated Transit Window
            </label>
            <input
              id="estimatedDays"
              type="text"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value)}
              className="w-full border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#C9A84C)]/30"
            />
          </div>
        </div>
      </form>
    </motion.div>
  );
}

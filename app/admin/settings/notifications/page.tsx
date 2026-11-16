'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import {
  getExtendedStoreSettings,
  saveExtendedStoreSettings,
} from '@/lib/actions/store-settings';

export default function NotificationsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [orderSound, setOrderSound] = useState(true);
  const [vipSmsAlert, setVipSmsAlert] = useState(false);
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState('5');

  useEffect(() => {
    getExtendedStoreSettings()
      .then((res) => {
        setOrderSound(res.extended.notifications.orderSound);
        setVipSmsAlert(res.extended.notifications.vipSmsAlert);
        setLowStockAlert(res.extended.notifications.lowStockAlert);
        setDailyDigest(res.extended.notifications.dailyDigest);
        setLowStockThreshold(String(res.extended.notifications.lowStockThreshold));
        if (!res.success && res.error) setErrorMsg(res.error);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await saveExtendedStoreSettings('notifications', {
        orderSound,
        vipSmsAlert,
        lowStockAlert,
        dailyDigest,
        lowStockThreshold: Math.max(1, Number(lowStockThreshold) || 5),
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to save notification rules.');
        toast.error(res.error || 'Failed to save notification rules.');
        return;
      }
      toast.success('Notification preferences persisted to Supabase!');
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
              Admin Alerts &amp; Notification Rules
            </h1>
            <AdminSectionInfo
              title="Admin Panel Notifications"
              purpose="Configure operational alerts and low-stock thresholds saved in Supabase store_settings."
              storefrontImpact="Drives low-stock warnings in Inventory Manager and order notifications in Admin."
              targets={[
                { name: 'Dashboard Alerts', path: '/admin', description: 'Real-time dashboard notifications' },
                { name: 'Inventory Alerts', path: '/admin/products/inventory', description: 'Low stock thresholds' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Operational notifications persisted for the administration team
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 shadow-sm transition-opacity self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Notification Settings'}
        </button>
      </div>

      {errorMsg && (
        <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-5">
        <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[var(--color-gold,#C9A84C)]" />
          Real-time Event Triggers
        </h2>

        <div className="space-y-4 divide-y divide-[var(--color-whisper,#E5E5E5)]">
          <label className="flex items-center justify-between pt-2 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-[var(--color-ink,#111111)]">New Order Audio Chime</p>
              <p className="text-xs text-[var(--color-slate,#666666)]">Play chime in Admin panel when a new order arrives</p>
            </div>
            <input type="checkbox" checked={orderSound} onChange={(e) => setOrderSound(e.target.checked)} className="h-4 w-4 accent-[var(--color-gold)]" />
          </label>

          <label className="flex items-center justify-between pt-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-[var(--color-ink,#111111)]">High Value Order Alert (&gt; ₹25,000)</p>
              <p className="text-xs text-[var(--color-slate,#666666)]">Flag high-value bridal &amp; couture orders</p>
            </div>
            <input type="checkbox" checked={vipSmsAlert} onChange={(e) => setVipSmsAlert(e.target.checked)} className="h-4 w-4 accent-[var(--color-gold)]" />
          </label>

          <label className="flex items-center justify-between pt-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-[var(--color-ink,#111111)]">Low Stock Variant Alert</p>
              <p className="text-xs text-[var(--color-slate,#666666)]">Warn ops team when stock falls below threshold</p>
            </div>
            <input type="checkbox" checked={lowStockAlert} onChange={(e) => setLowStockAlert(e.target.checked)} className="h-4 w-4 accent-[var(--color-gold)]" />
          </label>

          <label className="flex items-center justify-between pt-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-[var(--color-ink,#111111)]">Daily Revenue Summary Digest</p>
              <p className="text-xs text-[var(--color-slate,#666666)]">Include store metrics summary in owner notifications</p>
            </div>
            <input type="checkbox" checked={dailyDigest} onChange={(e) => setDailyDigest(e.target.checked)} className="h-4 w-4 accent-[var(--color-gold)]" />
          </label>

          <div className="pt-4">
            <label htmlFor="lowStockThreshold" className="block text-xs font-semibold text-[var(--color-slate,#666666)] mb-1">
              Low Stock Warning Threshold (Units)
            </label>
            <input
              id="lowStockThreshold"
              type="number"
              min={1}
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className="w-40 border border-[var(--color-whisper,#E5E5E5)] rounded-xl px-3.5 py-2 text-sm"
            />
          </div>
        </div>
      </form>
    </motion.div>
  );
}

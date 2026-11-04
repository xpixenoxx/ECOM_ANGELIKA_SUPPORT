'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Save } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

export default function NotificationsSettingsPage() {
  const [orderSound, setOrderSound] = useState(true);
  const [vipSmsAlert, setVipSmsAlert] = useState(true);
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);

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
              Admin Alerts &amp; Notification Rules
            </h1>
            <AdminSectionInfo
              title="Admin Panel Notifications"
              purpose="Configure operational alerts sent to store managers and designer Vidhya for high-value orders, stock depletions, and daily revenue reports."
              storefrontImpact="Triggered immediately when customers place high-value orders or when product inventory drops below low stock thresholds."
              targets={[
                { name: 'Dashboard Alerts', path: '/admin', description: 'Real-time dashboard notifications' },
                { name: 'Inventory Alerts', path: '/admin/products/inventory', description: 'Low stock thresholds' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Real-time push, sound, and SMS notifications for the administration team
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[var(--color-gold,#C9A84C)] text-white rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 shadow-sm transition-opacity self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Notification Settings'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[var(--color-gold,#C9A84C)]" />
          Real-time Event Triggers
        </h2>

        <div className="space-y-4 divide-y divide-[var(--color-whisper,#E5E5E5)]">
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-medium text-[var(--color-ink,#111111)]">New Order Audio Chime</p>
              <p className="text-xs text-[var(--color-slate,#666666)]">Play subtle bell sound in Admin panel when new order is placed</p>
            </div>
            <button
              type="button"
              onClick={() => setOrderSound(!orderSound)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                orderSound ? 'bg-[var(--color-gold,#C9A84C)]' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${orderSound ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-ink,#111111)]">High Value Order SMS Alert (&gt; ₹25,000)</p>
              <p className="text-xs text-[var(--color-slate,#666666)]">Instant SMS to store manager for bridal and luxury ensemble orders</p>
            </div>
            <button
              type="button"
              onClick={() => setVipSmsAlert(!vipSmsAlert)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                vipSmsAlert ? 'bg-[var(--color-gold,#C9A84C)]' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${vipSmsAlert ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-ink,#111111)]">Critical Low Stock WhatsApp Warning</p>
              <p className="text-xs text-[var(--color-slate,#666666)]">Notify when popular kurti/saree variants drop below 3 units</p>
            </div>
            <button
              type="button"
              onClick={() => setLowStockAlert(!lowStockAlert)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                lowStockAlert ? 'bg-[var(--color-gold,#C9A84C)]' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${lowStockAlert ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

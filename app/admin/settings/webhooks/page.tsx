'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

export default function WebhooksSettingsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const webhooks = [
    { name: 'Razorpay Payment Capture Webhook', endpoint: '/api/webhooks/razorpay', status: 'ACTIVE', events: 'payment.captured, payment.failed' },
    { name: 'Delhivery AWB Tracking Webhook', endpoint: '/api/webhooks/delhivery', status: 'ACTIVE', events: 'shipment.dispatched, shipment.delivered' },
    { name: 'Meta WhatsApp Inbound Webhook', endpoint: '/api/webhooks/whatsapp', status: 'ACTIVE', events: 'messages, message_deliveries' },
  ];

  function copyUrl(endpoint: string) {
    const full = typeof window !== 'undefined' ? `${window.location.origin}${endpoint}` : endpoint;
    navigator.clipboard.writeText(full);
    setCopied(endpoint);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
              Webhooks &amp; API Integrations
            </h1>
            <AdminSectionInfo
              title="Webhook Endpoints & Real-time Sync"
              purpose="Manage inbound webhook listeners from Razorpay (payment capture), Delhivery (AWB status updates), and WhatsApp (inbound customer messages)."
              storefrontImpact="Updates order status and payment status in real-time in Supabase when transactions complete on the payment gateway."
              targets={[
                { name: 'Orders Listing', path: '/admin/orders', description: 'Real-time order status updates' },
                { name: 'WhatsApp Concierge', path: '/admin/whatsapp', description: 'Real-time inbound message listener' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Real-time automated listeners for Razorpay, Delhivery, and WhatsApp
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] flex items-center gap-2">
          <Zap className="w-4 h-4 text-[var(--color-gold,#C9A84C)]" />
          Configured Webhook Listeners
        </h2>

        <div className="space-y-3">
          {webhooks.map((w) => (
            <div key={w.endpoint} className="p-4 rounded-xl bg-[var(--color-snow,#F9F9F9)] border border-[var(--color-whisper,#E5E5E5)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-[var(--color-ink,#111111)]">{w.name}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                    {w.status}
                  </span>
                </div>
                <p className="text-xs font-mono text-[var(--color-slate,#666666)] mt-1">{w.endpoint}</p>
                <p className="text-[11px] text-[var(--color-mist,#999999)] mt-0.5">Events: {w.events}</p>
              </div>

              <button
                type="button"
                onClick={() => copyUrl(w.endpoint)}
                className="px-3 py-1.5 rounded-lg border border-[var(--color-whisper,#E5E5E5)] bg-white text-xs font-medium text-[var(--color-ink,#111111)] hover:border-[var(--color-gold,#C9A84C)] transition-colors self-start sm:self-auto"
              >
                {copied === w.endpoint ? '✓ Copied URL' : 'Copy Endpoint'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

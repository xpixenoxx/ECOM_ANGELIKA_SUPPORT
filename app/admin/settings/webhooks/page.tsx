'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import { getExtendedStoreSettings } from '@/lib/actions/store-settings';
import type { ServiceHealthFlags } from '@/lib/env';

export default function WebhooksSettingsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [health, setHealth] = useState<ServiceHealthFlags | null>(null);

  useEffect(() => {
    getExtendedStoreSettings()
      .then((res) => setHealth(res.serviceHealth))
      .catch(() => {});
  }, []);

  const webhooks = [
    {
      name: 'Razorpay Payment & Refund Webhook (Primary)',
      endpoint: '/api/webhooks/razorpay',
      configured: health?.razorpayWebhookConfigured ?? false,
      envKey: 'RAZORPAY_WEBHOOK_SECRET',
      events: 'payment.authorized, payment.captured, payment.failed, order.paid, refund.created, refund.processed, refund.failed',
      note: 'Verifies raw body HMAC-SHA256 via x-razorpay-signature header.',
    },
    {
      name: 'Shiprocket Logistics & Tracking Webhook (Primary)',
      endpoint: '/api/webhooks/logistics',
      configured: health?.shiprocketWebhookConfigured ?? false,
      envKey: 'SHIPROCKET_WEBHOOK_TOKEN',
      events: 'AWB Assigned, Pickup Scheduled, Picked Up, In Transit, Out for Delivery, Delivered, NDR/Failed, RTO, Cancelled',
      note: 'URL avoids restricted keywords (shiprocket/sr/kr) per Shiprocket rules. Authenticates via x-api-key header.',
    },
    {
      name: 'Meta WhatsApp Inbound Webhook',
      endpoint: '/api/webhooks/whatsapp',
      configured: health?.whatsappWebhookConfigured ?? false,
      envKey: 'WHATSAPP_WEBHOOK_VERIFY_TOKEN + WHATSAPP_APP_SECRET',
      events: 'messages, message_deliveries',
      note: 'Verifies x-hub-signature-256 HMAC-SHA256.',
    },
  ];

  function copyUrl(endpoint: string) {
    const full = typeof window !== 'undefined' ? `${window.location.origin}${endpoint}` : endpoint;
    navigator.clipboard.writeText(full);
    setCopied(endpoint);
    toast.success(`Copied ${endpoint} URL`);
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
              purpose="Inspect fail-closed signature-verified inbound webhook listeners for Razorpay, Shiprocket, and Meta WhatsApp."
              storefrontImpact="Updates order, payment, refund, shipment, and conversation state in Supabase only when valid provider secrets verify."
              targets={[
                { name: 'Orders Listing', path: '/admin/orders', description: 'Real-time order & payment status updates' },
                { name: 'Shipments', path: '/admin/orders/shipments', description: 'Real-time Shiprocket tracking sync' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Signature-verified, idempotent webhook receivers persisted durably via webhook_events
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] flex items-center gap-2">
          <Zap className="w-4 h-4 text-[var(--color-gold,#C9A84C)]" />
          Webhook Listeners &amp; Secret Status
        </h2>

        <div className="space-y-3">
          {webhooks.map((w) => (
            <div key={w.endpoint} className="p-4 rounded-xl bg-[var(--color-snow,#F9F9F9)] border border-[var(--color-whisper,#E5E5E5)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold text-[var(--color-ink,#111111)]">{w.name}</p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      w.configured
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {w.configured ? 'SECRET CONFIGURED' : `NEEDS ${w.envKey}`}
                  </span>
                </div>
                <p className="text-xs font-mono text-[var(--color-slate,#666666)] mt-1">{w.endpoint}</p>
                <p className="text-[11px] text-[var(--color-mist,#999999)] mt-0.5">Events: {w.events}</p>
                {w.note && <p className="text-[11px] text-[var(--color-slate,#666666)] mt-0.5">{w.note}</p>}
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

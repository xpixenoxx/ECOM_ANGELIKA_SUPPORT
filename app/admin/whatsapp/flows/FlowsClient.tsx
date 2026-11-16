'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import {
  saveWhatsAppFlowsConfig,
  type WhatsAppFlowConfigItem,
} from '@/lib/actions/admin-whatsapp';

interface Props {
  initialFlows: WhatsAppFlowConfigItem[];
}

export default function FlowsClient({ initialFlows }: Props) {
  const [flows, setFlows] = useState<WhatsAppFlowConfigItem[]>(initialFlows);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function toggleFlow(id: string) {
    const previous = flows;
    const nextFlows = flows.map((f) =>
      f.id === id ? { ...f, status: (f.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE') as 'ACTIVE' | 'DRAFT' } : f
    );
    setFlows(nextFlows);
    setSavingId(id);

    try {
      const res = await saveWhatsAppFlowsConfig(nextFlows);
      if (!res.success) {
        setFlows(previous);
        toast.error(res.error || 'Could not update flow state.');
      } else {
        const updated = nextFlows.find((f) => f.id === id);
        toast.success(`${updated?.name || 'Flow'} is now ${updated?.status}.`);
      }
    } catch {
      setFlows(previous);
      toast.error('Failed to save WhatsApp flow configuration.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
              Interactive WhatsApp Flows
            </h1>
            <AdminSectionInfo
              title="Automated Concierge Flows"
              purpose="Configure interactive WhatsApp concierge flows for self-service sizing, automated order lookup, and bridal video consultations."
              storefrontImpact="Persists flow routing configuration in Supabase for concierge triggers across /size-finder and /track-order."
              targets={[
                { name: 'Size Finder Guide', path: '/size-finder', description: 'Interactive sizing consultation' },
                { name: 'Order Tracking', path: '/track-order', description: 'Automated 24/7 lookup' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Self-service WhatsApp concierge flows persisted in Supabase
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {flows.map((flow) => (
          <div
            key={flow.id}
            className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-ink,#111111)]">{flow.name}</h3>
                <p className="text-xs text-[var(--color-slate,#666666)] mt-1 leading-relaxed">{flow.description}</p>
              </div>
              <button
                type="button"
                disabled={savingId === flow.id}
                onClick={() => toggleFlow(flow.id)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
                  flow.status === 'ACTIVE'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {flow.status === 'ACTIVE' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                <span>{savingId === flow.id ? 'Saving...' : flow.status}</span>
              </button>
            </div>

            <div className="space-y-1.5 bg-[var(--color-snow,#F9F9F9)] p-3 rounded-xl border border-[var(--color-whisper,#E5E5E5)]">
              <span className="text-[10px] font-semibold text-[var(--color-slate,#666666)] uppercase tracking-wider">
                Triggers &amp; Entry Points
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {flow.triggers.map((trig, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-[var(--color-whisper,#E5E5E5)] text-[var(--color-ink,#111111)] font-mono"
                  >
                    {trig}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--color-slate,#666666)] pt-1 border-t border-[var(--color-whisper,#E5E5E5)]">
              <span>{flow.stepsCount} Interactive Steps</span>
              <span className="text-[11px] text-[var(--color-mist)]">
                Synced with Supabase configuration
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

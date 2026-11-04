'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

interface Flow {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'DRAFT';
  triggers: string[];
  stepsCount: number;
  completionRate: string;
}

const FLOWS: Flow[] = [
  {
    id: 'f1',
    name: 'Bespoke Sizing & Custom Blouse Measurement',
    description: 'Guides the customer through taking accurate bust, waist, shoulder, and blouse length measurements directly via WhatsApp interactive forms.',
    status: 'ACTIVE',
    triggers: ['Keyword "CUSTOM SIZE"', 'Product Page "Bespoke Size Request" CTA'],
    stepsCount: 5,
    completionRate: '88%',
  },
  {
    id: 'f2',
    name: 'Instant Order & Dispatch Tracking Flow',
    description: 'Allows customers to query order status 24/7 by entering their 5-digit order number, returning live courier AWB tracking links.',
    status: 'ACTIVE',
    triggers: ['Keyword "TRACK"', 'Footer "WhatsApp Track" CTA'],
    stepsCount: 3,
    completionRate: '94%',
  },
  {
    id: 'f3',
    name: 'Bridal Atelier Consultation Booking',
    description: 'Qualifies bridal inquiries, collects wedding date, budget, and desired color palette, then schedules a 1-on-1 video appointment with Vidhya.',
    status: 'ACTIVE',
    triggers: ['Bridal Lehenga Page "Book Atelier Consultation"', 'Keyword "BRIDAL"'],
    stepsCount: 6,
    completionRate: '79%',
  },
  {
    id: 'f4',
    name: 'Easy Return / Exchange Initiator',
    description: 'Self-service flow for initiating reverse pickup within 7 days of delivery, collecting return reasons and photos.',
    status: 'ACTIVE',
    triggers: ['Keyword "RETURN"', 'Order Success Email link'],
    stepsCount: 4,
    completionRate: '82%',
  },
];

export default function FlowsClient() {
  const [flows, setFlows] = useState<Flow[]>(FLOWS);

  function toggleFlow(id: string) {
    setFlows((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: f.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE' } : f
      )
    );
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
              purpose="Multi-step interactive mini-apps hosted inside WhatsApp for self-service sizing, automated order lookup, and bridal video consultations."
              storefrontImpact="Triggered when customers click 'Size Guide Consultation' or 'Chat with Vidhya' on the website."
              targets={[
                { name: 'Size Finder Guide', path: '/size-finder', description: 'Interactive sizing consultation' },
                { name: 'Order Tracking', path: '/track-order', description: 'Automated 24/7 lookup' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Self-service WhatsApp mini-apps &amp; customer journeys
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {flows.map((flow) => (
          <div
            key={flow.id}
            className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-ink,#111111)]">{flow.name}</h3>
                <p className="text-xs text-[var(--color-slate,#666666)] mt-1 leading-relaxed">{flow.description}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleFlow(flow.id)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                  flow.status === 'ACTIVE'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {flow.status === 'ACTIVE' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                <span>{flow.status}</span>
              </button>
            </div>

            {/* Triggers */}
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

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-[var(--color-slate,#666666)] pt-1 border-t border-[var(--color-whisper,#E5E5E5)]">
              <span>{flow.stepsCount} Interactive Steps</span>
              <span className="font-semibold text-green-600">{flow.completionRate} Completion Rate</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

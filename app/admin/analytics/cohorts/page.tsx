'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users2, Repeat, Calendar, Award } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

const COHORTS = [
  { cohort: 'Jul 2026', customers: 412, m1: '100%', m2: '38%', m3: '29%', m4: '26%', m5: '24%' },
  { cohort: 'Aug 2026', customers: 489, m1: '100%', m2: '41%', m3: '33%', m4: '28%', m5: '—' },
  { cohort: 'Sep 2026', customers: 560, m1: '100%', m2: '44%', m3: '35%', m4: '—', m5: '—' },
  { cohort: 'Oct 2026', customers: 680, m1: '100%', m2: '47%', m3: '—', m4: '—', m5: '—' },
  { cohort: 'Nov 2026 (MTD)', customers: 198, m1: '100%', m2: '—', m3: '—', m4: '—', m5: '—' },
];

export default function CohortsAnalyticsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
              Customer Cohort Retention
            </h1>
            <AdminSectionInfo
              title="Repeat Purchase Cohorts"
              purpose="Track repeat purchase behavior of ethnic wear shoppers month over month to quantify brand loyalty, seasonal bridal re-orders, and festive replenishment."
              storefrontImpact="Measures customer retention driven by the Loyalty Program (/account/loyalty), automated WhatsApp re-order flows, and email campaigns."
              targets={[
                { name: 'Customer Account Loyalty', path: '/account/loyalty', description: 'Points & reward tier redemption' },
                { name: 'All Customers Directory', path: '/admin/customers', description: 'Profiles and lifetime value' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Month 2 repeat order rate: <strong className="text-green-600 font-bold">47%</strong> for recent cohort
          </p>
        </div>
      </div>

      {/* Cohorts Table */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm overflow-x-auto">
        <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] mb-4">
          Repeat Purchase Retention Rate (%)
        </h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-whisper,#E5E5E5)] text-left text-xs text-[var(--color-slate,#666666)] uppercase tracking-wider">
              <th className="pb-3 font-semibold">Cohort Month</th>
              <th className="pb-3 font-semibold">New Clients</th>
              <th className="pb-3 font-semibold">Month 1</th>
              <th className="pb-3 font-semibold">Month 2</th>
              <th className="pb-3 font-semibold">Month 3</th>
              <th className="pb-3 font-semibold">Month 4</th>
              <th className="pb-3 font-semibold">Month 5</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-whisper,#E5E5E5)]">
            {COHORTS.map((row) => (
              <tr key={row.cohort} className="hover:bg-[var(--color-snow,#F9F9F9)] transition-colors">
                <td className="py-3.5 font-medium text-[var(--color-ink,#111111)] flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[var(--color-gold,#C9A84C)]" />
                  {row.cohort}
                </td>
                <td className="py-3.5 font-semibold text-[var(--color-ink,#111111)]">
                  {row.customers}
                </td>
                <td className="py-3.5">
                  <span className="px-2.5 py-1 rounded-md bg-green-100 text-green-800 font-medium text-xs">
                    {row.m1}
                  </span>
                </td>
                <td className="py-3.5">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${row.m2 !== '—' ? 'bg-green-50 text-green-700' : 'text-gray-400'}`}>
                    {row.m2}
                  </span>
                </td>
                <td className="py-3.5">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${row.m3 !== '—' ? 'bg-green-50 text-green-700' : 'text-gray-400'}`}>
                    {row.m3}
                  </span>
                </td>
                <td className="py-3.5">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${row.m4 !== '—' ? 'bg-green-50 text-green-700' : 'text-gray-400'}`}>
                    {row.m4}
                  </span>
                </td>
                <td className="py-3.5">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${row.m5 !== '—' ? 'bg-green-50 text-green-700' : 'text-gray-400'}`}>
                    {row.m5}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Filter,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  Users,
  Eye,
  ArrowDown,
} from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

const FUNNEL_STEPS = [
  {
    step: 'Storefront Visitors',
    count: 48500,
    pctOfTotal: '100%',
    dropoff: '42% drop-off',
    description: 'Arrived via Direct, Organic Search, Instagram, and WhatsApp links',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    step: 'Product Detail Views',
    count: 28130,
    pctOfTotal: '58.0%',
    dropoff: '68% drop-off',
    description: 'Browsed handcrafted Kurti, Saree, and Lehenga item pages',
    icon: Eye,
    color: 'bg-indigo-500',
  },
  {
    step: 'Added to Bag',
    count: 9002,
    pctOfTotal: '18.6%',
    dropoff: '51% drop-off',
    description: 'Selected garment size, color variant, and clicked Add to Bag',
    icon: ShoppingBag,
    color: 'bg-amber-500',
  },
  {
    step: 'Initiated Checkout',
    count: 4410,
    pctOfTotal: '9.1%',
    dropoff: '34% drop-off',
    description: 'Entered shipping address, pincode, and selected payment method',
    icon: CreditCard,
    color: 'bg-orange-500',
  },
  {
    step: 'Orders Placed & Paid',
    count: 2911,
    pctOfTotal: '6.0%',
    dropoff: 'Success',
    description: 'Completed Razorpay / COD payment and reached /order-success',
    icon: CheckCircle2,
    color: 'bg-green-600',
  },
];

export default function FunnelAnalyticsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
              Conversion Funnel Analysis
            </h1>
            <AdminSectionInfo
              title="Storefront Conversion Funnel"
              purpose="Track the complete buyer journey from first landing on the website to viewing handcrafted garments, adding to cart, and completing checkout."
              storefrontImpact="Monitors drop-off friction across Homepage (/), Shop (/shop), Product Pages (/product/[slug]), Cart Drawer, and Checkout (/checkout)."
              targets={[
                { name: 'Storefront Homepage', path: '/', description: 'Top-of-funnel traffic entry' },
                { name: 'Shop Catalog', path: '/shop', description: 'Catalog browsing step' },
                { name: 'Cart & Checkout', path: '/checkout', description: 'Conversion completion step' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Overall store conversion rate: <strong className="text-green-600 font-bold">6.0%</strong> (Industry benchmark: 2.8%)
          </p>
        </div>
      </div>

      {/* Visual Funnel Stack */}
      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] mb-4">
          Buyer Journey Stages (Last 30 Days)
        </h2>

        <div className="space-y-3">
          {FUNNEL_STEPS.map((s, idx) => {
            const Icon = s.icon;
            const widthPercentage = Math.max(15, parseInt(s.pctOfTotal));

            return (
              <div key={s.step} className="p-4 rounded-xl bg-[var(--color-snow,#F9F9F9)] border border-[var(--color-whisper,#E5E5E5)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg ${s.color} text-white flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink,#111111)]">
                        {idx + 1}. {s.step}
                      </p>
                      <p className="text-xs text-[var(--color-slate,#666666)]">{s.description}</p>
                    </div>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    <span className="text-base font-bold text-[var(--color-ink,#111111)]">
                      {s.count.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-semibold text-[var(--color-gold,#C9A84C)]">
                      {s.pctOfTotal} of traffic
                    </span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all duration-500`}
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

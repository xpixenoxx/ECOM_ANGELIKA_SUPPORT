'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Ticket, TrendingUp, DollarSign } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import Link from 'next/link';

const CAMPAIGNS = [
  { code: 'FESTIVE15', name: 'Diwali Festive Sale', discount: '15% Off', redemptions: 342, gmv: '₹14.2L', discountAwarded: '₹2.13L', roi: '6.7x' },
  { code: 'VIDHYA10', name: "Vidhya's Welcome Gift", discount: '10% Off', redemptions: 890, gmv: '₹31.5L', discountAwarded: '₹3.15L', roi: '10.0x' },
  { code: 'FREESHIP', name: 'Free Pan-India Express Shipping', discount: '₹150 Off', redemptions: 1240, gmv: '₹42.8L', discountAwarded: '₹1.86L', roi: '23.0x' },
  { code: 'BRIDAL20', name: 'Bridal Atelier Trousseau', discount: '20% Off', redemptions: 68, gmv: '₹18.4L', discountAwarded: '₹3.68L', roi: '5.0x' },
];

export default function CampaignsAnalyticsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
              Campaign &amp; Coupon ROI
            </h1>
            <AdminSectionInfo
              title="Promotional Campaigns Performance"
              purpose="Analyze redemption volume, gross revenue generated, and ROI for promo codes and seasonal festive campaigns created in the Coupons manager."
              storefrontImpact="Tracks checkout coupon field usage on the /checkout page and coupon banners on the /sale page."
              targets={[
                { name: 'Coupons Manager', path: '/admin/products/coupons', description: 'Create and toggle active promo codes' },
                { name: 'Storefront Checkout', path: '/checkout', description: 'Where customers redeem coupons' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Coupon campaign attribution and incremental revenue
          </p>
        </div>

        <Link
          href="/admin/products/coupons"
          className="px-4 py-2 rounded-xl bg-[var(--color-gold,#C9A84C)] text-white text-xs font-medium hover:opacity-90 shadow-sm self-start sm:self-auto"
        >
          Manage Active Coupons &rarr;
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm overflow-x-auto">
        <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] mb-4">
          Campaign Performance Breakdown
        </h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-whisper,#E5E5E5)] text-left text-xs text-[var(--color-slate,#666666)] uppercase tracking-wider">
              <th className="pb-3 font-semibold">Coupon Code</th>
              <th className="pb-3 font-semibold">Campaign Name</th>
              <th className="pb-3 font-semibold">Benefit</th>
              <th className="pb-3 font-semibold text-right">Redemptions</th>
              <th className="pb-3 font-semibold text-right">Total GMV</th>
              <th className="pb-3 font-semibold text-right">Discounts Awarded</th>
              <th className="pb-3 font-semibold text-right">Attributed ROI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-whisper,#E5E5E5)]">
            {CAMPAIGNS.map((c) => (
              <tr key={c.code} className="hover:bg-[var(--color-snow,#F9F9F9)] transition-colors">
                <td className="py-3.5 font-mono font-bold text-xs text-[var(--color-ink,#111111)]">
                  <span className="px-2.5 py-1 rounded-md bg-[var(--color-snow,#F9F9F9)] border border-[var(--color-whisper,#E5E5E5)]">
                    {c.code}
                  </span>
                </td>
                <td className="py-3.5 font-medium text-xs text-[var(--color-ink,#111111)]">
                  {c.name}
                </td>
                <td className="py-3.5 text-xs text-[var(--color-slate,#666666)]">
                  {c.discount}
                </td>
                <td className="py-3.5 text-right font-semibold text-[var(--color-ink,#111111)]">
                  {c.redemptions}
                </td>
                <td className="py-3.5 text-right font-bold text-green-700">
                  {c.gmv}
                </td>
                <td className="py-3.5 text-right text-xs text-amber-700">
                  {c.discountAwarded}
                </td>
                <td className="py-3.5 text-right font-bold text-[var(--color-gold,#C9A84C)]">
                  {c.roi}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Ticket, RefreshCw } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';
import Link from 'next/link';
import { getCampaignAnalytics, type RealCampaignAnalyticsRow } from '@/lib/actions/admin-analytics';

export default function CampaignsAnalyticsPage() {
  const [campaigns, setCampaigns] = useState<RealCampaignAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await getCampaignAnalytics();
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to load campaign metrics.');
      } else {
        setCampaigns(res.campaigns);
      }
    } catch {
      setErrorMsg('Unable to load campaign metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
            Live coupon campaign attribution and incremental revenue from Supabase orders
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-[var(--color-whisper,#E5E5E5)] bg-white text-xs font-medium text-[var(--color-ink,#111111)] hover:border-[var(--color-gold)] inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/admin/products/coupons"
            className="px-4 py-2 rounded-xl bg-[var(--color-gold,#C9A84C)] text-white text-xs font-medium hover:opacity-90 shadow-sm"
          >
            Manage Active Coupons &rarr;
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm overflow-x-auto">
        <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] mb-4">
          Campaign Performance Breakdown
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-[var(--color-slate,#666666)]">
            Calculating coupon attribution from live orders...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Ticket className="w-8 h-8 mx-auto text-[var(--color-mist)]" />
            <p className="text-sm font-medium text-[var(--color-ink)]">No coupon campaigns found yet</p>
            <p className="text-xs text-[var(--color-slate)] max-w-md mx-auto">
              Create your first coupon code in the Coupons Manager to track live checkout redemptions and attributed GMV.
            </p>
            <Link
              href="/admin/products/coupons"
              className="inline-block px-4 py-2 rounded-xl bg-[var(--color-ink)] text-white text-xs font-medium"
            >
              Create Coupon Campaign →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-whisper,#E5E5E5)] text-left text-xs text-[var(--color-slate,#666666)] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Coupon Code</th>
                <th className="pb-3 font-semibold">Campaign Name</th>
                <th className="pb-3 font-semibold">Benefit</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Redemptions</th>
                <th className="pb-3 font-semibold text-right">Total GMV</th>
                <th className="pb-3 font-semibold text-right">Discounts Awarded</th>
                <th className="pb-3 font-semibold text-right">Attributed ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-whisper,#E5E5E5)]">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--color-snow,#F9F9F9)] transition-colors">
                  <td className="py-3.5 font-mono font-bold text-xs text-[var(--color-ink,#111111)]">
                    <span className="px-2.5 py-1 rounded-md bg-[var(--color-snow,#F9F9F9)] border border-[var(--color-whisper,#E5E5E5)]">
                      {c.code}
                    </span>
                  </td>
                  <td className="py-3.5 font-medium text-xs text-[var(--color-ink,#111111)]">
                    {c.name}
                  </td>
                  <td className="py-3.5 text-xs text-[var(--color-slate,#666666)]">
                    {c.discountLabel}
                  </td>
                  <td className="py-3.5 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                      {c.isActive ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-semibold text-[var(--color-ink,#111111)]">
                    {c.redemptions}
                  </td>
                  <td className="py-3.5 text-right font-bold text-green-700">
                    ₹{Math.round(c.gmvInr).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 text-right text-xs text-amber-700">
                    ₹{Math.round(c.discountAwardedInr).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 text-right font-bold text-[var(--color-gold,#C9A84C)]">
                    {c.roiLabel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}

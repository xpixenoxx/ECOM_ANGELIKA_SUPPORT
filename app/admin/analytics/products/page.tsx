'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Package, Eye, ShoppingBag } from 'lucide-react';
import { AdminSectionInfo } from '@/components/admin/AdminSectionInfo';

const TOP_PRODUCTS = [
  { name: 'Pristine White Shadow Work Lucknowi Kurti', category: 'Kurtis', sold: 142, revenue: '₹5,67,858', conversion: '3.4%', stock: 74 },
  { name: 'Royal Indigo Pure Raw Silk Straight Suit', category: 'Salwars', sold: 98, revenue: '₹8,81,902', conversion: '4.1%', stock: 38 },
  { name: 'Handwoven Gold Zari Chanderi Saree', category: 'Sarees', sold: 76, revenue: '₹9,87,924', conversion: '2.8%', stock: 12 },
  { name: 'Kutch Ajrakh Modal Silk Kurti', category: 'Kurtis', sold: 110, revenue: '₹5,49,890', conversion: '3.9%', stock: 63 },
  { name: 'Ivory & Gold Chanderi Angrakha Suit', category: 'Salwars', sold: 85, revenue: '₹6,37,415', conversion: '3.2%', stock: 45 },
];

export default function ProductPerformanceAnalyticsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[var(--color-ink,#111111)]" style={{ fontFamily: 'var(--font-display)' }}>
              Product Sales Velocity &amp; Analytics
            </h1>
            <AdminSectionInfo
              title="Product Merchandising Analytics"
              purpose="Evaluate top performing luxury ethnic wear items, view-to-cart conversion rates, and revenue velocity to optimize stock replenishment and hero spotlights."
              storefrontImpact="Drives automatic merchandising in 'Trending Now', 'New Arrivals' (/new-arrivals), and 'Vidhya's Picks' (/vidhyas-picks) on the storefront."
              targets={[
                { name: 'All Products Catalog', path: '/shop', description: 'Storefront merchandise sorting' },
                { name: "Vidhya's Picks", path: '/vidhyas-picks', description: 'Hero editorial picks' },
              ]}
            />
          </div>
          <p className="text-sm text-[var(--color-slate,#666666)] mt-1">
            Top revenue generating garments and conversion velocity
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--color-whisper,#E5E5E5)] p-6 shadow-sm overflow-x-auto">
        <h2 className="text-base font-semibold text-[var(--color-ink,#111111)] mb-4">
          Top Performing Garments by Gross Merchandise Value (GMV)
        </h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-whisper,#E5E5E5)] text-left text-xs text-[var(--color-slate,#666666)] uppercase tracking-wider">
              <th className="pb-3 font-semibold">Product Name</th>
              <th className="pb-3 font-semibold">Category</th>
              <th className="pb-3 font-semibold text-right">Units Sold</th>
              <th className="pb-3 font-semibold text-right">Total Revenue</th>
              <th className="pb-3 font-semibold text-right">Conversion</th>
              <th className="pb-3 font-semibold text-right">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-whisper,#E5E5E5)]">
            {TOP_PRODUCTS.map((prod) => (
              <tr key={prod.name} className="hover:bg-[var(--color-snow,#F9F9F9)] transition-colors">
                <td className="py-3.5 font-medium text-[var(--color-ink,#111111)] max-w-xs truncate">
                  {prod.name}
                </td>
                <td className="py-3.5 text-xs text-[var(--color-slate,#666666)]">
                  {prod.category}
                </td>
                <td className="py-3.5 text-right font-semibold text-[var(--color-ink,#111111)]">
                  {prod.sold}
                </td>
                <td className="py-3.5 text-right font-bold text-green-700">
                  {prod.revenue}
                </td>
                <td className="py-3.5 text-right font-medium text-xs text-[var(--color-gold,#C9A84C)]">
                  {prod.conversion}
                </td>
                <td className="py-3.5 text-right text-xs text-[var(--color-slate,#666666)]">
                  {prod.stock} left
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

export default function LoyaltyPage() {
  const { user, profile } = useAuth();
  const loyaltyPoints = profile?.loyalty_points || 0;

  // Compute tier
  let tier = 'Silver';
  let nextTier = 'Gold';
  let pointsNeeded = 5000 - loyaltyPoints;
  let progress = Math.min(100, Math.round((loyaltyPoints / 5000) * 100));

  if (loyaltyPoints >= 15000) {
    tier = 'Platinum';
    nextTier = 'Top Tier';
    pointsNeeded = 0;
    progress = 100;
  } else if (loyaltyPoints >= 5000) {
    tier = 'Gold';
    nextTier = 'Platinum';
    pointsNeeded = 15000 - loyaltyPoints;
    progress = Math.min(100, Math.round(((loyaltyPoints - 5000) / 10000) * 100));
  }

  const perks = [
    {
      tier: 'Silver',
      range: '0 – 4,999 Points',
      features: [
        'Earn 1 point per ₹100 spent',
        'Special birthday coupon (15% off)',
        'Early access to seasonal sales',
        'Standard customer support',
      ],
      current: tier === 'Silver',
    },
    {
      tier: 'Gold',
      range: '5,000 – 14,999 Points',
      features: [
        'Earn 1.5 points per ₹100 spent',
        'Complimentary standard shipping on all orders',
        'Complimentary blouse / kurti alterations',
        'Festive surprise gifts & sample previews',
      ],
      current: tier === 'Gold',
    },
    {
      tier: 'Platinum',
      range: '15,000+ Points',
      features: [
        'Earn 2 points per ₹100 spent',
        'Complimentary express shipping',
        'Dedicated Vidhya’s personal stylist consultation',
        'Exclusive VIP private previews & couture concierge',
      ],
      current: tier === 'Platinum',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-snow)]/60 py-10 md:py-14">
      <div className="container-custom max-w-5xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to Account Overview</span>
          </Link>
          <span className="text-xs uppercase tracking-wider text-[var(--color-slate)] font-semibold">
            Loyalty &amp; Rewards
          </span>
        </div>

        {/* Hero Card */}
        <div className="mb-10 rounded-3xl bg-gradient-to-br from-[var(--color-ink)] via-[var(--color-charcoal)] to-[var(--color-ink)] text-white p-8 sm:p-10 shadow-xl border border-[var(--color-gold)]/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--color-gold)]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/30 mb-4">
              <span>✦</span>
              <span>Angelika Circle</span>
            </div>
            <h1 className="text-[var(--font-display)] text-3xl sm:text-5xl font-light tracking-wide text-[var(--color-gold)] mb-3">
              {tier} Member
            </h1>
            <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed mb-8">
              Welcome to Angelika Circle. Experience handcrafted rewards, bespoke alterations, and private couture access tailored to your ethnic journey.
            </p>

            {/* Points Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10">
              <div>
                <span className="text-xs uppercase tracking-wider text-stone-400 block mb-1">Available Points</span>
                <span className="text-2xl sm:text-3xl font-semibold text-white font-mono">
                  {loyaltyPoints.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-stone-400 block mb-1">Next Tier</span>
                <span className="text-2xl sm:text-3xl font-semibold text-[var(--color-gold)]">
                  {nextTier}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-xs uppercase tracking-wider text-stone-400 block mb-1">Points Needed</span>
                <span className="text-2xl sm:text-3xl font-semibold text-white font-mono">
                  {pointsNeeded > 0 ? pointsNeeded.toLocaleString() : 'Unlocked'}
                </span>
              </div>
            </div>

            {/* Tier Progress Bar */}
            {pointsNeeded > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-xs text-stone-400 mb-2">
                  <span>Progress to {nextTier}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-champagne)] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tier Benefits Comparison */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-[var(--font-display)] text-2xl sm:text-3xl font-medium text-[var(--color-ink)]">
              Membership Tiers &amp; Privileges
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-slate)] mt-1">
              Elevate your tier with every purchase to unlock exclusive couture privileges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {perks.map((p) => (
              <Card
                key={p.tier}
                variant="elevated"
                padding="lg"
                className={cn(
                  'rounded-3xl border transition-all duration-200 relative bg-white flex flex-col justify-between',
                  p.current
                    ? 'border-[var(--color-gold)] ring-2 ring-[var(--color-gold)]/20 shadow-md'
                    : 'border-[var(--color-whisper)] shadow-xs'
                )}
              >
                <div>
                  {p.current && (
                    <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--color-gold)] text-[var(--color-ink)] shadow-xs">
                      Your Current Tier
                    </div>
                  )}
                  <h3 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)] mt-2">
                    {p.tier}
                  </h3>
                  <p className="text-xs text-[var(--color-gold-dark,var(--color-gold))] font-medium mb-4">
                    {p.range}
                  </p>

                  <ul className="space-y-3 text-xs sm:text-sm text-[var(--color-slate)] border-t border-[var(--color-whisper)] pt-4">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-[var(--color-gold)] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-[var(--color-whisper)]">
                  <Link
                    href="/shop"
                    className={cn(
                      'w-full py-2.5 rounded-full text-xs font-semibold text-center block transition-all',
                      p.current
                        ? 'bg-[var(--color-ink)] text-[var(--color-gold)] hover:bg-[var(--color-charcoal)]'
                        : 'border border-[var(--color-whisper)] text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-snow)]'
                    )}
                  >
                    Shop to Earn Points
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* How to Earn Points */}
        <div className="bg-white rounded-3xl border border-[var(--color-whisper)] p-8 shadow-xs">
          <h3 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)] mb-6 text-center">
            Ways to Earn Points
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-[var(--color-snow)]/60 border border-[var(--color-whisper)]">
              <div className="w-12 h-12 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center mx-auto mb-3 text-[var(--color-gold)] font-bold text-lg">
                🛍️
              </div>
              <h4 className="font-semibold text-sm text-[var(--color-ink)] mb-1">Shop Handcrafted Collections</h4>
              <p className="text-xs text-[var(--color-slate)]">Earn points automatically on every verified order.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--color-snow)]/60 border border-[var(--color-whisper)]">
              <div className="w-12 h-12 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center mx-auto mb-3 text-[var(--color-gold)] font-bold text-lg">
                ⭐
              </div>
              <h4 className="font-semibold text-sm text-[var(--color-ink)] mb-1">Write Verified Reviews</h4>
              <p className="text-xs text-[var(--color-slate)]">Get 100 bonus points for sharing your authentic feedback.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--color-snow)]/60 border border-[var(--color-whisper)]">
              <div className="w-12 h-12 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center mx-auto mb-3 text-[var(--color-gold)] font-bold text-lg">
                ✨
              </div>
              <h4 className="font-semibold text-sm text-[var(--color-ink)] mb-1">Celebrate Your Birthday</h4>
              <p className="text-xs text-[var(--color-slate)]">Receive an annual festive reward voucher directly in your inbox.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

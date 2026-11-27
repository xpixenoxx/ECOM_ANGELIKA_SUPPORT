'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  redeemCustomerLoyaltyRewardAction,
  type CustomerLoyaltySummary,
  type RedeemedVoucher,
} from '@/lib/actions/customer-account';
import {
  DEFAULT_REDEMPTION_RULES,
  LOYALTY_TIERS,
  type LoyaltyTransaction,
} from '@/lib/actions/loyalty-types';
import {
  Sparkles,
  Award,
  Gift,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  Clock,
  ShoppingBag,
  Ticket,
  Crown,
} from 'lucide-react';

export interface LoyaltyPortalViewProps {
  initialLoyalty: CustomerLoyaltySummary;
  memberName: string;
  embedded?: boolean;
}

function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function LoyaltyPortalView({
  initialLoyalty,
  memberName,
  embedded = false,
}: LoyaltyPortalViewProps) {
  const { refreshProfile } = useAuth();
  const [loyalty, setLoyalty] = useState<CustomerLoyaltySummary>(initialLoyalty);
  const [redeemingRuleId, setRedeemingRuleId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [freshVoucher, setFreshVoucher] = useState<RedeemedVoucher | null>(null);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Voucher ${code} copied — paste it at checkout!`);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      toast.error('Please copy the voucher code manually.');
    }
  };

  const handleRedeem = async (ruleId: string) => {
    setRedeemingRuleId(ruleId);
    try {
      const res = await redeemCustomerLoyaltyRewardAction(ruleId);
      if (!res.success || !res.couponCode) {
        toast.error(res.error || 'Could not redeem reward.');
        return;
      }

      const newVoucher: RedeemedVoucher = {
        code: res.couponCode,
        name: res.discountLabel || 'Angelika Circle Reward',
        discountLabel: res.discountLabel || 'Reward Voucher',
        minOrderAmount: res.minOrderAmount || 0,
        isUsed: false,
        validUntil: res.validUntil || null,
        createdAt: new Date().toISOString(),
      };

      const nextPoints = res.newPoints ?? loyalty.currentPoints;
      let currentTierObj = LOYALTY_TIERS[0]!;
      for (const t of LOYALTY_TIERS) {
        if (nextPoints >= t.minPoints) currentTierObj = t;
      }
      const idx = LOYALTY_TIERS.findIndex((t) => t.name === currentTierObj.name);
      const nextTierObj = idx >= 0 && idx < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[idx + 1]! : null;
      const tierProgress = nextTierObj
        ? Math.min(100, Math.max(0, Math.round(((nextPoints - currentTierObj.minPoints) / Math.max(1, nextTierObj.minPoints - currentTierObj.minPoints)) * 100)))
        : 100;

      setLoyalty((prev) => ({
        ...prev,
        currentPoints: nextPoints,
        tierName: currentTierObj.name,
        tierLabel: currentTierObj.label,
        nextTierName: nextTierObj?.name ?? null,
        nextTierLabel: nextTierObj?.label ?? null,
        nextTierMinPoints: nextTierObj?.minPoints ?? null,
        pointsToNextTier: nextTierObj ? Math.max(0, nextTierObj.minPoints - nextPoints) : 0,
        tierProgress,
        lifetimePointsRedeemed:
          prev.lifetimePointsRedeemed + Math.abs(res.transaction?.points || 0),
        transactions: res.transaction
          ? [res.transaction, ...prev.transactions]
          : prev.transactions,
        vouchers: [newVoucher, ...prev.vouchers],
      }));

      setFreshVoucher(newVoucher);
      toast.success(`Unlocked ${res.couponCode}! Ready to use at checkout.`);
      refreshProfile().catch(() => {});
    } catch {
      toast.error('Unexpected error while redeeming points.');
    } finally {
      setRedeemingRuleId(null);
    }
  };

  return (
    <div className="space-y-7">
      {/* Obsidian Luxury Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#161310] text-[#FAF6F0] border border-[#C9A84C]/35 p-6 sm:p-9 shadow-[0_20px_50px_rgba(22,19,16,0.22)]">
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#241F19] border border-[#C9A84C]/45 text-[#E6C77A] text-[11px] font-semibold uppercase tracking-[0.16em]">
              <Crown className="w-3.5 h-3.5" />
              <span>Angelika Circle · {loyalty.tierLabel} Tier</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-[#FAF6F0]">
              {memberName}&apos;s Atelier Privileges
            </h2>
            <p className="text-sm text-[#CEC6BA] leading-relaxed">
              Earn points on every handcrafted piece and convert them directly into personal single-use checkout vouchers valid across the entire boutique.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-3 shrink-0">
            <div className="rounded-2xl bg-[#211C16] border border-[#C9A84C]/30 px-6 py-4 min-w-[210px]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#B8AE9F] font-semibold">
                Available Balance
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-4xl sm:text-5xl font-semibold text-[#E6C77A]">
                  {loyalty.currentPoints.toLocaleString('en-IN')}
                </span>
                <span className="text-xs uppercase tracking-[0.14em] text-[#C9C1B4]">Points</span>
              </div>
              <p className="text-[11px] text-[#A89E90] mt-1">
                Lifetime earned: {loyalty.lifetimePointsEarned.toLocaleString('en-IN')} pts
              </p>
            </div>

            {embedded && (
              <Link
                href="/account/loyalty"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#E6C77A] hover:text-[#FAF6F0] transition-colors"
              >
                Open Full Loyalty Lounge <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="relative mt-7 pt-5 border-t border-[#FAF6F0]/12">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
            <span className="text-[#CEC6BA]">
              Current Status: <strong className="text-[#FAF6F0]">{loyalty.tierLabel}</strong>
            </span>
            {loyalty.nextTierLabel ? (
              <span className="text-[#E6C77A] font-medium">
                {loyalty.pointsToNextTier.toLocaleString('en-IN')} pts to unlock {loyalty.nextTierLabel}
              </span>
            ) : (
              <span className="text-[#E6C77A] font-medium">✦ Highest Atelier Prestige Unlocked</span>
            )}
          </div>
          <div className="h-2.5 w-full rounded-full bg-[#2B251E] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(4, loyalty.tierProgress)}%`,
                background: 'linear-gradient(90deg, #A4832E 0%, #E6C77A 100%)',
              }}
            />
          </div>
          <div className="mt-2.5 grid grid-cols-4 gap-2 text-[10px] sm:text-[11px] text-[#A89E90]">
            {LOYALTY_TIERS.map((tier) => {
              const reached = loyalty.currentPoints >= tier.minPoints;
              return (
                <div
                  key={tier.name}
                  className={reached ? 'text-[#E6C77A] font-semibold' : 'text-[#8C8275]'}
                >
                  {tier.label} ({tier.minPoints.toLocaleString('en-IN')}+)
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Newly Redeemed Voucher Banner */}
      {freshVoucher && (
        <div className="rounded-2xl bg-[#ECFDF3] border-2 border-[#067647]/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#067647] text-[#FFFFFF] flex items-center justify-center shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#065F46]">
                Voucher Created: {freshVoucher.discountLabel}
              </p>
              <p className="text-xs text-[#047857] mt-0.5">
                Use code <strong className="font-mono">{freshVoucher.code}</strong> at checkout
                {freshVoucher.minOrderAmount > 0
                  ? ` on orders ₹${freshVoucher.minOrderAmount.toLocaleString('en-IN')}+`
                  : ''}
                . Valid until {formatShortDate(freshVoucher.validUntil)}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleCopyCode(freshVoucher.code)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#067647] text-[#FFFFFF] hover:bg-[#055C38] cursor-pointer"
            >
              {copiedCode === freshVoucher.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode === freshVoucher.code ? 'Copied' : freshVoucher.code}
            </button>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFFFFF] text-[#065F46] border border-[#067647]/30 hover:bg-[#F0FDF4]"
            >
              Shop Now
            </Link>
          </div>
        </div>
      )}

      {/* Redeem Rewards Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#74590E] font-semibold">
              Instant Checkout Vouchers
            </p>
            <h3 className="font-display text-2xl font-semibold text-[#1A1A1A] mt-0.5">
              Redeem Your Points
            </h3>
          </div>
          <p className="text-xs text-[#5A544B]">
            Each redemption generates a personal single-use code valid for 90 days.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEFAULT_REDEMPTION_RULES.filter((r) => r.isActive).map((rule) => {
            const canAfford = loyalty.currentPoints >= rule.pointsRequired;
            const shortfall = Math.max(0, rule.pointsRequired - loyalty.currentPoints);
            const isBusy = redeemingRuleId === rule.id;

            return (
              <div
                key={rule.id}
                className={`rounded-2xl bg-[#FFFFFF] p-5 flex flex-col justify-between border transition-all ${
                  canAfford
                    ? 'border-[#C9A84C]/65 shadow-[0_10px_28px_rgba(22,19,16,0.06)] hover:border-[#A4832E]'
                    : 'border-[#E5DDD2]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-9 h-9 rounded-xl bg-[#FAF4E8] border border-[#E6D5B0] flex items-center justify-center">
                      <Gift className="w-4 h-4 text-[#947218]" />
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F6EDD9] text-[#6B500E]">
                      {rule.pointsRequired.toLocaleString('en-IN')} pts
                    </span>
                  </div>
                  <h4 className="font-display text-xl font-semibold text-[#1A1A1A] mt-4">
                    {rule.name}
                  </h4>
                  <p className="text-xs text-[#5A544B] mt-1 leading-relaxed">{rule.description}</p>
                  {rule.minOrderAmount && rule.minOrderAmount > 0 ? (
                    <p className="text-[11px] text-[#7A7065] mt-2">
                      Min. bag value: ₹{rule.minOrderAmount.toLocaleString('en-IN')}
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#7A7065] mt-2">No minimum bag value</p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-[#F1EAE0]">
                  <button
                    type="button"
                    disabled={!canAfford || redeemingRuleId !== null}
                    onClick={() => handleRedeem(rule.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-[0.12em] transition-colors flex items-center justify-center gap-2 ${
                      canAfford
                        ? 'bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520] cursor-pointer'
                        : 'bg-[#F3EEE8] text-[#7A7065] cursor-not-allowed'
                    }`}
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A84C]" />
                        Issuing Voucher...
                      </>
                    ) : canAfford ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#E6C77A]" />
                        Redeem Voucher
                      </>
                    ) : (
                      <span>Need {shortfall.toLocaleString('en-IN')} more pts</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Member's Redeemed Vouchers */}
      {loyalty.vouchers.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-display text-2xl font-semibold text-[#1A1A1A]">Your Redeemed Vouchers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loyalty.vouchers.map((v) => (
              <div
                key={v.code}
                className={`rounded-2xl bg-[#FFFFFF] border p-4 flex items-center justify-between gap-4 ${
                  v.isUsed ? 'border-[#E5DDD2] opacity-70' : 'border-[#C9A84C]/60'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-[#1A1A1A] tracking-wider">
                      {v.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        v.isUsed
                          ? 'bg-[#F3EEE8] text-[#6B6258]'
                          : 'bg-[#ECFDF3] text-[#067647]'
                      }`}
                    >
                      {v.isUsed ? 'Used / Expired' : 'Ready to Apply'}
                    </span>
                  </div>
                  <p className="text-xs text-[#4E4840] mt-1">
                    {v.discountLabel}
                    {v.minOrderAmount > 0 ? ` · Min. ₹${v.minOrderAmount.toLocaleString('en-IN')}` : ''}
                    {v.validUntil ? ` · Valid till ${formatShortDate(v.validUntil)}` : ''}
                  </p>
                </div>
                {!v.isUsed && (
                  <button
                    type="button"
                    onClick={() => handleCopyCode(v.code)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FAF8F4] text-[#1A1A1A] border border-[#DFD5C8] hover:border-[#C9A84C] cursor-pointer"
                  >
                    {copiedCode === v.code ? <Check className="w-3.5 h-3.5 text-[#067647]" /> : <Copy className="w-3.5 h-3.5 text-[#74590E]" />}
                    {copiedCode === v.code ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Membership Tiers Overview */}
      <section className="space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#74590E] font-semibold">
            Circle Architecture
          </p>
          <h3 className="font-display text-2xl font-semibold text-[#1A1A1A] mt-0.5">
            Tier Privileges
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LOYALTY_TIERS.map((tier) => {
            const isCurrent = loyalty.tierName === tier.name;
            return (
              <div
                key={tier.name}
                className={`rounded-2xl bg-[#FFFFFF] p-5 border transition-all ${
                  isCurrent
                    ? 'border-2 border-[#C9A84C] shadow-[0_10px_28px_rgba(201,168,76,0.14)]'
                    : 'border-[#E5DDD2]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1A1A1A]">
                    <Award className="w-4 h-4 text-[#A4832E]" />
                    {tier.label}
                  </span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] bg-[#161310] text-[#E6C77A]">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-[#74590E] mb-3">
                  {tier.maxPoints
                    ? `${tier.minPoints.toLocaleString('en-IN')} – ${tier.maxPoints.toLocaleString('en-IN')} pts`
                    : `${tier.minPoints.toLocaleString('en-IN')}+ pts`}
                </p>
                <ul className="space-y-2 text-xs text-[#4E4840]">
                  {tier.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#A4832E] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Points Activity History — Semantic Responsive Table */}
      <section className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-[#FAF8F4] border-b border-[#EAE2D6] flex items-center justify-between gap-3">
          <div>
            <h3 id="loyalty-ledger-heading" className="font-display text-xl font-semibold text-[#1A1A1A]">
              Points Activity Ledger
            </h3>
            <p className="text-xs text-[#6B6258] mt-0.5">
              Complete history of earned points and redeemed checkout vouchers.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFFFFF] border border-[#E5DDD2] text-[#4E4840]">
            {loyalty.transactions.length} entries
          </span>
        </div>

        {loyalty.transactions.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF4E8] border border-[#E6D5B0] flex items-center justify-center mx-auto mb-3">
              <Clock className="w-5 h-5 text-[#947218]" />
            </div>
            <p className="font-medium text-[#1A1A1A]">No points activity recorded yet</p>
            <p className="text-xs text-[#5A544B] mt-1 max-w-sm mx-auto">
              Every completed purchase and verified ensemble review automatically credits points to your Angelika Circle balance.
            </p>
            <Link
              href="/shop"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#161310] text-[#FAF6F0] hover:bg-[#2A2520] transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#C9A84C]" />
              Explore Collections
            </Link>
          </div>
        ) : (
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="loyalty-ledger-heading"
            className="overflow-x-auto max-h-[420px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
          >
            <table className="w-full text-left border-collapse text-sm">
              <caption className="sr-only">Angelika Circle points earning and redemption history</caption>
              <thead className="sticky top-0 z-10 bg-[#FAF8F4] border-b border-[#EAE2D6] text-[11px] uppercase tracking-[0.12em] text-[#6B6258]">
                <tr>
                  <th scope="col" className="py-3 px-6 font-semibold">Date</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Activity</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Type</th>
                  <th scope="col" className="py-3 px-6 font-semibold text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EAE0]">
                {loyalty.transactions.map((tx: LoyaltyTransaction) => {
                  const isPositive = tx.points > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-[#FAF8F4]/70 transition-colors">
                      <th scope="row" className="py-3.5 px-6 font-normal text-xs text-[#5A544B] whitespace-nowrap">
                        {formatShortDate(tx.created_at)}
                      </th>
                      <td className="py-3.5 px-4 text-[#1A1A1A] font-medium">
                        {tx.description || tx.type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isPositive
                              ? 'bg-[#ECFDF3] text-[#067647]'
                              : 'bg-[#FEF3C7] text-[#92400E]'
                          }`}
                        >
                          {tx.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-6 text-right font-semibold whitespace-nowrap ${
                          isPositive ? 'text-[#067647]' : 'text-[#991B1B]'
                        }`}
                      >
                        {isPositive ? `+${tx.points.toLocaleString('en-IN')}` : tx.points.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

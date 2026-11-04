import { getLoyaltyStats, getLoyaltyTransactions, getLoyaltyTiers, getEarningRules, getRedemptionRules } from '@/lib/actions/loyalty';
import LoyaltyClient from './LoyaltyClient';

export const dynamic = 'force-dynamic';

export default async function LoyaltyPage() {
  const [stats, transactions, tiers, earningRules, redemptionRules] = await Promise.all([
    getLoyaltyStats(),
    getLoyaltyTransactions(1, 10),
    getLoyaltyTiers(),
    getEarningRules(),
    getRedemptionRules(),
  ]);

  return <LoyaltyClient
    initialStats={stats}
    initialTransactions={transactions.success ? transactions.transactions || [] : []}
    initialTotal={transactions.total || 0}
    tiers={tiers}
    earningRules={earningRules}
    redemptionRules={redemptionRules}
  />;
}
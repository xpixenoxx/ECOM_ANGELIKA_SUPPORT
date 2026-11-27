import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getCustomerAccountOverview } from '@/lib/actions/customer-account';
import { LoyaltyPortalView } from '@/components/account/LoyaltyPortalView';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Angelika Circle Loyalty | Angelika Fashions',
  description: 'Track your Angelika Circle points, membership tier privileges, and redeem checkout vouchers.',
};

export default async function LoyaltyPage() {
  const overview = await getCustomerAccountOverview();

  if (!overview.isAuthenticated || !overview.profile) {
    redirect('/login?redirect=/account/loyalty');
  }

  const memberName = overview.profile.full_name?.trim() || overview.profile.email.split('@')[0] || 'Member';

  return (
    <div className="min-h-screen bg-[#EFEAE2] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5A544B] hover:text-[#1A1A1A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#A4832E]" />
            Back to Account Overview
          </Link>
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#7A7065] font-semibold">
            Angelika Circle Rewards
          </span>
        </div>

        <LoyaltyPortalView
          initialLoyalty={overview.loyalty}
          memberName={memberName}
        />
      </div>
    </div>
  );
}

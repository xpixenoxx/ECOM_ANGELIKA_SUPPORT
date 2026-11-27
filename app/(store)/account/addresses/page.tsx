import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { getCustomerAccountOverview } from '@/lib/actions/customer-account';
import { AddressBookManager } from '@/components/account/AddressBookManager';
import { normalizeAddress } from '@/lib/utils/address';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Saved Addresses | Angelika Fashions',
  description: 'Manage your saved delivery addresses for faster checkout at Angelika Fashions.',
};

export default async function SavedAddressesPage() {
  const overview = await getCustomerAccountOverview();

  if (!overview.isAuthenticated || !overview.profile) {
    redirect('/login?redirect=/account/addresses');
  }

  const latestOrderWithAddr = overview.orders.find((o) => {
    const addr = o.shipping_address;
    return Boolean(
      addr &&
        (addr['address1'] || addr['address_line1']) &&
        addr['city'] &&
        (addr['postalCode'] || addr['postal_code'] || addr['pincode'])
    );
  });

  const recentOrderAddress = latestOrderWithAddr
    ? {
        orderNumber: latestOrderWithAddr.order_number,
        address: normalizeAddress(latestOrderWithAddr.shipping_address),
      }
    : null;

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
            Angelika Customer Portal
          </span>
        </div>

        <AddressBookManager
          initialAddresses={overview.profile.addresses}
          defaultName={overview.profile.full_name}
          defaultPhone={overview.profile.phone}
          recentOrderAddress={recentOrderAddress}
        />

        <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A]">Ready to place your next order?</p>
            <p className="text-xs text-[#5A544B] mt-0.5">
              Your default delivery address pre-fills automatically at checkout.
            </p>
          </div>
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.14em] bg-[#FAF8F4] text-[#1A1A1A] border border-[#DFD5C8] hover:border-[#C9A84C] transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-[#A4832E]" />
            Go to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

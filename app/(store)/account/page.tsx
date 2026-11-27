import { redirect } from 'next/navigation';
import { getCustomerAccountOverview } from '@/lib/actions/customer-account';
import { AccountClient } from './AccountClient';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Account | Angelika Fashions',
  description: 'Manage your Angelika Fashions orders, wishlist, saved addresses, profile, and Angelika Circle loyalty rewards.',
};

export default async function AccountPage() {
  const overview = await getCustomerAccountOverview();

  if (!overview.isAuthenticated || !overview.profile) {
    redirect('/login?redirect=/account');
  }

  return <AccountClient initialData={overview} />;
}

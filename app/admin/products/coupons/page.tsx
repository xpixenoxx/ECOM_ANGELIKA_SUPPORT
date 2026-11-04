import { getCoupons } from '@/lib/actions/admin-dashboard';
import CouponsClient from './CouponsClient';

export const dynamic = 'force-dynamic';

export default async function CouponsPage() {
  const coupons = await getCoupons();
  return <CouponsClient initialCoupons={coupons} />;
}

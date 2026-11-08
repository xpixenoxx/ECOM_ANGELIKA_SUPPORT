import { getOrders } from '@/lib/actions/admin-orders';
import ShipmentsClient from './ShipmentsClient';

export const dynamic = 'force-dynamic';

export default async function ShipmentsPage() {
  const orders = await getOrders();
  return <ShipmentsClient initialOrders={orders} />;
}


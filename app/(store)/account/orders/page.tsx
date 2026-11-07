import { getCustomerOrders } from '@/lib/actions/customer-orders';
import OrdersClient from './OrdersClient';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const res = await getCustomerOrders();

  return (
    <OrdersClient
      initialOrders={res.orders || []}
      initialIsAuthenticated={res.isAuthenticated}
    />
  );
}

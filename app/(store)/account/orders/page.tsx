import { getCustomerOrders } from '@/lib/actions/customer-orders';
import OrdersClient from './OrdersClient';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Orders | Angelika Fashions',
  description: 'Track shipments, view order status, reorder favorites, and download GST invoices.',
};

export default async function OrdersPage() {
  const res = await getCustomerOrders();

  return (
    <OrdersClient
      initialOrders={res.orders || []}
      initialIsAuthenticated={res.isAuthenticated}
    />
  );
}

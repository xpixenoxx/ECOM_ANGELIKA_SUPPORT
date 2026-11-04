import { getOrderById } from '@/lib/actions/admin-orders';
import OrderDetailClient from './OrderDetailClient';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const { order, items } = await getOrderById(params.id);
  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-[var(--color-slate)] text-lg">Order not found</p>
          <a href="/admin/orders" className="text-[var(--color-gold)] hover:underline mt-2 inline-block">
            ← Back to Orders
          </a>
        </div>
      </div>
    );
  }
  return <OrderDetailClient order={order} items={items ?? []} />;
}

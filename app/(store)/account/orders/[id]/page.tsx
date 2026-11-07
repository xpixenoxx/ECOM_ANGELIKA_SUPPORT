import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCustomerOrderById } from '@/lib/actions/customer-orders';
import OrderDetailClient from './OrderDetailClient';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = 'then' in params ? await params : params;
  const orderId = resolvedParams.id;

  if (!orderId) {
    notFound();
  }

  const { order } = await getCustomerOrderById(orderId);

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--color-snow)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[var(--color-whisper)] text-center shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">Order Not Found</h2>
          <p className="text-sm text-[var(--color-slate)] mb-6">
            We couldn't locate order #{orderId}. It may have been moved or you may need to sign in with the account used to place the order.
          </p>
          <Link
            href="/account/orders"
            className="px-6 py-2.5 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] font-semibold text-sm hover:bg-[var(--color-gold-hover)] transition-all inline-block"
          >
            &larr; Return to Orders
          </Link>
        </div>
      </div>
    );
  }

  return <OrderDetailClient order={order} />;
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCustomerOrderById } from '@/lib/actions/customer-orders';
import OrderDetailClient from './OrderDetailClient';

export const runtime = 'edge';
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
      <div className="min-h-screen bg-[#EFEAE2] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#FFFFFF] rounded-3xl p-8 border border-[#E5DDD2] text-center shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#FEF2F2] text-[#B42318] flex items-center justify-center mb-4">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-semibold text-[#1A1A1A] mb-2">Order Not Found</h2>
          <p className="text-sm text-[#5A544B] mb-6">
            We couldn&apos;t locate order #{orderId}. It may have been moved or you may need to sign in with the account used to place the order.
          </p>
          <Link
            href="/account/orders"
            className="px-6 py-2.5 rounded-xl bg-[#161310] text-[#FAF6F0] font-semibold text-xs uppercase tracking-[0.14em] hover:bg-[#2A2520] transition-all inline-block"
          >
            &larr; Return to My Orders
          </Link>
        </div>
      </div>
    );
  }

  return <OrderDetailClient order={order} />;
}

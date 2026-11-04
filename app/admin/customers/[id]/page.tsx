import { getCustomerById } from '@/lib/actions/admin-customers';
import CustomerDetailClient from './CustomerDetailClient';

export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { customer, orders, error } = await getCustomerById(params.id);
  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-[var(--color-slate)] text-lg">Customer not found</p>
          <a href="/admin/customers" className="text-[var(--color-gold)] hover:underline mt-2 inline-block">
            ← Back to Customers
          </a>
        </div>
      </div>
    );
  }
  return <CustomerDetailClient customer={customer} orders={orders} />;
}

import { getCustomers } from '@/lib/actions/admin-customers';
import CustomersClient from './CustomersClient';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const { customers } = await getCustomers();
  return <CustomersClient initialCustomers={customers} />;
}

import { getCustomers } from '@/lib/actions/admin-customers';
import SegmentsClient from './SegmentsClient';

export const dynamic = 'force-dynamic';

export default async function CustomerSegmentsPage() {
  const { customers } = await getCustomers();
  return <SegmentsClient initialCustomers={customers || []} />;
}


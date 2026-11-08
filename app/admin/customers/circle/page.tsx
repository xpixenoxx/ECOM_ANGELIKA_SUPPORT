import { getCircleDashboardData } from '@/lib/actions/circle';
import CircleClient from './CircleClient';

export const dynamic = 'force-dynamic';

export default async function CircleAdminPage() {
  const initialData = await getCircleDashboardData();
  return <CircleClient initialData={initialData} />;
}


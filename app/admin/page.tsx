import { getDashboardData } from '@/lib/actions/admin-dashboard';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const data = await getDashboardData();
  return <AdminDashboardClient data={data} />;
}

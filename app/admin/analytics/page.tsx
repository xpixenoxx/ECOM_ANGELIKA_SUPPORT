import { getAnalyticsData } from '@/lib/actions/admin-analytics';
import AnalyticsClient from './AnalyticsClient';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const initialData = await getAnalyticsData('30d');
  return <AnalyticsClient initialData={initialData} />;
}

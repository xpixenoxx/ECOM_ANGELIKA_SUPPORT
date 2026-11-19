import { getSiteContent } from '@/lib/actions/site-content';
import NewArrivalsClient from './NewArrivalsClient';

// ISR: rebuilds at most every 300s. For immediate updates, POST /api/revalidate
export const revalidate = 300;

export default async function NewArrivalsPage() {
  const siteContent = await getSiteContent();
  const newArrivalsContent = siteContent['new-arrivals-page'] || null;

  return <NewArrivalsClient initialContent={newArrivalsContent} />;
}

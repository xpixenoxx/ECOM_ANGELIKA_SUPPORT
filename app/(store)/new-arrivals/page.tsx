import { getSiteContent } from '@/lib/actions/site-content';
import NewArrivalsClient from './NewArrivalsClient';

export const revalidate = 60;

export default async function NewArrivalsPage() {
  const siteContent = await getSiteContent();
  const newArrivalsContent = siteContent['new-arrivals-page'] || null;

  return <NewArrivalsClient initialContent={newArrivalsContent} />;
}

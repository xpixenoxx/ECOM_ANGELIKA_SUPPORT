import { getAdminCollections } from '@/lib/actions/admin-products';
import CollectionsClient from './CollectionsClient';

export const dynamic = 'force-dynamic';

export default async function CollectionsPage() {
  const collections = await getAdminCollections();
  return <CollectionsClient initialCollections={collections} />;
}

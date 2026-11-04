import { getContentBlocksAdmin } from '@/lib/actions/content-blocks';
import ContentBlocksClient from './ContentBlocksClient';

export const dynamic = 'force-dynamic';

export default async function ContentBlocksPage() {
  const result = await getContentBlocksAdmin();

  return <ContentBlocksClient initialBlocks={result.success ? result.blocks || [] : []} error={result.error} />;
}
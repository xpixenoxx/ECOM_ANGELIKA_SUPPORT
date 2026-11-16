import { createClient } from '@/lib/supabase/server';
import { LooksList } from './LooksList';

export const dynamic = 'force-dynamic';

async function getLooks() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('looks')
    .select('id, name, lifestyle_image_url, is_active, display_order, created_at, look_hotspots(count)')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data || []).map((l) => ({
    ...l,
    is_active: Boolean(l.is_active),
    display_order: l.display_order ?? 0,
    created_at: l.created_at ?? '',
  }));
}

export default async function LooksListPage() {
  const looks = await getLooks();

  return <LooksList looks={looks} />;
}
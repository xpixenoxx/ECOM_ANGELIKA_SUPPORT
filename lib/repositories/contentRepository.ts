import { supabaseAdmin } from '@/lib/supabase/admin';

export const contentRepository = {
  async findByKey(key: string) {
    const { data, error } = await supabaseAdmin
      .from('content_blocks')
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async upsertBlock(key: string, type: string, title: string, content: any) {
    const { data, error } = await supabaseAdmin
      .from('content_blocks')
      .upsert(
        {
          key,
          type,
          title,
          content,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async findAllActive() {
    const { data, error } = await supabaseAdmin
      .from('content_blocks')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  },
};


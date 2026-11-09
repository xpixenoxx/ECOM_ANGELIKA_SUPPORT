import { supabaseAdmin } from '@/lib/supabase/admin';

export const customerRepository = {
  async countAll() {
    const { count, error } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (error) throw error;
    return count ?? 0;
  },

  async findMany(options?: { limit?: number; offset?: number; search?: string }) {
    let query = supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, phone, role, created_at, loyalty_points, loyalty_tier')
      .order('created_at', { ascending: false });

    if (options?.search) {
      query = query.or(`email.ilike.%${options.search}%,full_name.ilike.%${options.search}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async findById(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },
};


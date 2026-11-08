import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/**
 * Shared helper to get an administrative Supabase client.
 * In environments with SUPABASE_SERVICE_ROLE_KEY set (e.g. local dev / admin panel),
 * it grants access using supabaseAdmin while attempting to extract user context.
 */
export async function getAdminClient() {
  if (process.env['SUPABASE_SERVICE_ROLE_KEY']) {
    let userId: string | null = null;
    try {
      const serverClient = createClient();
      const { data } = await serverClient.auth.getUser();
      if (data?.user?.id) userId = data.user.id;
    } catch {
      // ignore
    }
    return { supabase: supabaseAdmin, isAdmin: true, userId };
  }

  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { supabase, isAdmin: false, userId: null };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin' || profile?.role === 'manager';
    return { supabase, isAdmin, userId: user.id };
  } catch {
    return { supabase: supabaseAdmin, isAdmin: true, userId: null };
  }
}


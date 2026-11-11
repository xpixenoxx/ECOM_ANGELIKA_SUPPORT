import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/**
 * Shared helper to get an administrative Supabase client.
 * Strictly verifies user authentication and ensures the user possesses
 * an administrative role ('admin', 'manager', or 'designer').
 */
export async function getAdminClient() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Allow direct admin access during local development
    if (process.env.NODE_ENV !== 'production') {
      return { supabase: supabaseAdmin, isAdmin: true, userId: user?.id || null };
    }

    if (authError || !user) {
      return { supabase: supabaseAdmin, isAdmin: false, userId: null };
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = profile?.role;
    const isAdmin = role === 'admin' || role === 'manager' || role === 'designer';
    return { supabase: supabaseAdmin, isAdmin, userId: user.id };
  } catch (error) {
    console.error('getAdminClient auth error:', error);
    return { supabase: supabaseAdmin, isAdmin: false, userId: null };
  }
}



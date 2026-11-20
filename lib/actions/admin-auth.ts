'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { hasValidServiceRoleKey } from '@/lib/env';
import { isAdminRole, type AdminRole } from '@/lib/supabase/rbac';

export interface AdminLoginResult {
  success: boolean;
  error?: string;
  role?: AdminRole;
  email?: string;
}

/**
 * Dedicated Admin Portal sign-in Server Action.
 * Runs on Cloudflare Edge / Node server, sets Supabase SSR auth cookies directly
 * on the response, and verifies the signed-in profile holds an Admin Portal role
 * (`admin`, `manager`, or `designer`). Customer accounts are rejected and signed out.
 */
export async function adminLoginAction(
  email: string,
  password: string
): Promise<AdminLoginResult> {
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !password) {
      return { success: false, error: 'Please enter a valid admin email and password.' };
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error || !data.user) {
      const raw = (error?.message || '').toLowerCase();
      if (raw.includes('invalid login') || raw.includes('invalid credentials')) {
        return { success: false, error: 'Invalid admin email or password.' };
      }
      return { success: false, error: error?.message || 'Unable to sign in. Please try again.' };
    }

    // Verify admin RBAC role in `profiles` using service-role if available, else the user's own session
    const reader = hasValidServiceRoleKey() ? supabaseAdmin : supabase;
    const { data: profile, error: profileError } = await reader
      .from('profiles')
      .select('role, email')
      .eq('id', data.user.id)
      .maybeSingle();

    const role = profile?.role as string | null | undefined;
    if (profileError || !isAdminRole(role)) {
      await supabase.auth.signOut().catch(() => {});
      return {
        success: false,
        error:
          'This account does not have Admin Portal privileges. Please sign in with an administrator account or use the customer login page.',
      };
    }

    return {
      success: true,
      role,
      email: profile?.email || data.user.email || cleanEmail,
    };
  } catch (err: any) {
    console.error('[adminLoginAction] unexpected error:', err);
    return {
      success: false,
      error: err?.message || 'Unexpected authentication error. Please try again.',
    };
  }
}

/**
 * Signs out the active Admin Portal session on the server and clears SSR cookies.
 */
export async function adminSignOutAction(): Promise<{ success: boolean }> {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch {
    return { success: true };
  }
}

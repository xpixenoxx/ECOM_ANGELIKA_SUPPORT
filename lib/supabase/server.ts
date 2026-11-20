import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

const PROD_SUPABASE_URL = 'https://ulxlpwipdvejzdzhmhwb.supabase.co';
const PROD_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseGxwd2lwZHZlanpkemhtaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NDI1NTQsImV4cCI6MjEwODUxODU1NH0.rKWX5kFwxom9mxCR7NQlP2M6MJRtQveEb8UQMmZ86L0';

function resolveServerSupabaseConfig() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const url =
    envUrl && !envUrl.includes('placeholder') && !envUrl.includes('your-project-id')
      ? envUrl
      : PROD_SUPABASE_URL;
  const anonKey =
    envKey && !envKey.startsWith('placeholder') && !envKey.startsWith('your-')
      ? envKey
      : PROD_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

/** Cloudflare Workers-safe fetch wrapper (strips RequestInit.cache which throws on workerd). */
function edgeSafeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const { cache: _cache, ...rest } = (init || {}) as RequestInit;
  const headers = new Headers(rest.headers);
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store');
  return fetch(input, { ...rest, headers });
}

/** Cookie-less anon client safe for public Edge SSR reads under RLS (always fetches fresh live data on Cloudflare Edge). */
export function createPublicClient() {
  const { url, anonKey } = resolveServerSupabaseConfig();
  return createSupabaseJsClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: edgeSafeFetch,
    },
  });
}

export function createClient() {
  const cookieStore = cookies();
  const { url, anonKey } = resolveServerSupabaseConfig();

  return createServerClient<Database>(url, anonKey, {
    global: {
      fetch: edgeSafeFetch,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

export async function getUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

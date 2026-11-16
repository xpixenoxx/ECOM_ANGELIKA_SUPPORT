'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL'] || 'https://placeholder.supabase.co';
  const anonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || 'placeholder-anon-key';
  return createBrowserClient<Database>(url, anonKey);
}

// Singleton instance for client-side usage
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}
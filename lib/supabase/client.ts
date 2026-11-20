'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export const PROD_SUPABASE_URL = 'https://ulxlpwipdvejzdzhmhwb.supabase.co';
export const PROD_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseGxwd2lwZHZlanpkemhtaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NDI1NTQsImV4cCI6MjEwODUxODU1NH0.rKWX5kFwxom9mxCR7NQlP2M6MJRtQveEb8UQMmZ86L0';

export function createClient() {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL'] || PROD_SUPABASE_URL;
  const anonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || PROD_SUPABASE_ANON_KEY;
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
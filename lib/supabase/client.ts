'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Public non-secret Supabase project coordinates (safe in browser bundles, protected by RLS).
// Dot notation on process.env.NEXT_PUBLIC_* is REQUIRED so Next.js DefinePlugin inlines build env vars.
export const PROD_SUPABASE_URL = 'https://ulxlpwipdvejzdzhmhwb.supabase.co';
export const PROD_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseGxwd2lwZHZlanpkemhtaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NDI1NTQsImV4cCI6MjEwODUxODU1NH0.rKWX5kFwxom9mxCR7NQlP2M6MJRtQveEb8UQMmZ86L0';

function resolveClientUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (envUrl && !envUrl.includes('placeholder') && !envUrl.includes('your-project-id')) {
    return envUrl;
  }
  return PROD_SUPABASE_URL;
}

function resolveClientAnonKey(): string {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (envKey && !envKey.startsWith('placeholder') && !envKey.startsWith('your-')) {
    return envKey;
  }
  return PROD_SUPABASE_ANON_KEY;
}

export function createClient() {
  return createBrowserClient<Database>(resolveClientUrl(), resolveClientAnonKey());
}

// Singleton instance for client-side usage
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}

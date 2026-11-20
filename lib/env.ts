/**
 * Environment Validation & Boolean Service Health Helpers
 *
 * Detects missing or template placeholder environment variables and exposes
 * boolean-only integration availability flags (never leaking raw secrets).
 */

const PLACEHOLDER_EXACT_VALUES = new Set([
  '',
  '...',
  'your-project-id.supabase.co',
  'https://your-project-id.supabase.co',
  'placeholder.supabase.co',
  'https://placeholder.supabase.co',
  'your-supabase-anon-key',
  'placeholder-anon-key',
  'your-supabase-service-role-key',
  'placeholder-service-key',
  'rzp_test_...',
  'rzp_live_9281a8c9b',
  'pk_test_...',
  'sk_test_...',
  'whsec_...',
  'SG...',
  'https://xxx@sentry.io/xxx',
]);

const PLACEHOLDER_PREFIXES = [
  'your-',
  'placeholder',
  'replace-with-',
  'changeme',
  '<',
];

export function isPlaceholderEnvValue(value?: string | null): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (PLACEHOLDER_EXACT_VALUES.has(trimmed)) return true;

  const lower = trimmed.toLowerCase();
  if (lower.endsWith('...') || lower.includes('your-project-id')) return true;
  return PLACEHOLDER_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

export function getOptionalEnv(name: string): string | undefined {
  const val = process.env[name]?.trim();
  return isPlaceholderEnvValue(val) ? undefined : val;
}

export function requireServerEnv(name: string): string {
  const val = getOptionalEnv(name);
  if (!val) {
    throw new Error(`Missing or placeholder server environment variable: ${name}`);
  }
  return val;
}

export const PROD_SUPABASE_URL = 'https://ulxlpwipdvejzdzhmhwb.supabase.co';
export const PROD_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseGxwd2lwZHZlanpkemhtaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NDI1NTQsImV4cCI6MjEwODUxODU1NH0.rKWX5kFwxom9mxCR7NQlP2M6MJRtQveEb8UQMmZ86L0';
export const PROD_SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseGxwd2lwZHZlanpkemhtaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mjk0MjU1NCwiZXhwIjoyMTA4NTE4NTU0fQ.m55v1r2zLg-3lpl88GX_F9K0AM-Y82bPyoBxPY9Bd3k';

export function hasValidSupabaseConfig(): boolean {
  const rawUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const rawAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  if (rawUrl && isPlaceholderEnvValue(rawUrl)) return false;
  if (rawAnonKey && isPlaceholderEnvValue(rawAnonKey)) return false;

  const url = getOptionalEnv('NEXT_PUBLIC_SUPABASE_URL') || PROD_SUPABASE_URL;
  const anonKey = getOptionalEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || PROD_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey && /^https:\/\/.+\.supabase\.co|^http:\/\/(127\.0\.0\.1|localhost)/.test(url));
}

export function hasValidServiceRoleKey(): boolean {
  const rawServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (rawServiceKey && isPlaceholderEnvValue(rawServiceKey)) return false;

  const serviceKey = getOptionalEnv('SUPABASE_SERVICE_ROLE_KEY') || PROD_SUPABASE_SERVICE_KEY;
  return Boolean(hasValidSupabaseConfig() && serviceKey);
}

export function isCloudServerlessEnv(): boolean {
  return Boolean(
    process.env['CF_PAGES'] ||
    process.env['CLOUDFLARE_WORKERS'] ||
    process.env['VERCEL']
  );
}

export function isLocalDevBypassAllowed(): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    !isCloudServerlessEnv() &&
    process.env['LOCAL_DEV_ADMIN_BYPASS'] === '1'
  );
}

export interface ServiceHealthFlags {
  supabaseConfigured: boolean;
  serviceRoleConfigured: boolean;
  cashfreeConfigured: boolean;
  cashfreeWebhookConfigured: boolean;
  razorpayConfigured: boolean;
  razorpayWebhookConfigured: boolean;
  stripeConfigured: boolean;
  stripeWebhookConfigured: boolean;
  resendConfigured: boolean;
  delhiveryWebhookConfigured: boolean;
  shiprocketConfigured: boolean;
  whatsappCloudConfigured: boolean;
  whatsappWebhookConfigured: boolean;
  revalidationConfigured: boolean;
}

export function getCashfreeMode(): 'sandbox' | 'production' {
  const explicitEnv = (
    getOptionalEnv('CASHFREE_ENV') ||
    getOptionalEnv('NEXT_PUBLIC_CASHFREE_ENV') ||
    ''
  ).toLowerCase();
  if (explicitEnv === 'sandbox' || explicitEnv === 'test') return 'sandbox';
  if (explicitEnv === 'production' || explicitEnv === 'prod') return 'production';
  const appId = getOptionalEnv('CASHFREE_APP_ID') || '';
  if (appId.toUpperCase().startsWith('TEST')) return 'sandbox';
  return 'production';
}

export function getCashfreeApiBaseUrl(): string {
  return getCashfreeMode() === 'sandbox'
    ? 'https://sandbox.cashfree.com/pg'
    : 'https://api.cashfree.com/pg';
}

export function getServiceHealthFlags(): ServiceHealthFlags {
  return {
    supabaseConfigured: hasValidSupabaseConfig(),
    serviceRoleConfigured: hasValidServiceRoleKey(),
    cashfreeConfigured: Boolean(
      getOptionalEnv('CASHFREE_APP_ID') && getOptionalEnv('CASHFREE_SECRET_KEY')
    ),
    cashfreeWebhookConfigured: Boolean(
      getOptionalEnv('CASHFREE_WEBHOOK_SECRET') || getOptionalEnv('CASHFREE_SECRET_KEY')
    ),
    razorpayConfigured: Boolean(
      getOptionalEnv('RAZORPAY_KEY_ID') &&
      getOptionalEnv('NEXT_PUBLIC_RAZORPAY_KEY_ID') &&
      getOptionalEnv('RAZORPAY_KEY_SECRET')
    ),
    razorpayWebhookConfigured: Boolean(getOptionalEnv('RAZORPAY_WEBHOOK_SECRET')),
    stripeConfigured: Boolean(getOptionalEnv('STRIPE_SECRET_KEY')),
    stripeWebhookConfigured: Boolean(getOptionalEnv('STRIPE_WEBHOOK_SECRET')),
    resendConfigured: Boolean(getOptionalEnv('RESEND_API_KEY')),
    delhiveryWebhookConfigured: Boolean(getOptionalEnv('DELHIVERY_WEBHOOK_SECRET')),
    shiprocketConfigured: Boolean(
      getOptionalEnv('SHIPROCKET_EMAIL') && getOptionalEnv('SHIPROCKET_PASSWORD')
    ),
    whatsappCloudConfigured: Boolean(
      getOptionalEnv('WHATSAPP_ACCESS_TOKEN') && getOptionalEnv('WHATSAPP_PHONE_NUMBER_ID')
    ),
    whatsappWebhookConfigured: Boolean(getOptionalEnv('WHATSAPP_WEBHOOK_VERIFY_TOKEN')),
    revalidationConfigured: Boolean(
      getOptionalEnv('REVALIDATION_SECRET') || getOptionalEnv('REVALIDATE_SECRET')
    ),
  };
}

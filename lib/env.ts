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
  'rzp_live_...',
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

/**
 * Reads runtime environment bindings from Cloudflare Pages request context
 * (`@cloudflare/next-on-pages` attaches env to Symbol.for('__cloudflare-request-context__'))
 * before falling back to `process.env`. Works across all Cloudflare compatibility dates.
 */
export function getCloudflareRequestEnv(): Record<string, unknown> | undefined {
  try {
    const ctx = (globalThis as any)?.[Symbol.for('__cloudflare-request-context__')];
    if (ctx && typeof ctx === 'object' && ctx.env && typeof ctx.env === 'object') {
      return ctx.env as Record<string, unknown>;
    }
  } catch {
    // Ignore outside Cloudflare runtime
  }
  return undefined;
}

export function getRawEnv(name: string): string | undefined {
  const procVal = process.env[name];
  if (typeof procVal === 'string' && procVal.trim()) {
    return procVal.trim();
  }
  const cfEnv = getCloudflareRequestEnv();
  const cfVal = cfEnv?.[name];
  if (typeof cfVal === 'string' && cfVal.trim()) {
    return cfVal.trim();
  }
  return undefined;
}

export function getOptionalEnv(name: string): string | undefined {
  const procVal = process.env[name];
  if (typeof procVal === 'string' && !isPlaceholderEnvValue(procVal)) {
    return procVal.trim();
  }
  const cfEnv = getCloudflareRequestEnv();
  const cfVal = cfEnv?.[name];
  if (typeof cfVal === 'string' && !isPlaceholderEnvValue(cfVal)) {
    return cfVal.trim();
  }
  return undefined;
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

export function hasValidSupabaseConfig(): boolean {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (rawUrl && isPlaceholderEnvValue(rawUrl)) return false;
  if (rawAnonKey && isPlaceholderEnvValue(rawAnonKey)) return false;

  const url = (rawUrl && !isPlaceholderEnvValue(rawUrl) ? rawUrl.trim() : undefined) || PROD_SUPABASE_URL;
  const anonKey =
    (rawAnonKey && !isPlaceholderEnvValue(rawAnonKey) ? rawAnonKey.trim() : undefined) || PROD_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey && /^https:\/\/.+\.supabase\.co|^http:\/\/(127\.0\.0\.1|localhost)/.test(url));
}

export function hasValidServiceRoleKey(): boolean {
  const serviceKey = getOptionalEnv('SUPABASE_SERVICE_ROLE_KEY');
  return Boolean(hasValidSupabaseConfig() && serviceKey);
}

export function isCloudServerlessEnv(): boolean {
  return Boolean(
    getCloudflareRequestEnv() ||
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

export type RazorpayMode = 'test' | 'live';

export interface RazorpayConfigValidation {
  configured: boolean;
  webhookConfigured: boolean;
  mode: RazorpayMode | null;
  keyId: string | null;
  keySecret: string | null;
  webhookSecret: string | null;
  mismatchError: string | null;
}

/**
 * Centralized Razorpay environment validation.
 * Enforces strict separation between Test Mode (`rzp_test_*`) and Live Mode (`rzp_live_*`)
 * so production and test credentials can never be mixed silently.
 */
export function getRazorpayConfig(): RazorpayConfigValidation {
  const serverKeyId = getOptionalEnv('RAZORPAY_KEY_ID');
  const publicKeyId = getOptionalEnv('NEXT_PUBLIC_RAZORPAY_KEY_ID');
  const keyId = serverKeyId || publicKeyId || null;
  const keySecret = getOptionalEnv('RAZORPAY_KEY_SECRET') || null;
  const webhookSecret = getOptionalEnv('RAZORPAY_WEBHOOK_SECRET') || null;

  const explicitServerEnv = (getOptionalEnv('RAZORPAY_ENV') || '').toLowerCase();
  const explicitPublicEnv = (getOptionalEnv('NEXT_PUBLIC_RAZORPAY_ENV') || '').toLowerCase();

  const normalizeEnv = (val: string): RazorpayMode | null => {
    if (!val) return null;
    if (val === 'test' || val === 'sandbox' || val === 'development') return 'test';
    if (val === 'live' || val === 'production' || val === 'prod') return 'live';
    return null;
  };

  const expectedServerMode = normalizeEnv(explicitServerEnv);
  const expectedPublicMode = normalizeEnv(explicitPublicEnv);

  const keyMode: RazorpayMode | null = keyId
    ? keyId.startsWith('rzp_test_')
      ? 'test'
      : keyId.startsWith('rzp_live_')
        ? 'live'
        : null
    : null;

  let mismatchError: string | null = null;

  if (serverKeyId && publicKeyId && serverKeyId !== publicKeyId) {
    mismatchError = 'RAZORPAY_KEY_ID and NEXT_PUBLIC_RAZORPAY_KEY_ID do not match.';
  } else if (expectedServerMode && expectedPublicMode && expectedServerMode !== expectedPublicMode) {
    mismatchError = 'RAZORPAY_ENV and NEXT_PUBLIC_RAZORPAY_ENV disagree on test vs live mode.';
  } else if (keyId && !keyMode) {
    mismatchError = 'RAZORPAY_KEY_ID must start with "rzp_test_" or "rzp_live_".';
  } else if (keyMode && expectedServerMode && keyMode !== expectedServerMode) {
    mismatchError = `RAZORPAY_ENV is "${expectedServerMode}" but RAZORPAY_KEY_ID is a "${keyMode}" key.`;
  } else if (keyMode && expectedPublicMode && keyMode !== expectedPublicMode) {
    mismatchError = `NEXT_PUBLIC_RAZORPAY_ENV is "${expectedPublicMode}" but Razorpay Key ID is a "${keyMode}" key.`;
  }

  const configured = Boolean(keyId && keySecret && keyMode && !mismatchError);

  return {
    configured,
    webhookConfigured: Boolean(webhookSecret),
    mode: keyMode || expectedServerMode || expectedPublicMode,
    keyId,
    keySecret,
    webhookSecret,
    mismatchError,
  };
}

export interface ShiprocketConfigValidation {
  configured: boolean;
  webhookConfigured: boolean;
  email: string | null;
  password: string | null;
  pickupLocation: string;
  pickupPincode: string | null;
  webhookToken: string | null;
  env: string;
  defaultWeightKg: number;
  defaultLengthCm: number;
  defaultBreadthCm: number;
  defaultHeightCm: number;
}

export function getShiprocketConfig(): ShiprocketConfigValidation {
  const email = getOptionalEnv('SHIPROCKET_EMAIL') || null;
  const password = getOptionalEnv('SHIPROCKET_PASSWORD') || null;
  const pickupLocation = getOptionalEnv('SHIPROCKET_PICKUP_LOCATION') || 'Primary';
  const pickupPincode = getOptionalEnv('SHIPROCKET_PICKUP_PINCODE') || null;
  const webhookToken = getOptionalEnv('SHIPROCKET_WEBHOOK_TOKEN') || null;
  const env = (getOptionalEnv('SHIPROCKET_ENV') || 'production').toLowerCase();

  const parsePositive = (raw: string | undefined, fallback: number): number => {
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  return {
    configured: Boolean(email && password),
    webhookConfigured: Boolean(webhookToken),
    email,
    password,
    pickupLocation,
    pickupPincode,
    webhookToken,
    env,
    defaultWeightKg: parsePositive(getOptionalEnv('SHIPROCKET_DEFAULT_WEIGHT_KG'), 0.5),
    defaultLengthCm: parsePositive(getOptionalEnv('SHIPROCKET_DEFAULT_LENGTH_CM'), 30),
    defaultBreadthCm: parsePositive(getOptionalEnv('SHIPROCKET_DEFAULT_BREADTH_CM'), 25),
    defaultHeightCm: parsePositive(getOptionalEnv('SHIPROCKET_DEFAULT_HEIGHT_CM'), 5),
  };
}

export interface ServiceHealthFlags {
  supabaseConfigured: boolean;
  serviceRoleConfigured: boolean;
  razorpayConfigured: boolean;
  razorpayWebhookConfigured: boolean;
  razorpayTestMode: boolean;
  razorpayLiveMode: boolean;
  razorpayModeMismatch: boolean;
  stripeConfigured: boolean;
  stripeWebhookConfigured: boolean;
  resendConfigured: boolean;
  delhiveryWebhookConfigured: boolean;
  shiprocketConfigured: boolean;
  shiprocketWebhookConfigured: boolean;
  whatsappCloudConfigured: boolean;
  whatsappWebhookConfigured: boolean;
  revalidationConfigured: boolean;
}

export function getServiceHealthFlags(): ServiceHealthFlags {
  const rzp = getRazorpayConfig();
  const sr = getShiprocketConfig();

  return {
    supabaseConfigured: hasValidSupabaseConfig(),
    serviceRoleConfigured: hasValidServiceRoleKey(),
    razorpayConfigured: rzp.configured,
    razorpayWebhookConfigured: rzp.webhookConfigured,
    razorpayTestMode: rzp.mode === 'test',
    razorpayLiveMode: rzp.mode === 'live',
    razorpayModeMismatch: Boolean(rzp.mismatchError),
    stripeConfigured: Boolean(getOptionalEnv('STRIPE_SECRET_KEY')),
    stripeWebhookConfigured: Boolean(getOptionalEnv('STRIPE_WEBHOOK_SECRET')),
    resendConfigured: Boolean(getOptionalEnv('RESEND_API_KEY')),
    delhiveryWebhookConfigured: Boolean(getOptionalEnv('DELHIVERY_WEBHOOK_SECRET')),
    shiprocketConfigured: sr.configured,
    shiprocketWebhookConfigured: sr.webhookConfigured,
    whatsappCloudConfigured: Boolean(
      getOptionalEnv('WHATSAPP_ACCESS_TOKEN') && getOptionalEnv('WHATSAPP_PHONE_NUMBER_ID')
    ),
    whatsappWebhookConfigured: Boolean(getOptionalEnv('WHATSAPP_WEBHOOK_VERIFY_TOKEN')),
    revalidationConfigured: Boolean(
      getOptionalEnv('REVALIDATION_SECRET') || getOptionalEnv('REVALIDATE_SECRET')
    ),
  };
}

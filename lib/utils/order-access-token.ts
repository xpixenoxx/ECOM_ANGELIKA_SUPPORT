import { hmacSha256Hex, timingSafeEqualStrings } from '@/lib/utils/edge-crypto';
import { getOptionalEnv } from '@/lib/env';

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSigningSecret(): string {
  return (
    getOptionalEnv('ORDER_TOKEN_SECRET') ||
    getOptionalEnv('SUPABASE_SERVICE_ROLE_KEY') ||
    'angelika-dev-order-token-secret'
  );
}

/**
 * Generates an HMAC-SHA256 signed token granting scoped receipt access to a specific order.
 * Format: `<expiresAtMs>.<hexSignature>`
 */
export function createOrderReceiptToken(
  orderId: string,
  email: string,
  ttlMs: number = DEFAULT_TTL_MS
): string {
  const expiresAt = Date.now() + ttlMs;
  const payload = `${orderId}:${email.trim().toLowerCase()}:${expiresAt}`;
  const sig = hmacSha256Hex(getSigningSecret(), payload);
  return `${expiresAt}.${sig}`;
}

export function verifyOrderReceiptToken(
  orderId: string,
  email: string,
  token?: string | null
): boolean {
  if (!token || !orderId || !email) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [expiresStr, providedSig] = parts;
  const expiresAt = Number(expiresStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  if (!providedSig || providedSig.length !== 64) return false;

  const expectedSig = hmacSha256Hex(
    getSigningSecret(),
    `${orderId}:${email.trim().toLowerCase()}:${expiresAt}`
  );

  return timingSafeEqualStrings(providedSig.toLowerCase(), expectedSig);
}

/**
 * Sliding-window rate limiter.
 * - Cloudflare Workers: uses KV binding (RATE_LIMIT_KV) when available
 * - Node.js / local dev: falls back to in-memory Map (single-instance only)
 *
 * Workers-safe: no setInterval, no persistent state between requests on CF.
 */

interface RateLimitEntry {
  timestamps: number[];
  lastSeen: number;
}

// In-memory fallback for Node.js / local dev
const MAX_STORE_SIZE = 10_000;
const store = new Map<string, RateLimitEntry>();

function evictOldestIfNeeded() {
  if (store.size < MAX_STORE_SIZE) return;
  let oldestKey: string | null = null;
  let oldestTime = Infinity;
  for (const [key, entry] of store.entries()) {
    if (entry.lastSeen < oldestTime) {
      oldestTime = entry.lastSeen;
      oldestKey = key;
    }
  }
  if (oldestKey) store.delete(oldestKey);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

type KvNamespaceLike = {
  get: (k: string) => Promise<string | null>;
  put: (k: string, v: string, o?: { expirationTtl?: number }) => Promise<void>;
};

function resolveCloudflareKv(explicitKv?: KvNamespaceLike | null): KvNamespaceLike | null {
  if (explicitKv && typeof explicitKv.get === 'function' && typeof explicitKv.put === 'function') {
    return explicitKv;
  }
  const cfCtxKv = (globalThis as any)?.[Symbol.for('__cloudflare-request-context__')]?.env?.RATE_LIMIT_KV;
  if (cfCtxKv && typeof cfCtxKv.get === 'function' && typeof cfCtxKv.put === 'function') {
    return cfCtxKv;
  }
  const globalKv = (globalThis as any)?.RATE_LIMIT_KV;
  if (globalKv && typeof globalKv.get === 'function' && typeof globalKv.put === 'function') {
    return globalKv;
  }
  const envKv = (process.env as any)?.RATE_LIMIT_KV;
  if (envKv && typeof envKv.get === 'function' && typeof envKv.put === 'function') {
    return envKv;
  }
  return null;
}

/**
 * Check rate limit using KV (Cloudflare) or in-memory (Node.js fallback).
 * Automatically resolves the Cloudflare RATE_LIMIT_KV binding when present.
 */
export async function checkRateLimitAsync(
  key: string,
  maxRequests: number,
  windowMs: number,
  kvNamespace?: KvNamespaceLike | null
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowMs;
  const resolvedKv = resolveCloudflareKv(kvNamespace);

  if (resolvedKv) {
    // Cloudflare KV path
    try {
      const raw = await resolvedKv.get(key);
      const timestamps: number[] = raw ? JSON.parse(raw) : [];
      const recent = timestamps.filter(ts => ts > windowStart);

      if (recent.length >= maxRequests) {
        const oldestInWindow = recent[0] ?? now;
        const resetAt = oldestInWindow + windowMs;
        return {
          allowed: false,
          remaining: 0,
          resetAt,
          retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
        };
      }

      recent.push(now);
      const ttlSeconds = Math.ceil(windowMs / 1000) + 10;
      await resolvedKv.put(key, JSON.stringify(recent), { expirationTtl: ttlSeconds });

      const oldestInWindow = recent[0] ?? now;
      const resetAt = oldestInWindow + windowMs;
      return {
        allowed: true,
        remaining: Math.max(0, maxRequests - recent.length),
        resetAt,
        retryAfterSeconds: 0,
      };
    } catch {
      // KV failure → fall through to in-memory check rather than failing completely unguarded
    }
  }

  // In-memory fallback (Node.js)
  const existing = store.get(key);
  const recent = existing ? existing.timestamps.filter(ts => ts > windowStart) : [];

  if (recent.length >= maxRequests) {
    const oldestInWindow = recent[0] ?? now;
    const resetAt = oldestInWindow + windowMs;
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
    };
  }

  recent.push(now);
  evictOldestIfNeeded();
  store.set(key, { timestamps: recent, lastSeen: now });

  const oldestInWindow = recent[0] ?? now;
  const resetAt = oldestInWindow + windowMs;
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - recent.length),
    resetAt,
    retryAfterSeconds: 0,
  };
}

/** Synchronous in-memory check (Node.js only — use checkRateLimitAsync when possible) */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  const existing = store.get(key);
  const recent = existing ? existing.timestamps.filter(ts => ts > windowStart) : [];

  if (recent.length >= maxRequests) {
    const oldestInWindow = recent[0] ?? now;
    const resetAt = oldestInWindow + windowMs;
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
    };
  }

  recent.push(now);
  evictOldestIfNeeded();
  store.set(key, { timestamps: recent, lastSeen: now });

  const oldestInWindow = recent[0] ?? now;
  const resetAt = oldestInWindow + windowMs;
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - recent.length),
    resetAt,
    retryAfterSeconds: 0,
  };
}

export function resetRateLimit(key?: string): void {
  if (key) store.delete(key);
  else store.clear();
}

export function getClientIp(request: Request): string {
  // Cloudflare sets CF-Connecting-IP; Vercel sets x-forwarded-for
  const cfIp = request.headers.get('cf-connecting-ip')?.trim();
  if (cfIp) return cfIp;
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown';
}

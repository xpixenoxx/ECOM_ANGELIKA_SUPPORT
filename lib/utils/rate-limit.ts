/**
 * Sliding-window rate limiter utility.
 * Bounded in-memory store safe for Next.js API routes, Server Actions, and tests.
 */

interface RateLimitEntry {
  timestamps: number[];
  lastSeen: number;
}

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
  if (oldestKey) {
    store.delete(oldestKey);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  const existing = store.get(key);
  const recent = existing
    ? existing.timestamps.filter((ts) => ts > windowStart)
    : [];

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
  if (key) {
    store.delete(key);
  } else {
    store.clear();
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown';
}

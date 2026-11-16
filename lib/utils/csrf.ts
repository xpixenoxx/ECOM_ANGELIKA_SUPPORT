/**
 * Same-origin / CSRF protection for authenticated mutation endpoints.
 * Webhook routes authenticate via cryptographic HMAC signatures instead.
 */

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function extractHost(urlValue: string | null): string | null {
  if (!urlValue) return null;
  try {
    return new URL(urlValue).host.toLowerCase();
  } catch {
    return null;
  }
}

export function verifySameOrigin(request: Request): { ok: boolean; reason?: string } {
  const method = (request.method || 'GET').toUpperCase();
  if (SAFE_METHODS.has(method)) {
    return { ok: true };
  }

  const secFetchSite = request.headers.get('sec-fetch-site')?.toLowerCase();
  if (secFetchSite === 'cross-site') {
    return { ok: false, reason: 'Cross-site request rejected' };
  }

  const requestHost =
    request.headers.get('x-forwarded-host')?.split(',')[0]?.trim().toLowerCase() ||
    request.headers.get('host')?.toLowerCase() ||
    extractHost(request.url);

  const allowedHosts = new Set<string>();
  if (requestHost) allowedHosts.add(requestHost);
  const configuredSiteHost = extractHost(process.env['NEXT_PUBLIC_SITE_URL'] || null);
  if (configuredSiteHost) allowedHosts.add(configuredSiteHost);

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (origin) {
    if (origin === 'null') {
      return { ok: false, reason: 'Null origin rejected' };
    }
    const originHost = extractHost(origin);
    if (!originHost || (allowedHosts.size > 0 && !allowedHosts.has(originHost))) {
      return { ok: false, reason: 'Origin mismatch' };
    }
    return { ok: true };
  }

  if (referer) {
    const refererHost = extractHost(referer);
    if (!refererHost || (allowedHosts.size > 0 && !allowedHosts.has(refererHost))) {
      return { ok: false, reason: 'Referer mismatch' };
    }
    return { ok: true };
  }

  // Browser fetches send Origin or Referer on POST/PUT/PATCH/DELETE; allow explicit same-origin or Vitest/node unit calls without Origin only if not cross-site
  if (process.env.NODE_ENV === 'production' && secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'none') {
    return { ok: false, reason: 'Untrusted fetch site' };
  }

  return { ok: true };
}

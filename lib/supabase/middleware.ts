import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { hasValidSupabaseConfig, isLocalDevBypassAllowed } from '@/lib/env';
import { canAccessAdminPath, isAdminRole } from './rbac';

export async function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response };
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!hasValidSupabaseConfig()) {
    if (pathname.startsWith('/admin') && !isLocalDevBypassAllowed()) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    if (pathname.startsWith('/account')) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  try {
    const { supabase, response } = await createMiddlewareClient(request);

    // Refresh session if expired - required for Server Components
    let user = null;
    try {
      const userRes = await supabase.auth.getUser();
      user = userRes.data?.user || null;
    } catch {
      user = null;
    }

  // Geo-based redirect
  const country = request.headers.get('x-vercel-ip-country') || 'IN';
  const currency = country === 'IN' ? 'INR' : country === 'US' ? 'USD' : 'EUR';
  const locale = country === 'IN' ? 'en-IN' : 'en-US';

  // Set currency/locale cookies if not present
  if (!request.cookies.has('currency')) {
    response.cookies.set('currency', currency, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  if (!request.cookies.has('locale')) {
    response.cookies.set('locale', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  // Admin RBAC protection (fail-closed)
  if (pathname.startsWith('/admin')) {
    if (!user) {
      if (!isLocalDevBypassAllowed()) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }
    } else {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const role = profile?.role as string | null | undefined;
      if (profileError || !isAdminRole(role)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (!canAccessAdminPath(role, pathname)) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
  }

  // Account route protection
  if (pathname.startsWith('/account') && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Checkout protection - require email/phone
  if (pathname.startsWith('/checkout') && !user) {
    // Allow guest checkout but track
    response.headers.set('x-guest-checkout', 'true');
  }

  return response;
  } catch {
    if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }
}

// Role-based access control
export type UserRole = 'customer' | 'admin' | 'manager' | 'designer';

export function hasRole(userRole: UserRole | null, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

export function isAdmin(userRole: UserRole | null): boolean {
  return hasRole(userRole, ['admin']);
}

export function isManager(userRole: UserRole | null): boolean {
  return hasRole(userRole, ['admin', 'manager']);
}

export function isDesigner(userRole: UserRole | null): boolean {
  return hasRole(userRole, ['admin', 'manager', 'designer']);
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 60 * 1000); // Every hour
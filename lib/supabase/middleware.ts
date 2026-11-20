import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { hasValidSupabaseConfig, isLocalDevBypassAllowed } from '@/lib/env';
import { canAccessAdminPath, isAdminRole } from './rbac';

export async function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url =
    process.env['NEXT_PUBLIC_SUPABASE_URL'] || 'https://ulxlpwipdvejzdzhmhwb.supabase.co';
  const anonKey =
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseGxwd2lwZHZlanpkemhtaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NDI1NTQsImV4cCI6MjEwODUxODU1NH0.rKWX5kFwxom9mxCR7NQlP2M6MJRtQveEb8UQMmZ86L0';

  const supabase = createServerClient(
    url,
    anonKey,
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
  // Support both Vercel (x-vercel-ip-country) and Cloudflare (cf-ipcountry) geo headers
  const country = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country') || 'IN';
  const currency = country === 'IN' ? 'INR' : country === 'US' ? 'USD' : 'EUR';
  const locale = country === 'IN' ? 'en-IN' : 'en-US';

  // Set currency/locale cookies if not present
  const isProd = process.env.NODE_ENV === 'production';
  if (!request.cookies.has('currency')) {
    response.cookies.set('currency', currency, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: isProd,
    });
  }

  if (!request.cookies.has('locale')) {
    response.cookies.set('locale', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: isProd,
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

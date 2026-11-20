import { updateSession } from './lib/supabase/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Block direct access via Cloudflare's default *.pages.dev domain so only custom domains serve the store
  const host = (request.headers.get('host') || request.nextUrl.hostname || '')
    .split(':')[0]
    ?.toLowerCase();

  if (host && host.endsWith('.pages.dev')) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'no-store',
      },
    });
  }

  // Skip middleware for static assets, public files, and API routes that handle their own auth
  const pathname = request.nextUrl.pathname;

  // Skip for static assets and public endpoints (NEVER skip /admin)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|avif|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (api endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|css|js|woff|woff2)$).*)',
  ],
};

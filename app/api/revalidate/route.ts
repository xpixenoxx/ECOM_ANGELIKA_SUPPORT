export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

const REVALIDATE_PATHS = ['/', '/shop', '/new-arrivals', '/sale', '/vidhyas-picks'];
const CATEGORY_SLUGS = ['kurtis', 'sarees', 'lehengas', 'salwars', 'dupattas'];

export async function POST(request: NextRequest) {
  const secret = process.env['REVALIDATE_SECRET'] || process.env['REVALIDATION_SECRET'];
  const authHeader = request.headers.get('authorization') || '';
  const headerSecret = request.headers.get('x-revalidate-secret')?.trim() || '';
  const bearerToken = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();
  const provided = bearerToken || headerSecret;

  if (secret && provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const tag = body.tag || url.searchParams.get('tag');
    const path = body.path || url.searchParams.get('path');
    const all = body.all || url.searchParams.get('all') === 'true';

    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ success: true, revalidated: true, type: 'tag', tag });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ success: true, revalidated: true, type: 'path', path });
    }

    if (all) {
      REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
      CATEGORY_SLUGS.forEach((slug) => revalidatePath(`/shop/${slug}`));
      return NextResponse.json({
        success: true,
        revalidated: true,
        type: 'all',
        paths: [...REVALIDATE_PATHS, ...CATEGORY_SLUGS.map((s) => `/shop/${s}`)],
      });
    }

    return NextResponse.json({ error: 'Provide path, tag, or all:true', success: false }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, success: false }, { status: 500 });
  }
}

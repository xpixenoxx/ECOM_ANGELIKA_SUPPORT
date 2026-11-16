import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import crypto from 'crypto';
import { isPlaceholderEnvValue } from '@/lib/env';

const ALLOWED_TAGS = new Set([
  'store-settings',
  'navbar-items',
  'site-content',
  'products',
  'categories',
  'looks',
]);

function timingSafeMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const secret = process.env['REVALIDATION_SECRET']?.trim() || '';
  if (!secret || isPlaceholderEnvValue(secret)) {
    return NextResponse.json(
      { success: false, error: 'Revalidation is not configured on the server.' },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('authorization') || '';
  const bearerToken = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : '';
  const headerSecret = request.headers.get('x-revalidate-secret')?.trim() || '';
  const provided = bearerToken || headerSecret;

  if (!provided || !timingSafeMatch(provided, secret)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: { tag?: string; path?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
  }

  const revalidated: string[] = [];

  if (typeof body.tag === 'string' && ALLOWED_TAGS.has(body.tag)) {
    revalidateTag(body.tag);
    revalidated.push(`tag:${body.tag}`);
  }

  if (typeof body.path === 'string' && body.path.startsWith('/') && !body.path.startsWith('//')) {
    revalidatePath(body.path);
    revalidated.push(`path:${body.path}`);
  }

  if (revalidated.length === 0) {
    revalidatePath('/');
    revalidated.push('path:/');
  }

  return NextResponse.json({ success: true, revalidated, timestamp: new Date().toISOString() });
}

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { CONTENT_ADMIN_ROLES, logAdminAction, requireAdminApi } from '@/lib/supabase/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const guard = await requireAdminApi(request, CONTENT_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
    const supabase = supabaseAdmin;

    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

    let query = supabase
      .from('content_blocks')
      .select('*')
      .not('key', 'like', 'otp_%')
      .not('key', 'like', 'inquiry_%')
      .not('key', 'like', 'product_return_policy_%');

    if (!includeDrafts) {
      query = query
        .eq('is_active', true)
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString());
    }

    const { data: blocks, error } = await query
      .order('sort_order', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get content blocks error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ blocks: blocks || [] });
  } catch (error: any) {
    console.error('Get content blocks error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch content blocks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi(request, CONTENT_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
    const supabase = supabaseAdmin;
    const userId = guard.auth.userId;

    const body = await request.json();
    const { key, type, title, content, settings, is_active, published_at } = body;

    if (!key || !type) {
      return NextResponse.json({ error: 'Key and type are required' }, { status: 400 });
    }

    // Check if key already exists
    const { data: existing } = await supabase
      .from('content_blocks')
      .select('id')
      .eq('key', key)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'A content block with this key already exists' }, { status: 400 });
    }

    const { data: block, error } = await supabase
      .from('content_blocks')
      .insert({
        key,
        type,
        title: title || null,
        content: content || {},
        settings: settings || {},
        is_active: is_active || false,
        published_at: published_at || null,
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Create content block error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAdminAction({
      actorId: userId,
      action: 'create_content_block',
      entityType: 'content_block',
      entityId: block.id,
      afterState: { key: block.key, type: block.type },
    });

    return NextResponse.json({ block }, { status: 201 });
  } catch (error: any) {
    console.error('Create content block error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create content block' }, { status: 500 });
  }
}

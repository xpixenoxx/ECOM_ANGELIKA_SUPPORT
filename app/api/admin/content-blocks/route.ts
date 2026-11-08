import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { supabase, isAdmin } = await getAdminClient();

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

    let query = supabase.from('content_blocks').select('*');

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
  try {
    const { supabase, isAdmin, userId } = await getAdminClient();

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    return NextResponse.json({ block }, { status: 201 });
  } catch (error: any) {
    console.error('Create content block error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create content block' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

    let query = supabase
      .from('content_blocks')
      .select('*');

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
  } catch (error) {
    console.error('Get content blocks error:', error);
    return NextResponse.json({ error: 'Failed to fetch content blocks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
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
      .single();

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
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Create content block error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ block }, { status: 201 });
  } catch (error) {
    console.error('Create content block error:', error);
    return NextResponse.json({ error: 'Failed to create content block' }, { status: 500 });
  }
}
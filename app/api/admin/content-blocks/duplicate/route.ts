import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

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
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    // Get original block
    const { data: original, error: fetchError } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !original) {
      return NextResponse.json({ error: 'Content block not found' }, { status: 404 });
    }

    // Generate new key
    const baseKey = original.key;
    let newKey = `${baseKey}-copy`;
    let counter = 1;

    while (true) {
      const { data: existing } = await supabase
        .from('content_blocks')
        .select('id')
        .eq('key', newKey)
        .single();

      if (!existing) break;
      counter++;
      newKey = `${baseKey}-copy-${counter}`;
    }

    // Create duplicate
    const { data: block, error } = await supabase
      .from('content_blocks')
      .insert({
        key: newKey,
        type: original.type,
        title: original.title ? `${original.title} (Copy)` : null,
        content: original.content,
        settings: original.settings,
        is_active: false, // Duplicate starts as draft
        published_at: null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Duplicate content block error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ block }, { status: 201 });
  } catch (error) {
    console.error('Duplicate content block error:', error);
    return NextResponse.json({ error: 'Failed to duplicate content block' }, { status: 500 });
  }
}
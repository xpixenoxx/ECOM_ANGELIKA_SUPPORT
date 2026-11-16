import { NextRequest, NextResponse } from 'next/server';
import { CONTENT_ADMIN_ROLES, logAdminAction, requireAdminApi } from '@/lib/supabase/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi(request, CONTENT_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
    const supabase = supabaseAdmin;
    const userId = guard.auth.userId;

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
        .maybeSingle();

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
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Duplicate content block error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAdminAction({
      actorId: userId,
      action: 'duplicate_content_block',
      entityType: 'content_block',
      entityId: block.id,
      metadata: { sourceBlockId: id },
    });

    return NextResponse.json({ block }, { status: 201 });
  } catch (error: any) {
    console.error('Duplicate content block error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to duplicate content block' }, { status: 500 });
  }
}

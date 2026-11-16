import { NextRequest, NextResponse } from 'next/server';
import { CONTENT_ADMIN_ROLES, logAdminAction, requireAdminApi } from '@/lib/supabase/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const guard = await requireAdminApi(request, CONTENT_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
    const supabase = supabaseAdmin;

    const { id } = await Promise.resolve(params);

    const { data: block, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ block });
  } catch (error: any) {
    console.error('Get content block error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch content block' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const guard = await requireAdminApi(request, CONTENT_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
    const supabase = supabaseAdmin;
    const userId = guard.auth.userId;

    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const { key, type, title, content, settings, is_active, published_at, sort_order } = body;

    // If key is being changed, check for conflicts
    if (key) {
      const { data: existing } = await supabase
        .from('content_blocks')
        .select('id')
        .eq('key', key)
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: 'A content block with this key already exists' }, { status: 400 });
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    if (userId) {
      updateData.updated_by = userId;
    }

    if (key !== undefined) updateData.key = key;
    if (type !== undefined) updateData.type = type;
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (settings !== undefined) updateData.settings = settings;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (published_at !== undefined) updateData.published_at = published_at;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    const { data: block, error } = await supabase
      .from('content_blocks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update content block error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAdminAction({
      actorId: userId,
      action: 'update_content_block',
      entityType: 'content_block',
      entityId: id,
    });

    return NextResponse.json({ block });
  } catch (error: any) {
    console.error('Update content block error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update content block' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const guard = await requireAdminApi(request, CONTENT_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
    const supabase = supabaseAdmin;

    const { id } = await Promise.resolve(params);

    const { error } = await supabase
      .from('content_blocks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete content block error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAdminAction({
      actorId: guard.auth.userId,
      action: 'delete_content_block',
      entityType: 'content_block',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete content block error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete content block' }, { status: 500 });
  }
}

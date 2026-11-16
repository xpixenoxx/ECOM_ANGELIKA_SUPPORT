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
    const { id, is_active, publish } = body;

    if (!id || is_active === undefined) {
      return NextResponse.json({ error: 'id and is_active required' }, { status: 400 });
    }

    const updateData: any = {
      is_active,
      updated_at: new Date().toISOString(),
    };
    if (userId) {
      updateData.updated_by = userId;
    }

    if (publish && is_active) {
      updateData.published_at = new Date().toISOString();
    } else if (!is_active) {
      updateData.published_at = null;
    }

    const { data: block, error } = await supabase
      .from('content_blocks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Toggle content block status error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAdminAction({
      actorId: userId,
      action: 'toggle_content_block',
      entityType: 'content_block',
      entityId: id,
      afterState: { is_active, publish },
    });

    return NextResponse.json({ block });
  } catch (error: any) {
    console.error('Toggle content block status error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to toggle status' }, { status: 500 });
  }
}

export const runtime = 'edge';

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
    const { blockIds } = body;

    if (!blockIds || !Array.isArray(blockIds)) {
      return NextResponse.json({ error: 'blockIds array required' }, { status: 400 });
    }

    const updates = blockIds.map((id: string, index: number) => {
      const updateData: any = { sort_order: index };
      if (userId) updateData.updated_by = userId;
      return supabase
        .from('content_blocks')
        .update(updateData)
        .eq('id', id);
    });

    const results = await Promise.all(updates);

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Some blocks failed to reorder' }, { status: 500 });
    }

    await logAdminAction({
      actorId: userId,
      action: 'reorder_content_blocks',
      entityType: 'content_block',
      afterState: { blockIds },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reorder content blocks error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to reorder content blocks' }, { status: 500 });
  }
}

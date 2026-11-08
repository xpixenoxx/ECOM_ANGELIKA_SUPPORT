import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { supabase, isAdmin, userId } = await getAdminClient();

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reorder content blocks error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to reorder content blocks' }, { status: 500 });
  }
}

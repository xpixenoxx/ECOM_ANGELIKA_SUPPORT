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
    const { blockIds } = body;

    if (!blockIds || !Array.isArray(blockIds)) {
      return NextResponse.json({ error: 'blockIds array required' }, { status: 400 });
    }

    const updates = blockIds.map((id: string, index: number) =>
      supabase
        .from('content_blocks')
        .update({ sort_order: index, updated_by: user.id })
        .eq('id', id)
    );

    const results = await Promise.all(updates);

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Some blocks failed to reorder' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder content blocks error:', error);
    return NextResponse.json({ error: 'Failed to reorder content blocks' }, { status: 500 });
  }
}
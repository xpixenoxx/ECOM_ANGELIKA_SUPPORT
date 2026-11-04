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
    const { id, is_active, publish } = body;

    if (!id || is_active === undefined) {
      return NextResponse.json({ error: 'id and is_active required' }, { status: 400 });
    }

    const updateData: any = {
      is_active,
      updated_by: user.id,
    };

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

    return NextResponse.json({ block });
  } catch (error) {
    console.error('Toggle content block status error:', error);
    return NextResponse.json({ error: 'Failed to toggle status' }, { status: 500 });
  }
}
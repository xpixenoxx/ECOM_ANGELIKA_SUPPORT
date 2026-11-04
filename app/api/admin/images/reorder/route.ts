import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reorderProductImages } from '@/lib/image-processing';

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
    const { productId, imageIds } = body;

    if (!productId || !imageIds || !Array.isArray(imageIds)) {
      return NextResponse.json({ error: 'Product ID and image IDs array required' }, { status: 400 });
    }

    const result = await reorderProductImages(productId, imageIds);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Image reorder error:', error);
    return NextResponse.json({ error: 'Reorder failed' }, { status: 500 });
  }
}
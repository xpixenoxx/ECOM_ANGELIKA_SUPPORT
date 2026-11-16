import { NextRequest, NextResponse } from 'next/server';
import { CONTENT_ADMIN_ROLES, logAdminAction, requireAdminApi } from '@/lib/supabase/admin-auth';
import { reorderProductImages } from '@/lib/image-processing';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi(request, CONTENT_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const { productId, imageIds } = body;

    if (!productId || !imageIds || !Array.isArray(imageIds)) {
      return NextResponse.json({ error: 'Product ID and image IDs array required' }, { status: 400 });
    }

    const result = await reorderProductImages(productId, imageIds);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    await logAdminAction({
      actorId: guard.auth.userId,
      action: 'reorder_product_images',
      entityType: 'product',
      entityId: productId,
      afterState: { imageIds },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Image reorder error:', error);
    return NextResponse.json({ error: 'Reorder failed' }, { status: 500 });
  }
}

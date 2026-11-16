import { NextRequest, NextResponse } from 'next/server';
import { CONTENT_ADMIN_ROLES, logAdminAction, requireAdminApi } from '@/lib/supabase/admin-auth';
import { setPrimaryProductImage } from '@/lib/image-processing';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi(request, CONTENT_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const { productId, imageId } = body;

    if (!productId || !imageId) {
      return NextResponse.json({ error: 'Product ID and image ID required' }, { status: 400 });
    }

    const result = await setPrimaryProductImage(productId, imageId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    await logAdminAction({
      actorId: guard.auth.userId,
      action: 'set_primary_product_image',
      entityType: 'product',
      entityId: productId,
      afterState: { imageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set primary image error:', error);
    return NextResponse.json({ error: 'Failed to set primary image' }, { status: 500 });
  }
}

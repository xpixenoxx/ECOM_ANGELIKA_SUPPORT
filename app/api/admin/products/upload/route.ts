import { NextRequest, NextResponse } from 'next/server';
import { CONTENT_ADMIN_ROLES, logAdminAction, requireAdminApi } from '@/lib/supabase/admin-auth';
import { validateAndPersistAdminImage } from '@/lib/utils/storage-upload';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi(request, CONTENT_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const saved = await validateAndPersistAdminImage({
      buffer,
      originalName: file.name || 'product-upload.jpg',
      folder: 'products',
      prefix: 'product',
    });

    if (!saved.success) {
      return NextResponse.json({ success: false, error: saved.error }, { status: 400 });
    }

    await logAdminAction({
      actorId: guard.auth.userId,
      action: 'upload_product_image',
      entityType: 'media',
      entityId: saved.filename,
      metadata: { url: saved.url, provider: saved.storageProvider },
    });

    return NextResponse.json({
      success: true,
      url: saved.url,
      filename: saved.filename,
      size: saved.size,
    });
  } catch (error: any) {
    console.error('Product image upload error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to upload image' }, { status: 500 });
  }
}

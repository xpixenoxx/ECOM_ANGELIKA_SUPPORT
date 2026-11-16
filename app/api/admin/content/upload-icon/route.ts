import { NextRequest, NextResponse } from 'next/server';
import { CONTENT_ADMIN_ROLES, logAdminAction, requireAdminApi } from '@/lib/supabase/admin-auth';
import { MAX_UPLOAD_SIZE_BYTES } from '@/lib/utils/file-validation';
import { validateAndPersistAdminImage } from '@/lib/utils/storage-upload';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi(request, CONTENT_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
    const contentType = request.headers.get('content-type') || '';

    let buffer: Buffer;
    let originalName = 'icon.png';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
      }
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        return NextResponse.json({ success: false, error: 'File too large (max 10MB)' }, { status: 400 });
      }
      buffer = Buffer.from(await file.arrayBuffer());
      originalName = file.name || 'icon.png';
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      const { imageBase64, filename: customName } = body;

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400 });
      }

      if (imageBase64.length > 14 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: 'Payload too large (max 10MB decoded)' }, { status: 400 });
      }

      const match = imageBase64.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      const rawBase64 = match && match[2] ? match[2] : imageBase64;
      buffer = Buffer.from(rawBase64, 'base64');
      originalName = typeof customName === 'string' && customName ? customName : 'icon-pasted.png';
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported Content-Type' }, { status: 400 });
    }

    const saved = await validateAndPersistAdminImage({
      buffer,
      originalName,
      folder: 'icons',
      prefix: 'icon',
    });

    if (!saved.success) {
      return NextResponse.json({ success: false, error: saved.error }, { status: 400 });
    }

    await logAdminAction({
      actorId: guard.auth.userId,
      action: 'upload_icon_image',
      entityType: 'media',
      entityId: saved.filename,
      metadata: { url: saved.url, provider: saved.storageProvider },
    });

    return NextResponse.json({ success: true, url: saved.url });
  } catch (error: any) {
    console.error('Error handling icon upload:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}

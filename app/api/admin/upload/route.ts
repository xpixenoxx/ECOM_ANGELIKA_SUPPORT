export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { CONTENT_ADMIN_ROLES, logAdminAction, requireAdminApi } from '@/lib/supabase/admin-auth';
import { validateAndPersistAdminImage } from '@/lib/utils/storage-upload';

export const dynamic = 'force-dynamic';

type AllowedFolder = 'content' | 'products' | 'icons' | 'looks' | 'general';

function resolveFolder(raw: FormDataEntryValue | null): AllowedFolder {
  const value = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  if (value === 'products' || value === 'product') return 'products';
  if (value === 'icons' || value === 'icon') return 'icons';
  if (value === 'looks' || value === 'look') return 'looks';
  if (value === 'general') return 'general';
  return 'content';
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi(request, CONTENT_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const categoryOrTarget = formData.get('folder') || formData.get('category') || formData.get('target');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const folder = resolveFolder(categoryOrTarget);

    const saved = await validateAndPersistAdminImage({
      buffer,
      originalName: file.name || 'admin-upload.jpg',
      folder,
      prefix: typeof categoryOrTarget === 'string' && categoryOrTarget.trim()
        ? categoryOrTarget.trim().toLowerCase()
        : folder,
    });

    if (!saved.success) {
      return NextResponse.json({ success: false, error: saved.error }, { status: 400 });
    }

    await logAdminAction({
      actorId: guard.auth.userId,
      action: 'upload_admin_image',
      entityType: 'media',
      entityId: saved.filename,
      metadata: { folder, url: saved.url, provider: saved.storageProvider },
    });

    return NextResponse.json({
      success: true,
      url: saved.url,
      filename: saved.filename,
      size: saved.size,
      provider: saved.storageProvider,
    });
  } catch (error: any) {
    console.error('[api/admin/upload] error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}

import crypto from 'crypto';
import { hasValidServiceRoleKey, isCloudServerlessEnv } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { MAX_UPLOAD_SIZE_BYTES, validateImageBuffer } from './file-validation';

export interface StoredUploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  mimeType?: string;
  storageProvider?: 'supabase' | 'local';
  error?: string;
}

const DEFAULT_MEDIA_BUCKET = 'media';

function extractBaseName(originalName: string): string {
  const slashIdx = Math.max(originalName.lastIndexOf('/'), originalName.lastIndexOf('\\'));
  const fileOnly = slashIdx >= 0 ? originalName.slice(slashIdx + 1) : originalName;
  const dotIdx = fileOnly.lastIndexOf('.');
  return dotIdx > 0 ? fileOnly.slice(0, dotIdx) : fileOnly;
}

/**
 * Validates image buffer by magic bytes and persists to Supabase Storage
 * (when configured), falling back to local public directory in local dev only.
 * Cloudflare Workers safe: zero top-level fs/path imports.
 */
export async function validateAndPersistAdminImage(params: {
  buffer: Buffer;
  originalName: string;
  folder: 'content' | 'products' | 'icons' | 'looks' | 'general';
  prefix?: string;
  bucket?: string;
  maxBytes?: number;
}): Promise<StoredUploadResult> {
  const {
    buffer,
    originalName,
    folder,
    prefix = folder,
    bucket = DEFAULT_MEDIA_BUCKET,
    maxBytes = MAX_UPLOAD_SIZE_BYTES,
  } = params;

  const check = validateImageBuffer(buffer, maxBytes);
  if (!check.valid || !check.extension || !check.mimeType) {
    return { success: false, error: check.error || 'Invalid image' };
  }

  const sanitizedBase =
    extractBaseName(originalName || 'upload')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 32) || 'img';
  const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24) || 'img';
  const uniqueSuffix = crypto.randomBytes(4).toString('hex');
  const filename = `${safePrefix}-${sanitizedBase}-${Date.now()}-${uniqueSuffix}${check.extension}`;
  const storagePath = `${folder}/${filename}`;

  if (hasValidServiceRoleKey()) {
    try {
      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(storagePath, buffer, {
          contentType: check.mimeType,
          upsert: false,
          cacheControl: '31536000',
        });

      if (!uploadError) {
        const { data: pubData } = supabaseAdmin.storage.from(bucket).getPublicUrl(storagePath);
        if (pubData?.publicUrl) {
          return {
            success: true,
            url: pubData.publicUrl,
            filename,
            size: buffer.length,
            mimeType: check.mimeType,
            storageProvider: 'supabase',
          };
        }
      } else {
        console.warn('[validateAndPersistAdminImage] Supabase Storage upload fallback:', uploadError.message);
      }
    } catch (storageErr) {
      console.warn('[validateAndPersistAdminImage] Supabase Storage error:', storageErr);
    }
  }

  // Serverless / Cloudflare Workers / Vercel environments cannot write to local disk
  if (process.env.NODE_ENV === 'production' || isCloudServerlessEnv()) {
    return {
      success: false,
      error: 'Media storage bucket is not configured for production uploads.',
    };
  }

  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const localSubDir =
      folder === 'icons'
        ? path.join('public', 'uploads', 'icons')
        : folder === 'products'
          ? path.join('public', 'images', 'products')
          : path.join('public', 'images', 'uploads');

    const uploadDir = path.join(process.cwd(), localSubDir);
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const publicUrl =
      folder === 'icons'
        ? `/uploads/icons/${filename}`
        : folder === 'products'
          ? `/images/products/${filename}`
          : `/images/uploads/${filename}`;

    return {
      success: true,
      url: publicUrl,
      filename,
      size: buffer.length,
      mimeType: check.mimeType,
      storageProvider: 'local',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Local storage write failed.',
    };
  }
}

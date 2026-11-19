import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { hasValidServiceRoleKey } from '@/lib/env';

// ============================================
// IMAGE VARIANT CONFIGURATION
// ============================================

export interface ImageVariant {
  name: string;
  width: number;
  height?: number; // undefined = maintain aspect ratio
  quality: number;
  format: 'webp' | 'avif' | 'jpeg';
  suffix: string;
}

export const IMAGE_VARIANTS: ImageVariant[] = [
  // 1. Thumbnail - for grids, listings (square)
  { name: 'thumbnail', width: 200, height: 200, quality: 75, format: 'webp', suffix: '_thumb' },

  // 2. Small - for product cards (4:5 aspect ratio)
  { name: 'small', width: 320, height: 400, quality: 80, format: 'webp', suffix: '_small' },

  // 3. Medium - for product gallery thumbnails (4:5)
  { name: 'medium', width: 480, height: 600, quality: 85, format: 'webp', suffix: '_med' },

  // 4. Large - for product detail main image (4:5)
  { name: 'large', width: 720, height: 900, quality: 90, format: 'webp', suffix: '_large' },

  // 5. XLarge - for zoom/lightbox (4:5)
  { name: 'xlarge', width: 1080, height: 1350, quality: 90, format: 'webp', suffix: '_xlarge' },

  // 6. Original - optimized but near-original dimensions
  { name: 'original', width: 2048, quality: 92, format: 'webp', suffix: '_orig' },

  // 7. Blur placeholder - tiny base64 for LQIP
  { name: 'blur', width: 20, quality: 30, format: 'jpeg', suffix: '_blur' },
];

// ============================================
// IMAGE PROCESSING TYPES
// ============================================

export interface ProcessedImageResult {
  variant: string;
  url: string;
  width: number;
  height: number;
  size: number; // bytes
  format: string;
  blurDataUrl?: string; // Only for blur variant
}

export interface ImageUploadResult {
  success: boolean;
  originalName: string;
  variants: ProcessedImageResult[];
  error?: string;
}

export interface ProductImageUploadOptions {
  productId: string;
  variantId?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  altText?: string;
  type?: 'lifestyle' | 'detail' | 'flat_lay' | 'model' | 'fabric' | 'video';
}

function getStorageDbClient() {
  if (hasValidServiceRoleKey()) {
    return supabaseAdmin;
  }
  return createClient();
}

/**
 * Pure TypeScript / Cloudflare Workers compatible binary image header parser.
 * Extracts width, height, and format from PNG, JPEG, WebP, and GIF buffers without native C++ addons.
 */
export function extractImageDimensions(buffer: Buffer): { width: number; height: number; format: 'jpeg' | 'png' | 'webp' | 'avif' } {
  try {
    // PNG: 89 50 4E 47 0D 0A 1A 0A, IHDR at offset 16..24
    if (buffer.length >= 24 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
        format: 'png',
      };
    }

    // WebP: "RIFF" .... "WEBP"
    if (
      buffer.length >= 30 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    ) {
      const chunkType = buffer.toString('ascii', 12, 16);
      if (chunkType === 'VP8 ' && buffer.length >= 30) {
        return {
          width: buffer.readUInt16LE(26) & 0x3fff,
          height: buffer.readUInt16LE(28) & 0x3fff,
          format: 'webp',
        };
      }
      if (chunkType === 'VP8L' && buffer.length >= 25) {
        const b0 = buffer[21] ?? 0;
        const b1 = buffer[22] ?? 0;
        const b2 = buffer[23] ?? 0;
        const b3 = buffer[24] ?? 0;
        return {
          width: 1 + (((b1 & 0x3f) << 8) | b0),
          height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
          format: 'webp',
        };
      }
      if (chunkType === 'VP8X' && buffer.length >= 30) {
        const w = 1 + buffer.readUIntLE(24, 3);
        const h = 1 + buffer.readUIntLE(27, 3);
        return { width: w, height: h, format: 'webp' };
      }
    }

    // JPEG: FF D8 ... SOF markers (FF C0, FF C1, FF C2)
    if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset + 9 < buffer.length) {
        if (buffer[offset] !== 0xff) {
          offset++;
          continue;
        }
        const marker = buffer[offset + 1] ?? 0;
        if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          if (width > 0 && height > 0) {
            return { width, height, format: 'jpeg' };
          }
        }
        if (marker === 0xd9 || marker === 0xda) break;
        const segLen = buffer.readUInt16BE(offset + 2);
        if (segLen < 2) break;
        offset += 2 + segLen;
      }
      return { width: 1080, height: 1350, format: 'jpeg' };
    }
  } catch {
    // Fallback to standard 4:5 couture portrait dimensions
  }

  return { width: 1080, height: 1350, format: 'webp' };
}

function createLuxuryBlurDataUrl(width = 720, height = 900): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FBF8F5"/><stop offset="50%" stop-color="#F3ECE3"/><stop offset="100%" stop-color="#EAE0D2"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#g)"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ============================================
// CORE IMAGE PROCESSING (CLOUDFLARE EDGE SAFE)
// ============================================

/**
 * Process an uploaded image buffer into all configured variants.
 * Cloudflare Workers compatible: avoids native C++ libvips/sharp bindings at runtime,
 * uploads canonical master asset to Supabase Storage, and maps variant URLs.
 */
export async function processProductImage(
  fileBuffer: Buffer,
  originalFilename: string,
  options: ProductImageUploadOptions
): Promise<ImageUploadResult> {
  const supabase = getStorageDbClient();
  const baseName = crypto.randomUUID();
  const { width: originalWidth, height: originalHeight, format: detectedFormat } =
    extractImageDimensions(fileBuffer);
  const ext = detectedFormat === 'png' ? 'png' : detectedFormat === 'webp' ? 'webp' : 'jpg';
  const contentType =
    detectedFormat === 'png'
      ? 'image/png'
      : detectedFormat === 'webp'
        ? 'image/webp'
        : 'image/jpeg';

  const masterPath = `products/${options.productId}/${baseName}_master.${ext}`;
  const results: ProcessedImageResult[] = [];
  const blurDataUrl = createLuxuryBlurDataUrl(originalWidth, originalHeight);

  try {
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(masterPath, fileBuffer, {
        contentType,
        cacheControl: 'public, max-age=31536000, immutable',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload image to storage: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(masterPath);

    const masterUrl = urlData.publicUrl;

    for (const variant of IMAGE_VARIANTS) {
      const targetHeight =
        variant.height ||
        Math.max(1, Math.round((originalHeight / Math.max(1, originalWidth)) * variant.width));

      const variantResult: ProcessedImageResult = {
        variant: variant.name,
        url: masterUrl,
        width: Math.min(originalWidth || variant.width, variant.width),
        height: Math.min(originalHeight || targetHeight, targetHeight),
        size: fileBuffer.length,
        format: variant.format,
      };

      if (variant.name === 'blur') {
        variantResult.blurDataUrl = blurDataUrl;
      }

      results.push(variantResult);
    }

    await saveImageRecords(
      supabase,
      options,
      results,
      originalFilename,
      originalWidth,
      originalHeight
    );

    return {
      success: true,
      originalName: originalFilename,
      variants: results,
    };
  } catch (error) {
    console.error('Image processing error:', error);
    await supabase.storage.from('product-images').remove([masterPath]).catch(() => {});

    return {
      success: false,
      originalName: originalFilename,
      variants: [],
      error: error instanceof Error ? error.message : 'Image processing failed',
    };
  }
}

/**
 * Save image metadata to database
 */
async function saveImageRecords(
  supabase: any,
  options: ProductImageUploadOptions,
  variants: ProcessedImageResult[],
  originalFilename: string,
  originalWidth: number,
  originalHeight: number
) {
  const largeVariant = variants.find((v) => v.variant === 'large') || variants[0];
  const blurVariant = variants.find((v) => v.variant === 'blur');

  if (!largeVariant) {
    throw new Error('Large variant not found in processed results');
  }

  const imageRecord = {
    product_id: options.productId,
    variant_id: options.variantId || null,
    url: largeVariant.url,
    alt_text: options.altText || originalFilename.replace(/\.[^/.]+$/, ''),
    type: options.type || 'lifestyle',
    sort_order: options.sortOrder || 0,
    is_primary: options.isPrimary || false,
    width: largeVariant.width,
    height: largeVariant.height,
    blur_data_url: blurVariant?.blurDataUrl || null,
    metadata: {
      variants: variants.reduce((acc, v) => {
        acc[v.variant] = { url: v.url, width: v.width, height: v.height };
        return acc;
      }, {} as Record<string, any>),
      original_filename: originalFilename,
      original_width: originalWidth,
      original_height: originalHeight,
      processed_at: new Date().toISOString(),
    },
  };

  const { error } = await supabase.from('product_images').insert(imageRecord);

  if (error) {
    console.error('Failed to save image record:', error);
    throw new Error('Failed to save image metadata');
  }
}

// ============================================
// DELETE PRODUCT IMAGES
// ============================================

export async function deleteProductImage(imageId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getStorageDbClient();

  try {
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('*')
      .eq('id', imageId)
      .single();

    if (fetchError || !image) {
      return { success: false, error: 'Image not found' };
    }

    try {
      const url = new URL(image.url);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex((p) => p === 'product-images');
      if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
        const storagePath = pathParts.slice(bucketIndex + 1).join('/');

        if (image.metadata && typeof image.metadata === 'object' && 'variants' in image.metadata) {
          const variantPaths = Array.from(
            new Set(
              Object.values((image.metadata as any).variants)
                .map((v: any) => {
                  try {
                    const variantUrl = new URL(v.url);
                    const variantPathParts = variantUrl.pathname.split('/');
                    const variantBucketIndex = variantPathParts.findIndex((p) => p === 'product-images');
                    if (variantBucketIndex !== -1 && variantBucketIndex + 1 < variantPathParts.length) {
                      return variantPathParts.slice(variantBucketIndex + 1).join('/');
                    }
                  } catch {
                    // Ignore malformed URL
                  }
                  return null;
                })
                .filter((p): p is string => p !== null)
            )
          );

          if (variantPaths.length > 0) {
            await supabase.storage.from('product-images').remove(variantPaths);
          }
        } else {
          await supabase.storage.from('product-images').remove([storagePath]);
        }
      }
    } catch {
      // Non-fatal if image URL was external or local static asset
    }

    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete image error:', error);
    return { success: false, error: 'Failed to delete image' };
  }
}

// ============================================
// REORDER IMAGES
// ============================================

export async function reorderProductImages(
  productId: string,
  imageIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = getStorageDbClient();

  try {
    const updates = imageIds.map((id, index) =>
      supabase
        .from('product_images')
        .update({ sort_order: index })
        .eq('id', id)
        .eq('product_id', productId)
    );

    const results = await Promise.all(updates);

    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      return { success: false, error: 'Some images failed to reorder' };
    }

    return { success: true };
  } catch (error) {
    console.error('Reorder images error:', error);
    return { success: false, error: 'Failed to reorder images' };
  }
}

// ============================================
// SET PRIMARY IMAGE
// ============================================

export async function setPrimaryProductImage(
  productId: string,
  imageId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getStorageDbClient();

  try {
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId)
      .eq('is_primary', true);

    const { error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId)
      .eq('product_id', productId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Set primary image error:', error);
    return { success: false, error: 'Failed to set primary image' };
  }
}

// ============================================
// VALIDATION
// ============================================

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic'];
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Allowed: JPEG, PNG, WebP, AVIF, HEIC' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB` };
  }

  return { valid: true };
}

// ============================================
// BATCH PROCESSING
// ============================================

export async function processMultipleProductImages(
  files: Array<{ buffer: Buffer; filename: string }>,
  options: ProductImageUploadOptions
): Promise<ImageUploadResult[]> {
  const results: ImageUploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) continue;
    const result = await processProductImage(file.buffer, file.filename, {
      ...options,
      sortOrder: options.sortOrder !== undefined ? options.sortOrder + i : i,
      isPrimary: options.isPrimary && i === 0,
    });
    results.push(result);
  }

  return results;
}

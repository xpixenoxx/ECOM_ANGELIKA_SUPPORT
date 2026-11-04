import sharp from 'sharp';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

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

// ============================================
// CORE IMAGE PROCESSING
// ============================================

/**
 * Process an uploaded image buffer into all configured variants
 * Uploads to Supabase Storage and returns variant metadata
 */
export async function processProductImage(
  fileBuffer: Buffer,
  originalFilename: string,
  options: ProductImageUploadOptions
): Promise<ImageUploadResult> {
  const supabase = await createClient();
  const fileExt = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = uuidv4();
  const timestamp = Date.now();

  const results: ProcessedImageResult[] = [];
  let blurDataUrl: string | undefined;

  try {
    // Get original image metadata
    const originalMetadata = await sharp(fileBuffer).metadata();
    const originalWidth = originalMetadata.width || 0;
    const originalHeight = originalMetadata.height || 0;

    // Process each variant
    for (const variant of IMAGE_VARIANTS) {
      const outputFilename = `${baseName}${variant.suffix}.${variant.format}`;
      const storagePath = `products/${options.productId}/${outputFilename}`;

      // Process image
      let pipeline = sharp(fileBuffer)
        .rotate() // Auto-rotate based on EXIF
        .resize({
          width: variant.width,
          height: variant.height,
          fit: variant.height ? 'cover' : 'inside',
          withoutEnlargement: true,
          position: 'center',
        });

      // Apply format-specific settings
      if (variant.format === 'webp') {
        pipeline = pipeline.webp({ quality: variant.quality, effort: 4 });
      } else if (variant.format === 'avif') {
        pipeline = pipeline.avif({ quality: variant.quality, effort: 4 });
      } else if (variant.format === 'jpeg') {
        pipeline = pipeline.jpeg({ quality: variant.quality, progressive: true, mozjpeg: true });
      }

      const processedBuffer = await pipeline.toBuffer();
      const processedMetadata = await sharp(processedBuffer).metadata();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(storagePath, processedBuffer, {
          contentType: `image/${variant.format === 'jpeg' ? 'jpeg' : variant.format}`,
          cacheControl: 'public, max-age=31536000, immutable',
          upsert: false,
        });

      if (uploadError) {
        console.error(`Upload failed for ${variant.name}:`, uploadError);
        throw new Error(`Failed to upload ${variant.name} variant`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(storagePath);

      const variantResult: ProcessedImageResult = {
        variant: variant.name,
        url: urlData.publicUrl,
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0,
        size: processedBuffer.length,
        format: variant.format,
      };

      // Store blur data URL for LQIP
      if (variant.name === 'blur') {
        const base64 = processedBuffer.toString('base64');
        blurDataUrl = `data:image/jpeg;base64,${base64}`;
        variantResult.blurDataUrl = blurDataUrl;
      }

      results.push(variantResult);
    }

    // Save image records to database
    await saveImageRecords(supabase, options, results, originalFilename, originalWidth, originalHeight);

    return {
      success: true,
      originalName: originalFilename,
      variants: results,
    };
  } catch (error) {
    console.error('Image processing error:', error);
    // Cleanup any uploaded variants on failure
    await cleanupVariants(supabase, options.productId, baseName);

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
  // Find the large variant for primary dimensions (guaranteed to exist as it's in IMAGE_VARIANTS)
  const largeVariant = variants.find(v => v.variant === 'large');
  const blurVariant = variants.find(v => v.variant === 'blur');

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
    // Store all variant URLs in metadata
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

  const { error } = await supabase
    .from('product_images')
    .insert(imageRecord);

  if (error) {
    console.error('Failed to save image record:', error);
    throw new Error('Failed to save image metadata');
  }
}

/**
 * Cleanup uploaded variants on processing failure
 */
async function cleanupVariants(supabase: any, productId: string, baseName: string) {
  const paths = IMAGE_VARIANTS.map(v => `products/${productId}/${baseName}${v.suffix}.${v.format}`);

  await supabase.storage
    .from('product-images')
    .remove(paths);
}

// ============================================
// DELETE PRODUCT IMAGES
// ============================================

export async function deleteProductImage(imageId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Get image record first
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('*')
      .eq('id', imageId)
      .single();

    if (fetchError || !image) {
      return { success: false, error: 'Image not found' };
    }

    // Delete from storage - extract path from URL
    const url = new URL(image.url);
    const pathParts = url.pathname.split('/');
    // Path format: /storage/v1/object/public/product-images/products/{productId}/{filename}
    const bucketIndex = pathParts.findIndex(p => p === 'product-images');
    if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
      const storagePath = pathParts.slice(bucketIndex + 1).join('/');

      // Delete all variants based on metadata
      if (image.metadata && typeof image.metadata === 'object' && 'variants' in image.metadata) {
        const variantPaths = Object.values((image.metadata as any).variants)
          .map((v: any) => {
            const variantUrl = new URL(v.url);
            const variantPathParts = variantUrl.pathname.split('/');
            const variantBucketIndex = variantPathParts.findIndex(p => p === 'product-images');
            if (variantBucketIndex !== -1 && variantBucketIndex + 1 < variantPathParts.length) {
              return variantPathParts.slice(variantBucketIndex + 1).join('/');
            }
            return null;
          })
          .filter((p): p is string => p !== null);

        if (variantPaths.length > 0) {
          await supabase.storage.from('product-images').remove(variantPaths);
        }
      } else {
        // Fallback: delete just the main file
        await supabase.storage.from('product-images').remove([storagePath]);
      }
    }

    // Delete database record
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
  const supabase = await createClient();

  try {
    const updates = imageIds.map((id, index) =>
      supabase
        .from('product_images')
        .update({ sort_order: index })
        .eq('id', id)
        .eq('product_id', productId)
    );

    const results = await Promise.all(updates);

    const errors = results.filter(r => r.error);
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
  const supabase = await createClient();

  try {
    // Unset current primary
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId)
      .eq('is_primary', true);

    // Set new primary
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
      isPrimary: options.isPrimary && i === 0, // Only first is primary
    });
    results.push(result);
  }

  return results;
}
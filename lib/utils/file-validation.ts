export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface MagicByteValidationResult {
  valid: boolean;
  detectedType?: 'jpeg' | 'png' | 'webp' | 'gif' | 'avif';
  mimeType?: string;
  extension?: string;
  error?: string;
}

/**
 * Validates uploaded image buffers using file magic bytes (signatures)
 * rather than trusting client-supplied MIME headers or file extensions.
 * Intentionally excludes image/svg+xml to prevent stored XSS.
 */
export function validateImageBuffer(
  buffer: Buffer,
  maxBytes: number = MAX_UPLOAD_SIZE_BYTES
): MagicByteValidationResult {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'Uploaded file is empty' };
  }

  if (buffer.length > maxBytes) {
    return {
      valid: false,
      error: `File too large. Maximum allowed size is ${Math.round(maxBytes / (1024 * 1024))}MB`,
    };
  }

  if (buffer.length < 12) {
    return { valid: false, error: 'Invalid or corrupted image file' };
  }

  // Reject SVG / XML / HTML payloads masquerading as images
  const headText = buffer.subarray(0, 256).toString('utf8').trimStart().toLowerCase();
  if (headText.startsWith('<svg') || headText.startsWith('<?xml') || headText.startsWith('<!doctype') || headText.startsWith('<html')) {
    return { valid: false, error: 'SVG and XML/HTML files are not permitted for security reasons' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedType: 'jpeg', mimeType: 'image/jpeg', extension: '.jpg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedType: 'png', mimeType: 'image/png', extension: '.png' };
  }

  // WebP: RIFF .... WEBP
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { valid: true, detectedType: 'webp', mimeType: 'image/webp', extension: '.webp' };
  }

  // GIF: GIF87a or GIF89a
  const gifHeader = buffer.subarray(0, 6).toString('ascii');
  if (gifHeader === 'GIF87a' || gifHeader === 'GIF89a') {
    return { valid: true, detectedType: 'gif', mimeType: 'image/gif', extension: '.gif' };
  }

  // AVIF / ISOBMFF: .... ftyp avif / avis / mif1
  if (buffer.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = buffer.subarray(8, 12).toString('ascii');
    if (brand === 'avif' || brand === 'avis' || brand === 'mif1') {
      return { valid: true, detectedType: 'avif', mimeType: 'image/avif', extension: '.avif' };
    }
  }

  return {
    valid: false,
    error: 'Unsupported file format. Only valid JPEG, PNG, WebP, GIF, or AVIF images are allowed.',
  };
}

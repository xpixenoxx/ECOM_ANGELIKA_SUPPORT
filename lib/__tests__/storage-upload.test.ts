import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateAndPersistAdminImage } from '../utils/storage-upload';
import fs from 'fs/promises';
import path from 'path';

describe('validateAndPersistAdminImage local storage fallback', () => {
  const createdFiles: string[] = [];

  beforeEach(() => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    for (const filePath of createdFiles) {
      await fs.unlink(filePath).catch(() => {});
    }
    createdFiles.length = 0;
  });

  it('persists a valid PNG buffer to local public directory in local dev', async () => {
    // 16-byte valid PNG buffer
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    ]);

    const result = await validateAndPersistAdminImage({
      buffer: pngBuffer,
      originalName: 'test-hero.png',
      folder: 'content',
      prefix: 'hero',
    });

    expect(result.success).toBe(true);
    expect(result.url).toBeDefined();
    expect(result.url).toMatch(/^\/images\/uploads\/hero-test-hero-/);
    expect(result.filename).toBeDefined();

    if (result.filename) {
      const fullPath = path.join(process.cwd(), 'public', 'images', 'uploads', result.filename);
      createdFiles.push(fullPath);
      const exists = await fs.access(fullPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    }
  });

  it('rejects invalid image content', async () => {
    const invalidBuffer = Buffer.from('hello world not an image');
    const result = await validateAndPersistAdminImage({
      buffer: invalidBuffer,
      originalName: 'test.jpg',
      folder: 'content',
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Unsupported file format/i);
  });
});

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'icons');

async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    // Ignore if already exists
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();

    const contentType = request.headers.get('content-type') || '';

    // Handle Multipart Form Data (file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Determine extension safely
      const fileName = file.name || 'icon.png';
      let ext = path.extname(fileName).toLowerCase();
      if (!ext) {
        if (file.type === 'image/svg+xml') ext = '.svg';
        else if (file.type === 'image/png') ext = '.png';
        else if (file.type === 'image/jpeg') ext = '.jpg';
        else if (file.type === 'image/webp') ext = '.webp';
        else ext = '.png';
      }

      const filename = `icon-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(UPLOAD_DIR, filename);

      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/icons/${filename}`;
      return NextResponse.json({ success: true, url: publicUrl });
    }

    // Handle JSON (Base64 pasted images)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { imageBase64, filename: customName } = body;

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400 });
      }

      // Extract format from base64 header (e.g. data:image/png;base64,...)
      const match = imageBase64.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      let buffer: Buffer;
      let ext = '.png';

      if (match && match[1] && match[2]) {
        const format = match[1].toLowerCase();
        ext = format === 'svg+xml' ? '.svg' : `.${format}`;
        buffer = Buffer.from(match[2], 'base64');
      } else {
        // Raw base64 string
        buffer = Buffer.from(imageBase64, 'base64');
      }

      const filename = customName
        ? `${path.parse(customName).name}-${Date.now()}${ext}`
        : `icon-pasted-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

      const filePath = path.join(UPLOAD_DIR, filename);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/icons/${filename}`;
      return NextResponse.json({ success: true, url: publicUrl });
    }

    return NextResponse.json({ success: false, error: 'Unsupported Content-Type' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling icon upload:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const target = (formData.get('target') as string) || 'hero';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate extension/mime
    const extMatch = file.name.match(/\.(jpg|jpeg|png|webp|svg|avif|gif)$/i);
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/avif', 'image/gif'];
    if (!validMimes.includes(file.type) && !extMatch) {
      return NextResponse.json({
        success: false,
        error: 'Only image files (JPG, PNG, WebP, SVG, AVIF, GIF) are allowed',
      }, { status: 400 });
    }

    const originalExt = path.extname(file.name) || (extMatch ? extMatch[0] : '.jpg');
    const cleanExt = originalExt.toLowerCase();
    const safeTarget = target.replace(/[^a-zA-Z0-9_-]/g, '') || 'upload';
    const timestamp = Date.now();
    const sanitizedBase = path.basename(file.name, originalExt).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const filename = `${safeTarget}-${sanitizedBase}-${timestamp}${cleanExt}`;

    const uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/images/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Content image upload error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to upload image' }, { status: 500 });
  }
}


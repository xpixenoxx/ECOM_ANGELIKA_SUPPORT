import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name || 'product-upload.jpg';
    const extMatch = fileName.match(/\.(jpg|jpeg|png|webp|svg|avif|gif)$/i);
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/avif', 'image/gif'];

    if (!validMimes.includes(file.type) && !extMatch) {
      return NextResponse.json({
        success: false,
        error: 'Only image files (JPG, PNG, WebP, SVG, AVIF, GIF) are allowed',
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalExt = path.extname(fileName) || (extMatch ? extMatch[0] : '.jpg');
    const cleanExt = originalExt.toLowerCase();
    const timestamp = Date.now();
    const sanitizedBase = path.basename(fileName, originalExt)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30) || 'img';
    const filename = `product-${timestamp}-${sanitizedBase}${cleanExt}`;

    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/images/products/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Product image upload error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to upload image' }, { status: 500 });
  }
}


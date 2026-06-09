import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/server/lib/cloudinary';
import sharp from 'sharp';
import path from 'path';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    if (!files.length) return NextResponse.json({ error: 'No files' }, { status: 400 });

    const results = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Optimize image to 1:1 aspect ratio white padded canvas and convert to WebP
        const optimizedBuffer = await sharp(buffer)
          .resize({
            width: 800,
            height: 800,
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .webp({ quality: 82 })
          .toBuffer();

        const parsed = path.parse(file.name);
        const slugged = slugify(parsed.name);
        const name = `${Date.now()}-${slugged || 'image'}`;

        return uploadImage(optimizedBuffer, name);
      })
    );

    return NextResponse.json({
      urls: results.map((r) => r.url),
      publicIds: results.map((r) => r.publicId),
    });
  } catch (error) {
    console.error('Upload optimization error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}


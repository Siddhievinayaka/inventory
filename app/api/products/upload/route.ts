import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/server/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    if (!files.length) return NextResponse.json({ error: 'No files' }, { status: 400 });

    const results = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const name = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        return uploadImage(buffer, name);
      })
    );

    return NextResponse.json({
      urls: results.map((r) => r.url),
      publicIds: results.map((r) => r.publicId),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

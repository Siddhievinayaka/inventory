import { NextRequest, NextResponse } from 'next/server';
import { analyzeProductImage } from '@/server/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const product = await req.json();

    if (!product.images?.length) {
      return NextResponse.json(
        { error: 'Upload at least one image first' },
        { status: 400 }
      );
    }

    const result = await analyzeProductImage(product.images[0], {
      title: product.title,
      category: product.category,
      subcategory: product.subcategory,
      productType: product.productType,
      material: product.material,
      style: product.style,
      occasion: product.occasion,
    });

    return NextResponse.json({
      description: result.description || '',
      shortDescription: result.shortDescription || '',
    });
  } catch (e: any) {
    console.error('[AI Description Error]', e?.message || e);
    return NextResponse.json({ error: e?.message || 'Generation failed' }, { status: 500 });
  }
}

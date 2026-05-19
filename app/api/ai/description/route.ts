import { NextRequest, NextResponse } from 'next/server';
import { generateDescription, analyzeProductImage } from '@/server/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const product = await req.json();

    // Run vision analysis and description generation in parallel
    const [description, visionResult] = await Promise.all([
      generateDescription(product),
      product.images?.length ? analyzeProductImage(product.images[0]).catch(() => ({})) : Promise.resolve({}),
    ]);

    return NextResponse.json({
      description,
      suggestions: {
        title: visionResult.suggestedTitle || '',
        category: visionResult.suggestedCategory || '',
        material: visionResult.suggestedMaterial || '',
        style: visionResult.suggestedStyle || '',
        tags: visionResult.suggestedTags || [],
        confidence: visionResult.confidence || null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Generation failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { analyzeProductImage } from '@/server/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    const result = await analyzeProductImage(imageUrl);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('Analyze error:', e?.message || e);
    return NextResponse.json({ error: e?.message || 'Analysis failed' }, { status: 500 });
  }
}

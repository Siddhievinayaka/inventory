import { NextRequest, NextResponse } from 'next/server';
import { generateSEO } from '@/server/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const product = await req.json();
    const result = await generateSEO(product);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Generation failed' }, { status: 500 });
  }
}

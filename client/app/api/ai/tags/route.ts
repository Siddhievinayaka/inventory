import { NextRequest, NextResponse } from 'next/server';
import { generateTags } from '@/server/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const product = await req.json();
    const tags = await generateTags(product);
    return NextResponse.json(tags);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Generation failed' }, { status: 500 });
  }
}

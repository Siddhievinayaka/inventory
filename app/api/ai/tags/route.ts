import { NextRequest, NextResponse } from 'next/server';
import { generateTags } from '@/server/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    console.log('Tags API called');
    const product = await req.json();
    console.log('Product data:', product);
    
    const tags = await generateTags(product);
    console.log('Generated tags:', tags);
    
    return NextResponse.json(tags);
  } catch (e: any) {
    console.error('Tags error:', e);
    return NextResponse.json({ error: e?.message || 'Generation failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { generateDescription } from '@/server/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    console.log('Description API called');
    const product = await req.json();
    console.log('Product data:', product);
    
    const description = await generateDescription(product);
    console.log('Generated description:', description);
    
    return NextResponse.json(description);
  } catch (e: any) {
    console.error('Description error:', e);
    return NextResponse.json({ error: e?.message || 'Generation failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/server/lib/db';
import Product from '@/server/models/Product';
import { verifyToken } from '@/server/lib/jwt';

function auth(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  return token ? verifyToken(token) : null;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const product = await Product.findById(params.id);
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const data = await req.json();
  const product = await Product.findByIdAndUpdate(params.id, data, { new: true });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  await Product.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const original = await Product.findById(params.id).lean() as any;
  if (!original) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { _id, createdAt, updatedAt, sku, slug, ...rest } = original;
  const ts = Date.now().toString(36).toUpperCase();
  const copy = await Product.create({
    ...rest,
    title: `${rest.title} (Copy)`,
    sku: `RSV-${ts}-COPY`,
    slug: `${rest.slug || ''}-copy-${ts.toLowerCase()}`,
    status: 'Draft',
  });
  return NextResponse.json(copy, { status: 201 });
}

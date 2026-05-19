import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/server/lib/db';
import Product from '@/server/models/Product';
import { verifyToken } from '@/server/lib/jwt';

function auth(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  return token && verifyToken(token);
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();

  const { searchParams } = req.nextUrl;
  const query: any = {};
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { sku: { $regex: search, $options: 'i' } },
  ];
  if (category) query.category = category;
  if (status) query.status = status;

  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(query),
  ]);

  return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const data = await req.json();
  const product = await Product.create(data);
  return NextResponse.json(product, { status: 201 });
}

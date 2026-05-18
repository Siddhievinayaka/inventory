import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/server/lib/db';
import Product from '@/server/models/Product';
import { verifyToken } from '@/server/lib/jwt';

function getToken(req: NextRequest) {
  return req.headers.get('authorization')?.split(' ')[1];
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { searchParams } = req.nextUrl;
  const query: any = {};
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  if (search) query.title = { $regex: search, $options: 'i' };
  if (category) query.category = category;
  if (status) query.status = status;

  const products = await Product.find(query).sort({ createdAt: -1 });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const data = await req.json();
  const product = await Product.create(data);
  return NextResponse.json(product, { status: 201 });
}

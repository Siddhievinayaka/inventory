import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/server/lib/db';
import { verifyToken } from '@/server/lib/jwt';
import {
  Category, Subcategory, ProductType, Material,
  Style, Occasion, Color, Size, Tag,
  SpecificationLabel, Feature, CareInstruction,
} from '@/server/models/Master';

const MODELS: Record<string, any> = {
  categories: Category,
  subcategories: Subcategory,
  productTypes: ProductType,
  materials: Material,
  styles: Style,
  occasions: Occasion,
  colors: Color,
  sizes: Size,
  tags: Tag,
  specifications: SpecificationLabel,
  features: Feature,
  careInstructions: CareInstruction,
};

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function auth(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  return token && verifyToken(token);
}

export async function GET(req: NextRequest, { params }: { params: { collection: string } }) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const Model = MODELS[params.collection];
  if (!Model) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await connectDB();
  const search = req.nextUrl.searchParams.get('search') || '';
  const query = search ? { name: { $regex: search, $options: 'i' } } : {};
  const items = await Model.find(query).sort({ name: 1 }).limit(50);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest, { params }: { params: { collection: string } }) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const Model = MODELS[params.collection];
  if (!Model) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await connectDB();
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const slug = slugify(name);
  const existing = await Model.findOne({ slug });
  if (existing) return NextResponse.json(existing);

  const item = await Model.create({ name: name.trim(), slug });
  return NextResponse.json(item, { status: 201 });
}

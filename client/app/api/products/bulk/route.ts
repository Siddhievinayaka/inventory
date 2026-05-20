import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/server/lib/db';
import Product from '@/server/models/Product';
import { verifyToken } from '@/server/lib/jwt';

function auth(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  return token && verifyToken(token);
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();

  const { action, ids, payload } = await req.json();
  if (!ids?.length) return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });

  let update: any = {};

  switch (action) {
    case 'publish':       update = { status: 'Published' }; break;
    case 'draft':         update = { status: 'Draft' }; break;
    case 'archive':       update = { status: 'Archived' }; break;
    case 'out_of_stock':  update = { stockStatus: 'Out of Stock' }; break;
    case 'in_stock':      update = { stockStatus: 'In Stock' }; break;
    case 'new_arrival':   update = { $addToSet: { tags: 'new arrival' } }; break;
    case 'featured':      update = { $addToSet: { tags: 'featured' } }; break;
    case 'category':      update = { category: payload?.category }; break;
    case 'tags':          update = { $addToSet: { tags: { $each: payload?.tags || [] } } }; break;
    case 'discount': {
      const disc = parseFloat(payload?.discountPercentage);
      if (isNaN(disc) || disc < 0 || disc >= 100) {
        return NextResponse.json({ error: 'Invalid discount' }, { status: 400 });
      }
      const products = await Product.find({ _id: { $in: ids } });
      await Promise.all(products.map((p) => {
        const fp = (p.finalPrice || p.sellingPrice) as number;
        const mrp = fp / (1 - disc / 100);
        return p.updateOne({ discountPercentage: disc, mrp: parseFloat(mrp.toFixed(2)) });
      }));
      return NextResponse.json({ success: true, count: products.length });
    }
    case 'pricing': {
      // Recalculate MRP from sellingPrice + shippingCharge + discount
      const products = await Product.find({ _id: { $in: ids } });
      const disc = payload?.discountPercentage;
      await Promise.all(products.map((p) => {
        const sp = payload?.sellingPrice ?? p.sellingPrice;
        const shipping = payload?.shippingCharge ?? p.shippingCharge;
        const d = disc ?? p.discountPercentage;
        const fp = sp + shipping;
        const mrp = d < 100 ? fp / (1 - d / 100) : fp;
        return p.updateOne({ sellingPrice: sp, shippingCharge: shipping, discountPercentage: d, finalPrice: fp, mrp });
      }));
      return NextResponse.json({ success: true, count: products.length });
    }
    case 'delete':
      await Product.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({ success: true, count: ids.length });
    case 'export': {
      const products = await Product.find({ _id: { $in: ids } }).lean();
      return NextResponse.json({ products });
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  const result = await Product.updateMany({ _id: { $in: ids } }, update);
  return NextResponse.json({ success: true, count: result.modifiedCount });
}

import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  title: string;
  category: string;
  mrp: number;
  sellingPrice: number;
  quantity: number;
  material: string;
  dimensions: string;
  description: string;
  tags: string[];
  status: 'Draft' | 'Review' | 'Published' | 'Sold';
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sku: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    mrp: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, default: 1, min: 0 },
    material: { type: String, default: '' },
    dimensions: { type: String, default: '' },
    description: { type: String, default: '' },
    tags: [{ type: String, lowercase: true, trim: true }],
    status: { type: String, enum: ['Draft', 'Review', 'Published', 'Sold'], default: 'Draft' },
    images: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

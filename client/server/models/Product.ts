import mongoose, { Schema, Document } from 'mongoose';

export interface IImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
}

export interface ISpec {
  label: string;
  value: string;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  brand: string;
  productCollection: string;

  category: string;
  subcategory: string;
  productType: string;
  material: string;
  style: string;
  occasion: string;

  mrp: number;
  discountPercentage: number;
  sellingPrice: number;
  shippingCharge: number;
  finalPrice: number;

  stockStatus: string;
  quantity: number;
  lowStockThreshold: number;
  availabilityType: string;

  specifications: ISpec[];
  colors: string[];
  sizes: string[];
  variants: string[];
  keyFeatures: string[];
  careInstructions: string[];

  tags: string[];
  seoTitle: string;
  seoDescription: string;
  searchKeywords: string[];

  dispatchTime: string;
  estimatedDelivery: string;
  returnAvailable: boolean;

  images: IImage[];
  status: 'Draft' | 'Review' | 'Published' | 'Archived';

  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImage>({
  url: { type: String, required: true },
  publicId: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
});

const SpecSchema = new Schema<ISpec>({
  label: { type: String, required: true },
  value: { type: String, required: true },
});

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    brand: { type: String, default: '' },
    productCollection: { type: String, default: '' },

    category: { type: String, default: '' },
    subcategory: { type: String, default: '' },
    productType: { type: String, default: '' },
    material: { type: String, default: '' },
    style: { type: String, default: '' },
    occasion: { type: String, default: '' },

    mrp: { type: Number, default: 0, min: 0 },
    discountPercentage: { type: Number, default: 35, min: 0, max: 100 },
    sellingPrice: { type: Number, default: 0, min: 0 },
    shippingCharge: { type: Number, default: 0, min: 0 },
    finalPrice: { type: Number, default: 0, min: 0 },

    stockStatus: { type: String, enum: ['In Stock', 'Out of Stock', 'On Demand', 'Pre Order'], default: 'In Stock' },
    quantity: { type: Number, default: 1, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    availabilityType: { type: String, enum: ['Ready To Ship', 'Made To Order'], default: 'Ready To Ship' },

    specifications: [SpecSchema],
    colors: [{ type: String }],
    sizes: [{ type: String }],
    variants: [{ type: String }],
    keyFeatures: [{ type: String }],
    careInstructions: [{ type: String }],

    tags: [{ type: String, lowercase: true, trim: true }],
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    searchKeywords: [{ type: String }],

    dispatchTime: { type: String, default: '' },
    estimatedDelivery: { type: String, default: '' },
    returnAvailable: { type: Boolean, default: false },

    images: [ImageSchema],
    status: { type: String, enum: ['Draft', 'Review', 'Published', 'Archived'], default: 'Draft' },
  },
  { timestamps: true }
);

ProductSchema.index({ title: 'text', tags: 'text', searchKeywords: 'text' });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ sku: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

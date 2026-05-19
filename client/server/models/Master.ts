import mongoose, { Schema } from 'mongoose';

const masterSchema = (name: string) => {
  const schema = new Schema(
    {
      name: { type: String, required: true, trim: true },
      slug: { type: String, required: true, trim: true, lowercase: true },
    },
    { timestamps: true }
  );
  schema.index({ slug: 1 }, { unique: true });
  return mongoose.models[name] || mongoose.model(name, schema);
};

export const Category = masterSchema('Category');
export const Subcategory = masterSchema('Subcategory');
export const ProductType = masterSchema('ProductType');
export const Material = masterSchema('Material');
export const Style = masterSchema('Style');
export const Occasion = masterSchema('Occasion');
export const Color = masterSchema('Color');
export const Size = masterSchema('Size');
export const Tag = masterSchema('Tag');
export const SpecificationLabel = masterSchema('SpecificationLabel');
export const Feature = masterSchema('Feature');
export const CareInstruction = masterSchema('CareInstruction');

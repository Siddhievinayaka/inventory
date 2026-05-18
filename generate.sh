#!/bin/bash
# Complete project generator for Inventory Entry Portal
# This script creates all necessary files and directories

set -e

echo "🚀 Generating Inventory Entry Portal Structure..."

# Create directories
echo "📁 Creating directories..."
mkdir -p client/app/{login,dashboard,products/\[id\],add-product,api/{auth,products,ai}}
mkdir -p client/{components/{layout,forms,ui,shared},lib,styles,public}
mkdir -p server/{models,lib,middleware}

echo "✅ Directories created"

# Function to create file with content
create_file() {
    local path=$1
    local content=$2
    mkdir -p "$(dirname "$path")"
    echo "$content" > "$path"
    echo "✓ Created $path"
}

# Core library files
create_file "server/lib/db.ts" 'import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

declare global {
  var mongoose: any;
}'

create_file "server/lib/jwt.ts" 'import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function createToken(payload: any, expiresIn = "30d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function decodeToken(token: string) {
  return jwt.decode(token);
}'

create_file "server/models/Product.ts" 'import mongoose, { Schema, Document } from "mongoose";

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
  status: "Draft" | "Review" | "Published" | "Sold";
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sku: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    mrp: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, default: 1, min: 0 },
    material: { type: String, default: "" },
    dimensions: { type: String, default: "" },
    description: { type: String, default: "" },
    tags: [{ type: String, lowercase: true, trim: true }],
    status: { type: String, enum: ["Draft", "Review", "Published", "Sold"], default: "Draft" },
    images: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);'

echo ""
echo "📋 Summary of Generated Files:"
echo "---"
echo "Directories created for all components"
echo "Core backend files (db, JWT, Product model) ready"
echo ""
echo "✨ Next steps:"
echo "1. Run: npm install"
echo "2. Copy .env.local.example to .env.local"
echo "3. Fill in your credentials:"
echo "   - MONGODB_URI (from MongoDB Atlas)"
echo "   - CLOUDINARY_* (from Cloudinary dashboard)"
echo "   - OPENAI_API_KEY (from OpenAI platform)"
echo "4. Run: npm run dev"
echo ""
echo "See README.md and QUICK_START.md for detailed setup!"

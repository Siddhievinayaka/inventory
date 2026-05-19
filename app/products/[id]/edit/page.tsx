'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { ProductForm } from '@/components/forms/ProductForm';
import { apiProducts } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiProducts.get(params.id)
      .then((r) => setProduct(r.data))
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <ProtectedLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/products/${params.id}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-bold text-gray-900">Edit Product</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full" />
          </div>
        ) : product ? (
          <ProductForm
            mode="edit"
            initialData={{
              ...product,
              mrp: String(product.mrp || ''),
              discountPercentage: String(product.discountPercentage || '35'),
              sellingPrice: String(product.sellingPrice || ''),
              shippingCharge: String(product.shippingCharge || '0'),
              finalPrice: String(product.finalPrice || ''),
              quantity: String(product.quantity || '1'),
              lowStockThreshold: String(product.lowStockThreshold || '5'),
            }}
          />
        ) : (
          <p className="text-center py-20 text-gray-400">Product not found</p>
        )}
      </div>
    </ProtectedLayout>
  );
}

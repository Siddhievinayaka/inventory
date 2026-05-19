import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { ProductForm } from '@/components/forms/ProductForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AddProductPage() {
  return (
    <ProtectedLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/products" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} /> Products
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-bold text-gray-900">Add New Product</h1>
        </div>
        <ProductForm mode="create" />
      </div>
    </ProtectedLayout>
  );
}

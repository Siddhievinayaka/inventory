import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { ProductForm } from '@/components/forms/ProductForm';

export default function AddProductPage() {
  return (
    <ProtectedLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Add New Product</h1>
        <ProductForm />
      </div>
    </ProtectedLayout>
  );
}

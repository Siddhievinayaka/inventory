'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiProducts } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Trash2, Edit } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    apiProducts.get(params.id).then((r) => setProduct(r.data)).catch(() => toast.error('Product not found')).finally(() => setLoading(false));
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Delete this product?')) return;
    setDeleting(true);
    try {
      await apiProducts.delete(params.id);
      toast.success('Product deleted');
      router.push('/products');
    } catch { toast.error('Delete failed'); setDeleting(false); }
  };

  if (loading) return <ProtectedLayout><div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full" /></div></ProtectedLayout>;
  if (!product) return <ProtectedLayout><p className="text-center py-20 text-gray-400">Product not found</p></ProtectedLayout>;

  return (
    <ProtectedLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/products" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => router.push(`/products/${params.id}/edit`)}>
              <Edit size={14} /> Edit
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete} isLoading={deleting}>
              <Trash2 size={14} /> Delete
            </Button>
          </div>
        </div>

        {product.images?.length > 0 && (
          <Card className="p-3">
            <img src={product.images[activeImg]} alt="" className="w-full h-64 object-contain rounded-lg bg-gray-50" />
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {product.images.map((url: string, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-brand-500' : 'border-transparent'}`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900">{product.title}</h1>
              <p className="text-sm text-gray-400">{product.sku}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${product.status === 'Published' ? 'bg-green-100 text-green-700' : product.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
              {product.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-400 text-xs">MRP</p><p className="font-medium">{formatCurrency(product.mrp)}</p></div>
            <div><p className="text-gray-400 text-xs">Selling Price</p><p className="font-semibold text-brand-700">{formatCurrency(product.sellingPrice)}</p></div>
            <div><p className="text-gray-400 text-xs">Category</p><p className="font-medium">{product.category}</p></div>
            <div><p className="text-gray-400 text-xs">Quantity</p><p className="font-medium">{product.quantity}</p></div>
            {product.material && <div><p className="text-gray-400 text-xs">Material</p><p className="font-medium">{product.material}</p></div>}
            {product.dimensions && <div><p className="text-gray-400 text-xs">Dimensions</p><p className="font-medium">{product.dimensions}</p></div>}
            <div><p className="text-gray-400 text-xs">Added</p><p className="font-medium">{formatDate(product.createdAt)}</p></div>
          </div>

          {product.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700">{product.description}</p>
            </div>
          )}

          {product.tags?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </ProtectedLayout>
  );
}

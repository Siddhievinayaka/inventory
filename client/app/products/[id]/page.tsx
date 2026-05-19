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
import { ArrowLeft, Trash2, Edit, Package } from 'lucide-react';

function Field({ label, value }: { label: string; value?: any }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pt-4 mt-4 border-t border-gray-100 first:border-0 first:pt-0 first:mt-0">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{title}</p>
      {children}
    </div>
  );
}

const statusColors: Record<string, string> = {
  Published: 'bg-green-100 text-green-700',
  Draft: 'bg-yellow-100 text-yellow-700',
  Review: 'bg-blue-100 text-blue-700',
  Archived: 'bg-gray-100 text-gray-500',
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const getImages = (p: any): string[] => {
    if (!p.images?.length) return [];
    return p.images.map((img: any) => typeof img === 'string' ? img : img?.url).filter(Boolean);
  };

  useEffect(() => {
    apiProducts.get(params.id)
      .then((r) => setProduct(r.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
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

  if (loading) return (
    <ProtectedLayout>
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    </ProtectedLayout>
  );

  if (!product) return (
    <ProtectedLayout>
      <p className="text-center py-20 text-gray-400">Product not found</p>
    </ProtectedLayout>
  );

  const images = getImages(product);

  return (
    <ProtectedLayout>
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/products" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft size={16} /> Products
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

        {/* Images */}
        {images.length > 0 ? (
          <Card className="p-3">
            <img src={images[activeImg]} alt="" className="w-full h-72 object-contain rounded-lg bg-gray-50" />
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((url, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-brand-500' : 'border-gray-200'}`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-3">
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package size={40} className="text-gray-300" />
            </div>
          </Card>
        )}

        {/* Title + Status */}
        <Card>
          <div className="flex items-start justify-between mb-1">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{product.title}</h1>
              <p className="text-xs text-gray-400 mt-0.5">{product.sku}{product.slug ? ` · /${product.slug}` : ''}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusColors[product.status] || 'bg-gray-100 text-gray-600'}`}>
              {product.status}
            </span>
          </div>

          {product.shortDescription && (
            <p className="text-sm text-gray-500 mt-2">{product.shortDescription}</p>
          )}

          {/* Pricing */}
          <Section title="Pricing">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="MRP" value={formatCurrency(product.mrp)} />
              <Field label="Discount" value={product.discountPercentage ? `${product.discountPercentage}%` : undefined} />
              <Field label="Selling Price" value={formatCurrency(product.sellingPrice)} />
              <Field label="Final Price" value={formatCurrency(product.finalPrice || product.sellingPrice)} />
            </div>
            {product.mrp > 0 && product.sellingPrice > 0 && product.mrp > product.sellingPrice && (
              <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg mt-3">
                Customer saves {formatCurrency(product.mrp - product.sellingPrice)} ({product.discountPercentage}% off)
              </p>
            )}
          </Section>

          {/* Categorization */}
          <Section title="Categorization">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Category" value={product.category} />
              <Field label="Subcategory" value={product.subcategory} />
              <Field label="Product Type" value={product.productType} />
              <Field label="Material" value={product.material} />
              <Field label="Style" value={product.style} />
              <Field label="Occasion" value={product.occasion} />
              <Field label="Brand" value={product.brand} />
              <Field label="Collection" value={product.productCollection || product.collection} />
            </div>
          </Section>

          {/* Inventory */}
          <Section title="Inventory">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Stock Status" value={product.stockStatus} />
              <Field label="Quantity" value={product.quantity} />
              <Field label="Low Stock Alert" value={product.lowStockThreshold} />
              <Field label="Availability" value={product.availabilityType} />
            </div>
          </Section>

          {/* Specifications */}
          {product.specifications?.length > 0 && (
            <Section title="Specifications">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {product.specifications.map((s: any, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400">{s.label}</p>
                    <p className="text-sm font-medium text-gray-900">{s.value}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Attributes */}
          {(product.colors?.length > 0 || product.sizes?.length > 0) && (
            <Section title="Attributes">
              <div className="space-y-2">
                {product.colors?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Colors</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.colors.map((c: string) => (
                        <span key={c} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {product.sizes?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Sizes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.sizes.map((s: string) => (
                        <span key={s} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Description */}
          {product.description && (
            <Section title="Description">
              <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
            </Section>
          )}

          {/* Key Features */}
          {product.keyFeatures?.length > 0 && (
            <Section title="Key Features">
              <ul className="space-y-1">
                {product.keyFeatures.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-brand-500 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Care Instructions */}
          {product.careInstructions?.length > 0 && (
            <Section title="Care Instructions">
              <ul className="space-y-1">
                {product.careInstructions.map((c: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-gray-400 mt-0.5">·</span> {c}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Shipping */}
          {(product.dispatchTime || product.estimatedDelivery || product.shippingCharge >= 0) && (
            <Section title="Shipping">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Dispatch Time" value={product.dispatchTime} />
                <Field label="Estimated Delivery" value={product.estimatedDelivery} />
                <Field label="Shipping Charge" value={product.shippingCharge !== undefined ? formatCurrency(product.shippingCharge) : undefined} />
                <Field label="Returns" value={product.returnAvailable ? 'Available' : 'Not Available'} />
              </div>
            </Section>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <Section title="Tags">
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">{tag}</span>
                ))}
              </div>
            </Section>
          )}

          {/* SEO */}
          {(product.seoTitle || product.seoDescription || product.searchKeywords?.length > 0) && (
            <Section title="SEO Metadata">
              <div className="space-y-3">
                <Field label="SEO Title" value={product.seoTitle} />
                <Field label="SEO Description" value={product.seoDescription} />
                {product.searchKeywords?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Search Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.searchKeywords.map((k: string) => (
                        <span key={k} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{k}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Meta */}
          <Section title="Record Info">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Created" value={formatDate(product.createdAt)} />
              <Field label="Updated" value={formatDate(product.updatedAt)} />
            </div>
          </Section>
        </Card>
      </div>
    </ProtectedLayout>
  );
}

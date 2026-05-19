'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Card } from '@/components/ui/Card';
import { apiProducts } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Package, PlusCircle, TrendingUp, Archive } from 'lucide-react';

export default function DashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiProducts.list().then((r) => {
      const data = r.data;
      setProducts(Array.isArray(data) ? data : data.products || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: products.length,
    published: products.filter((p) => p.status === 'Published').length,
    draft: products.filter((p) => p.status === 'Draft').length,
    revenue: products.filter((p) => p.status === 'Published').reduce((s, p) => s + p.sellingPrice, 0),
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <Link href="/products/add" className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
            <PlusCircle size={16} /> Add Product
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Products', value: stats.total, icon: Package, color: 'text-blue-600 bg-blue-50' },
            { label: 'Published', value: stats.published, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
            { label: 'Drafts', value: stats.draft, icon: Archive, color: 'text-yellow-600 bg-yellow-50' },
            { label: 'Listed Value', value: formatCurrency(stats.revenue), icon: TrendingUp, color: 'text-brand-600 bg-brand-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </Card>
          ))}
        </div>

        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Products</h2>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Package size={40} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No products yet</p>
              <Link href="/products/add" className="text-brand-600 text-sm font-medium mt-2 inline-block">Add your first product →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {products.slice(0, 8).map((p) => (
                <Link key={p._id} href={`/products/${p._id}`} className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-6 px-6 transition-colors">
                  {(() => {
                    const img = p.images?.[0];
                    const url = typeof img === 'string' ? img : img?.url;
                    return url ? (
                      <img src={url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                    <p className="text-xs text-gray-400">{p.sku} · {formatDate(p.createdAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(p.sellingPrice)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'Published' ? 'bg-green-100 text-green-700' : p.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </ProtectedLayout>
  );
}

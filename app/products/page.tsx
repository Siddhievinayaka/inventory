'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Card } from '@/components/ui/Card';
import { apiProducts } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PlusCircle, Search, Package, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUSES = ['All', 'Draft', 'Review', 'Published', 'Archived'];

const statusColors: Record<string, string> = {
  Published: 'bg-green-100 text-green-700',
  Draft: 'bg-yellow-100 text-yellow-700',
  Review: 'bg-blue-100 text-blue-700',
  Archived: 'bg-gray-100 text-gray-500',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const params: any = { page, limit: 20 };
    if (search) params.search = search;
    if (status !== 'All') params.status = status;
    setLoading(true);
    apiProducts.list(params)
      .then((r) => {
        const data = r.data;
        // Handle both old array response and new paginated response
        if (Array.isArray(data)) {
          setProducts(data);
          setTotal(data.length);
          setPages(1);
        } else {
          setProducts(data.products || []);
          setTotal(data.total || 0);
          setPages(data.pages || 1);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, status, page]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, status]);

  return (
    <ProtectedLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Products</h1>
            {total > 0 && <p className="text-xs text-gray-400 mt-0.5">{total} total</p>}
          </div>
          <Link href="/products/add" className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
            <PlusCircle size={15} /> Add Product
          </Link>
        </div>

        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or SKU..."
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package size={40} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No products found</p>
              <Link href="/products/add" className="text-brand-600 text-sm font-medium mt-2 inline-block">Add your first product →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {products.map((p) => {
                const img = p.images?.[0];
                const primaryImg = typeof img === 'string' ? img : img?.url;
                return (
                  <Link key={p._id} href={`/products/${p._id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    {primaryImg ? (
                      <img src={primaryImg} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        <Package size={16} className="text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {p.sku}{p.category ? ` · ${p.category}` : ''} · {formatDate(p.createdAt)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(p.sellingPrice || p.finalPrice)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600">Page {page} of {pages}</span>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}

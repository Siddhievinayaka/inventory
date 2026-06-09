'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Card } from '@/components/ui/Card';
import { apiProducts } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StockBadge } from '@/components/ui/StockBadge';
import {
  PlusCircle, Search, Package, ChevronLeft, ChevronRight,
  MoreVertical, Eye, Edit, Copy, Archive, Trash2,
  CheckSquare, Square, Percent, Download,
  CheckCircle, XCircle, Star, X,
} from 'lucide-react';

const STATUSES = ['All', 'Draft', 'Review', 'Published', 'Archived'];

const statusColors: Record<string, string> = {
  Published: 'bg-green-100 text-green-700',
  Draft: 'bg-yellow-100 text-yellow-700',
  Review: 'bg-blue-100 text-blue-700',
  Archived: 'bg-gray-100 text-gray-500',
};

// ── Portal Menu ──────────────────────────────────────────────────────────────

function usePortalMenu(anchorRef: React.RefObject<HTMLElement>) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const calc = useCallback(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const menuH = 380;
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < menuH && rect.top > menuH) {
      setStyle({ position: 'fixed', bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right, zIndex: 99999 });
    } else {
      setStyle({ position: 'fixed', top: rect.bottom + 4, right: window.innerWidth - rect.right, zIndex: 99999 });
    }
  }, [anchorRef]);

  useEffect(() => {
    if (open) calc();
  }, [open, calc]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as Element)?.closest('[data-portal-menu]') &&
          !anchorRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open, anchorRef]);

  return { open, setOpen, style };
}

// ── Row Action Menu ──────────────────────────────────────────────────────────

function RowMenu({ product, onAction }: { product: any; onAction: (action: string, id: string) => void }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const { open, setOpen, style } = usePortalMenu(btnRef as React.RefObject<HTMLElement>);

  const items = [
    { label: 'View', icon: Eye, action: 'view' },
    { label: 'Edit', icon: Edit, action: 'edit' },
    { label: 'Duplicate', icon: Copy, action: 'duplicate' },
    null,
    { label: 'Publish', icon: CheckCircle, action: 'publish' },
    { label: 'Set Draft', icon: XCircle, action: 'draft' },
    { label: 'Archive', icon: Archive, action: 'archive' },
    null,
    { label: 'In Stock', icon: CheckSquare, action: 'in_stock' },
    { label: 'Out of Stock', icon: XCircle, action: 'out_of_stock' },
    null,
    { label: 'Delete', icon: Trash2, action: 'delete', danger: true },
  ];

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
      >
        <MoreVertical size={15} />
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div data-portal-menu style={style}
          className="w-44 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          {items.map((item, i) =>
            item === null ? (
              <div key={i} className="border-t border-gray-100" />
            ) : (
              <button key={item.action} type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(false); onAction(item.action, product._id); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left ${(item as any).danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                <item.icon size={14} className="flex-shrink-0" />
                {item.label}
              </button>
            )
          )}
        </div>,
        document.body
      )}
    </>
  );
}

// ── Bulk Input Popover ───────────────────────────────────────────────────────

function BulkPopover({ label, icon: Icon, onApply, inputType = 'text', placeholder }: {
  label: string; icon: any; onApply: (val: string) => void;
  inputType?: string; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);
  const { style } = usePortalMenu(btnRef as React.RefObject<HTMLElement>);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as Element)?.closest('[data-bulk-popover]') &&
          !btnRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <>
      <button ref={btnRef} onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-white/15 rounded-lg hover:bg-white/25 transition-colors font-medium whitespace-nowrap">
        <Icon size={12} /> {label}
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div data-bulk-popover style={{ ...style, minWidth: 180 }}
          className="bg-white border border-gray-200 rounded-xl shadow-2xl p-3">
          <p className="text-xs text-gray-500 mb-2 font-medium">{label}</p>
          <input type={inputType} value={val} onChange={(e) => setVal(e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 mb-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder={placeholder} />
          <button onClick={() => { onApply(val); setVal(''); setOpen(false); }}
            className="w-full py-1.5 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700">
            Apply
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

// ── Bulk Bar ─────────────────────────────────────────────────────────────────

function BulkBar({ selected, onAction, onClear }: {
  selected: string[];
  onAction: (action: string, payload?: any) => void;
  onClear: () => void;
}) {
  if (!selected.length) return null;

  return (
    <div className="bg-brand-700 text-white rounded-xl px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between mb-2.5">
        <span className="text-sm font-semibold">{selected.length} product{selected.length > 1 ? 's' : ''} selected</span>
          <div className="flex items-center gap-2">
            <button onClick={() => onAction('delete')}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-red-500 rounded-lg hover:bg-red-600 transition-colors font-medium">
              <Trash2 size={12} /> Delete
            </button>
            <button onClick={() => onAction('export')}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-white/15 rounded-lg hover:bg-white/25 transition-colors font-medium">
              <Download size={12} /> Export
            </button>
            <button onClick={onClear}
              className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { label: 'Publish', action: 'publish', icon: CheckCircle },
          { label: 'Draft', action: 'draft', icon: XCircle },
          { label: 'Archive', action: 'archive', icon: Archive },
          { label: 'In Stock', action: 'in_stock', icon: CheckSquare },
          { label: 'Out of Stock', action: 'out_of_stock', icon: XCircle },
          { label: 'New Arrival', action: 'new_arrival', icon: Star },
          { label: 'Featured', action: 'featured', icon: Star },
        ].map(({ label, action, icon: Icon }) => (
          <button key={action} onClick={() => onAction(action)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-white/15 rounded-lg hover:bg-white/25 transition-colors font-medium whitespace-nowrap">
            <Icon size={12} /> {label}
          </button>
        ))}

        <div className="w-px h-5 bg-white/30 self-center mx-0.5" />

        <BulkPopover label="Discount %" icon={Percent} inputType="number" placeholder="e.g. 35"
          onApply={(v) => onAction('discount', { discountPercentage: parseFloat(v) })} />
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  const fetchProducts = useCallback(() => {
    const params: any = { page, limit: 20 };
    if (search) params.search = search;
    if (status !== 'All') params.status = status;
    setLoading(true);
    apiProducts.list(params)
      .then((r) => {
        const data = r.data;
        if (Array.isArray(data)) {
          setProducts(data); setTotal(data.length); setPages(1);
        } else {
          setProducts(data.products || []); setTotal(data.total || 0); setPages(data.pages || 1);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, status, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); setSelected([]); }, [search, status]);

  const toggleSelect = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === products.length ? [] : products.map((p) => p._id));

  const downloadJSON = (data: any[], filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleRowAction = async (action: string, id: string) => {
    if (action === 'view') { router.push(`/products/${id}`); return; }
    if (action === 'edit' || action === 'ai' || action === 'stock') { router.push(`/products/${id}/edit`); return; }

    if (action === 'duplicate') {
      try { await apiProducts.duplicate(id); toast.success('Duplicated as Draft'); fetchProducts(); }
      catch { toast.error('Duplicate failed'); }
      return;
    }
    if (action === 'export') {
      const p = products.find((x) => x._id === id);
      if (p) downloadJSON([p], `product-${p.sku}`);
      return;
    }
    if (action === 'delete') {
      if (!confirm('Delete this product?')) return;
      try { await apiProducts.delete(id); toast.success('Deleted'); fetchProducts(); }
      catch { toast.error('Delete failed'); }
      return;
    }
    const map: Record<string, any> = {
      publish: { status: 'Published' }, draft: { status: 'Draft' }, archive: { status: 'Archived' },
      in_stock: { stockStatus: 'In Stock' }, out_of_stock: { stockStatus: 'Out of Stock' },
    };
    if (map[action]) {
      try { await apiProducts.update(id, map[action]); toast.success('Updated'); fetchProducts(); }
      catch { toast.error('Update failed'); }
    }
  };

  const handleBulkAction = async (action: string, payload?: any) => {
    if (!selected.length) return;
    if (action === 'export') {
      downloadJSON(products.filter((p) => selected.includes(p._id)), `export-${Date.now()}`);
      return;
    }
    if (action === 'delete' && !confirm(`Delete ${selected.length} products?`)) return;
    try {
      const res = await apiProducts.bulk(action, selected, payload);
      toast.success(`${res.data.count ?? selected.length} product(s) updated`);
      setSelected([]); fetchProducts();
    } catch { toast.error('Bulk action failed'); }
  };

  const allSelected = products.length > 0 && selected.length === products.length;

  return (
    <ProtectedLayout>
      <div className="space-y-3">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Products</h1>
            {total > 0 && <p className="text-xs text-gray-400 mt-0.5">{total} total</p>}
          </div>
          <Link href="/products/add"
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
            <PlusCircle size={15} /> Add Product
          </Link>
        </div>

        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or SKU..."
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <BulkBar selected={selected} onAction={handleBulkAction} onClear={() => setSelected([])} />

        <Card className="p-0 overflow-visible">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package size={40} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No products found</p>
              <Link href="/products/add" className="text-brand-600 text-sm font-medium mt-2 inline-block">
                Add your first product →
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                <button type="button" onClick={toggleAll}
                  className="text-gray-400 hover:text-brand-600 transition-colors flex-shrink-0">
                  {allSelected
                    ? <CheckSquare size={16} className="text-brand-600" />
                    : <Square size={16} />}
                </button>
                <span className="text-xs text-gray-500 font-medium">
                  {selected.length > 0 ? `${selected.length} selected` : `${products.length} on this page`}
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {products.map((p) => {
                  const primaryImg = (() => {
                    const imgs = p.images || [];
                    const primary = imgs.find((i: any) => i?.isPrimary) || imgs[0];
                    return typeof primary === 'string' ? primary : primary?.url;
                  })();
                  const isSelected = selected.includes(p._id);

                  return (
                    <div key={p._id}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${isSelected ? 'bg-brand-50' : 'hover:bg-gray-50'}`}>

                      {/* Checkbox */}
                      <button type="button" onClick={() => toggleSelect(p._id)}
                        className="text-gray-400 hover:text-brand-600 transition-colors flex-shrink-0">
                        {isSelected
                          ? <CheckSquare size={16} className="text-brand-600" />
                          : <Square size={16} />}
                      </button>

                      {/* Image */}
                      <Link href={`/products/${p._id}`} className="flex-shrink-0">
                        {primaryImg ? (
                          <img src={primaryImg} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package size={15} className="text-gray-300" />
                          </div>
                        )}
                      </Link>

                      {/* Info block */}
                      <Link href={`/products/${p._id}`} className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{p.title}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{p.sku}{p.category ? ` · ${p.category}` : ''}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(p.sellingPrice || p.finalPrice)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}>
                            {p.status}
                          </span>
                          <StockBadge productId={p._id} status={p.stockStatus || 'Out of Stock'}
                            onUpdate={() => fetchProducts()} />
                        </div>
                      </Link>

                      {/* Row Actions */}
                      <RowMenu product={p} onAction={handleRowAction} />
                    </div>
                  );
                })}
              </div>
            </>
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

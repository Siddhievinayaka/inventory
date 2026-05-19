'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { apiMaster } from '@/lib/api';
import { Plus, X, Loader2, Database } from 'lucide-react';

const COLLECTIONS = [
  { key: 'categories', label: 'Categories' },
  { key: 'subcategories', label: 'Subcategories' },
  { key: 'productTypes', label: 'Product Types' },
  { key: 'materials', label: 'Materials' },
  { key: 'styles', label: 'Styles' },
  { key: 'occasions', label: 'Occasions' },
  { key: 'colors', label: 'Colors' },
  { key: 'sizes', label: 'Sizes' },
  { key: 'tags', label: 'Tags' },
  { key: 'specifications', label: 'Specification Labels' },
  { key: 'features', label: 'Key Features' },
  { key: 'careInstructions', label: 'Care Instructions' },
];

function CollectionPanel({ collectionKey, label }: { collectionKey: string; label: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    apiMaster.list(collectionKey)
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [collectionKey]);

  const handleAdd = async () => {
    if (!input.trim()) return;
    setAdding(true);
    try {
      const res = await apiMaster.create(collectionKey, input.trim());
      setItems((prev) => {
        if (prev.some((i) => i._id === res.data._id)) return prev;
        return [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name));
      });
      setInput('');
      toast.success(`Added "${res.data.name}"`);
    } catch {
      toast.error('Failed to add');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={`Add ${label.toLowerCase()}...`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !input.trim()}
            className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          </button>
        </div>

        {loading ? (
          <div className="space-y-1.5">
            {[...Array(3)].map((_, i) => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">No items yet</p>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {items.map((item) => (
              <span key={item._id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                {item.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MasterDataPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center">
            <Database size={18} className="text-brand-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Master Data</h1>
            <p className="text-sm text-gray-500">Manage reusable taxonomy values used across all products</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COLLECTIONS.map((c) => (
            <CollectionPanel key={c.key} collectionKey={c.key} label={c.label} />
          ))}
        </div>
      </div>
    </ProtectedLayout>
  );
}

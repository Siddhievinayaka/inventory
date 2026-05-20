'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { apiProducts } from '@/lib/api';
import toast from 'react-hot-toast';

const STOCK_OPTIONS = [
  { value: 'In Stock',     dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  { value: 'Out of Stock', dot: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
  { value: 'On Demand',    dot: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { value: 'Pre Order',    dot: 'bg-blue-500',   text: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
];

function getStyle(status: string) {
  return STOCK_OPTIONS.find((o) => o.value === status) || STOCK_OPTIONS[1];
}

interface Props {
  productId: string;
  status: string;
  onUpdate?: (newStatus: string) => void;
  readonly?: boolean;
}

export function StockBadge({ productId, status, onUpdate, readonly = false }: Props) {
  const [current, setCurrent] = useState(status);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const style = getStyle(current);

  const handleSelect = async (val: string) => {
    setOpen(false);
    if (val === current) return;
    setSaving(true);
    try {
      await apiProducts.update(productId, { stockStatus: val });
      setCurrent(val);
      onUpdate?.(val);
      toast.success(`Stock: ${val}`);
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const badge = (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border} ${!readonly ? 'cursor-pointer hover:opacity-80 transition-opacity select-none' : ''} ${saving ? 'opacity-50' : ''}`}
      onClick={readonly ? undefined : (e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
      {current}
    </span>
  );

  if (readonly) return badge;

  return (
    <div className="relative inline-block">
      {badge}
      {open && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden w-40"
          style={{ top: 0, left: 0 }}
          ref={(el) => {
            if (!el) return;
            const trigger = document.activeElement as HTMLElement;
            const parent = el.previousElementSibling as HTMLElement;
            const rect = (parent || trigger)?.getBoundingClientRect?.() || { bottom: 100, left: 100 };
            el.style.top = `${rect.bottom + 4}px`;
            el.style.left = `${rect.left}px`;
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {STOCK_OPTIONS.map((opt) => (
            <button key={opt.value} type="button"
              onClick={() => handleSelect(opt.value)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-gray-50 ${current === opt.value ? 'font-semibold' : 'font-normal'}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />
              <span className={opt.text}>{opt.value}</span>
              {current === opt.value && <span className="ml-auto text-brand-600 text-xs">✓</span>}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

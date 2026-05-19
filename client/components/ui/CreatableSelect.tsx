'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronDown, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiMaster } from '@/lib/api';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  collection: string;
  value: string | string[];
  onChange: (val: string | string[]) => void;
  placeholder?: string;
  multi?: boolean;
  label?: string;
  required?: boolean;
}

function useDebounce(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function CreatableSelect({ collection, value, onChange, placeholder = 'Search or create...', multi = false, label, required }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(search);

  const selected = multi
    ? (Array.isArray(value) ? value : [])
    : (typeof value === 'string' ? value : '');

  const fetchOptions = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await apiMaster.list(collection, q);
      setOptions(res.data.map((item: any) => ({ value: item.name, label: item.name })));
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [collection]);

  useEffect(() => {
    if (open) fetchOptions(debouncedSearch);
  }, [open, debouncedSearch, fetchOptions]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleCreate = async () => {
    if (!search.trim()) return;
    setCreating(true);
    try {
      const res = await apiMaster.create(collection, search.trim());
      const newOpt = { value: res.data.name, label: res.data.name };
      setOptions((prev) => [newOpt, ...prev]);
      handleSelect(newOpt.value);
      setSearch('');
    } catch {
    } finally {
      setCreating(false);
    }
  };

  const handleSelect = (val: string) => {
    if (multi) {
      const arr = Array.isArray(selected) ? selected : [];
      if (arr.includes(val)) {
        onChange(arr.filter((v) => v !== val));
      } else {
        onChange([...arr, val]);
      }
    } else {
      onChange(val === selected ? '' : val);
      setOpen(false);
      setSearch('');
    }
  };

  const removeChip = (val: string) => {
    if (multi && Array.isArray(selected)) {
      onChange(selected.filter((v) => v !== val));
    }
  };

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const showCreate = search.trim() && !options.some((o) => o.label.toLowerCase() === search.toLowerCase().trim());

  const displayValue = !multi && typeof selected === 'string' ? selected : '';

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div
        className={cn(
          'min-h-[42px] w-full border border-gray-300 rounded-lg bg-white cursor-text transition-all',
          open ? 'ring-2 ring-brand-500 border-transparent' : 'hover:border-gray-400'
        )}
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        <div className="flex flex-wrap gap-1.5 p-2 pr-8 relative">
          {multi && Array.isArray(selected) && selected.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-100 text-brand-800 rounded-md text-xs font-medium">
              {v}
              <button type="button" onClick={(e) => { e.stopPropagation(); removeChip(v); }} className="hover:text-brand-900">
                <X size={10} />
              </button>
            </span>
          ))}

          {!multi && displayValue && (
            <span className="text-sm text-gray-900 py-0.5 px-1">{displayValue}</span>
          )}

          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); if (showCreate) handleCreate(); else if (filtered[0]) handleSelect(filtered[0].value); }
              if (e.key === 'Escape') setOpen(false);
            }}
            placeholder={(!multi && displayValue) || (multi && Array.isArray(selected) && selected.length > 0) ? '' : placeholder}
            className="flex-1 min-w-[80px] outline-none text-sm bg-transparent py-0.5 px-1 placeholder:text-gray-400"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg-soft overflow-hidden">
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && !showCreate && !loading && (
              <p className="text-sm text-gray-400 px-3 py-3 text-center">No results</p>
            )}
            {filtered.map((opt) => {
              const isSelected = multi
                ? Array.isArray(selected) && selected.includes(opt.value)
                : selected === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between transition-colors',
                    isSelected && 'bg-brand-50 text-brand-700 font-medium'
                  )}
                >
                  {opt.label}
                  {isSelected && <span className="text-brand-600 text-xs">✓</span>}
                </button>
              );
            })}
          </div>

          {showCreate && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCreate}
              disabled={creating}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-brand-700 font-medium border-t border-gray-100 hover:bg-brand-50 transition-colors"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create "{search.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

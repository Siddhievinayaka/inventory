'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

interface DropdownPos {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
}

const splitBulkText = (text: string): string[] => {
  // First, split by newlines
  let lines = text.split(/\r?\n/);
  
  // If there's only one line, check if it contains multiple sentences (separated by periods)
  if (lines.length === 1 && text.includes('.')) {
    const sentences = text
      .split(/\.\s+/)
      .map((s) => s.trim())
      .map((s) => (s.endsWith('.') ? s.slice(0, -1) : s))
      .filter(Boolean);
    
    if (sentences.length > 1) {
      return sentences;
    }
  }
  
  // Clean up each line: trim and remove bullets/numbers
  return lines
    .map((line) => {
      let cleaned = line.trim();
      cleaned = cleaned.replace(/^(?:\d+\.\s*|[-*•]\s*)/, '');
      return cleaned.trim();
    })
    .filter(Boolean);
};

export function CreatableSelect({
  collection, value, onChange,
  placeholder = 'Search or create...',
  multi = false, label, required,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pos, setPos] = useState<DropdownPos>({ top: 0, left: 0, width: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(search);

  const selected = multi
    ? (Array.isArray(value) ? value : [])
    : (typeof value === 'string' ? value : '');

  // Calculate fixed position from anchor element
  const calcPos = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = 220;
    if (spaceBelow < menuHeight && rect.top > menuHeight) {
      setPos({ bottom: window.innerHeight - rect.top + 2, left: rect.left, width: rect.width });
    } else {
      setPos({ top: rect.bottom + 2, left: rect.left, width: rect.width });
    }
  }, []);

  useEffect(() => {
    if (open) calcPos();
  }, [open, calcPos]);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', calcPos, true);
    window.addEventListener('resize', calcPos);
    return () => {
      window.removeEventListener('scroll', calcPos, true);
      window.removeEventListener('resize', calcPos);
    };
  }, [open, calcPos]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

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
      onChange(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
    } else {
      onChange(val === selected ? '' : val);
      setOpen(false);
      setSearch('');
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const items = splitBulkText(pastedText);

    if (items.length > 1) {
      e.preventDefault();
      setLoading(true);
      try {
        const createdItems = await Promise.all(
          items.map(async (item) => {
            try {
              const res = await apiMaster.create(collection, item);
              return res.data.name;
            } catch {
              return item;
            }
          })
        );

        if (multi) {
          const arr = Array.isArray(selected) ? selected : [];
          const updated = [...arr];
          createdItems.forEach((val) => {
            if (!updated.includes(val)) updated.push(val);
          });
          onChange(updated);
        } else {
          onChange(createdItems);
        }
      } catch (err) {
        console.error('Bulk paste failed:', err);
      } finally {
        setLoading(false);
        setSearch('');
      }
    }
  };

  const removeChip = (val: string) => {
    if (multi && Array.isArray(selected)) onChange(selected.filter((v) => v !== val));
  };

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const showCreate = search.trim() &&
    !options.some((o) => o.label.toLowerCase() === search.toLowerCase().trim());

  const displayValue = !multi && typeof selected === 'string' ? selected : '';

  const dropdownMenu = open && typeof document !== 'undefined'
    ? createPortal(
        <div
          style={{
            position: 'fixed',
            top: pos.top,
            bottom: pos.bottom,
            left: pos.left,
            width: pos.width,
            zIndex: 99999,
          }}
          ref={dropdownRef}
          className="bg-white border border-gray-200 rounded-lg shadow-xl"
        >
          <div className="max-h-52 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 px-3 py-3 text-sm text-gray-400">
                <Loader2 size={14} className="animate-spin" /> Loading...
              </div>
            )}
            {!loading && filtered.length === 0 && !showCreate && (
              <p className="text-sm text-gray-400 px-3 py-3 text-center">No results</p>
            )}
            {!loading && filtered.map((opt) => {
              const isSelected = multi
                ? Array.isArray(selected) && selected.includes(opt.value)
                : selected === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
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
              onClick={handleCreate}
              disabled={creating}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-brand-700 font-medium border-t border-gray-100 hover:bg-brand-50 transition-colors disabled:opacity-50"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create "{search.trim()}"
            </button>
          )}
        </div>,
        document.body
      )
    : null;

  return (
    <div className="w-full" ref={containerRef}>
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
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeChip(v); }}
                className="hover:text-brand-900"
              >
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
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (showCreate) handleCreate();
                else if (filtered[0]) handleSelect(filtered[0].value);
              }
              if (e.key === 'Escape') setOpen(false);
            }}
            placeholder={
              (!multi && displayValue) ||
              (multi && Array.isArray(selected) && selected.length > 0)
                ? '' : placeholder
            }
            className="flex-1 min-w-[80px] outline-none text-sm bg-transparent py-0.5 px-1 placeholder:text-gray-400"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {loading
              ? <Loader2 size={14} className="animate-spin" />
              : <ChevronDown size={14} />
            }
          </div>
        </div>
      </div>

      {dropdownMenu}
    </div>
  );
}

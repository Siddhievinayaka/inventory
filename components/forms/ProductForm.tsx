'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  ChevronDown, ChevronUp, Sparkles, Plus, X, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreatableSelect } from '@/components/ui/CreatableSelect';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { generateSKU, slugify, cn, normalizeImages } from '@/lib/utils';
import { apiProducts, apiAI } from '@/lib/api';

// ─── Menu Data (single source of truth for categorization) ──────────────────

const MENU_DATA = [
  {
    id: 'home-decor', label: 'Home Decor', icon: '🏮', slug: 'home-decor',
    children: [
      { id: 'wall-table-decor', label: 'Wall & Table', slug: 'wall-table-decor', children: [
        { label: 'Wall Hangings', slug: 'wall-hangings' },
        { label: 'Table Stand Frames', slug: 'table-stand-frames' },
        { label: 'Table Clocks', slug: 'table-clocks' },
        { label: 'Painting & Photos', slug: 'painting-photos' },
      ]},
      { id: 'decorative-accents', label: 'Decorative Accents', slug: 'decorative-accents', children: [
        { label: 'Wind Chimes', slug: 'wind-chimes' },
        { label: 'Showpiece Boxes', slug: 'showpiece-boxes' },
        { label: 'Decorative Drawer', slug: 'decorative-drawer' },
        { label: 'Artificial Birds', slug: 'artificial-birds' },
      ]},
      { id: 'showpieces-figurines', label: 'Showpieces & Figurines', slug: 'showpieces-figurines', children: [
        { label: 'Artificial Showpieces', slug: 'artificial-showpieces' },
        { label: 'Metal Showpieces', slug: 'metal-showpieces' },
        { label: 'Wooden Showpieces', slug: 'wooden-showpieces' },
        { label: 'Ceramic Showpieces', slug: 'ceramic-showpieces' },
        { label: 'Other Decor', slug: 'other-decor' },
      ]},
    ],
  },
  {
    id: 'fashion', label: 'Fashion', icon: '👗', slug: 'fashion',
    children: [
      { id: 'men-fashion', label: 'Men', slug: 'men-fashion', children: [
        { label: 'Long Kurta', slug: 'long-kurta' },
        { label: 'Short Kurta', slug: 'short-kurta' },
        { label: 'Bagalbandi', slug: 'bagalbandi' },
        { label: 'Shirt', slug: 'shirt' },
        { label: 'Jacket', slug: 'jacket' },
        { label: 'Dhoti & Chadara', slug: 'dhoti-chadara' },
        { label: 'Linen Pants', slug: 'linen-pants' },
      ]},
      { id: 'women-fashion', label: 'Women', slug: 'women-fashion', children: [
        { label: 'ISKCON Gopi Dress', slug: 'gopi-dress' },
        { label: 'ISKCON Anarkali Dress', slug: 'anarkali-gopi-dress' },
        { label: 'Long Kurti', slug: 'long-kurti' },
        { label: 'Short Kurti', slug: 'short-kurti' },
        { label: 'Kurti Set', slug: 'kurti-set' },
        { label: 'Linen Pant', slug: 'women-linen-pant' },
        { label: 'Co-Ord Set', slug: 'co-ord-set' },
        { label: 'Lounge Set', slug: 'lounge-set' },
        { label: 'Blouse', slug: 'blouse' },
        { label: 'Under Skirts', slug: 'under-skirts' },
        { label: 'Sarees', slug: 'sarees' },
      ]},
      { id: 'kids-fashion', label: 'Kids', slug: 'kids-fashion', children: [
        { label: 'Gopi Dress', slug: 'kids-gopi-dress' },
        { label: 'Anarkali Dress', slug: 'kids-anarkali-dress' },
        { label: 'Frock', slug: 'frock' },
        { label: 'Kurta', slug: 'kids-kurta' },
        { label: 'Pajama', slug: 'pajama' },
      ]},
    ],
  },
  {
    id: 'fashion-accessories', label: 'Fashion Accessories', icon: '👜', slug: 'fashion-accessories',
    children: [
      { id: 'bags-wraps', label: 'Bags & Wraps', slug: 'bags-wraps', children: [
        { label: 'Tote Bags', slug: 'tote-bags' },
        { label: 'Stoles', slug: 'stoles' },
        { label: 'Scarfs', slug: 'scarfs' },
        { label: 'Towels', slug: 'towels' },
        { label: 'Harinam Chadar', slug: 'harinam-chadar' },
        { label: 'Chadar', slug: 'chadar' },
        { label: 'Shawl Dupatta', slug: 'shawl-dupatta' },
      ]},
      { id: 'jewellery-adornments', label: 'Jewellery & Adornments', slug: 'jewellery-adornments', children: [
        { label: 'Earrings', slug: 'earrings' },
        { label: 'Pendants', slug: 'pendants' },
        { label: 'Conch Bangles', slug: 'conch-bangles' },
        { label: 'Oxidized Bangles', slug: 'oxidized-bangles' },
      ]},
    ],
  },
  {
    id: 'puja-worship', label: 'Puja & Worship', icon: '🪔', slug: 'puja-worship',
    children: [
      { id: 'god-idols', label: 'God Idols', slug: 'god-idols', children: [
        { label: 'Radha Krishna', slug: 'radha-krishna' },
        { label: 'Single Krishna', slug: 'single-krishna' },
        { label: 'Narsingha Bhagawan', slug: 'narsingha-bhagawan' },
        { label: 'Laxmi Narsingha Bhagawan', slug: 'laxmi-narsingha' },
        { label: 'Ganesha', slug: 'ganesha' },
        { label: 'Laxmi', slug: 'laxmi' },
        { label: 'Saraswati', slug: 'saraswati' },
        { label: 'Shiva', slug: 'shiva' },
        { label: 'Narayan Bhagawan', slug: 'narayan-bhagawan' },
        { label: 'Narayan Laxmi', slug: 'narayan-laxmi' },
        { label: 'Brahma', slug: 'brahma' },
        { label: 'Shiva Family', slug: 'shiva-family' },
        { label: 'Cow Krishna', slug: 'cow-krishna' },
        { label: 'Durga', slug: 'durga' },
        { label: 'Hanuman', slug: 'hanuman' },
        { label: 'Dattatreya', slug: 'dattatreya' },
        { label: 'Varah Deva', slug: 'varah-deva' },
        { label: 'Varah Devi', slug: 'varah-devi' },
        { label: 'Ram Darbar', slug: 'ram-darbar' },
        { label: 'Garudaji', slug: 'garudaji' },
        { label: 'Vrindadevi', slug: 'vrindadevi' },
        { label: 'Anna Purna', slug: 'anna-purna' },
        { label: 'Kubera', slug: 'kubera' },
      ]},
      { id: 'puja-accessories', label: 'Puja Accessories', slug: 'puja-accessories', children: [
        { label: 'Conch', slug: 'conch' },
        { label: 'Conch Stand', slug: 'conch-stand' },
        { label: 'Incense Stick Stand', slug: 'incense-stand' },
        { label: 'Hand Bell-Ghanti', slug: 'hand-bell' },
        { label: 'Puja Thali', slug: 'puja-thali' },
        { label: 'Dhoop Burner', slug: 'dhoop-burner' },
        { label: 'Oil Lamp', slug: 'oil-lamp' },
        { label: 'Temple Bell', slug: 'temple-bell' },
        { label: 'Dhoop Kone Stand', slug: 'dhoop-kone-stand' },
        { label: 'Temples', slug: 'temples' },
      ]},
      { id: 'incense-fragrance', label: 'Incense & Fragrance', slug: 'incense-fragrance', children: [
        { label: 'Dhoopa Kone', slug: 'dhoopa-kone' },
        { label: 'Dhoopa Stick', slug: 'dhoopa-stick' },
        { label: 'Incense Stick', slug: 'incense-stick' },
        { label: 'Aroma Oils', slug: 'aroma-oils' },
        { label: 'Itra', slug: 'itra' },
        { label: 'Perfumes', slug: 'perfumes' },
      ]},
    ],
  },
  {
    id: 'instruments', label: 'Musical Instruments', icon: '🥁', slug: 'instruments',
    children: [
      { id: 'devotional-instruments', label: 'Instruments', slug: 'devotional-instruments', children: [
        { label: 'Mridangams', slug: 'mridangams' },
        { label: 'Kartal', slug: 'kartal' },
        { label: 'Happy Drums', slug: 'happy-drums' },
        { label: 'Singing Bowls', slug: 'singing-bowls' },
        { label: 'Hand Pan', slug: 'hand-pan' },
        { label: 'Pantham', slug: 'pantham' },
        { label: 'Darbooka', slug: 'darbooka' },
        { label: 'Whompers', slug: 'whompers' },
      ]},
    ],
  },
  {
    id: 'kid-toy', label: 'Kid Toy', icon: '🧸', slug: 'kid-toy',
    children: [
      { id: 'kids-toys', label: 'Toys & Puzzles', slug: 'kids-toys', children: [
        { label: 'Chase Game', slug: 'chase-game' },
        { label: 'Wooden Puzzles', slug: 'wooden-puzzles' },
        { label: 'Soft Krishna Dolls', slug: 'soft-krishna-dolls' },
        { label: 'Soft Dolls', slug: 'soft-dolls' },
      ]},
    ],
  },
  {
    id: 'yantras-crystals', label: 'Yantras & Crystals', icon: '🔮', slug: 'yantras-crystals',
    children: [
      { id: 'yantras', label: 'Yantras', slug: 'yantras', children: [
        { label: 'Shri Yantra', slug: 'shri-yantra' },
        { label: 'Shani Yantra', slug: 'shani-yantra' },
        { label: 'Nava Grah Yantra', slug: 'nava-grah-yantra' },
        { label: 'Sarpa Dosh Yantra', slug: 'sarpa-dosh-yantra' },
        { label: 'Laxmi Yantra', slug: 'laxmi-yantra' },
      ]},
      { id: 'crystal-bracelets-beads', label: 'Bracelets & Neck Beads', slug: 'crystal-bracelets-beads', children: [
        { label: '7 Chakra Bracelet', slug: '7-chakra-bracelet' },
        { label: 'Amazonite', slug: 'amazonite-bracelet' },
        { label: 'Amethyst', slug: 'amethyst-bracelet' },
        { label: 'Black Obsidian', slug: 'black-obsidian-bracelet' },
        { label: 'Black Onyx', slug: 'black-onyx-bracelet' },
        { label: 'Black Sulemani', slug: 'black-sulemani-bracelet' },
        { label: 'Black Tourmaline', slug: 'black-tourmaline-bracelet' },
        { label: 'Bloodstone', slug: 'bloodstone-bracelet' },
        { label: 'Blue Tiger Eye', slug: 'blue-tiger-eye-bracelet' },
        { label: 'Carnelian', slug: 'carnelian-bracelet' },
        { label: 'Cat Eye', slug: 'cat-eye-bracelet' },
        { label: 'Citrine', slug: 'citrine-bracelet' },
        { label: 'Clear Quartz', slug: 'clear-quartz-bracelet' },
        { label: 'Fluorite', slug: 'fluorite-bracelet' },
        { label: 'Green Aventurine', slug: 'green-aventurine-bracelet' },
        { label: 'Green Jade', slug: 'green-jade-bracelet' },
        { label: 'Hematite', slug: 'hematite-bracelet' },
        { label: 'Howlite', slug: 'howlite-bracelet' },
        { label: 'Lapis Lazuli', slug: 'lapis-lazuli-bracelet' },
        { label: 'Moonstone', slug: 'moonstone-bracelet' },
        { label: 'Multi Fluorite', slug: 'multi-fluorite-bracelet' },
        { label: 'Pearl', slug: 'pearl-bracelet' },
        { label: 'Pyrite', slug: 'pyrite-bracelet' },
        { label: 'Red Jasper', slug: 'red-jasper-bracelet' },
        { label: 'Rose Quartz', slug: 'rose-quartz-bracelet' },
        { label: 'Selenite', slug: 'selenite-bracelet' },
        { label: 'Sodalite', slug: 'sodalite-bracelet' },
        { label: 'Sunstone', slug: 'sunstone-bracelet' },
        { label: 'Tiger Eye', slug: 'tiger-eye-bracelet' },
        { label: 'Turquoise', slug: 'turquoise-bracelet' },
      ]},
      { id: 'raw-rough-stones', label: 'Raw Rough Stone', slug: 'raw-rough-stones', children: [
        { label: 'Pyrite', slug: 'raw-pyrite' },
        { label: 'Rose Quartz', slug: 'raw-rose-quartz' },
      ]},
    ],
  },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Spec { label: string; value: string; }
interface ProductImage { url: string; publicId: string; isPrimary: boolean; }

interface FormState {
  title: string; slug: string; sku: string;
  shortDescription: string; description: string; brand: string; productCollection: string;
  category: string; subcategory: string; productType: string;
  material: string; style: string; occasion: string;
  mrp: string; discountPercentage: string; sellingPrice: string;
  shippingCharge: string; finalPrice: string;
  stockStatus: string; quantity: string; lowStockThreshold: string; availabilityType: string;
  specifications: Spec[];
  colors: string[]; sizes: string[]; variants: string[];
  keyFeatures: string[]; careInstructions: string[];
  tags: string[]; seoTitle: string; seoDescription: string; searchKeywords: string[];
  dispatchTime: string; estimatedDelivery: string; returnAvailable: boolean;
  images: ProductImage[];
  status: string;
}

const initial = (): FormState => ({
  title: '', slug: '', sku: generateSKU(),
  shortDescription: '', description: '', brand: '', productCollection: '',
  category: '', subcategory: '', productType: '',
  material: '', style: '', occasion: '',
  mrp: '', discountPercentage: '35', sellingPrice: '', shippingCharge: '0', finalPrice: '',
  stockStatus: 'In Stock', quantity: '1', lowStockThreshold: '5', availabilityType: 'Ready To Ship',
  specifications: [],
  colors: [], sizes: [], variants: [],
  keyFeatures: [], careInstructions: [],
  tags: [], seoTitle: '', seoDescription: '', searchKeywords: [],
  dispatchTime: '', estimatedDelivery: '', returnAvailable: false,
  images: [],
  status: 'Draft',
});

// ─── Accordion Section ────────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = false, badge }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{title}</span>
          {badge && <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full font-medium">{badge}</span>}
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-gray-100 space-y-4">{children}</div>}
    </div>
  );
}

// ─── Dynamic List Field ───────────────────────────────────────────────────────

function ListField({ label, items, onChange, collection, placeholder }: {
  label: string; items: string[]; onChange: (v: string[]) => void;
  collection: string; placeholder?: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={placeholder}
            />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
        <div className="relative">
          <CreatableSelect
            collection={collection}
            value=""
            onChange={(v) => { if (v && !items.includes(v as string)) onChange([...items, v as string]); }}
            placeholder={`Search or add ${label.toLowerCase()}...`}
          />
        </div>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {items.map((item) => (
            <span key={item} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs">
              {item}
              <button type="button" onClick={() => onChange(items.filter((v) => v !== item))}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Specifications Field ─────────────────────────────────────────────────────

function SpecsField({ specs, onChange }: { specs: Spec[]; onChange: (v: Spec[]) => void }) {
  const add = () => onChange([...specs, { label: '', value: '' }]);
  const remove = (i: number) => onChange(specs.filter((_, j) => j !== i));
  const update = (i: number, key: keyof Spec, val: string) => {
    const n = [...specs]; n[i] = { ...n[i], [key]: val }; onChange(n);
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Specifications</p>
      <div className="space-y-2">
        {specs.map((spec, i) => (
          <div key={i} className="flex gap-2">
            <div className="w-2/5">
              <CreatableSelect
                collection="specifications"
                value={spec.label}
                onChange={(v) => update(i, 'label', v as string)}
                placeholder="Label (e.g. Weight)"
              />
            </div>
            <input
              value={spec.value}
              onChange={(e) => update(i, 'value', e.target.value)}
              placeholder="Value (e.g. 800 gm)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button type="button" onClick={() => remove(i)} className="p-2 text-gray-400 hover:text-red-500">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add}
        className="mt-2 flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium">
        <Plus size={14} /> Add Specification
      </button>
    </div>
  );
}

// ─── AI Button ────────────────────────────────────────────────────────────────

function AIButton({ onClick, loading, label }: { onClick: () => void; loading: boolean; label: string }) {
  return (
    <button type="button" onClick={onClick} disabled={loading}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 font-medium">
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
      {label}
    </button>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

interface Props {
  initialData?: Partial<FormState> & { _id?: string };
  mode?: 'create' | 'edit';
}

export function ProductForm({ initialData, mode = 'create' }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => ({
    ...initial(),
    ...initialData,
    images: normalizeImages((initialData?.images as any[]) || []),
  }));
  const [saving, setSaving] = useState(false);
  const [ai, setAi] = useState<string | null>(null);

  const set = useCallback((field: keyof FormState, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      // Auto-generate slug from title
      if (field === 'title') next.slug = slugify(value);

      // Cascade reset for dependent category dropdowns
      if (field === 'category') {
        next.subcategory = '';
        next.productType = '';
      }
      if (field === 'subcategory') {
        next.productType = '';
      }

      // Pricing: Selling Price + Shipping = Final Price. MRP = Final Price / (1 - disc%)
      if (['sellingPrice', 'shippingCharge', 'discountPercentage'].includes(field)) {
        const sp = parseFloat(field === 'sellingPrice' ? value : next.sellingPrice) || 0;
        const shipping = parseFloat(field === 'shippingCharge' ? value : next.shippingCharge) || 0;
        const disc = parseFloat(field === 'discountPercentage' ? value : next.discountPercentage) || 0;
        const fp = sp + shipping;
        next.finalPrice = fp.toFixed(2);
        next.mrp = disc < 100 ? (fp / (1 - disc / 100)).toFixed(2) : fp.toFixed(2);
      }

      return next;
    });
  }, []);

  const handleImages = (images: ProductImage[]) => set('images', images);

  // AI Generators
  const aiContext = () => ({
    title: form.title, category: form.category, subcategory: form.subcategory,
    material: form.material, style: form.style, occasion: form.occasion,
    description: form.description,
    images: form.images.map((i) => i.url),
  });

  const genDescription = async () => {
    if (!form.images.length) return toast.error('Upload at least one image first');
    setAi('desc');
    try {
      const res = await apiAI.generateDescription(aiContext());
      const data = res.data;
      if (data.description) set('description', data.description);
      if (data.shortDescription) set('shortDescription', data.shortDescription);
      toast.success('Description generated');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'AI failed');
    } finally { setAi(null); }
  };

  const genTags = async () => {
    if (!form.title) return toast.error('Enter a product title first');
    setAi('tags');
    try {
      const res = await apiAI.generateTags(aiContext());
      set('tags', Array.isArray(res.data) ? res.data : []);
      toast.success('Tags generated');
    } catch { toast.error('AI failed'); } finally { setAi(null); }
  };

  const genSEO = async () => {
    if (!form.title) return toast.error('Enter a product title first');
    setAi('seo');
    try {
      const res = await apiAI.generateSEO(aiContext());
      const { seoTitle, seoDescription, searchKeywords } = res.data;
      setForm((p) => ({ ...p, seoTitle: seoTitle || p.seoTitle, seoDescription: seoDescription || p.seoDescription, searchKeywords: searchKeywords || p.searchKeywords }));
      toast.success('SEO metadata generated');
    } catch { toast.error('AI failed'); } finally { setAi(null); }
  };

  const handleSubmit = async (status: string) => {
    if (!form.title.trim()) return toast.error('Product title is required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        status,
        mrp: parseFloat(form.mrp) || 0,
        discountPercentage: parseFloat(form.discountPercentage) || 0,
        sellingPrice: parseFloat(form.sellingPrice) || 0,
        shippingCharge: parseFloat(form.shippingCharge) || 0,
        finalPrice: parseFloat(form.finalPrice) || 0,
        quantity: parseInt(form.quantity) || 0,
        lowStockThreshold: parseInt(form.lowStockThreshold) || 5,
      };

      if (mode === 'edit' && initialData?._id) {
        await apiProducts.update(initialData._id, payload);
        toast.success('Product updated');
        router.push(`/products/${initialData._id}`);
      } else {
        await apiProducts.create(payload);
        toast.success('Product saved');
        router.push('/products');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const inputCls = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-3 pb-24">

      {/* ── 1. Basic Information ── */}
      <Section title="Media Upload" defaultOpen>
        <ImageUpload onUpload={handleImages} existingImages={form.images} maxFiles={10} />
      </Section>

      <Section title="Basic Information" defaultOpen>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Product Title *"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Antique Brass Ganesha Idol"
            />
          </div>
          <div>
            <label className={labelCls}>Slug</label>
            <input value={form.slug} onChange={(e) => set('slug', e.target.value)} className={inputCls} placeholder="auto-generated" />
          </div>
          <div>
            <label className={labelCls}>SKU</label>
            <input value={form.sku} disabled className={cn(inputCls, 'bg-gray-50 text-gray-500')} />
          </div>
          <Input label="Brand" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Jaipur Crafts" />
          <Input label="Collection" value={form.productCollection} onChange={(e) => set('productCollection', e.target.value)} placeholder="e.g. Diwali 2024" />
        </div>

        <div>
          <label className={labelCls}>Short Description</label>
          <textarea value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)}
            rows={2} placeholder="One-line product summary..." className={inputCls} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelCls}>Full Description</label>
            <AIButton onClick={genDescription} loading={ai === 'desc'} label="Generate with AI" />
          </div>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
            rows={4} placeholder="Detailed product description..." className={inputCls} />
        </div>
      </Section>

      {/* ── 2. Categorization ── */}
      <Section title="Product Categorization" badge="Dynamic">
        {/* ── Level 1 → 2 → 3 dependent dropdowns ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Category (Level 1) */}
          <div>
            <label className={labelCls}>Category</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className={inputCls}
            >
              <option value="">— Select Category —</option>
              {MENU_DATA.map((cat) => (
                <option key={cat.id} value={cat.label}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>

          {/* Sub Category (Level 2) */}
          <div>
            <label className={labelCls}>Sub Category</label>
            <select
              value={form.subcategory}
              onChange={(e) => set('subcategory', e.target.value)}
              disabled={!form.category}
              className={cn(inputCls, !form.category && 'bg-gray-50 text-gray-400 cursor-not-allowed')}
            >
              <option value="">— Select Sub Category —</option>
              {(MENU_DATA.find((cat) => cat.label === form.category)?.children ?? []).map((sub) => (
                <option key={sub.id} value={sub.label}>{sub.label}</option>
              ))}
            </select>
          </div>

          {/* Product Category (Level 3) */}
          <div className="sm:col-span-2">
            <label className={labelCls}>Product Category</label>
            <select
              value={form.productType}
              onChange={(e) => set('productType', e.target.value)}
              disabled={!form.subcategory}
              className={cn(inputCls, !form.subcategory && 'bg-gray-50 text-gray-400 cursor-not-allowed')}
            >
              <option value="">— Select Product Category —</option>
              {(
                MENU_DATA
                  .find((cat) => cat.label === form.category)
                  ?.children.find((sub) => sub.label === form.subcategory)
                  ?.children ?? []
              ).map((item) => (
                <option key={item.slug} value={item.label}>{item.label}</option>
              ))}
            </select>
          </div>

        </div>

        {/* ── Additional Attributes ── */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Additional Attributes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CreatableSelect collection="materials" value={form.material} onChange={(v) => set('material', v)} label="Material" placeholder="e.g. Brass" />
            <CreatableSelect collection="styles" value={form.style} onChange={(v) => set('style', v)} label="Style" placeholder="e.g. Antique" />
            <CreatableSelect collection="occasions" value={form.occasion} onChange={(v) => set('occasion', v)} label="Occasion" placeholder="e.g. Diwali" />
          </div>
        </div>
      </Section>

      {/* ── 3. Pricing ── */}
      <Section title="Pricing & Discounts">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Selling Price (₹) *</label>
            <input type="number" value={form.sellingPrice} onChange={(e) => set('sellingPrice', e.target.value)} className={cn(inputCls, 'bg-green-50 font-semibold text-green-800')} placeholder="e.g. 650" min="0" />
          </div>
          <div>
            <label className={labelCls}>Shipping Charge (₹)</label>
            <input type="number" value={form.shippingCharge} onChange={(e) => set('shippingCharge', e.target.value)} className={inputCls} placeholder="0" min="0" />
          </div>
          <div>
            <label className={labelCls}>Discount %</label>
            <input type="number" value={form.discountPercentage} onChange={(e) => set('discountPercentage', e.target.value)} className={inputCls} placeholder="35" min="0" max="100" />
          </div>
          <div>
            <label className={labelCls}>Final Price (₹) <span className="text-gray-400 font-normal text-xs">auto</span></label>
            <input type="number" value={form.finalPrice} disabled className={cn(inputCls, 'bg-gray-50 text-gray-500 font-semibold')} />
          </div>
          <div>
            <label className={labelCls}>MRP (₹) <span className="text-gray-400 font-normal text-xs">auto</span></label>
            <input type="number" value={form.mrp} disabled className={cn(inputCls, 'bg-gray-50 text-gray-500 font-semibold')} />
          </div>
        </div>
        {form.finalPrice && form.mrp && parseFloat(form.mrp) > parseFloat(form.finalPrice) && (
          <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            MRP ₹{parseFloat(form.mrp).toFixed(2)} · Customer saves ₹{(parseFloat(form.mrp) - parseFloat(form.finalPrice)).toFixed(2)} ({form.discountPercentage}% off)
          </p>
        )}
      </Section>

      {/* ── 4. Inventory ── */}
      <Section title="Inventory & Availability">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Stock Status</label>
            <select value={form.stockStatus} onChange={(e) => set('stockStatus', e.target.value)} className={inputCls}>
              {['In Stock', 'Out of Stock', 'On Demand', 'Pre Order'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Quantity</label>
            <input type="number" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} className={inputCls} min="0" />
          </div>
          <div>
            <label className={labelCls}>Low Stock Alert</label>
            <input type="number" value={form.lowStockThreshold} onChange={(e) => set('lowStockThreshold', e.target.value)} className={inputCls} min="0" />
          </div>
          <div>
            <label className={labelCls}>Availability</label>
            <select value={form.availabilityType} onChange={(e) => set('availabilityType', e.target.value)} className={inputCls}>
              {['Ready To Ship', 'Made To Order'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Section>

      {/* ── 5. Specifications ── */}
      <Section title="Specifications" badge="Dynamic">
        <SpecsField specs={form.specifications} onChange={(v) => set('specifications', v)} />
      </Section>

      {/* ── 6. Attributes ── */}
      <Section title="Product Attributes">
        <div className="space-y-4">
          <CreatableSelect collection="colors" value={form.colors} onChange={(v) => set('colors', v)} label="Colors" multi placeholder="Add colors..." />
          <CreatableSelect collection="sizes" value={form.sizes} onChange={(v) => set('sizes', v)} label="Sizes" multi placeholder="Add sizes..." />
        </div>
      </Section>

      {/* ── 7. Key Features ── */}
      <Section title="Key Features">
        <ListField label="Key Features" items={form.keyFeatures} onChange={(v) => set('keyFeatures', v)} collection="features" placeholder="e.g. Handcrafted in India" />
      </Section>

      {/* ── 8. Care Instructions ── */}
      <Section title="Care Instructions">
        <ListField label="Care Instructions" items={form.careInstructions} onChange={(v) => set('careInstructions', v)} collection="careInstructions" placeholder="e.g. Clean with soft cloth" />
      </Section>

      {/* ── 9. Shipping ── */}
      <Section title="Shipping Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Dispatch Time" value={form.dispatchTime} onChange={(e) => set('dispatchTime', e.target.value)} placeholder="e.g. 1-2 business days" />
          <Input label="Estimated Delivery" value={form.estimatedDelivery} onChange={(e) => set('estimatedDelivery', e.target.value)} placeholder="e.g. 5-7 business days" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.returnAvailable} onChange={(e) => set('returnAvailable', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
          <span className="text-sm text-gray-700">Returns available</span>
        </label>
      </Section>

      {/* ── 11. SEO & AI Metadata ── */}
      <Section title="SEO & AI Metadata">
        <div className="flex justify-end mb-2">
          <AIButton onClick={genSEO} loading={ai === 'seo'} label="Generate All SEO with AI" />
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls}>Tags</label>
              <AIButton onClick={genTags} loading={ai === 'tags'} label="Generate Tags" />
            </div>
            <CreatableSelect collection="tags" value={form.tags} onChange={(v) => set('tags', v)} multi placeholder="Add tags..." />
          </div>
          <Input label="SEO Title" value={form.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} placeholder="Max 60 characters" />
          <div>
            <label className={labelCls}>SEO Description</label>
            <textarea value={form.seoDescription} onChange={(e) => set('seoDescription', e.target.value)}
              rows={2} placeholder="Max 160 characters" className={inputCls} />
            <p className="text-xs text-gray-400 mt-1">{form.seoDescription.length}/160</p>
          </div>
          <div>
            <label className={labelCls}>Search Keywords</label>
            <input
              value={form.searchKeywords.join(', ')}
              onChange={(e) => set('searchKeywords', e.target.value.split(',').map((k) => k.trim()).filter(Boolean))}
              className={inputCls}
              placeholder="keyword1, keyword2, keyword3..."
            />
          </div>
        </div>
      </Section>

      {/* ── Sticky Save Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg-soft px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex-1">
            <select value={form.status} onChange={(e) => set('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              {['Draft', 'Review', 'Published', 'Archived'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <Button variant="secondary" onClick={() => handleSubmit('Draft')} isLoading={saving}>
            Save Draft
          </Button>
          <Button onClick={() => handleSubmit(form.status)} isLoading={saving}>
            {mode === 'edit' ? 'Update Product' : 'Save Product'}
          </Button>
        </div>
      </div>
    </div>
  );
}

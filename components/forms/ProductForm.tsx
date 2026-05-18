'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { generateSKU } from '@/lib/utils';
import { apiProducts, apiAI } from '@/lib/api';
import { Sparkles } from 'lucide-react';

const CATEGORIES = [
  'Men - Dhoti Kurta', 'Men - Bagalbandi', 'Men - Short Kurta', 'Men - Shirts', 'Men - Silk Jackets', 'Men - Chadar', 'Men - Pajama', 'Men - Pants',
  'Women - Gopi Dress', 'Women - Anarkali Gopi Dress', 'Women - Kurtis', 'Women - Sarees', 'Women - Dupattas', 'Women - Pajama', 'Women - Pants',
  'Kids - Dhoti Kurta', 'Kids - Bagalbandi', 'Kids - T-Shirts', 'Kids - Girls Gopi Dress', 'Kids - Ethnic Wear',
  'Brass Idols', 'Bronze Idols', 'Clay Idols', 'Wooden Idols', 'Marble Idols', 'Stone Idols', 'Fiber Idols',
  'Krishna Idols', 'Radha Krishna Idols', 'Shiva Idols', 'Ganesha Idols', 'Lakshmi Idols', 'Hanuman Idols', 'Saraswati Idols', 'Durga Idols', 'Ram Darbar', 'Jagannath Idols',
  'Tulasi Japa Mala', 'Kanthi Mala', 'Rudraksha Mala', 'Meditation Cushions', 'Incense', 'Singing Bowls', 'Aroma Oils',
  'Conch Shells', 'Panchaarati', 'Incense Stands', 'Diyas', 'Puja Thalis', 'Bells', 'Camphor', 'Agarbatti', 'Cotton Wicks',
  'Mridanga', 'Harmonium', 'Kartal', 'Flute', 'Tabla', 'Veena', 'Tambourine',
  'Healing Crystals', 'Crystal Trees', 'Crystal Bracelets', 'Chakra Stones', 'Reiki Products', 'Crystal Pyramids',
  'Keychains', 'Earrings', 'Bangles', 'Necklaces', 'Pendants', 'Rings', 'Bracelets',
  'Hemp Side Bags', 'Cotton Hand Bags', 'Laptop Bags', 'Travel Bags', 'Tote Bags',
  'Bhagavad Gita', 'Srimad Bhagavatam', 'Ramayana', 'Mahabharata', 'Spiritual Literature', 'Kids Story Books', 'Moral Stories', 'Activity Books',
  'Himalaya Juice', 'Churn', 'Eye Drops', 'Herbal Oils', 'Natural Powders', 'Wellness Products',
  'Wall Hangings', 'Lamps', 'Decorative Frames', 'Temple Decor', 'Spiritual Decor',
  'Wooden Temples', 'Wooden Toys', 'Wooden Decor', 'Handcrafted Art', 'Wooden Storage Boxes',
  'Radha Krishna Paintings', 'Shiva Paintings', 'Abstract Art', 'Canvas Paintings', 'Handmade Paintings',
  'Kids Learning Toys', 'Plush Toys', 'Puzzle Games', 'Spiritual Toys',
  'Janmashtami', 'Diwali', 'Holi', 'Navratri', 'Rath Yatra', 'Raksha Bandhan', 'Makar Sankranti',
  "Today's Deals", 'Festival Sale', 'Combo Offers', 'Clearance Sale', 'New Launches', 'Trending Products',
];

const initial = () => ({
  sku: generateSKU(),
  title: '',
  category: 'Men - Dhoti Kurta',
  mrp: '',
  sellingPrice: '',
  quantity: '1',
  material: '',
  dimensions: '',
  description: '',
  tags: '',
  status: 'Draft',
  images: [] as string[],
});

export function ProductForm() {
  const router = useRouter();
  const [form, setForm] = useState(initial());
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<'desc' | 'tags' | null>(null);

  const set = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    set(e.target.name, e.target.value);

  const generateDesc = async () => {
    if (!form.title) return toast.error('Enter a product title first');
    if (!form.images.length) return toast.error('Upload at least one image first');
    setAiLoading('desc');
    try {
      const payload = { title: form.title, images: form.images };
      console.log('Sending to API:', payload);
      const res = await apiAI.generateDescription(payload);
      set('description', res.data);
      toast.success('Description generated!');
    } catch (e: any) { toast.error(e?.response?.data?.error || e?.message || 'AI failed'); }
    finally { setAiLoading(null); }
  };

  const generateTags = async () => {
    if (!form.title) return toast.error('Enter a product title first');
    setAiLoading('tags');
    try {
      const res = await apiAI.generateTags({ title: form.title, description: form.description, category: form.category });
      set('tags', (Array.isArray(res.data) ? res.data : []).join(', '));
      toast.success('Tags generated!');
    } catch (e: any) { toast.error(e?.response?.data?.error || e?.message || 'AI failed'); }
    finally { setAiLoading(null); }
  };

  const handleSubmit = async (status: string) => {
    if (!form.title) return toast.error('Product title is required');
    if (!form.images.length) return toast.error('At least one image is required');
    setSaving(true);
    try {
      await apiProducts.create({
        ...form,
        status,
        mrp: parseFloat(form.mrp) || 0,
        sellingPrice: parseFloat(form.sellingPrice) || 0,
        quantity: parseInt(form.quantity) || 1,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      toast.success('Product saved!');
      setForm(initial());
      router.push('/products');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const inputClass = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent';

  return (
    <div className="space-y-4">
      {/* Images */}
      <Card>
        <CardHeader><CardTitle>Product Images *</CardTitle></CardHeader>
        <CardContent>
          <ImageUpload onUpload={(urls) => set('images', urls)} />
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="SKU" name="sku" value={form.sku} disabled />
          <Input label="Product Name *" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Antique Teak Chair" />
          <div>
            <label className={labelClass}>Category</label>
            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader><CardTitle>Pricing & Stock</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Input label="MRP (₹)" name="mrp" type="number" value={form.mrp} onChange={handleChange} placeholder="0" />
          <Input label="Selling Price (₹)" name="sellingPrice" type="number" value={form.sellingPrice} onChange={handleChange} placeholder="0" />
          <Input label="Quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} min="0" />
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              <option>Draft</option>
              <option>Review</option>
              <option>Published</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Material" name="material" value={form.material} onChange={handleChange} placeholder="e.g. Teak Wood" />
          <Input label="Dimensions" name="dimensions" value={form.dimensions} onChange={handleChange} placeholder="e.g. 100cm × 50cm × 45cm" />
        </CardContent>
      </Card>

      {/* AI Fields */}
      <Card>
        <CardHeader><CardTitle>Description & Tags</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Product description..." className={inputClass} />
            <Button type="button" variant="secondary" size="sm" onClick={generateDesc} isLoading={aiLoading === 'desc'} className="mt-2">
              <Sparkles size={14} /> Generate with AI
            </Button>
          </div>
          <div>
            <label className={labelClass}>Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input name="tags" value={form.tags} onChange={handleChange} placeholder="antique, wood, chair..." className={inputClass} />
            <Button type="button" variant="secondary" size="sm" onClick={generateTags} isLoading={aiLoading === 'tags'} className="mt-2">
              <Sparkles size={14} /> Generate with AI
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-3 pb-6">
        <Button onClick={() => handleSubmit('Draft')} variant="secondary" isLoading={saving} className="flex-1">
          Save as Draft
        </Button>
        <Button onClick={() => handleSubmit(form.status)} isLoading={saving} className="flex-1">
          Save Product
        </Button>
      </div>
    </div>
  );
}

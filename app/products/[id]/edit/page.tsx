'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { apiProducts, apiAI } from '@/lib/api';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

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

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<'desc' | 'tags' | null>(null);

  useEffect(() => {
    apiProducts.get(params.id).then((r) => {
      const p = r.data;
      setForm({
        ...p,
        tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags,
        mrp: String(p.mrp),
        sellingPrice: String(p.sellingPrice),
        quantity: String(p.quantity),
      });
    }).catch(() => toast.error('Failed to load product'));
  }, [params.id]);

  const set = (field: string, value: any) => setForm((p: any) => ({ ...p, [field]: value }));
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    set(e.target.name, e.target.value);

  const generateDesc = async () => {
    if (!form.title) return toast.error('Enter a product title first');
    if (!form.images?.length) return toast.error('Upload at least one image first');
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
    setAiLoading('tags');
    try {
      const res = await apiAI.generateTags({ title: form.title, description: form.description, category: form.category });
      set('tags', (Array.isArray(res.data) ? res.data : []).join(', '));
      toast.success('Tags generated!');
    } catch (e: any) { toast.error(e?.response?.data?.error || 'AI failed'); }
    finally { setAiLoading(null); }
  };

  const handleSave = async () => {
    if (!form.title) return toast.error('Product title is required');
    setSaving(true);
    try {
      await apiProducts.update(params.id, {
        ...form,
        mrp: parseFloat(form.mrp) || 0,
        sellingPrice: parseFloat(form.sellingPrice) || 0,
        quantity: parseInt(form.quantity) || 1,
        tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      });
      toast.success('Product updated!');
      router.push(`/products/${params.id}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const inputClass = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent';

  if (!form) return (
    <ProtectedLayout>
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    </ProtectedLayout>
  );

  return (
    <ProtectedLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Link href={`/products/${params.id}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Edit Product</h1>
          <Button onClick={handleSave} isLoading={saving} size="sm">Save</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Product Images</CardTitle></CardHeader>
          <CardContent>
            <ImageUpload onUpload={(urls) => set('images', urls)} existingImages={form.images} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="SKU" name="sku" value={form.sku} disabled />
            <Input label="Product Name *" name="title" value={form.title} onChange={handleChange} />
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pricing & Stock</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Input label="MRP (₹)" name="mrp" type="number" value={form.mrp} onChange={handleChange} />
            <Input label="Selling Price (₹)" name="sellingPrice" type="number" value={form.sellingPrice} onChange={handleChange} />
            <Input label="Quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} min="0" />
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                <option>Draft</option>
                <option>Review</option>
                <option>Published</option>
                <option>Sold</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Material" name="material" value={form.material} onChange={handleChange} />
            <Input label="Dimensions" name="dimensions" value={form.dimensions} onChange={handleChange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Description & Tags</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={labelClass}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputClass} />
              <Button type="button" variant="secondary" size="sm" onClick={generateDesc} isLoading={aiLoading === 'desc'} className="mt-2">
                <Sparkles size={14} /> Generate with AI
              </Button>
            </div>
            <div>
              <label className={labelClass}>Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
              <input name="tags" value={form.tags} onChange={handleChange} className={inputClass} />
              <Button type="button" variant="secondary" size="sm" onClick={generateTags} isLoading={aiLoading === 'tags'} className="mt-2">
                <Sparkles size={14} /> Generate with AI
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 pb-6">
          <Link href={`/products/${params.id}`} className="flex-1">
            <button className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          </Link>
          <Button onClick={handleSave} isLoading={saving} className="flex-1 justify-center">Save Changes</Button>
        </div>
      </div>
    </ProtectedLayout>
  );
}

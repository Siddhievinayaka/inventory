'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Upload, Camera, X, Star } from 'lucide-react';

interface ProductImage { url: string; publicId: string; isPrimary: boolean; }

type Props = {
  onUpload: (images: ProductImage[]) => void;
  existingImages?: any[];
  maxFiles?: number;
};

function toProductImages(raw: any[]): ProductImage[] {
  if (!raw?.length) return [];
  return raw.map((img, i) => {
    if (typeof img === 'string') return { url: img, publicId: '', isPrimary: i === 0 };
    return { url: img.url || '', publicId: img.publicId || '', isPrimary: img.isPrimary ?? i === 0 };
  });
}

export function ImageUpload({ onUpload, existingImages = [], maxFiles = 10 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [images, setImages] = useState<ProductImage[]>(toProductImages(existingImages));
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    if (images.length + files.length > maxFiles) {
      toast.error(`Max ${maxFiles} images allowed`);
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      const res = await fetch('/api/products/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const newImages: ProductImage[] = data.urls.map((url: string, i: number) => ({
        url,
        publicId: data.publicIds?.[i] || '',
        isPrimary: images.length === 0 && i === 0,
      }));

      const updated = [...images, ...newImages];
      setImages(updated);
      onUpload(updated);
      toast.success(`${newImages.length} image(s) uploaded`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    let updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0] = { ...updated[0], isPrimary: true };
    }
    setImages(updated);
    onUpload(updated);
  };

  const setPrimary = (index: number) => {
    const updated = images.map((img, i) => ({ ...img, isPrimary: i === index }));
    setImages(updated);
    onUpload(updated);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${drag ? 'border-brand-500 bg-brand-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`}
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={28} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-600">Drag & drop or click to upload</p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · max {maxFiles} files</p>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
          <Upload size={15} /> {uploading ? 'Uploading...' : 'Browse Files'}
        </button>
        <button type="button" onClick={() => cameraRef.current?.click()} disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
          <Camera size={15} /> Camera
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFiles(e.target.files)} />

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((img, i) => (
            <div key={i} className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-colors ${img.isPrimary ? 'border-brand-500' : 'border-gray-200'}`}>
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <button type="button" onClick={() => setPrimary(i)}
                  className={`p-1.5 rounded-full transition-colors ${img.isPrimary ? 'bg-brand-500 text-white' : 'bg-white/80 text-gray-700 hover:bg-brand-500 hover:text-white'}`}>
                  <Star size={12} />
                </button>
                <button type="button" onClick={() => removeImage(i)}
                  className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                  <X size={12} />
                </button>
              </div>
              {img.isPrimary && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded font-medium">Primary</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Upload, Camera, X } from 'lucide-react';

type Props = {
  onUpload: (urls: string[]) => void;
  existingImages?: string[];
  maxFiles?: number;
};

export function ImageUpload({ onUpload, existingImages = [], maxFiles = 5 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [images, setImages] = useState<string[]>(existingImages);
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
      const updated = [...images, ...data.urls];
      setImages(updated);
      onUpload(updated);
      toast.success(`${data.urls.length} image(s) uploaded`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onUpload(updated);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${drag ? 'border-brand-500 bg-brand-50' : 'border-gray-300 bg-gray-50'}`}
      >
        <Upload size={28} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">Drag & drop images here</p>
        <p className="text-xs text-gray-400 mt-1">or use buttons below · max {maxFiles} files</p>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          <Upload size={16} /> {uploading ? 'Uploading...' : 'Browse Files'}
        </button>
        <button type="button" onClick={() => cameraRef.current?.click()} disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          <Camera size={16} /> Camera
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFiles(e.target.files)} />

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square">
              <img src={url} alt="" className="w-full h-full object-cover rounded-lg border border-gray-200" />
              <button type="button" onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

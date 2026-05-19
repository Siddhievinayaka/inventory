export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));
}

export function generateSKU() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SKU-${ts}-${rand}`;
}

export function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Handles both old string[] and new {url, publicId, isPrimary}[] image formats
export function getImageUrl(img: any): string {
  if (!img) return '';
  if (typeof img === 'string') return img;
  return img.url || '';
}

export function getPrimaryImage(images: any[]): string {
  if (!images?.length) return '';
  const primary = images.find((i) => i?.isPrimary);
  return getImageUrl(primary || images[0]);
}

export function normalizeImages(images: any[]): { url: string; publicId: string; isPrimary: boolean }[] {
  if (!images?.length) return [];
  return images.map((img, i) => {
    if (typeof img === 'string') return { url: img, publicId: '', isPrimary: i === 0 };
    return { url: img.url || '', publicId: img.publicId || '', isPrimary: img.isPrimary ?? i === 0 };
  });
}

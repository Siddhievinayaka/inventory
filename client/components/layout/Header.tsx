'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { LogOut, Package, LayoutDashboard, PlusCircle, Menu, X, Database } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products/add', label: 'Add Product', icon: PlusCircle },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/master-data', label: 'Master Data', icon: Database },
];

export function Header() {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/products' ? pathname === '/products' : pathname.startsWith(href);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-brand-700">
          <div className="w-7 h-7 bg-brand-600 rounded-md" />
          <span className="hidden sm:inline text-sm">Radha Store</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors', isActive(href) ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100')}>
              <Icon size={15} />{label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={logout} className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            <LogOut size={15} /> Logout
          </button>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-2 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className={cn('flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium', isActive(href) ? 'bg-brand-50 text-brand-700' : 'text-gray-700')}>
              <Icon size={15} />{label}
            </Link>
          ))}
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 w-full">
            <LogOut size={15} /> Logout
          </button>
        </div>
      )}
    </header>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const defaultLinks = {
  admin: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/orders', label: 'Orders', icon: '📋' },
    { href: '/dashboard/new-order', label: 'Buat Order', icon: '➕' },
    { href: '/dashboard/queue', label: 'Antrian', icon: '⏳' },
    { href: '/dashboard/qc', label: 'QC', icon: '✅' },
    { href: '/dashboard/reports', label: 'Reports', icon: '📈' },
    { href: '/dashboard/users', label: 'Users', icon: '👥' },
  ],
  teknisi: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/queue', label: 'Antrian', icon: '⏳' },
    { href: '/dashboard/orders', label: 'Orders', icon: '📋' },
  ],
  supervisor: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/orders', label: 'Orders', icon: '📋' },
    { href: '/dashboard/qc', label: 'QC', icon: '✅' },
    { href: '/dashboard/reports', label: 'Reports', icon: '📈' },
    { href: '/dashboard/users', label: 'Users', icon: '👥' },
  ],
};

export function Sidebar() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          router.push('/auth/login');
        }
      })
      .catch(() => {
        router.push('/auth/login');
      });

    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };

  const links = user ? defaultLinks[user.role as keyof typeof defaultLinks] || defaultLinks.admin : [];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
        aria-label="Buka menu"
      >
        <span className="text-xl">☰</span>
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        w-full max-w-[280px] rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30
        lg:w-[280px] lg:block
        fixed lg:relative top-0 left-0 h-full lg:h-auto z-50 lg:z-auto
        transition-transform duration-300 ease-in-out
      `}>
        <div className="flex items-center justify-between mb-8 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Arlogic</p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white text-2xl"
            aria-label="Tutup menu"
          >
            ✕
          </button>
        </div>
        <div className="mb-8 hidden lg:block">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔧</span>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Arlogic</p>
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-white">Service Dashboard</h1>
        </div>

        {user ? (
          <div className="mb-6 rounded-3xl border border-slate-700 bg-slate-900/60 p-4 hover:border-slate-600 transition">
            <div className="text-xs text-slate-500 uppercase tracking-[0.1em] font-medium">Signed in as</div>
            <div className="mt-2 text-base font-semibold text-white">{user.name}</div>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-[0.1em]">
              {user.role === 'admin' && <span className="badge-antrian">Admin</span>}
              {user.role === 'teknisi' && <span className="badge-proses">Teknisi</span>}
              {user.role === 'supervisor' && <span className="badge-siap">Supervisor</span>}
            </div>
          </div>
        ) : null}

        <nav className="space-y-1 mb-8">
          {links.map((link) => {
            const isActive = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition duration-200 ${
                  isActive
                    ? 'bg-brand-500/20 text-brand-200 border border-brand-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-red-600/50 hover:bg-red-600/10 hover:text-red-300"
        >
          <span>🚪</span>
          Logout
        </button>
      </aside>
    </>
  );
}
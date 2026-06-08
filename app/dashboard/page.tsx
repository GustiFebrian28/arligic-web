'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatCurrency, formatDate, totalOrder } from '../../lib/utils';

interface OrderSummary {
  label: string;
  count: number;
  icon: string;
  color: string;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats: OrderSummary[] = [
    { 
      label: 'Total Order', 
      count: orders.length, 
      icon: '📦',
      color: 'from-blue-500/20 to-blue-600/10'
    },
    { 
      label: 'Dalam Antrian', 
      count: orders.filter((order) => order.status === 'Dalam Antrian').length,
      icon: '⏳',
      color: 'from-blue-500/20 to-blue-600/10'
    },
    { 
      label: 'Proses Pengerjaan', 
      count: orders.filter((order) => order.status === 'Proses Pengerjaan').length,
      icon: '🔧',
      color: 'from-amber-500/20 to-amber-600/10'
    },
    { 
      label: 'Menunggu QC', 
      count: orders.filter((order) => order.status === 'Menunggu QC').length,
      icon: '✅',
      color: 'from-purple-500/20 to-purple-600/10'
    },
  ];

  const totalRevenue = orders
    .filter((order) => order.status === 'Selesai Diambil')
    .reduce((sum, order) => sum + totalOrder(order), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-100/70">Dashboard</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">Selamat datang di Arlogic</h1>
          <p className="mt-2 max-w-2xl text-slate-400">Pantau antrian, order, dokumentasi, dan status QC dari satu tempat.</p>
        </div>
        <Link href="/dashboard/new-order" className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 active:bg-brand-700">
          <span>➕</span>
          Buat Order Baru
        </Link>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-300">Memuat data...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <article key={item.label} className={`stat-card bg-gradient-to-br ${item.color}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="stat-label">{item.label}</p>
                  <p className="stat-value">{item.count}</p>
                </div>
                <div className="text-4xl opacity-20">{item.icon}</div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 hover:border-slate-700 transition">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">📊</span>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">Ringkasan Proses Order</h2>
              <p className="mt-2 text-slate-400 text-sm">Alur kerja sistem mendukung Admin, Teknisi, Supervisor, dan pelanggan dengan kontrol akses dan audit trail.</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-green-500/10 to-green-600/5 p-6 hover:border-green-700/50 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">💰 Revenue dari order selesai</p>
              <p className="mt-3 text-3xl font-semibold text-green-300">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="text-right text-slate-400">
              <p className="text-xs uppercase tracking-[0.2em]">📅 Data terbaru</p>
              <p className="mt-2 text-sm">{formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { OrderStatusBadge } from '../../../components/OrderStatusBadge';
import { formatDate } from '../../../lib/utils';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    if (!query.trim()) return orders;
    const lower = query.toLowerCase();
    return orders.filter((order) =>
      [order.id, order.customer, order.brand, order.model, order.status, order.phone]
        .join(' ')
        .toLowerCase()
        .includes(lower)
    );
  }, [orders, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-100/70">Daftar Order</p>
          <h1 className="text-3xl font-semibold text-white">Orders</h1>
        </div>
        <Link href="/dashboard/new-order" className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 active:bg-brand-700">
          <span>➕</span>
          Tambah Order
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="form-input"
          placeholder="🔍 Cari order, pelanggan, merek, status..."
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-lg">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <div className="flex flex-col items-center gap-3">
              <div className="text-2xl">⏳</div>
              <div>Memuat order...</div>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📭</div>
            <div className="empty-text">Tidak ada order ditemukan</div>
          </div>
        ) : (
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Merek</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/50 transition duration-150 cursor-pointer">
                  <td className="px-6 py-4 font-medium text-white">
                    <Link href={`/dashboard/orders/${order.id}`} className="text-brand-300 hover:text-brand-200 font-semibold">
                      {order.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-medium">{order.customer}</td>
                  <td className="px-6 py-4 text-slate-400">{order.brand}</td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-400">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

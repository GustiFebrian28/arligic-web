'use client';

import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../../components/useCurrentUser';
import { formatCurrency, formatDate, totalOrder } from '../../../lib/utils';

export default function QCPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingOrder, setRejectingOrder] = useState<any>(null);
  const [rejectNote, setRejectNote] = useState('');

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => setOrders((data.orders || []).filter((order: any) => order.status === 'Menunggu QC')))
      .finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    setLoading(true);
    const response = await fetch('/api/orders');
    const data = await response.json();
    setOrders((data.orders || []).filter((order: any) => order.status === 'Menunggu QC'));
    setLoading(false);
  };

  const handleApprove = async (order: any) => {
    await fetch(`/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Siap Diambil', qcNote: order.qcNote, qcApproved: true, qcBy: user?.id ?? null, qcAt: new Date().toISOString(), discount: Number(order.discount || 0), extraCost: Number(order.extraCost || 0) }),
    });
    refresh();
  };

  const handleReject = async (order: any) => {
    if (!rejectNote || rejectNote.trim() === '') {
      alert('Silakan masukkan alasan revisi terlebih dahulu.');
      return;
    }
    await fetch(`/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Perlu Revisi', qcNote: rejectNote, qcApproved: false, qcBy: user?.id ?? null, qcAt: new Date().toISOString() }),
    });
    setRejectingOrder(null);
    setRejectNote('');
    refresh();
  };

  const openRejectDialog = (order: any) => {
    setRejectingOrder(order);
    setRejectNote('');
  };

  const closeRejectDialog = () => {
    setRejectingOrder(null);
    setRejectNote('');
  };

  const updateOrderField = (id: string, field: string, value: any) => {
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, [field]: value } : order)));
  };

  if (userLoading) {
    return <div className="text-slate-400">Memeriksa session...</div>;
  }

  if (user?.role !== 'supervisor') {
    return <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-300">Hanya supervisor yang dapat mengakses halaman QC.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-100/70">Quality Control</p>
        <h1 className="text-3xl font-semibold text-white">QC</h1>
        <p className="mt-2 text-slate-400">Periksa hasil pengerjaan, tentukan harga final, dan setujui atau minta revisi.</p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-400">Memuat order QC...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-300">Tidak ada order menunggu QC saat ini.</div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm uppercase tracking-[0.3em] text-brand-100/70">{order.id}</div>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{order.customer}</h2>
                  <p className="text-slate-400">{order.brand} {order.model} • Teknisi: {order.technicianId ?? 'Belum ditugaskan'}</p>
                </div>
                <div className="text-right">
                  <div className="text-slate-300 text-sm">Dikirim ke QC</div>
                  <div className="mt-1 text-xl font-semibold text-white">{formatDate(order.workEndAt)}</div>
                  <div className="mt-3 text-slate-400 text-sm">Rekomendasi teknisi</div>
                  <div className="mt-1 text-brand-200 font-semibold">{formatCurrency(totalOrder(order))}</div>
                </div>
              </div>

              {(order.parts?.length || order.services?.length) ? (
                <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 mt-6">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Barang yang digunakan</p>
                      {order.parts?.length ? order.parts.map((part: any, idx: number) => (
                        <div key={idx} className="mt-3 text-slate-200 text-sm">
                          {part.qty} x {part.name} @ {formatCurrency(part.harga)}
                        </div>
                      )) : <p className="mt-3 text-slate-500 text-sm">Belum ada barang terdaftar.</p>}
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Pengerjaan jasa</p>
                      {order.services?.length ? order.services.map((service: any, idx: number) => (
                        <div key={idx} className="mt-3 text-slate-200 text-sm">
                          {service.name} – {formatCurrency(service.harga)}
                        </div>
                      )) : <p className="mt-3 text-slate-500 text-sm">Belum ada jasa terdaftar.</p>}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 lg:grid-cols-2 mt-6">
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Extra Biaya (Rp)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={order.extraCost || 0}
                      onChange={(event) => updateOrderField(order.id, 'extraCost', Number(event.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Diskon (Rp)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={order.discount || 0}
                      onChange={(event) => updateOrderField(order.id, 'discount', Number(event.target.value))}
                    />
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Total final saat ini</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(totalOrder(order))}</p>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Catatan QC</label>
                  <textarea
                    className="form-textarea"
                    value={order.qcNote || ''}
                    onChange={(event) => updateOrderField(order.id, 'qcNote', event.target.value)}
                    placeholder="Tuliskan temuan QC, catatan tambahan, atau alasan revisi..."
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <button className="btn btn-success" onClick={() => handleApprove(order)}>
                  Setujui & Siap Diambil
                </button>
                <button className="btn btn-danger" onClick={() => openRejectDialog(order)}>
                  Tolak & Revisi
                </button>
                <button className="btn btn-outline" onClick={() => window.location.assign(`/dashboard/orders/${order.id}`)}>
                  Detail Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectingOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white">Alasan Revisi</h2>
            <p className="text-sm text-slate-400 mt-1">Masukkan alasan mengapa order ini perlu direvisi.</p>
            
            <div className="mt-4 form-group">
              <label className="form-label">Catatan Revisi</label>
              <textarea
                className="form-textarea"
                value={rejectNote}
                onChange={(event) => setRejectNote(event.target.value)}
                placeholder="Contoh: Sambungan kurang rapi, perlu pemasangan ulang..."
                rows={5}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button className="btn btn-danger flex-1" onClick={() => handleReject(rejectingOrder)}>
                Kirim Revisi
              </button>
              <button className="btn btn-outline flex-1" onClick={closeRejectDialog}>
                Batal
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

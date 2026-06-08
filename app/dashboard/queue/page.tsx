'use client';

import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../../components/useCurrentUser';
import { formatDate } from '../../../lib/utils';

export default function QueuePage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'queue' | 'active' | 'revisi'>('queue');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    setLoading(true);
    const response = await fetch('/api/orders');
    const data = await response.json();
    setOrders(data.orders || []);
    setLoading(false);
  };

  const takeOrder = async (id: string) => {
    if (!user) return;
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Proses Pengerjaan', technicianId: user.id, workStartAt: new Date().toISOString() }),
    });
    refresh();
  };

  const rework = async (id: string) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Proses Pengerjaan' }),
    });
    refresh();
  };

  const queueOrders = orders.filter((order) => order.status === 'Dalam Antrian');
  const activeOrders = orders.filter((order) => {
    if (order.status !== 'Proses Pengerjaan') return false;
    if (user?.role === 'teknisi') {
      return order.technicianId === user.id;
    }
    return true;
  });
  const revisiOrders = orders.filter((order) => {
    if (order.status !== 'Perlu Revisi') return false;
    if (user?.role === 'teknisi') {
      return order.technicianId === user.id;
    }
    return true;
  });

  if (userLoading) {
    return <div className="text-slate-400">Memeriksa session...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-100/70">Antrian Servis</p>
        <h1 className="text-3xl font-semibold text-white">Antrian Teknisi</h1>
        <p className="mt-2 text-slate-400">Sistem bekerja untuk memudahkan teknisi mengambil pekerjaan secara cepat.</p>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'queue' ? 'active' : ''}`} onClick={() => setActiveTab('queue')}>
          ⏳ Dalam Antrian <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300">{queueOrders.length}</span>
        </button>
        <button className={`tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
          🔧 Sedang Dikerjakan <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300">{activeOrders.length}</span>
        </button>
        <button className={`tab ${activeTab === 'revisi' ? 'active' : ''}`} onClick={() => setActiveTab('revisi')}>
          ⚠️ Perlu Revisi <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300">{revisiOrders.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 rounded-3xl border border-slate-800 bg-slate-900/90">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="text-2xl">⏳</div>
            <div>Memuat daftar order...</div>
          </div>
        </div>
      ) : (
        <> 
          <div style={{ display: activeTab === 'queue' ? 'block' : 'none' }}>
            {queueOrders.length === 0 ? (
              <div className="empty"><div className="empty-icon">📭</div><div className="empty-text">Tidak ada order dalam antrian</div></div>
            ) : (
              <div className="space-y-3">
                {queueOrders.map((order) => (
                  <div key={order.id} className="card bg-gradient-to-r from-blue-500/5 to-blue-600/5 border-l-4 border-l-blue-500">
                    <div className="card-header">
                      <div>
                        <div className="col-id">📭 {order.id}</div>
                        <div className="text-white text-lg font-semibold mt-2">{order.customer}</div>
                        <div className="text-slate-400 text-sm mt-1">{order.brand} {order.model} • Masuk: {formatDate(order.createdAt)}</div>
                      </div>
                      <div className="flex gap-2">
                        {user?.role === 'teknisi' ? (
                          <button className="btn btn-primary btn-sm" onClick={() => takeOrder(order.id)}>
                            ➕ Ambil Pengerjaan
                          </button>
                        ) : null}
                        <a className="btn btn-outline btn-sm" href={`/dashboard/orders/${order.id}`}>
                          📋 Detail
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: activeTab === 'active' ? 'block' : 'none' }}>
            {activeOrders.length === 0 ? (
              <div className="empty"><div className="empty-icon">🔧</div><div className="empty-text">Tidak ada order sedang dikerjakan</div></div>
            ) : (
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <div key={order.id} className="card bg-gradient-to-r from-amber-500/5 to-amber-600/5 border-l-4 border-l-amber-500">
                    <div className="card-header">
                      <div>
                        <div className="col-id">⚙️ {order.id}</div>
                        <div className="text-white text-lg font-semibold mt-2">{order.customer}</div>
                        <div className="text-slate-400 text-sm mt-1">Dimulai: {formatDate(order.workStartAt)}</div>
                      </div>
                      <div className="flex gap-2">
                        <a className="btn btn-outline btn-sm" href={`/dashboard/orders/${order.id}`}>
                          📋 Detail
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: activeTab === 'revisi' ? 'block' : 'none' }}>
            {revisiOrders.length === 0 ? (
              <div className="empty"><div className="empty-icon">✅</div><div className="empty-text">Tidak ada order perlu revisi</div></div>
            ) : (
              <div className="space-y-3">
                {revisiOrders.map((order) => (
                  <div key={order.id} className="card bg-gradient-to-r from-red-500/5 to-red-600/5 border-l-4 border-l-red-500">
                    <div className="card-header">
                      <div>
                        <div className="col-id">⚠️ {order.id}</div>
                        <div className="text-white text-lg font-semibold mt-2">{order.customer}</div>
                        <div className="text-red-300 text-sm mt-1">💬 QC: {order.qcNote || 'Belum ada catatan'}</div>
                      </div>
                      <div className="flex gap-2">
                        {user?.role === 'teknisi' ? (
                          <button className="btn btn-success btn-sm" onClick={() => rework(order.id)}>
                            🔄 Kerjakan Ulang
                          </button>
                        ) : null}
                        <a className="btn btn-outline btn-sm" href={`/dashboard/orders/${order.id}`}>
                          📋 Detail
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

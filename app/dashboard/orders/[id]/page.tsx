'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../../../components/useCurrentUser';
import { OrderStatusBadge } from '../../../../components/OrderStatusBadge';
import { formatCurrency, formatDateTime, totalOrder } from '../../../../lib/utils';

interface OrderPageProps {
  params: { id: string };
}

interface UploadPreview {
  id: string;
  name: string;
  url: string | ArrayBuffer | null;
  caption: string;
}

export default function OrderDetailPage({ params }: OrderPageProps) {
  const { id } = params;
  const { user, loading: userLoading } = useCurrentUser();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [docUploads, setDocUploads] = useState<UploadPreview[]>([]);
  const [notesTech, setNotesTech] = useState('');
  const [docIndex, setDocIndex] = useState(0);

  useEffect(() => {
    const fetchOrder = async () => {
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();
      setOrder(data.order || null);
      setNotesTech(data.order?.notesTech || '');
      setDocIndex(0);
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  const canTakeOrder = user?.role === 'teknisi' && order?.status === 'Dalam Antrian';
  const canUploadDocs = user?.role === 'teknisi' && order?.status === 'Proses Pengerjaan' && order?.technicianId === user.id;
  const canEditWork = canUploadDocs;

  const handleTakeOrder = async () => {
    if (!user) return;
    const response = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Proses Pengerjaan', technicianId: user.id, workStartAt: new Date().toISOString() }),
    });
    if (response.ok) {
      setMessage('Order diambil. Status diubah menjadi Proses Pengerjaan.');
      const data = await response.json();
      setOrder(data.order);
    }
  };

  const handleDocFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setDocUploads((prev) => [
          ...prev,
          { id: crypto.randomUUID(), name: file.name, url: reader.result, caption: '', },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveDocumentation = async () => {
    if (!order) return;
    const docPhotos = docUploads.map((item) => ({
      id: item.id,
      type: 'documentation',
      name: item.name,
      url: item.url,
      caption: item.caption,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user?.id ?? 'unknown',
    }));
    const response = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docPhotos: [...(order.docPhotos || []), ...docPhotos], notesTech }),
    });
    if (response.ok) {
      const data = await response.json();
      setOrder(data.order);
      setDocUploads([]);
      setDocIndex(0);
      setMessage('Dokumentasi berhasil disimpan.');
    }
  };

  const updatePartField = (index: number, field: string, value: any) => {
    setOrder((current: any) => {
      const parts = [...(current.parts || [])];
      parts[index] = { ...parts[index], [field]: field === 'qty' || field === 'harga' ? Number(value) : value };
      return { ...current, parts };
    });
  };

  const updateServiceField = (index: number, field: string, value: any) => {
    setOrder((current: any) => {
      const services = [...(current.services || [])];
      services[index] = { ...services[index], [field]: field === 'harga' ? Number(value) : value };
      return { ...current, services };
    });
  };

  const addPartRow = () => {
    setOrder((current: any) => ({
      ...current,
      parts: [...(current.parts || []), { name: '', qty: 1, harga: 0 }],
    }));
  };

  const addServiceRow = () => {
    setOrder((current: any) => ({
      ...current,
      services: [...(current.services || []), { name: '', harga: 0 }],
    }));
  };

  const removePartRow = (index: number) => {
    setOrder((current: any) => ({
      ...current,
      parts: (current.parts || []).filter((_: any, idx: number) => idx !== index),
    }));
  };

  const removeServiceRow = (index: number) => {
    setOrder((current: any) => ({
      ...current,
      services: (current.services || []).filter((_: any, idx: number) => idx !== index),
    }));
  };

  const handleSaveWork = async () => {
    if (!order) return;
    const response = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services: order.services || [], parts: order.parts || [], notesTech }),
    });
    if (response.ok) {
      const data = await response.json();
      setOrder(data.order);
      setMessage('Detail pekerjaan dan estimasi biaya berhasil disimpan.');
    }
  };

  const handleSendToQC = async () => {
    if (!order) return;
    const response = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Menunggu QC', notesTech, services: order.services || [], parts: order.parts || [] }),
    });
    if (response.ok) {
      const data = await response.json();
      setOrder(data.order);
      setMessage('Order dikirim ke QC. Supervisor akan melakukan review harga final.');
    }
  };

  if (userLoading || loading) {
    return <div className="text-slate-400">Memuat detail order...</div>;
  }

  if (!order) {
    return <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-300">Order tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-100/70">Detail Order</p>
          <h1 className="text-3xl font-semibold text-white">{order.id}</h1>
          <p className="text-slate-400 mt-1">{order.brand} {order.model}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/dashboard/orders" className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-brand-500 hover:text-white">
            Kembali ke daftar
          </Link>
          {canTakeOrder ? (
            <button className="btn btn-primary btn-sm" onClick={handleTakeOrder}>
              Ambil Pengerjaan
            </button>
          ) : null}
        </div>
      </div>

      {message ? <div className="alert alert-info">{message}</div> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Pelanggan</p>
              <p className="mt-2 text-lg font-semibold text-white">{order.customer}</p>
              <p className="text-slate-500 text-sm mt-1">{order.phone}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Status</p>
              <div className="mt-2"><OrderStatusBadge status={order.status} /></div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dibuat</p>
              <p className="mt-2 text-slate-200">{formatDateTime(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Teknisi</p>
              <p className="mt-2 text-slate-200">{order.technicianId || 'Belum ditugaskan'}</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Deskripsi Keluhan</p>
            <p className="mt-3 text-slate-200">{order.issue}</p>
            {order.notes ? <p className="mt-3 text-slate-400 text-sm">Catatan: {order.notes}</p> : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Start kerja</p>
              <p className="mt-2 text-slate-200">{formatDateTime(order.workStartAt)}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Selesai kerja</p>
              <p className="mt-2 text-slate-200">{formatDateTime(order.workEndAt)}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">QC oleh</p>
              <p className="mt-2 text-slate-200">{order.qcBy || 'Belum QC'}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dikirim QC</p>
              <p className="mt-2 text-slate-200">{formatDateTime(order.workEndAt)}</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Estimasi Biaya Saat Ini</p>
            <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(totalOrder(order))}</p>
          </div>
        </div>
      </div>

      {canEditWork ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="section-h">Pengerjaan Teknisi</h2>
              <p className="text-sm text-slate-400">Isi barang dan jasa yang digunakan, lalu simpan estimasi biaya.</p>
            </div>
            <div className="text-right text-slate-400">
              <p className="text-sm uppercase tracking-[0.2em]">Estimasi teknisi</p>
              <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(totalOrder(order))}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="form-label">Barang yang Digunakan</div>
              {(order.parts || []).map((part: any, index: number) => (
                <div key={index} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      type="text"
                      placeholder="Nama barang"
                      className="form-input"
                      value={part.name}
                      onChange={(event) => updatePartField(index, 'name', event.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      className="form-input"
                      value={part.qty ?? 1}
                      onChange={(event) => updatePartField(index, 'qty', event.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Harga (Rp)"
                      className="form-input"
                      value={part.harga ?? 0}
                      onChange={(event) => updatePartField(index, 'harga', event.target.value)}
                    />
                  </div>
                  <button type="button" className="btn btn-danger btn-sm mt-3" onClick={() => removePartRow(index)}>
                    Hapus Barang
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={addPartRow}>
                Tambah Barang
              </button>
            </div>

            <div className="space-y-4">
              <div className="form-label">Pengerjaan Jasa</div>
              {(order.services || []).map((service: any, index: number) => (
                <div key={index} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Nama jasa"
                      className="form-input"
                      value={service.name}
                      onChange={(event) => updateServiceField(index, 'name', event.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Harga (Rp)"
                      className="form-input"
                      value={service.harga ?? 0}
                      onChange={(event) => updateServiceField(index, 'harga', event.target.value)}
                    />
                  </div>
                  <button type="button" className="btn btn-danger btn-sm mt-3" onClick={() => removeServiceRow(index)}>
                    Hapus Jasa
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={addServiceRow}>
                Tambah Jasa
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" onClick={handleSaveWork}>
              Simpan Pengerjaan & Estimasi
            </button>
            <button type="button" className="btn btn-success" onClick={handleSendToQC}>
              Kirim ke QC
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-h">Foto & Dokumentasi</h2>
          <p className="text-sm text-slate-400">Upload foto teknis lengkap dengan caption.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="form-label">Foto Kondisi Awal</div>
            <div className="photo-grid mt-3">
              {(order.photos || []).length === 0 ? (
                <div className="empty"><div className="empty-icon">○</div><div className="empty-text">Belum ada foto kondisi awal</div></div>
              ) : (
                (order.photos || []).map((photo: any) => (
                  <div key={photo.id} className="photo-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={String(photo.url || '')} alt={photo.name} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4px', background: 'rgba(0,0,0,0.45)', fontSize: '10px', color: '#f8fafc' }}>{photo.caption || photo.name}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="form-label">Dokumentasi Teknis</div>
            <div className="upload-area mt-3" onClick={() => document.getElementById('doc-upload')?.click()}>
              <input id="doc-upload" type="file" accept="image/*" multiple hidden onChange={(event) => handleDocFiles(event.target.files)} />
              <div className="text-slate-300">Klik untuk pilih foto dokumentasi teknisi</div>
              <div className="text-xs text-slate-500">Upload unlimited foto dengan caption.</div>
            </div>
            <div className="mt-4">
              {docUploads.map((preview) => (
                <div key={preview.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="photo-thumb" style={{ width: 80, height: 80 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {preview.url ? <img src={String(preview.url)} alt={preview.name} /> : <span>{preview.name}</span>}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{preview.name}</div>
                      <input
                        placeholder="Caption foto dokumentasi"
                        value={preview.caption}
                        className="form-input mt-2"
                        onChange={(event) => {
                          const caption = event.target.value;
                          setDocUploads((current) => current.map((item) => (item.id === preview.id ? { ...item, caption } : item)));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {order.docPhotos?.length ? (
              <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="mb-3 text-sm uppercase tracking-[0.3em] text-slate-400">Foto dokumentasi yang sudah tersimpan</div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                  <div className="relative">
                    <div className="overflow-hidden rounded-3xl bg-slate-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={String(order.docPhotos[docIndex].url || '')}
                        alt={order.docPhotos[docIndex].name}
                        className="w-full max-h-[420px] object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    <div className="mt-3 text-sm text-slate-200 text-center">
                      {order.docPhotos[docIndex].caption || order.docPhotos[docIndex].name}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setDocIndex((current) => Math.max(current - 1, 0))}
                        disabled={docIndex === 0}
                      >
                        Sebelumnya
                      </button>
                      <div className="text-sm text-slate-400">
                        {docIndex + 1} of {order.docPhotos.length}
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setDocIndex((current) => Math.min(current + 1, order.docPhotos.length - 1))}
                        disabled={docIndex === order.docPhotos.length - 1}
                      >
                        Berikutnya
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {canUploadDocs ? (
              <button type="button" className="btn btn-primary" onClick={handleSaveDocumentation}>
                Simpan Dokumentasi
              </button>
            ) : (
              <p className="text-sm text-slate-500">Upload dokumentasi hanya tersedia ketika teknisi mengambil order.</p>
            )}
          </div>
        </div>
      </div>

      {canUploadDocs ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="form-group">
            <label className="form-label">Catatan Teknisi</label>
            <textarea className="form-textarea" value={notesTech} onChange={(event) => setNotesTech(event.target.value)} placeholder="Catatan teknisi / diagnosis pengerjaan..." />
          </div>
          <button type="button" className="btn btn-success" onClick={handleSendToQC}>
            Kirim ke QC
          </button>
        </div>
      ) : null}
    </div>
  );
}

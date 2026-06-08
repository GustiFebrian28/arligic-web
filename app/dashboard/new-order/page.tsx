'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewOrderPage() {
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [issue, setIssue] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: 'initial',
            name: file.name,
            url: reader.result,
            caption: '',
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'user-admin',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const totalPhoto = useMemo(() => photos.length, [photos]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customer || !phone || !brand || !model || !issue) {
      setMessage('Lengkapi semua field wajib terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer, phone, brand, model, serial, issue, notes, photos }),
    });
    setIsLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setMessage(data?.error || 'Gagal membuat order.');
      return;
    }

    setMessage('Order berhasil dibuat dan ditambahkan ke antrian.');
    setTimeout(() => router.push('/dashboard/orders'), 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-100/70">Buat Order Baru</p>
        <h1 className="text-3xl font-semibold text-white">Form Order</h1>
        <p className="mt-2 text-slate-400">Masukkan data servis jam untuk memulai alur kerja.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="form-label">Nama Customer *</span>
            <input value={customer} onChange={(e) => setCustomer(e.target.value)} className="form-input" placeholder="PT Pelanggan Prima" />
          </label>
          <label className="block">
            <span className="form-label">Nomor Telepon *</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="form-input" placeholder="081234567890" />
          </label>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="form-label">Merek Jam *</span>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} className="form-input" placeholder="Rolex" />
          </label>
          <label className="block">
            <span className="form-label">Model / Referensi *</span>
            <input value={model} onChange={(e) => setModel(e.target.value)} className="form-input" placeholder="Submariner 116610" />
          </label>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="form-label">Serial</span>
            <input value={serial} onChange={(e) => setSerial(e.target.value)} className="form-input" placeholder="Opsional" />
          </label>
          <label className="block">
            <span className="form-label">Keluhan / Issue *</span>
            <textarea value={issue} onChange={(e) => setIssue(e.target.value)} className="form-textarea" placeholder="Deskripsikan kerusakan..." />
          </label>
        </div>

        <label className="block">
          <span className="form-label">Catatan Tambahan</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="form-textarea" placeholder="Permintaan khusus atau kondisi tambahan..." />
        </label>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="form-label">Foto Kondisi Awal</div>
          <div className="upload-area" onClick={() => document.getElementById('photo-input')?.click()}>
            <input id="photo-input" type="file" accept="image/*" multiple hidden onChange={(event) => handleFiles(event.target.files)} />
            <div className="text-slate-300">Klik untuk pilih foto kondisi awal</div>
            <div className="text-xs text-slate-500">Bisa upload lebih dari satu foto</div>
          </div>
          <div className="mt-3 text-sm text-slate-300">{totalPhoto} foto siap diunggah.</div>
        </div>

        <button type="submit" disabled={isLoading} className="inline-flex rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60">
          {isLoading ? 'Menyimpan...' : 'Simpan Order'}
        </button>
        {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
      </form>
    </div>
  );
}

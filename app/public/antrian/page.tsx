import Link from 'next/link';

export default function PublicAntrianPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-100/70">Antrian Publik</p>
        <h1 className="text-3xl font-semibold text-white">Status Order Pelanggan</h1>
        <p className="mt-2 text-slate-400">Cek status order pelanggan tanpa login.</p>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
        <p className="text-slate-300">Di sini akan tampil antrian publik dan status order jika sudah diintegrasikan ke Supabase.</p>
        <Link href="/auth/login" className="mt-5 inline-flex rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}

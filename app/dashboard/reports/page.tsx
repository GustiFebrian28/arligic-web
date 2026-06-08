export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-100/70">Reports</p>
        <h1 className="text-3xl font-semibold text-white">Laporan</h1>
        <p className="mt-2 text-slate-400">Analitik order dan kinerja teknisi dalam satu dashboard.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <h2 className="text-lg font-semibold text-white">Volume Order</h2>
          <p className="mt-3 text-slate-300">Tampilkan ringkasan jumlah order per status, per tim, dan per periode.</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <h2 className="text-lg font-semibold text-white">Kinerja QC</h2>
          <p className="mt-3 text-slate-300">Laporan hasil QC dan revisi kualitas service.</p>
        </div>
      </div>
    </div>
  );
}

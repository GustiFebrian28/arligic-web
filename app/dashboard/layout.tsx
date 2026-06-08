import { ReactNode } from 'react';
import { Sidebar } from '../../components/Sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex min-h-screen max-w-[1440px] flex-col gap-8 px-4 py-6 lg:flex-row lg:px-8">
        <Sidebar />
        <section className="flex-1 rounded-[32px] border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20">
          {children}
        </section>
      </main>
    </div>
  );
}

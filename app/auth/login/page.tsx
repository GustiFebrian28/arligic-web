'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setError('Email dan password harus diisi');
      return;
    }

    setIsLoading(true);
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword }),
    });

    setIsLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data?.error || 'Login gagal. Periksa kredensial Anda.');
      return;
    }

    router.push('/dashboard');
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16 bg-slate-950">
      <div className="w-full max-w-md rounded-[32px] border border-slate-800 bg-slate-950/90 p-10 shadow-2xl shadow-slate-950/40">
        <h1 className="text-3xl font-semibold text-white">Masuk ke Arlogic</h1>
        <p className="mt-3 text-slate-400">Gunakan akun email & password untuk masuk sebagai Admin, Teknisi, atau Supervisor.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-brand-500"
              placeholder="admin@arlogic.test"
              autoCapitalize="none"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-brand-500"
              placeholder="••••••••"
            />
          </div>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </main>
  );
}

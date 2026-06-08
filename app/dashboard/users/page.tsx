"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useCurrentUser } from '../../../components/useCurrentUser';

type NewUser = {
  name: string;
  email: string;
  role: string;
  password: string;
};

export default function UsersPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<NewUser>({ name: '', email: '', role: 'teknisi', password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (userLoading) return <div className="text-slate-400">Memeriksa session...</div>;
  if (user?.role !== 'supervisor') return <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-300">Hanya supervisor dapat mengelola staff.</div>;

  const handleChange = (k: keyof NewUser, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.email || !form.password) {
      setError('Name, email, and password are required.');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || 'Terjadi kesalahan');
      setSaving(false);
      return;
    }
    setForm({ name: '', email: '', role: 'teknisi', password: '' });
    await fetchUsers();
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-100/70">Manajemen User</p>
        <h1 className="text-3xl font-semibold text-white">Users</h1>
        <p className="mt-2 text-slate-400">Tambah teknisi atau staff lain langsung dari dashboard.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-white">Tambah Staff</h2>
          <p className="text-sm text-slate-400 mt-1">Buat akun teknisi tanpa perlu akses Supabase.</p>
          <form className="mt-4 space-y-3" onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Nama</label>
              <input className="form-input" value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Peran</label>
              <select className="form-input" value={form.role} onChange={(e) => handleChange('role', e.target.value)}>
                <option value="teknisi">Teknisi</option>
                <option value="admin">Admin</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" value={form.password} onChange={(e) => handleChange('password', e.target.value)} />
            </div>
            {error ? <div className="text-sm text-red-400">{error}</div> : null}
            <div className="mt-4">
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Buat User'}</button>
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">Daftar User</h2>
          <p className="text-sm text-slate-400 mt-1">{users.length} user terdaftar</p>
          <div className="mt-4 overflow-hidden rounded-2xl">
            {loading ? (
              <div className="p-6 text-slate-400">Memuat pengguna...</div>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="px-4 py-2">Nama</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-slate-800">
                      <td className="px-4 py-3 text-white">{u.name}</td>
                      <td className="px-4 py-3 text-slate-300">{u.email}</td>
                      <td className="px-4 py-3">{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

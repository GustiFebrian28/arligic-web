import { NextRequest } from 'next/server';
import { findUserByEmail, saveUser } from '../../../../lib/db';
import { createSessionResponse, hashPassword, verifyPassword } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '').trim();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email dan password wajib diisi.' }), { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password)) {
    return new Response(JSON.stringify({ error: 'Email atau password salah.' }), { status: 401 });
  }

  if (!user.password.startsWith('sha256$')) {
    await saveUser({ ...user, password: hashPassword(password) });
  }

  return createSessionResponse({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }, user.id);
}

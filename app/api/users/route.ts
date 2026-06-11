import { findUserByEmail, listUsers, saveUser } from '../../../lib/db';
import type { UserRole } from '../../../types';
import { NextRequest } from 'next/server';
import { getUserFromCookie, hashPassword } from '../../../lib/auth';

export async function GET() {
  const users = await listUsers();
  return new Response(JSON.stringify({ users: users.map((user) => ({ id: user.id, name: user.name, email: user.email, role: user.role })) }), { status: 200 });
}

export async function POST(req: NextRequest) {
  const currentUser = await getUserFromCookie();
  if (!currentUser || currentUser.role !== 'supervisor') {
    return new Response(JSON.stringify({ error: 'Unauthorized.' }), { status: 403 });
  }

  const body = await req.json();
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const role = String(body.role || 'teknisi').trim();
  const password = String(body.password || '').trim();
  const availableRoles = ['admin', 'teknisi', 'supervisor'] as const;
  const selectedRole: UserRole = availableRoles.includes(role as UserRole) ? role as UserRole : 'teknisi';

  if (!name || !email || !password) {
    return new Response(JSON.stringify({ error: 'Name, email, and password are required.' }), { status: 400 });
  }

  const exists = await findUserByEmail(email);
  if (exists) {
    return new Response(JSON.stringify({ error: 'Email already registered.' }), { status: 409 });
  }

  const id = 'user-' + Date.now().toString(36);
  const user = { id, name, email, role: selectedRole, password: hashPassword(password) };
  await saveUser(user);

  return new Response(JSON.stringify({ user: { id, name, email, role } }), { status: 201 });
}

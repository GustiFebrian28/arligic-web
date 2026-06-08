import { getUserFromCookie } from '../../../../lib/auth';

export async function GET() {
  const user = await getUserFromCookie();
  if (!user) {
    return new Response(JSON.stringify({ user: null }), { status: 200 });
  }

  return new Response(JSON.stringify({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }), { status: 200 });
}

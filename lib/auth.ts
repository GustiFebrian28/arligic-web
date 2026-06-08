import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { findUserById } from './db';

const SESSION_COOKIE = 'arlogic_user_id';
const HASH_PREFIX = 'sha256$';

export function hashPassword(password: string) {
  const digest = crypto.createHash('sha256').update(password, 'utf8').digest('hex');
  return `${HASH_PREFIX}${digest}`;
}

export function verifyPassword(password: string, storedPassword: string) {
  if (storedPassword.startsWith(HASH_PREFIX)) {
    return hashPassword(password) === storedPassword;
  }
  return password === storedPassword;
}

export async function getUserFromCookie() {
  const cookieStore = cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie || !cookie.value) return null;
  return await findUserById(cookie.value);
}

export function createSessionResponse(body: unknown, userId: string) {
  const response = NextResponse.json(body);
  response.cookies.set({
    name: SESSION_COOKIE,
    value: userId,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export function clearSessionResponse(body: unknown) {
  const response = NextResponse.json(body);
  response.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
  });
  return response;
}

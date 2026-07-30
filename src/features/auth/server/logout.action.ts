'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_SESSION_COOKIE } from '../domain/auth.constants';
import { createServerAuthRepository } from './auth-server.repository';
import { clearAuthSessionCookie } from './auth-session';

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value;
  if (sessionId) {
    await createServerAuthRepository().deleteSession(sessionId);
  }
  await clearAuthSessionCookie();
  redirect('/');
}

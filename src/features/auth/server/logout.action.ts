'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TDM_MOCK_API_ORIGIN } from '@/mocks/mock-api.constants';
import { AUTH_SESSION_COOKIE } from '../domain/auth.constants';
import { createHttpAuthRepository } from '../infrastructure/http/http-auth.repository';
import { clearAuthSessionCookie } from './auth-session';

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value;
  if (sessionId) {
    const repository = createHttpAuthRepository({ baseUrl: TDM_MOCK_API_ORIGIN });
    await repository.deleteSession(sessionId);
  }
  await clearAuthSessionCookie();
  redirect('/');
}

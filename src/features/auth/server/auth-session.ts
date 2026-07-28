import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TDM_MOCK_API_ORIGIN } from '@/mocks/mock-api.constants';
import {
  AUTH_DEFAULT_RETURN_TO,
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_DURATION_SECONDS
} from '../domain/auth.constants';
import type { AuthenticatedSession } from '../domain/auth.types';
import { createHttpAuthRepository } from '../infrastructure/http/http-auth.repository';

function createRepository() {
  return createHttpAuthRepository({ baseUrl: TDM_MOCK_API_ORIGIN });
}

export function sanitizeReturnTo(value: string | null | undefined) {
  if (!value?.startsWith('/') || value.startsWith('//')) return AUTH_DEFAULT_RETURN_TO;
  return value;
}

export async function writeAuthSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: AUTH_SESSION_DURATION_SECONDS
  });
}

export async function clearAuthSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_SESSION_COOKIE);
}

export async function getAuthenticatedSession(): Promise<AuthenticatedSession | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  return createRepository().findSession(sessionId);
}

export async function requireAuthenticatedSession(returnTo = AUTH_DEFAULT_RETURN_TO) {
  const authenticated = await getAuthenticatedSession();
  if (!authenticated) redirect(`/login?returnTo=${encodeURIComponent(sanitizeReturnTo(returnTo))}`);
  return authenticated;
}

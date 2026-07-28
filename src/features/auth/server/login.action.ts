'use server';

import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { TDM_MOCK_API_ORIGIN } from '@/mocks/mock-api.constants';
import { authenticateUser } from '../application/authenticate-user';
import { AUTH_LOGIN_DELAY_MS, AUTH_PASSWORD_MIN_LENGTH } from '../domain/auth.constants';
import type { AuthFieldErrors } from '../domain/auth.validation';
import type { LoginActionState } from '../application/login-action-state';
import { validateAuthCredentials } from '../domain/auth.validation';
import { createHttpAuthRepository } from '../infrastructure/http/http-auth.repository';
import { sanitizeReturnTo, writeAuthSessionCookie } from './auth-session';

function wait(duration: number) { return new Promise((resolve) => setTimeout(resolve, duration)); }

function localizeFieldErrors(
  errors: AuthFieldErrors,
  t: (key: string, values?: Record<string, string | number>) => string
): LoginActionState['fieldErrors'] {
  return Object.fromEntries(
    Object.entries(errors).map(([field, code]) => [
      field,
      t(`validation.${code}`, { min: AUTH_PASSWORD_MIN_LENGTH })
    ])
  );
}

export async function loginAction(_previousState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const t = await getTranslations('Auth.login');
  await wait(AUTH_LOGIN_DELAY_MS);

  const validation = validateAuthCredentials({
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? '')
  });

  if (!validation.valid) {
    return {
      status: 'error',
      message: t('feedback.reviewFields'),
      fieldErrors: localizeFieldErrors(validation.errors, t)
    };
  }

  const repository = createHttpAuthRepository({ baseUrl: TDM_MOCK_API_ORIGIN });
  const authenticated = await authenticateUser(repository, validation.credentials);
  if (!authenticated) {
    return { status: 'error', message: t('feedback.invalidCredentials'), fieldErrors: {} };
  }

  await writeAuthSessionCookie(authenticated.session.id);
  redirect(sanitizeReturnTo(String(formData.get('returnTo') ?? '')));
}

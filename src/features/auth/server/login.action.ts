'use server';

import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { attemptUserLogin } from '../application/attempt-user-login';
import { AUTH_LOGIN_DELAY_MS, AUTH_PASSWORD_MIN_LENGTH } from '../domain/auth.constants';
import type { AuthFieldErrors } from '../domain/auth.validation';
import type { LoginActionState } from '../application/login-action-state';
import { createServerAuthRepository } from './auth-server.repository';
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

  const result = await attemptUserLogin(createServerAuthRepository(), {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? '')
  });

  if (result.status === 'invalid-fields') {
    return {
      status: 'error',
      message: t('feedback.reviewFields'),
      fieldErrors: localizeFieldErrors(result.fieldErrors, t)
    };
  }

  if (result.status === 'invalid-credentials') {
    return { status: 'error', message: t('feedback.invalidCredentials'), fieldErrors: {} };
  }

  await writeAuthSessionCookie(result.authenticatedSession.session.id);
  redirect(sanitizeReturnTo(String(formData.get('returnTo') ?? '')));
}

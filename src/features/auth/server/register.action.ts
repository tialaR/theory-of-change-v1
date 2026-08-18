'use server';

import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { attemptUserRegistration } from '../application/attempt-user-registration';
import type { RegistrationActionState } from '../application/registration-action-state';
import { AUTH_PASSWORD_MIN_LENGTH } from '../domain/auth.constants';
import type { AuthFieldErrors } from '../domain/auth.validation';
import { createServerAuthRepository } from './auth-server.repository';
import { sanitizeReturnTo, writeAuthSessionCookie } from './auth-session';

function localizeFieldErrors(
  errors: AuthFieldErrors,
  t: (key: string, values?: Record<string, string | number>) => string
): RegistrationActionState['fieldErrors'] {
  return Object.fromEntries(
    Object.entries(errors).map(([field, code]) => [
      field,
      t(`validation.${code}`, { min: AUTH_PASSWORD_MIN_LENGTH })
    ])
  );
}

export async function registerAction(
  _previousState: RegistrationActionState,
  formData: FormData
): Promise<RegistrationActionState> {
  const t = await getTranslations('Auth.register');
  const result = await attemptUserRegistration(createServerAuthRepository(), {
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

  if (result.status === 'email-already-registered') {
    return {
      status: 'error',
      message: t('feedback.emailAlreadyRegistered'),
      fieldErrors: {}
    };
  }

  await writeAuthSessionCookie(result.authenticatedSession.session.id);
  redirect(sanitizeReturnTo(String(formData.get('returnTo') ?? '')));
}

import { AUTH_PASSWORD_MIN_LENGTH } from './auth.constants';
import type { AuthCredentials } from './auth.types';

export type AuthFieldErrorCode = 'nameRequired' | 'emailInvalid' | 'passwordTooShort';
export type AuthFieldErrors = Partial<Record<keyof AuthCredentials, AuthFieldErrorCode>>;

export type AuthValidationResult =
  | { valid: true; credentials: AuthCredentials }
  | { valid: false; errors: AuthFieldErrors };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAuthCredentials(input: AuthCredentials): AuthValidationResult {
  const credentials = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password
  };
  const errors: AuthFieldErrors = {};

  if (!credentials.name) errors.name = 'nameRequired';
  if (!EMAIL_PATTERN.test(credentials.email)) errors.email = 'emailInvalid';
  if (credentials.password.length < AUTH_PASSWORD_MIN_LENGTH) errors.password = 'passwordTooShort';

  if (Object.keys(errors).length) return { valid: false, errors };
  return { valid: true, credentials };
}

import type { AuthCredentials, AuthRepository, AuthenticatedSession } from '../domain/auth.types';
import type { AuthFieldErrors } from '../domain/auth.validation';
import { validateAuthCredentials } from '../domain/auth.validation';
import { authenticateUser } from './authenticate-user';

export type AttemptUserLoginResult =
  | { status: 'authenticated'; authenticatedSession: AuthenticatedSession }
  | { status: 'invalid-fields'; fieldErrors: AuthFieldErrors }
  | { status: 'invalid-credentials' };

export async function attemptUserLogin(
  repository: AuthRepository,
  input: AuthCredentials
): Promise<AttemptUserLoginResult> {
  const validation = validateAuthCredentials(input);

  if (!validation.valid) {
    return { status: 'invalid-fields', fieldErrors: validation.errors };
  }

  const authenticatedSession = await authenticateUser(repository, validation.credentials);

  if (!authenticatedSession) {
    return { status: 'invalid-credentials' };
  }

  return { status: 'authenticated', authenticatedSession };
}

import type { AuthCredentials, AuthRepository, AuthenticatedSession } from '../domain/auth.types';
import type { AuthFieldErrors } from '../domain/auth.validation';
import { validateAuthCredentials } from '../domain/auth.validation';

export type AttemptUserRegistrationResult =
  | { status: 'registered'; authenticatedSession: AuthenticatedSession }
  | { status: 'invalid-fields'; fieldErrors: AuthFieldErrors }
  | { status: 'email-already-registered' };

export async function attemptUserRegistration(
  repository: AuthRepository,
  input: AuthCredentials
): Promise<AttemptUserRegistrationResult> {
  const validation = validateAuthCredentials(input);

  if (!validation.valid) {
    return { status: 'invalid-fields', fieldErrors: validation.errors };
  }

  const authenticatedSession = await repository.registerUser(validation.credentials);

  if (!authenticatedSession) {
    return { status: 'email-already-registered' };
  }

  return { status: 'registered', authenticatedSession };
}

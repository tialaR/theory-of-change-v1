import type { AuthCredentials, AuthRepository, AuthenticatedSession } from '../domain/auth.types';

export async function authenticateUser(
  repository: AuthRepository,
  credentials: AuthCredentials
): Promise<AuthenticatedSession | null> {
  return repository.createSession(credentials);
}

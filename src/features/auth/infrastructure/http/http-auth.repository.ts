import { AUTH_API_PATH } from '../../domain/auth.constants';
import type { AuthCredentials, AuthRepository } from '../../domain/auth.types';
import { isAuthApiEnvelope, type AuthApiEnvelope } from './auth-api.contract';

export type HttpAuthRepositoryOptions = {
  baseUrl: string;
  fetcher?: typeof fetch;
};

export function createHttpAuthRepository(options: HttpAuthRepositoryOptions): AuthRepository {
  const baseUrl = options.baseUrl.replace(/\/$/, '');
  const fetcher = options.fetcher ?? globalThis.fetch;

  async function readEnvelope(response: Response): Promise<AuthApiEnvelope> {
    if (!response.ok) throw new Error(`Auth API respondeu com status ${response.status}.`);
    const body: unknown = await response.json();
    if (!isAuthApiEnvelope(body)) throw new Error('Auth API respondeu com contrato inválido.');
    return body;
  }

  return {
    async createSession(credentials: AuthCredentials) {
      const response = await fetcher(`${baseUrl}${AUTH_API_PATH}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(credentials),
        cache: 'no-store'
      });
      if (response.status === 401) return null;
      return (await readEnvelope(response)).data;
    },

    async findSession(sessionId: string) {
      const response = await fetcher(`${baseUrl}${AUTH_API_PATH}/${sessionId}`, {
        method: 'GET',
        headers: { accept: 'application/json' },
        cache: 'no-store'
      });
      if (response.status === 404 || response.status === 401) return null;
      return (await readEnvelope(response)).data;
    },

    async deleteSession(sessionId: string) {
      const response = await fetcher(`${baseUrl}${AUTH_API_PATH}/${sessionId}`, {
        method: 'DELETE',
        headers: { accept: 'application/json' },
        cache: 'no-store'
      });
      if (!response.ok && response.status !== 404) {
        throw new Error(`Auth API respondeu com status ${response.status}.`);
      }
    }
  };
}

import { describe, expect, it } from 'vitest';
import { authenticateUser } from './authenticate-user';
import type { AuthRepository } from '../domain/auth.types';

const authenticatedSession = {
  user: { id: 'user-tiala', name: 'Tiala Rocha', email: 'tialarocha@tdmconstrutor.com.br', avatarUrl: null },
  session: {
    id: 'session-1',
    userId: 'user-tiala',
    createdAt: '2026-07-28T00:00:00.000Z',
    expiresAt: '2026-07-28T08:00:00.000Z'
  }
};

describe('authenticateUser', () => {
  it('delega a autenticação ao repository', async () => {
    const repository: AuthRepository = {
      createSession: async () => authenticatedSession,
      createDemoSession: async () => authenticatedSession,
      registerUser: async () => authenticatedSession,
      findSession: async () => null,
      updateUserAvatar: async () => null,
      deleteSession: async () => undefined
    };

    await expect(authenticateUser(repository, {
      name: 'Tiala Rocha',
      email: 'tialarocha@tdmconstrutor.com.br',
      password: 'tdm123456'
    })).resolves.toEqual(authenticatedSession);
  });
});

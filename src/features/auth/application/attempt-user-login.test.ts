import { describe, expect, it, vi } from 'vitest';
import type { AuthRepository, AuthenticatedSession } from '../domain/auth.types';
import { attemptUserLogin } from './attempt-user-login';

const authenticatedSession: AuthenticatedSession = {
  session: {
    id: 'session-1',
    userId: 'user-1',
    createdAt: '2026-08-05T00:00:00.000Z',
    expiresAt: '2026-08-06T00:00:00.000Z'
  },
  user: {
    id: 'user-1',
    name: 'Tiala Rocha',
    email: 'tiala@example.com',
    avatarUrl: null
  }
};

function createRepository(
  createSession: AuthRepository['createSession']
): AuthRepository {
  return {
    createSession,
    findSession: vi.fn(),
    updateUserAvatar: vi.fn(),
    deleteSession: vi.fn()
  };
}

describe('attemptUserLogin', () => {
  it('returns field error codes without calling the repository when input is invalid', async () => {
    const createSession = vi.fn();
    const result = await attemptUserLogin(createRepository(createSession), {
      name: ' ',
      email: 'invalid',
      password: '123'
    });

    expect(result).toEqual({
      status: 'invalid-fields',
      fieldErrors: {
        name: 'nameRequired',
        email: 'emailInvalid',
        password: 'passwordTooShort'
      }
    });
    expect(createSession).not.toHaveBeenCalled();
  });

  it('returns invalid credentials after normalized valid input is rejected', async () => {
    const createSession = vi.fn().mockResolvedValue(null);
    const result = await attemptUserLogin(createRepository(createSession), {
      name: '  Tiala Rocha  ',
      email: '  TIALA@EXAMPLE.COM ',
      password: 'secret1'
    });

    expect(result).toEqual({ status: 'invalid-credentials' });
    expect(createSession).toHaveBeenCalledWith({
      name: 'Tiala Rocha',
      email: 'tiala@example.com',
      password: 'secret1'
    });
  });

  it('returns the authenticated session when credentials are accepted', async () => {
    const createSession = vi.fn().mockResolvedValue(authenticatedSession);
    const result = await attemptUserLogin(createRepository(createSession), {
      name: 'Tiala Rocha',
      email: 'tiala@example.com',
      password: 'secret1'
    });

    expect(result).toEqual({ status: 'authenticated', authenticatedSession });
  });
});

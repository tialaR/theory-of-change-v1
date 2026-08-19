import { describe, expect, it, vi } from 'vitest';
import type { AuthRepository, AuthenticatedSession } from '../domain/auth.types';
import { attemptUserRegistration } from './attempt-user-registration';

const authenticatedSession: AuthenticatedSession = {
  user: {
    id: 'user-new',
    name: 'Nova Pessoa',
    email: 'nova@tdm.local',
    avatarUrl: null,
    accessMode: 'standard'
  },
  session: {
    id: 'session-new',
    userId: 'user-new',
    createdAt: '2026-08-17T20:00:00.000Z',
    expiresAt: '2026-08-18T20:00:00.000Z'
  }
};

function repository(registerUser: AuthRepository['registerUser']): AuthRepository {
  return {
    createSession: vi.fn(),
    createDemoSession: vi.fn(),
    registerUser,
    findSession: vi.fn(),
    updateUserAvatar: vi.fn(),
    deleteSession: vi.fn()
  };
}

describe('attemptUserRegistration', () => {
  it('valida os campos antes de registrar', async () => {
    const registerUser = vi.fn<AuthRepository['registerUser']>();
    const result = await attemptUserRegistration(repository(registerUser), {
      name: '',
      email: 'invalido',
      password: '123'
    });

    expect(result.status).toBe('invalid-fields');
    expect(registerUser).not.toHaveBeenCalled();
  });

  it('distingue e-mail já cadastrado', async () => {
    const result = await attemptUserRegistration(
      repository(async () => null),
      { name: 'Nova Pessoa', email: 'nova@tdm.local', password: 'tdm123456' }
    );

    expect(result).toEqual({ status: 'email-already-registered' });
  });

  it('retorna a sessão autenticada do novo usuário', async () => {
    const result = await attemptUserRegistration(
      repository(async () => authenticatedSession),
      { name: 'Nova Pessoa', email: 'NOVA@TDM.LOCAL', password: 'tdm123456' }
    );

    expect(result).toEqual({ status: 'registered', authenticatedSession });
  });
});

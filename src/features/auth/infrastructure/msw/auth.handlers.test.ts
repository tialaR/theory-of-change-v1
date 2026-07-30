import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { TDM_MOCK_API_ORIGIN } from '@/mocks/mock-api.constants';
import { createHttpAuthRepository } from '../http/http-auth.repository';
import { authMockStore } from './auth.mock-store';
import { authTestServer } from './auth.test-server';

beforeAll(() => authTestServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => authMockStore.clearSessions());
afterAll(() => authTestServer.close());

describe('authHandlers', () => {
  it('autentica somente as personas existentes e mantém a sessão no store do módulo', async () => {
    const repository = createHttpAuthRepository({ baseUrl: TDM_MOCK_API_ORIGIN });
    const authenticated = await repository.createSession({
      name: 'Tiala Rocha',
      email: 'tialarocha@tdmconstrutor.com.br',
      password: 'tdm123456'
    });

    expect(authenticated?.user.id).toBe('user-tiala-rocha');
    await expect(repository.findSession(authenticated?.session.id ?? '')).resolves.toEqual(authenticated);

    const updated = await repository.updateUserAvatar(authenticated?.session.id ?? '', 'data:image/png;base64,abc');
    expect(updated?.user.avatarUrl).toBe('data:image/png;base64,abc');
    await expect(repository.findSession(authenticated?.session.id ?? '')).resolves.toEqual(updated);
    await expect(repository.createSession({
      name: 'Tiala Rocha',
      email: 'tialarocha@tdmconstrutor.com.br',
      password: 'senha-errada'
    })).resolves.toBeNull();
  });
});

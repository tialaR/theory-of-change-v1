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
    const registered = await repository.registerUser({
      name: 'Pessoa Nova',
      email: 'pessoa.nova@tdm.local',
      password: 'tdm123456'
    });
    expect(registered?.user.email).toBe('pessoa.nova@tdm.local');
    await expect(repository.registerUser({
      name: 'Pessoa Repetida',
      email: 'PESSOA.NOVA@TDM.LOCAL',
      password: 'outra123'
    })).resolves.toBeNull();

    const demoA = await repository.createDemoSession();
    const demoB = await repository.createDemoSession();
    expect(demoA.user.accessMode).toBe('demo');
    expect(demoB.user.accessMode).toBe('demo');
    expect(demoA.user.id).not.toBe(demoB.user.id);
    expect(demoA.session.id).not.toBe(demoB.session.id);

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

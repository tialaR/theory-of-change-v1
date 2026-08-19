import { afterEach, describe, expect, it } from 'vitest';
import { authMockStore } from './auth.mock-store';

afterEach(() => {
  authMockStore.resetDynamicUsers();
});

describe('mock registration ownership', () => {
  it('registra um usuário único e permite login sem compartilhar identidade', () => {
    const registered = authMockStore.registerUser({
      name: 'Pessoa Nova',
      email: 'pessoa.nova@tdm.local',
      password: 'tdm123456'
    });

    expect(registered?.user.id).toMatch(/^user-/);
    expect(registered?.user.accessMode).toBe('standard');

    const authenticated = authMockStore.createSession({
      name: 'Pessoa Nova',
      email: 'pessoa.nova@tdm.local',
      password: 'tdm123456'
    });

    expect(authenticated?.user.id).toBe(registered?.user.id);
    expect(
      authMockStore.registerUser({
        name: 'Outra Pessoa',
        email: 'PESSOA.NOVA@TDM.LOCAL',
        password: 'outra123'
      })
    ).toBeNull();
  });
});

import { describe, expect, it, vi } from 'vitest';
import { createHttpAuthRepository } from './http-auth.repository';

const envelope = {
  data: {
    user: { id: 'user-tiala', name: 'Tiala Rocha', email: 'tialarocha@tdmconstrutor.com.br' },
    session: {
      id: 'session-1',
      userId: 'user-tiala',
      createdAt: '2026-07-28T00:00:00.000Z',
      expiresAt: '2026-07-28T08:00:00.000Z'
    }
  },
  meta: { requestId: 'request-1', schemaVersion: 1 as const }
};

describe('createHttpAuthRepository', () => {
  it('usa POST para criar sessão e GET para recuperá-la', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () =>
      new Response(JSON.stringify(envelope), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    );
    const repository = createHttpAuthRepository({ baseUrl: 'http://tdm.mock.local', fetcher });

    await repository.createSession({
      name: 'Tiala Rocha',
      email: 'tialarocha@tdmconstrutor.com.br',
      password: 'tdm123456'
    });
    await repository.findSession('session-1');

    expect(fetcher.mock.calls[0]?.[1]?.method).toBe('POST');
    expect(fetcher.mock.calls[1]?.[1]?.method).toBe('GET');
  });
});

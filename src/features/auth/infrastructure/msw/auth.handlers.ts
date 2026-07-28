import { http, HttpResponse, delay } from 'msw';
import { AUTH_API_PATH } from '../../domain/auth.constants';
import type { AuthCredentials } from '../../domain/auth.types';
import { authMockStore } from './auth.mock-store';

const collectionEndpoint = `*${AUTH_API_PATH}`;
const sessionEndpoint = `*${AUTH_API_PATH}/:sessionId`;

function envelope(data: NonNullable<ReturnType<typeof authMockStore.readSession>>) {
  return { data, meta: { requestId: crypto.randomUUID(), schemaVersion: 1 as const } };
}

export const authHandlers = [
  http.post(collectionEndpoint, async ({ request }) => {
    await delay(120);
    const credentials = (await request.json()) as AuthCredentials;
    const authenticated = authMockStore.createSession(credentials);
    if (!authenticated) {
      return HttpResponse.json(
        { error: { code: 'invalid-credentials', message: 'Nome, e-mail ou senha inválidos.' } },
        { status: 401 }
      );
    }
    return HttpResponse.json(envelope(authenticated), { status: 201 });
  }),
  http.get(sessionEndpoint, ({ params }) => {
    const authenticated = authMockStore.readSession(String(params.sessionId));
    if (!authenticated) {
      return HttpResponse.json(
        { error: { code: 'session-not-found', message: 'Sessão não encontrada.' } },
        { status: 404 }
      );
    }
    return HttpResponse.json(envelope(authenticated));
  }),
  http.delete(sessionEndpoint, ({ params }) => {
    authMockStore.deleteSession(String(params.sessionId));
    return new HttpResponse(null, { status: 204 });
  })
];

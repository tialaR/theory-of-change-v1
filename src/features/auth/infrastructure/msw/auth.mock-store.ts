import { AUTH_SESSION_DURATION_SECONDS } from '../../domain/auth.constants';
import type { AuthCredentials, AuthSession, AuthUser, AuthenticatedSession } from '../../domain/auth.types';

type MockAuthUser = AuthUser & { password: string };

const users: MockAuthUser[] = [
  { id: 'user-tiala-rocha', name: 'Tiala Rocha', email: 'tialarocha@tdmconstrutor.com.br', password: 'tdm123456' },
  { id: 'user-rodger-rocha', name: 'Rodger Rocha', email: 'rodgerrocha@tdmconstrutor.com.br', password: 'tdm123456' }
];

const AUTH_SESSIONS_KEY = Symbol.for('tdm.mock.auth.sessions');
type AuthMockGlobal = typeof globalThis & { [AUTH_SESSIONS_KEY]?: Map<string, AuthSession> };
const authGlobal = globalThis as AuthMockGlobal;
const sessions = authGlobal[AUTH_SESSIONS_KEY] ?? new Map<string, AuthSession>();
authGlobal[AUTH_SESSIONS_KEY] = sessions;

function publicUser(user: MockAuthUser): AuthUser {
  return { id: user.id, name: user.name, email: user.email };
}

function findUser(credentials: AuthCredentials) {
  const normalizedName = credentials.name.trim().toLocaleLowerCase('pt-BR');
  const normalizedEmail = credentials.email.trim().toLowerCase();
  return users.find((user) => (
    user.name.toLocaleLowerCase('pt-BR') === normalizedName &&
    user.email === normalizedEmail &&
    user.password === credentials.password
  ));
}

function resolveSession(sessionId: string): AuthenticatedSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (Date.parse(session.expiresAt) <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  const user = users.find((candidate) => candidate.id === session.userId);
  return user ? { session: structuredClone(session), user: publicUser(user) } : null;
}

export const authMockStore = {
  clearSessions() { sessions.clear(); },
  createSession(credentials: AuthCredentials): AuthenticatedSession | null {
    const user = findUser(credentials);
    if (!user) return null;
    const createdAt = new Date();
    const session: AuthSession = {
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: createdAt.toISOString(),
      expiresAt: new Date(createdAt.getTime() + AUTH_SESSION_DURATION_SECONDS * 1000).toISOString()
    };
    sessions.set(session.id, session);
    return { session: structuredClone(session), user: publicUser(user) };
  },
  readSession(sessionId: string) { return resolveSession(sessionId); },
  deleteSession(sessionId: string) { sessions.delete(sessionId); }
};

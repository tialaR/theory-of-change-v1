import { AUTH_SESSION_DURATION_SECONDS } from '../../domain/auth.constants';
import type { AuthCredentials, AuthSession, AuthUser, AuthenticatedSession } from '../../domain/auth.types';

type MockAuthUser = AuthUser & { password?: string };

const AUTH_USERS_KEY = Symbol.for('tdm.mock.auth.users');
const AUTH_SESSIONS_KEY = Symbol.for('tdm.mock.auth.sessions');

type AuthMockGlobal = typeof globalThis & {
  [AUTH_USERS_KEY]?: MockAuthUser[];
  [AUTH_SESSIONS_KEY]?: Map<string, AuthSession>;
};

const authGlobal = globalThis as AuthMockGlobal;
const users = authGlobal[AUTH_USERS_KEY] ?? [
  {
    id: 'user-tiala-rocha',
    name: 'Tiala Rocha',
    email: 'tialarocha@tdmconstrutor.com.br',
    password: 'tdm123456',
    avatarUrl: null,
    accessMode: 'standard'
  },
  {
    id: 'user-rodger-rocha',
    name: 'Rodger Rocha',
    email: 'rodgerrocha@tdmconstrutor.com.br',
    password: 'tdm123456',
    avatarUrl: null,
    accessMode: 'standard'
  }
];
const sessions = authGlobal[AUTH_SESSIONS_KEY] ?? new Map<string, AuthSession>();
authGlobal[AUTH_USERS_KEY] = users;
authGlobal[AUTH_SESSIONS_KEY] = sessions;

const SEEDED_USER_IDS = new Set(['user-tiala-rocha', 'user-rodger-rocha']);

function publicUser(user: MockAuthUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    accessMode: user.accessMode
  };
}

function findUser(credentials: AuthCredentials) {
  const normalizedName = credentials.name.trim().toLocaleLowerCase('pt-BR');
  const normalizedEmail = credentials.email.trim().toLowerCase();
  return users.find((user) => (
    user.accessMode !== 'demo' &&
    user.name.toLocaleLowerCase('pt-BR') === normalizedName &&
    user.email === normalizedEmail &&
    user.password === credentials.password
  ));
}

function removeDemoUser(userId: string) {
  const index = users.findIndex((user) => user.id === userId && user.accessMode === 'demo');
  if (index >= 0) users.splice(index, 1);
}

function resolveSession(sessionId: string): AuthenticatedSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  if (Date.parse(session.expiresAt) <= Date.now()) {
    sessions.delete(sessionId);
    removeDemoUser(session.userId);
    return null;
  }

  const user = users.find((candidate) => candidate.id === session.userId);
  return user ? { session: structuredClone(session), user: publicUser(user) } : null;
}

function createSessionForUser(user: MockAuthUser): AuthenticatedSession {
  const createdAt = new Date();
  const session: AuthSession = {
    id: crypto.randomUUID(),
    userId: user.id,
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(createdAt.getTime() + AUTH_SESSION_DURATION_SECONDS * 1000).toISOString()
  };
  sessions.set(session.id, session);
  return { session: structuredClone(session), user: publicUser(user) };
}

export const authMockStore = {
  clearSessions() {
    sessions.clear();
    for (let index = users.length - 1; index >= 0; index -= 1) {
      if (users[index]?.accessMode === 'demo') users.splice(index, 1);
    }
  },

  createSession(credentials: AuthCredentials): AuthenticatedSession | null {
    const user = findUser(credentials);
    return user ? createSessionForUser(user) : null;
  },

  createDemoSession(): AuthenticatedSession {
    const identity = crypto.randomUUID();
    const user: MockAuthUser = {
      id: `demo-user-${identity}`,
      name: 'Visitante demo',
      email: `demo-${identity}@demo.tdm.local`,
      avatarUrl: null,
      accessMode: 'demo'
    };
    users.push(user);
    return createSessionForUser(user);
  },

  registerUser(credentials: AuthCredentials): AuthenticatedSession | null {
    const normalizedEmail = credentials.email.trim().toLowerCase();
    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) return null;

    const user: MockAuthUser = {
      id: `user-${crypto.randomUUID()}`,
      name: credentials.name.trim(),
      email: normalizedEmail,
      password: credentials.password,
      avatarUrl: null,
      accessMode: 'standard'
    };
    users.push(user);
    return createSessionForUser(user);
  },

  resetDynamicUsers() {
    sessions.clear();
    for (let index = users.length - 1; index >= 0; index -= 1) {
      const user = users[index];
      if (user && !SEEDED_USER_IDS.has(user.id)) users.splice(index, 1);
    }
  },

  readSession(sessionId: string) {
    return resolveSession(sessionId);
  },

  updateUserAvatar(sessionId: string, avatarUrl: string) {
    const authenticated = resolveSession(sessionId);
    if (!authenticated) return null;
    const user = users.find((candidate) => candidate.id === authenticated.user.id);
    if (!user) return null;
    user.avatarUrl = avatarUrl;
    return resolveSession(sessionId);
  },

  deleteSession(sessionId: string) {
    const session = sessions.get(sessionId);
    sessions.delete(sessionId);
    if (session) removeDemoUser(session.userId);
  }
};

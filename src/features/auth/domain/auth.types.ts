export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthCredentials = {
  name: string;
  email: string;
  password: string;
};

export type AuthSession = {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

export type AuthenticatedSession = {
  session: AuthSession;
  user: AuthUser;
};

export type AuthRepository = {
  createSession(credentials: AuthCredentials): Promise<AuthenticatedSession | null>;
  findSession(sessionId: string): Promise<AuthenticatedSession | null>;
  deleteSession(sessionId: string): Promise<void>;
};

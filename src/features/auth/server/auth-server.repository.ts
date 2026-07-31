import type { AuthRepository } from '../domain/auth.types';
import { authMockStore } from '../infrastructure/msw/auth.mock-store';

export function createServerAuthRepository(): AuthRepository {
  return {
    async createSession(credentials) {
      return authMockStore.createSession(credentials);
    },
    async findSession(sessionId) {
      return authMockStore.readSession(sessionId);
    },
    async updateUserAvatar(sessionId, avatarUrl) {
      return authMockStore.updateUserAvatar(sessionId, avatarUrl);
    },
    async deleteSession(sessionId) {
      authMockStore.deleteSession(sessionId);
    }
  };
}

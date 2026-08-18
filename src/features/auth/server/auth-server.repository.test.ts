import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthRepository } from '../domain/auth.types';

const { createHttpAuthRepositoryMock, repositoryStub } = vi.hoisted(() => {
  const repository: AuthRepository = {
    createSession: vi.fn(),
    createDemoSession: vi.fn(),
    registerUser: vi.fn(),
    findSession: vi.fn(),
    updateUserAvatar: vi.fn(),
    deleteSession: vi.fn()
  };
  return {
    repositoryStub: repository,
    createHttpAuthRepositoryMock: vi.fn(() => repository)
  };
});

vi.mock('../infrastructure/http/http-auth.repository', () => ({
  createHttpAuthRepository: createHttpAuthRepositoryMock
}));

import { TDM_MOCK_API_ORIGIN } from '@/mocks/mock-api.constants';
import { createServerAuthRepository } from './auth-server.repository';

describe('createServerAuthRepository', () => {
  beforeEach(() => createHttpAuthRepositoryMock.mockClear());

  it('composes the canonical HTTP repository against the mock API origin', () => {
    expect(createServerAuthRepository()).toBe(repositoryStub);
    expect(createHttpAuthRepositoryMock).toHaveBeenCalledExactlyOnceWith({ baseUrl: TDM_MOCK_API_ORIGIN });
  });
});

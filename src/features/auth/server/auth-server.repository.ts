import { TDM_MOCK_API_ORIGIN } from '@/mocks/mock-api.constants';
import { startMockApiServer } from '@/mocks/server';
import type { AuthRepository } from '../domain/auth.types';
import { createHttpAuthRepository } from '../infrastructure/http/http-auth.repository';

export function createServerAuthRepository(): AuthRepository {
  startMockApiServer();
  return createHttpAuthRepository({ baseUrl: TDM_MOCK_API_ORIGIN });
}

import { TDM_MOCK_API_ORIGIN } from '@/mocks/mock-api.constants';
import { createHttpCanvasProjectRepository } from '../infrastructure/http/http-canvas-project.repository';

export function createServerCanvasProjectRepository() {
  return createHttpCanvasProjectRepository({ baseUrl: TDM_MOCK_API_ORIGIN });
}

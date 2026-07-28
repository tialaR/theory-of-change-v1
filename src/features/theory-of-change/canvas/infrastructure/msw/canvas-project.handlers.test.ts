import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { TDM_MOCK_API_ORIGIN } from '@/mocks/mock-api.constants';
import { createCanvasProject } from '../../application/create-canvas-project';
import { createHttpCanvasProjectRepository } from '../http/http-canvas-project.repository';
import { canvasProjectMockStore } from './canvas-project.mock-store';
import { canvasProjectTestServer } from './canvas-project.test-server';

beforeAll(() => canvasProjectTestServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => canvasProjectMockStore.clear());
afterAll(() => canvasProjectTestServer.close());

describe('canvasProjectHandlers', () => {
  it('persiste projetos isolados por usuário no store de módulo', async () => {
    const repository = createHttpCanvasProjectRepository({ baseUrl: TDM_MOCK_API_ORIGIN });
    const tialaProject = createCanvasProject({ id: 'primary', ownerId: 'user-tiala-rocha', title: 'Minha teoria da mudança' });
    const rodgerProject = createCanvasProject({ id: 'primary', ownerId: 'user-rodger-rocha', title: 'Minha teoria da mudança' });

    await repository.create(tialaProject.ownerId, tialaProject);
    await repository.create(rodgerProject.ownerId, rodgerProject);
    await repository.patch(tialaProject.ownerId, tialaProject.id, { title: 'Canvas da Tiala' });

    await expect(repository.findById(tialaProject.ownerId, tialaProject.id)).resolves.toMatchObject({
      title: 'Canvas da Tiala', ownerId: 'user-tiala-rocha'
    });
    await expect(repository.findById(rodgerProject.ownerId, rodgerProject.id)).resolves.toMatchObject({
      title: 'Minha teoria da mudança', ownerId: 'user-rodger-rocha'
    });
  });
});

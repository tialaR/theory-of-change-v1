import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createCanvasProject } from '../../application/create-canvas-project';
import {
  createHttpCanvasProjectRepository,
  type HttpCanvasProjectRepositoryOptions
} from '../http/http-canvas-project.repository';
import type { CanvasProjectRepository } from '../../domain/canvas-project';
import { canvasProjectMockStore } from './canvas-project.mock-store';
import { canvasProjectTestServer } from './canvas-project.test-server';

const repositoryOptions: HttpCanvasProjectRepositoryOptions = {
  baseUrl: 'http://localhost:3000'
};

let repository: CanvasProjectRepository;

beforeAll(() => {
  canvasProjectTestServer.listen({ onUnhandledRequest: 'error' });
  repository = createHttpCanvasProjectRepository(repositoryOptions);
});

afterEach(() => {
  canvasProjectMockStore.clear();
  canvasProjectTestServer.resetHandlers();
});

afterAll(() => canvasProjectTestServer.close());

describe('canvasProjectHandlers', () => {
  it('persiste e recupera o projeto no store em memória da API mockada', async () => {
    const project = createCanvasProject({ id: 'project-msw' });
    await repository.save(project);

    await expect(repository.findById(project.id)).resolves.toEqual(project);
  });
});

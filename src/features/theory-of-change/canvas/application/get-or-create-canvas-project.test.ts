import { describe, expect, it } from 'vitest';
import { getOrCreateCanvasProject } from './get-or-create-canvas-project';
import type { CanvasProject, CanvasProjectRepository } from '../domain/canvas-project';

function createRepository(): CanvasProjectRepository {
  const projects = new Map<string, CanvasProject>();
  const key = (ownerId: string, projectId: string) => `${ownerId}:${projectId}`;
  return {
    listByOwner: async (ownerId) => [...projects.values()].filter((project) => project.ownerId === ownerId),
    findById: async (ownerId, projectId) => projects.get(key(ownerId, projectId)) ?? null,
    create: async (ownerId, project) => {
      projects.set(key(ownerId, project.id), project);
      return structuredClone(project);
    },
    replace: async (ownerId, project) => {
      projects.set(key(ownerId, project.id), project);
      return structuredClone(project);
    },
    patch: async () => { throw new Error('not used'); },
    delete: async () => undefined
  };
}

describe('getOrCreateCanvasProject', () => {
  it('cria um projeto isolado para o proprietário quando necessário', async () => {
    const project = await getOrCreateCanvasProject(createRepository(), 'user-tiala-rocha', 'Minha teoria da mudança');
    expect(project.ownerId).toBe('user-tiala-rocha');
    expect(project.id).toBe('primary-theory-of-change');
  });
});

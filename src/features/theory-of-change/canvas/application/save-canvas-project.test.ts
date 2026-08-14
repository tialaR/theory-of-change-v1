import { describe, expect, it } from 'vitest';
import { createCanvasProject } from './create-canvas-project';
import { saveCanvasProject } from './save-canvas-project';
import type { CanvasProject, CanvasProjectRepository } from '../domain/canvas-project';

function createRepository(): CanvasProjectRepository {
  let stored: CanvasProject | null = null;
  return {
    listByOwner: async () => stored ? [stored] : [],
    findById: async () => stored,
    create: async (_ownerId, project) => structuredClone(project),
    replace: async (_ownerId, project) => {
      stored = structuredClone(project);
      return structuredClone(project);
    },
    patch: async () => { throw new Error('not used'); },
    delete: async () => undefined
  };
}

describe('saveCanvasProject', () => {
  it('incrementa revisão antes de persistir no owner correto', async () => {
    const repository = createRepository();
    const project = createCanvasProject({ id: 'project-1', ownerId: 'user-tiala-rocha', title: 'Minha teoria da mudança' });
    const result = await saveCanvasProject(repository, project, new Date('2026-07-27T13:00:00.000Z'));
    expect(result.project.revision).toBe(1);
    expect(result.project.ownerId).toBe('user-tiala-rocha');
  });
});

import { describe, expect, it } from 'vitest';
import { createCanvasProject } from './create-canvas-project';
import { saveCanvasProject } from './save-canvas-project';
import type { CanvasProject, CanvasProjectRepository } from '../domain/canvas-project';

function createRepository(): CanvasProjectRepository {
  let stored: CanvasProject | null = null;

  return {
    async findById() {
      return stored;
    },
    async save(project) {
      stored = structuredClone(project);
      return structuredClone(project);
    }
  };
}

describe('saveCanvasProject', () => {
  it('incrementa revisão antes de persistir', async () => {
    const repository = createRepository();
    const project = createCanvasProject({ id: 'project-1' });
    const result = await saveCanvasProject(
      repository,
      project,
      new Date('2026-07-27T13:00:00.000Z')
    );

    expect(result.project.revision).toBe(1);
    expect(result.project.updatedAt).toBe('2026-07-27T13:00:00.000Z');
  });
});

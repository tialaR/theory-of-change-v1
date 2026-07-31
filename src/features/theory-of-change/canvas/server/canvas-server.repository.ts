import type { CanvasProjectRepository } from '../domain/canvas-project';
import { canvasProjectMockStore } from '../infrastructure/msw/canvas-project.mock-store';

export function createServerCanvasProjectRepository(): CanvasProjectRepository {
  return {
    async listByOwner(ownerId) {
      return canvasProjectMockStore.list(ownerId);
    },
    async findById(ownerId, projectId) {
      return canvasProjectMockStore.read(ownerId, projectId);
    },
    async create(ownerId, project) {
      const created = canvasProjectMockStore.create(ownerId, project);
      if (!created) throw new Error('Canvas project already exists.');
      return created;
    },
    async replace(ownerId, project) {
      const replaced = canvasProjectMockStore.replace(ownerId, project);
      if (!replaced) throw new Error('Canvas project not found.');
      return replaced;
    },
    async patch(ownerId, projectId, patch) {
      const updated = canvasProjectMockStore.patch(ownerId, projectId, patch);
      if (!updated) throw new Error('Canvas project not found.');
      return updated;
    },
    async delete(ownerId, projectId) {
      canvasProjectMockStore.delete(ownerId, projectId);
    }
  };
}

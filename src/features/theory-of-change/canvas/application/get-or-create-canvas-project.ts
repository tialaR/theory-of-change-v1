import { createCanvasProject } from './create-canvas-project';
import { ACTIVE_CANVAS_PROJECT_ID } from '../domain/canvas-project.constants';
import type { CanvasProjectRepository } from '../domain/canvas-project';

export async function getOrCreateCanvasProject(repository: CanvasProjectRepository, ownerId: string, defaultTitle: string) {
  const existing = await repository.findById(ownerId, ACTIVE_CANVAS_PROJECT_ID);
  if (existing) return existing;
  return repository.create(ownerId, createCanvasProject({ id: ACTIVE_CANVAS_PROJECT_ID, ownerId, title: defaultTitle }));
}

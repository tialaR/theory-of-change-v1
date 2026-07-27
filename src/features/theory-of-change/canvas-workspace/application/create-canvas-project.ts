import type { CanvasProject } from '../domain/canvas-project';
import { CANVAS_PROJECT_DEFAULT_TITLE } from '../domain/canvas-project.constants';

export type CreateCanvasProjectInput = {
  id: string;
  title?: string;
  now?: Date;
};

export function createCanvasProject(input: CreateCanvasProjectInput): CanvasProject {
  const timestamp = (input.now ?? new Date()).toISOString();

  return {
    schemaVersion: 1,
    id: input.id,
    title: input.title?.trim() || CANVAS_PROJECT_DEFAULT_TITLE,
    locale: 'pt-BR',
    revision: 0,
    nodes: [],
    connections: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

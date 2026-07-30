import type { CanvasProject } from '../domain/canvas-project';

export type CreateCanvasProjectInput = {
  id: string;
  ownerId: string;
  title: string;
  now?: Date;
};

export function createCanvasProject(input: CreateCanvasProjectInput): CanvasProject {
  const timestamp = (input.now ?? new Date()).toISOString();

  return {
    schemaVersion: 3,
    id: input.id,
    ownerId: input.ownerId,
    title: input.title.trim(),
    locale: 'pt-BR',
    revision: 0,
    nodes: [],
    connections: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

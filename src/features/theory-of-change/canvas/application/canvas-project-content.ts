import type { CanvasProject, CanvasViewport } from '../domain/canvas-project';
import {
  createCanvasEnginePersistenceSignature,
  createCanvasEnginePersistenceSnapshot,
  type CanvasEnginePersistableContent
} from '../engine/canvas-engine';

export type CanvasProjectContent = Pick<CanvasProject, 'title' | 'nodes' | 'connections' | 'viewport'>;

type CanvasProjectEngineContent = CanvasEnginePersistableContent<
  CanvasProject['nodes'][number],
  CanvasProject['connections'][number],
  CanvasViewport
>;

export function assembleCanvasProjectContent(input: {
  project: CanvasProject;
  viewport: CanvasViewport;
}): CanvasProjectContent {
  const content: CanvasProjectEngineContent = {
    title: input.project.title,
    nodes: input.project.nodes,
    connections: input.project.connections,
    viewport: input.viewport
  };

  return createCanvasEnginePersistenceSnapshot(content);
}

export function createCanvasProjectContentSignature(project: CanvasProjectContent) {
  return createCanvasEnginePersistenceSignature(project);
}

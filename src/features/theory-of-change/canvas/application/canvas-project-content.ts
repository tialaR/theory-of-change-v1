import type { CanvasProject } from '../domain/canvas-project';

export type CanvasProjectContent = Pick<CanvasProject, 'title' | 'nodes' | 'connections'>;

export function createCanvasProjectContentSignature(project: CanvasProjectContent) {
  return JSON.stringify({
    title: project.title,
    nodes: project.nodes,
    connections: project.connections
  });
}

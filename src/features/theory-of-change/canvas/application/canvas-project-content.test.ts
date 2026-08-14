import { describe, expect, it } from 'vitest';
import { createCanvasProject } from './create-canvas-project';
import {
  assembleCanvasProjectContent,
  createCanvasProjectContentSignature
} from './canvas-project-content';

describe('canvas project content', () => {
  it('assembles only persistable content and uses the latest viewport', () => {
    const project = createCanvasProject({
      id: 'project-1',
      ownerId: 'user-1',
      title: 'Theory draft'
    });
    const viewport = { x: 120, y: -48, zoom: 0.85 };

    const content = assembleCanvasProjectContent({ project, viewport });

    expect(content).toEqual({
      title: project.title,
      nodes: project.nodes,
      connections: project.connections,
      viewport
    });
    expect(content.viewport).not.toBe(viewport);
    expect(content).not.toHaveProperty('id');
    expect(content).not.toHaveProperty('ownerId');
    expect(content).not.toHaveProperty('revision');
  });

  it('creates equal signatures for equivalent persistable content', () => {
    const project = createCanvasProject({
      id: 'project-1',
      ownerId: 'user-1',
      title: 'Stable theory'
    });
    const first = assembleCanvasProjectContent({
      project,
      viewport: { x: 0, y: 0, zoom: 1 }
    });
    const second = assembleCanvasProjectContent({
      project: { ...project, revision: 9 },
      viewport: { x: 0, y: 0, zoom: 1 }
    });

    expect(createCanvasProjectContentSignature(first)).toBe(
      createCanvasProjectContentSignature(second)
    );
  });
});

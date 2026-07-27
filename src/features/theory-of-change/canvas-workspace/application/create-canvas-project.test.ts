import { describe, expect, it } from 'vitest';
import { createCanvasProject } from './create-canvas-project';

describe('createCanvasProject', () => {
  it('cria documento versionado e vazio', () => {
    const project = createCanvasProject({
      id: 'project-1',
      now: new Date('2026-07-27T12:00:00.000Z')
    });

    expect(project).toMatchObject({
      schemaVersion: 1,
      id: 'project-1',
      locale: 'pt-BR',
      revision: 0,
      nodes: [],
      connections: []
    });
  });
});

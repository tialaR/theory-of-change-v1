import { describe, expect, it } from 'vitest';
import { createCanvasProject } from './create-canvas-project';

describe('createCanvasProject', () => {
  it('cria documento versionado, vazio e pertencente ao usuário', () => {
    const project = createCanvasProject({
      id: 'project-1',
      ownerId: 'user-tiala-rocha',
      title: 'Minha teoria da mudança',
      now: new Date('2026-07-27T12:00:00.000Z')
    });

    expect(project).toMatchObject({
      schemaVersion: 2,
      id: 'project-1',
      ownerId: 'user-tiala-rocha',
      locale: 'pt-BR',
      revision: 0,
      nodes: [],
      connections: []
    });
  });
});

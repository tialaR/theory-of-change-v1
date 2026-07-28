import { describe, expect, it } from 'vitest';
import { createCanvasProject } from '@/features/theory-of-change/canvas-workspace';
import { mapCanvasSnapshotToProject } from './canvas-project.mapper';

describe('mapCanvasSnapshotToProject', () => {
  it('mapeia nós, conexões e marcadores sem estado global compartilhado', () => {
    const base = createCanvasProject({ id: 'active-canvas', now: new Date('2026-07-27T00:00:00.000Z') });
    const project = mapCanvasSnapshotToProject(base, {
      title: 'Teoria territorial',
      nodes: [
        { id: 'input-1', stage: 'input', title: 'Equipe', description: 'Técnica', advancedDetails: '', x: 10, y: 20 },
        { id: 'activity-1', stage: 'activity', title: 'Oficina', description: 'Formação', advancedDetails: '', x: 30, y: 40 }
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'input-1',
          target: 'activity-1',
          relationKind: 'risk',
          relationTitle: 'Baixa adesão',
          relationText: 'Pode reduzir o alcance',
          relationAdvancedDetails: ''
        }
      ]
    });

    expect(project.title).toBe('Teoria territorial');
    expect(project.nodes[0].position).toEqual({ x: 10, y: 20 });
    expect(project.connections[0].relation).toMatchObject({ kind: 'risk', title: 'Baixa adesão' });
  });
});

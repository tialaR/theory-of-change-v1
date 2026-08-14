import { describe, expect, it } from 'vitest';
import type { CanvasProject } from '../../domain/canvas-project';
import { mapCanvasProjectToResultViewModel } from './canvas-result.mapper';

const project: CanvasProject = {
  schemaVersion: 3,
  id: 'project-1',
  ownerId: 'user-1',
  title: 'Teoria construída no Canvas',
  locale: 'pt-BR',
  revision: 4,
  createdAt: '2026-07-29T20:00:00.000Z',
  updatedAt: '2026-07-29T21:00:00.000Z',
  nodes: [
    {
      id: 'input-1',
      stage: 'input',
      order: 0,
      title: 'Equipe',
      description: 'Equipe disponível',
      advancedDetails: 'Detalhes da equipe',
      position: { x: 120, y: 140 }
    },
    {
      id: 'product-1',
      stage: 'product',
      order: 0,
      title: 'Entrega',
      description: 'Entrega realizada',
      advancedDetails: '',
      position: { x: 800, y: 140 }
    }
  ],
  connections: [
    {
      id: 'edge-1',
      sourceId: 'input-1',
      targetId: 'product-1',
      relation: {
        kind: 'hypothesis',
        title: 'A equipe permanece disponível',
        description: '',
        advancedDetails: ''
      }
    }
  ]
};

describe('mapCanvasProjectToResultViewModel', () => {
  it('transforma o projeto persistido no mesmo modelo da experiência interativa', () => {
    const result = mapCanvasProjectToResultViewModel(project);

    expect(result.title).toBe(project.title);
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes[1]?.stage).toBe('output');
    expect(result.edges[0]).toMatchObject({
      source: 'input-1',
      target: 'product-1',
      markerType: 'hypothesis',
      markerText: 'A equipe permanece disponível'
    });
  });

  it('ignora conexões órfãs sem quebrar a tela de resultado', () => {
    const result = mapCanvasProjectToResultViewModel({
      ...project,
      connections: [{ id: 'orphan', sourceId: 'missing', targetId: 'product-1' }]
    });

    expect(result.edges).toEqual([]);
  });
});

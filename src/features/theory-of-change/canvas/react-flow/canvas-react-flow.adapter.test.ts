import { describe, expect, it } from 'vitest';
import { createCanvasProject } from '../application/create-canvas-project';
import { applyCanvasFlowGraph, toCanvasFlowGraph } from './canvas-react-flow.adapter';

function createProject() {
  const project = createCanvasProject({ id: 'project-flow', ownerId: 'user-tiala-rocha', title: 'Minha teoria da mudança' });
  project.nodes.push({
    id: 'input-1',
    stage: 'input',
    order: 0,
    title: 'Equipe',
    description: 'Equipe técnica',
    advancedDetails: '',
    position: { x: 120, y: 180 }
  });
  return project;
}

describe('canvasReactFlowAdapter', () => {
  it('traduz o documento sem perder identidade, posição ou order', () => {
    const graph = toCanvasFlowGraph(createProject());

    expect(graph.nodes[0]).toMatchObject({
      id: 'input-1',
      type: 'canvas-stage',
      position: { x: 120, y: 180 },
      data: { order: 0 }
    });
  });

  it('reconstrói o documento preservando order ao mover visualmente', () => {
    const project = createProject();
    const graph = toCanvasFlowGraph(project);
    graph.nodes[0].position = { x: 240, y: 320 };

    expect(applyCanvasFlowGraph(project, graph).nodes[0]).toMatchObject({
      order: 0,
      position: { x: 240, y: 320 }
    });
  });

  it('atribui order determinístico para node novo sem order', () => {
    const project = createProject();
    const graph = toCanvasFlowGraph(project);
    graph.nodes.push({
      id: 'input-2',
      type: 'canvas-stage',
      position: { x: 120, y: 80 },
      data: {
        stage: 'input',
        title: 'Orçamento',
        description: '',
        advancedDetails: ''
      }
    });

    const nodes = applyCanvasFlowGraph(project, graph).nodes;
    expect(nodes.find((node) => node.id === 'input-2')?.order).toBe(0);
    expect(nodes.find((node) => node.id === 'input-1')?.order).toBe(1);
  });
});

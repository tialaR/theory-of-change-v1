import { describe, expect, it } from 'vitest';
import { createCanvasProject } from '../application/create-canvas-project';
import { applyCanvasFlowGraph, toCanvasFlowGraph } from './canvas-react-flow.adapter';

function createProject() {
  const project = createCanvasProject({ id: 'project-flow', ownerId: 'user-tiala-rocha', title: 'Minha teoria da mudança' });
  project.nodes.push({
    id: 'input-1',
    stage: 'input',
    title: 'Equipe',
    description: 'Equipe técnica',
    advancedDetails: '',
    position: { x: 120, y: 180 }
  });
  return project;
}

describe('canvasReactFlowAdapter', () => {
  it('traduz o documento sem perder identidade ou posição', () => {
    const graph = toCanvasFlowGraph(createProject());

    expect(graph.nodes[0]).toMatchObject({
      id: 'input-1',
      type: 'canvas-stage',
      position: { x: 120, y: 180 }
    });
  });

  it('reconstrói o documento a partir do grafo real', () => {
    const project = createProject();
    const graph = toCanvasFlowGraph(project);
    graph.nodes[0].position = { x: 240, y: 320 };

    expect(applyCanvasFlowGraph(project, graph).nodes[0].position).toEqual({ x: 240, y: 320 });
  });
});

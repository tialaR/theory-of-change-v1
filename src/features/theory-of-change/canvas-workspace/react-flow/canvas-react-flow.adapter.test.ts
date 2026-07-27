import { describe, expect, it } from 'vitest';
import { createCanvasProject } from '../application/create-canvas-project';
import { toCanvasFlowGraph } from './canvas-react-flow.adapter';

describe('toCanvasFlowGraph', () => {
  it('traduz o documento sem perder identidade ou posição', () => {
    const project = createCanvasProject({ id: 'project-flow' });
    project.nodes.push({
      id: 'input-1',
      stage: 'input',
      title: 'Equipe',
      description: 'Equipe técnica',
      advancedDetails: '',
      position: { x: 120, y: 180 }
    });

    const graph = toCanvasFlowGraph(project);
    expect(graph.nodes[0]).toMatchObject({
      id: 'input-1',
      type: 'canvas-stage',
      position: { x: 120, y: 180 }
    });
  });
});

import { describe, expect, it } from 'vitest';
import {
  centralizeCanvasEngineColumns,
  organizeCanvasEngineFlow,
  type CanvasEngineLayoutNode,
  type CanvasEngineLayoutPolicy
} from './canvas-engine-layout';

type Stage = 'input' | 'activity';
type Node = CanvasEngineLayoutNode<Stage> & { label: string };

const policy: CanvasEngineLayoutPolicy<Stage> = {
  stages: ['input', 'activity'],
  columnX: { input: 100, activity: 400 },
  columnStartY: 50,
  defaultNodeHeight: 120,
  nodeGap: 30
};

function makeNode(id: string, stage: Stage, y: number, height?: number): Node {
  return {
    id,
    label: id,
    position: { x: 999, y },
    measured: height ? { height } : undefined,
    data: { stage }
  };
}

describe('canvas engine layout', () => {
  it('centralizes stages while preserving vertical order', () => {
    const result = centralizeCanvasEngineColumns([
      makeNode('input-2', 'input', 300),
      makeNode('input-1', 'input', 100)
    ], policy);

    expect(result.find((node) => node.id === 'input-1')?.position).toEqual({ x: 100, y: 50 });
    expect(result.find((node) => node.id === 'input-2')?.position).toEqual({ x: 100, y: 200 });
  });

  it('uses measured node height when available', () => {
    const result = centralizeCanvasEngineColumns([
      makeNode('input-1', 'input', 100, 200),
      makeNode('input-2', 'input', 200)
    ], policy);

    expect(result.find((node) => node.id === 'input-2')?.position.y).toBe(280);
  });

  it('organizes the most connected node first inside its stage', () => {
    const nodes = [
      makeNode('input-low', 'input', 100),
      makeNode('input-high', 'input', 200),
      makeNode('activity-1', 'activity', 100)
    ];
    const edges = [
      { source: 'input-high', target: 'activity-1' },
      { source: 'input-high', target: 'activity-2' }
    ];

    const result = organizeCanvasEngineFlow(nodes, edges, policy);

    expect(result.find((node) => node.id === 'input-high')?.position.y).toBe(50);
    expect(result.find((node) => node.id === 'input-low')?.position.y).toBe(200);
  });

  it('returns new node objects without mutating the input', () => {
    const nodes = [makeNode('input-1', 'input', 100)];
    const result = centralizeCanvasEngineColumns(nodes, policy);

    expect(result).not.toBe(nodes);
    expect(result[0]).not.toBe(nodes[0]);
    expect(nodes[0].position).toEqual({ x: 999, y: 100 });
  });
});

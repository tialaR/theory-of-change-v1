import { describe, expect, it } from 'vitest';
import {
  constrainCanvasEngineDropPosition,
  resolveCanvasEngineConnection
} from './canvas-engine-interaction';

const nodes = [
  { id: 'input-1', data: { stage: 'input' } },
  { id: 'activity-1', data: { stage: 'activity' } }
] as const;

const evaluateTransition = (sourceStage: string, targetStage: string) => (
  sourceStage === 'input' && targetStage === 'activity'
    ? { allowed: true as const, relationKind: 'risk' as const }
    : { allowed: false as const, code: 'backward' as const }
);

describe('canvas-engine-interaction', () => {
  it('rejects incomplete and self-target connection candidates', () => {
    expect(resolveCanvasEngineConnection({
      nodes,
      edges: [],
      candidate: { source: null, target: 'activity-1' },
      evaluateTransition
    })).toEqual({ ok: false, code: 'invalid-target' });

    expect(resolveCanvasEngineConnection({
      nodes,
      edges: [],
      candidate: { source: 'input-1', target: 'input-1' },
      evaluateTransition
    })).toEqual({ ok: false, code: 'invalid-target' });
  });

  it('rejects missing, policy-rejected and duplicate connections', () => {
    expect(resolveCanvasEngineConnection({
      nodes,
      edges: [],
      candidate: { source: 'missing', target: 'activity-1' },
      evaluateTransition
    })).toEqual({ ok: false, code: 'missing-cards' });

    expect(resolveCanvasEngineConnection({
      nodes,
      edges: [],
      candidate: { source: 'activity-1', target: 'input-1' },
      evaluateTransition
    })).toEqual({ ok: false, code: 'backward' });

    expect(resolveCanvasEngineConnection({
      nodes,
      edges: [{ source: 'input-1', target: 'activity-1' }],
      candidate: { source: 'input-1', target: 'activity-1' },
      evaluateTransition
    })).toEqual({ ok: false, code: 'duplicate-connection' });
  });

  it('returns resolved endpoints and relation metadata for an allowed connection', () => {
    const result = resolveCanvasEngineConnection({
      nodes,
      edges: [],
      candidate: { source: 'input-1', target: 'activity-1' },
      evaluateTransition
    });

    expect(result).toEqual({
      ok: true,
      source: nodes[0],
      target: nodes[1],
      relationKind: 'risk'
    });
  });

  it('constrains stage drops to the configured canvas bounds', () => {
    const bounds = {
      width: 1000,
      height: 700,
      nodeWidth: 200,
      nodeHeight: 100,
      edgeGap: 20,
      topGap: 60,
      anchorOffsetX: 100,
      anchorOffsetY: 40
    };

    expect(constrainCanvasEngineDropPosition({ x: 30, y: 20 }, bounds))
      .toEqual({ x: 20, y: 60 });
    expect(constrainCanvasEngineDropPosition({ x: 990, y: 690 }, bounds))
      .toEqual({ x: 780, y: 580 });
    expect(constrainCanvasEngineDropPosition({ x: 450, y: 300 }, bounds))
      .toEqual({ x: 350, y: 260 });
  });
});

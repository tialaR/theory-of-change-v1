import { describe, expect, it } from 'vitest';
import { evaluateCanvasConnection } from './canvas-connection-policy';
import type { CanvasRelationKind, CanvasStageId } from './canvas-project';

const VALID_TRANSITIONS = [
  ['input', 'activity', 'risk'],
  ['activity', 'product', 'risk'],
  ['product', 'outcome', 'hypothesis']
] as const;

describe('evaluateCanvasConnection', () => {
  it.each(VALID_TRANSITIONS)('permite %s -> %s', (source: CanvasStageId, target: CanvasStageId, relationKind: CanvasRelationKind) => {
    expect(evaluateCanvasConnection(source, target)).toEqual({ allowed: true, relationKind });
  });

  it('rejeita salto causal sem mutação implícita', () => {
    expect(evaluateCanvasConnection('input', 'product')).toMatchObject({
      allowed: false,
      code: 'skip-stage'
    });
  });

  it('rejeita conexão regressiva', () => {
    expect(evaluateCanvasConnection('product', 'activity')).toMatchObject({
      allowed: false,
      code: 'backward'
    });
  });

  it('rejeita resultado como origem', () => {
    expect(evaluateCanvasConnection('outcome', 'input')).toMatchObject({
      allowed: false,
      code: 'outcome-source'
    });
  });
});

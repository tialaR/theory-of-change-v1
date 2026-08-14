import type { CanvasRelationKind, CanvasStageId } from './canvas-project';

export type CanvasConnectionRejectionCode =
  | 'same-stage'
  | 'backward'
  | 'skip-stage'
  | 'outcome-source';

export type CanvasConnectionDecision =
  | { allowed: true; relationKind: CanvasRelationKind }
  | { allowed: false; code: CanvasConnectionRejectionCode };

const ORDER: Record<CanvasStageId, number> = {
  input: 0,
  activity: 1,
  product: 2,
  outcome: 3
};

export function evaluateCanvasConnection(
  source: CanvasStageId,
  target: CanvasStageId
): CanvasConnectionDecision {
  if (source === 'outcome') return { allowed: false, code: 'outcome-source' };

  const distance = ORDER[target] - ORDER[source];
  if (distance === 0) return { allowed: false, code: 'same-stage' };
  if (distance < 0) return { allowed: false, code: 'backward' };
  if (distance > 1) return { allowed: false, code: 'skip-stage' };

  return {
    allowed: true,
    relationKind: source === 'product' ? 'hypothesis' : 'risk'
  };
}

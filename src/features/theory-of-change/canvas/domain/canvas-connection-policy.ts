import type { CanvasRelationKind, CanvasStageId } from './canvas-project';
import { CANVAS_CONNECTION_MESSAGES } from './canvas-connection.messages';

export type CanvasConnectionDecision =
  | { allowed: true; relationKind: CanvasRelationKind }
  | {
      allowed: false;
      code: 'same-stage' | 'backward' | 'skip-stage' | 'outcome-source';
      message: string;
    };

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
  if (source === 'outcome') {
    return {
      allowed: false,
      code: 'outcome-source',
      message: CANVAS_CONNECTION_MESSAGES.outcomeSource
    };
  }

  const distance = ORDER[target] - ORDER[source];

  if (distance === 0) {
    return {
      allowed: false,
      code: 'same-stage',
      message: CANVAS_CONNECTION_MESSAGES.sameStage
    };
  }

  if (distance < 0) {
    return {
      allowed: false,
      code: 'backward',
      message: CANVAS_CONNECTION_MESSAGES.backward
    };
  }

  if (distance > 1) {
    return {
      allowed: false,
      code: 'skip-stage',
      message: CANVAS_CONNECTION_MESSAGES.skipStage
    };
  }

  return {
    allowed: true,
    relationKind: source === 'product' ? 'hypothesis' : 'risk'
  };
}

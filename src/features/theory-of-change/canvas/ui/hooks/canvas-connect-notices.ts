import type { CanvasConnectFailureCode } from './use-canvas-flow-controller';

export const CANVAS_CONNECT_NOTICE_KEYS: Record<CanvasConnectFailureCode, string> = {
  'invalid-target': 'notices.invalidTarget',
  'missing-cards': 'notices.missingCards',
  'duplicate-connection': 'notices.duplicateConnection',
  'same-stage': 'notices.sameStage',
  backward: 'notices.backward',
  'skip-stage': 'notices.skipStage',
  'outcome-source': 'notices.outcomeSource'
};

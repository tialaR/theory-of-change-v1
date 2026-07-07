import type { TdmConnectionKind } from './tdm-types';

export const TDM_CONNECTION_STROKE: Record<TdmConnectionKind, string> = {
  'input-activity': '#8B7CFF',
  'activity-output': '#5EB8E8',
  'output-outcome': '#3DBF9A'
};

export const TDM_CONNECTION_STROKE_WIDTH = {
  rest: 1.6,
  active: 2.2
} as const;

export const TDM_EDGE_INTERACTION_WIDTH = 28;

export const TDM_EDGE_DASH = {
  rest: '6 8',
  active: '4 6'
} as const;

export function getConnectionStrokeColor(connectionKind: TdmConnectionKind | undefined, fallback: string): string {
  if (!connectionKind) {
    return fallback;
  }

  return TDM_CONNECTION_STROKE[connectionKind];
}

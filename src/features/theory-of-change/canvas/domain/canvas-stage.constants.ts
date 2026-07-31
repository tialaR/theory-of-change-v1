import type { CanvasStageId } from './canvas-project';

export const CANVAS_STAGES: readonly CanvasStageId[] = ['input', 'activity', 'product', 'outcome'];

export function isCanvasStageId(value: string): value is CanvasStageId {
  return CANVAS_STAGES.some((stage) => stage === value);
}

import type { CanvasStageId } from '../domain/canvas-project';
import type { CanvasStageCopy } from '../engine/canvas-engine';

export type { CanvasStageCopy } from '../engine/canvas-engine';

export type CanvasTranslator = (key: string, values?: Record<string, string | number>) => string;

export function createCanvasStageCopy(t: CanvasTranslator, stage: CanvasStageId): CanvasStageCopy {
  return {
    label: t(`stages.${stage}.label`),
    singular: t(`stages.${stage}.singular`),
    hint: t(`stages.${stage}.hint`),
    titlePlaceholder: t(`stages.${stage}.titlePlaceholder`),
    descriptionPlaceholder: t(`stages.${stage}.descriptionPlaceholder`),
    advancedPlaceholder: t(`stages.${stage}.advancedPlaceholder`)
  };
}

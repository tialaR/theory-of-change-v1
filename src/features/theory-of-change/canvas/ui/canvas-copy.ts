import type { CanvasStageId } from '../domain/canvas-project';

export type CanvasTranslator = (key: string, values?: Record<string, string | number>) => string;

export type CanvasStageCopy = {
  label: string;
  singular: string;
  hint: string;
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  advancedPlaceholder: string;
};

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

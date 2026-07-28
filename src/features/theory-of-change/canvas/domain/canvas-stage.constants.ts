import type { CanvasStageId } from './canvas-project';

export type CanvasStageMeta = {
  id: CanvasStageId;
  label: string;
  singular: string;
  hint: string;
};

export const CANVAS_STAGES: readonly CanvasStageMeta[] = [
  { id: 'input', label: 'Insumos', singular: 'Insumo', hint: 'Recursos disponíveis' },
  { id: 'activity', label: 'Atividades', singular: 'Atividade', hint: 'Ações realizadas' },
  { id: 'product', label: 'Produtos', singular: 'Produto', hint: 'Entregas concretas' },
  { id: 'outcome', label: 'Resultados', singular: 'Resultado', hint: 'Mudanças esperadas' }
];

export function getCanvasStageMeta(stage: CanvasStageId): CanvasStageMeta {
  return CANVAS_STAGES.find((item) => item.id === stage) ?? CANVAS_STAGES[0];
}

export function isCanvasStageId(value: string): value is CanvasStageId {
  return CANVAS_STAGES.some((stage) => stage.id === value);
}

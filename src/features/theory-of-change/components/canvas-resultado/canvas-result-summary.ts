import type { CanvasProject, CanvasStageId } from '@/features/theory-of-change/canvas-workspace';

const STAGE_ORDER: CanvasStageId[] = ['input', 'activity', 'product', 'outcome'];

const STAGE_LABELS: Record<CanvasStageId, string> = {
  input: 'Insumos',
  activity: 'Atividades',
  product: 'Produtos',
  outcome: 'Resultados'
};

export type CanvasResultStageSummary = {
  stage: CanvasStageId;
  label: string;
  count: number;
};

export function createCanvasResultStageSummary(project: CanvasProject): CanvasResultStageSummary[] {
  return STAGE_ORDER.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    count: project.nodes.filter((node) => node.stage === stage).length
  }));
}

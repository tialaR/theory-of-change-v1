import type { CanvasProject, CanvasStageId } from '../../domain/canvas-project';

const STAGE_ORDER: CanvasStageId[] = ['input', 'activity', 'product', 'outcome'];

export type CanvasResultStageSummary = {
  stage: CanvasStageId;
  count: number;
};

export function createCanvasResultStageSummary(project: CanvasProject): CanvasResultStageSummary[] {
  return STAGE_ORDER.map((stage) => ({
    stage,
    count: project.nodes.filter((node) => node.stage === stage).length
  }));
}

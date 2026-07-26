import { STAGE_ORDER, STAGES } from './canvas-v2.constants';
import type { TdmCanvasNode, TdmStageId } from './canvas-v2.types';

export function getStage(stageId: TdmStageId) {
  return STAGES.find((stage) => stage.id === stageId) ?? STAGES[0];
}

export function isValidCausalConnection(sourceStage: TdmStageId, targetStage: TdmStageId) {
  return STAGE_ORDER[targetStage] - STAGE_ORDER[sourceStage] === 1;
}

export function getConnectionError(source: TdmCanvasNode, target: TdmCanvasNode) {
  if (source.id === target.id) return 'Um bloco não pode se conectar a ele mesmo.';
  if (isValidCausalConnection(source.data.stage, target.data.stage)) return null;
  return `${getStage(source.data.stage).singular} conecta somente à etapa causal seguinte.`;
}

export function canQualifyEdge(source: TdmCanvasNode | undefined, target: TdmCanvasNode | undefined) {
  if (!source || !target) return false;
  return isValidCausalConnection(source.data.stage, target.data.stage);
}

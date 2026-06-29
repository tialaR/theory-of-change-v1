import { TDM_STAGE_ORDER } from '../domain/tdm-stages';
import type { TdmEdge, TdmNode } from '../domain/tdm-types';
import { isAllowedTdmConnection } from '../domain/tdm-connection-rules';

export function canViewTdmResult(nodes: TdmNode[], edges: TdmEdge[]) {
  const stageSet = new Set(nodes.map((node) => node.stage));
  const existsInput = stageSet.has('input');
  const existsActivity = stageSet.has('activity');
  const existsOutput = stageSet.has('output');
  const existsOutcome = stageSet.has('outcome');

  const hasInputToActivityConnection = edges.some(
    (edge) => edge.sourceStage === 'input' && edge.targetStage === 'activity' && isAllowedTdmConnection(edge.sourceStage, edge.targetStage)
  );
  const hasActivityToOutputConnection = edges.some(
    (edge) => edge.sourceStage === 'activity' && edge.targetStage === 'output' && isAllowedTdmConnection(edge.sourceStage, edge.targetStage)
  );
  const hasOutputToOutcomeConnection = edges.some(
    (edge) => edge.sourceStage === 'output' && edge.targetStage === 'outcome' && isAllowedTdmConnection(edge.sourceStage, edge.targetStage)
  );

  return (
    existsInput &&
    existsActivity &&
    existsOutput &&
    existsOutcome &&
    hasInputToActivityConnection &&
    hasActivityToOutputConnection &&
    hasOutputToOutcomeConnection
  );
}

export function getTdmResultAvailabilityMessage(nodes: TdmNode[], edges: TdmEdge[]) {
  const stageCounts = TDM_STAGE_ORDER.reduce<Record<string, number>>(
    (accumulator, stage) => {
      accumulator[stage] = nodes.filter((node) => node.stage === stage).length;
      return accumulator;
    },
    { input: 0, activity: 0, output: 0, outcome: 0 }
  );

  const hasAllStages = Object.values(stageCounts).every((count) => count > 0);
  if (!hasAllStages) {
    return 'Crie pelo menos um bloco em cada etapa para concluir e visualizar a teoria.';
  }

  const hasInputToActivityConnection = edges.some((edge) => edge.sourceStage === 'input' && edge.targetStage === 'activity');
  const hasActivityToOutputConnection = edges.some((edge) => edge.sourceStage === 'activity' && edge.targetStage === 'output');
  const hasOutputToOutcomeConnection = edges.some((edge) => edge.sourceStage === 'output' && edge.targetStage === 'outcome');

  if (!hasInputToActivityConnection || !hasActivityToOutputConnection || !hasOutputToOutcomeConnection) {
    return 'Agora conecte os blocos da esquerda para a direita para liberar a visualização.';
  }

  return 'Sua teoria está pronta para ser visualizada.';
}

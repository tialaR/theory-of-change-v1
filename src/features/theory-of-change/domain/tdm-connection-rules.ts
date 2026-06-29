import { TDM_STAGE_ORDER, type TdmStage } from './tdm-stages';
import type { TdmMarkerType } from './tdm-types';

const ALLOWED_CONNECTIONS: Record<TdmStage, readonly TdmStage[]> = {
  input: ['activity'],
  activity: ['output'],
  output: ['outcome'],
  outcome: []
};

const STAGE_MESSAGES = {
  sameColumn:
    'Esses blocos estão na mesma etapa. Para manter a lógica da mudança, conecte sempre uma coluna com a próxima.',
  rightToLeft:
    'Essa ligação volta no tempo. A teoria deve seguir da esquerda para a direita: insumos → atividades → produtos → resultados.',
  skipStage:
    'Essa ligação pula uma etapa. Primeiro conecte com a próxima coluna para deixar o caminho mais claro.',
  valid: 'Conexão válida. Agora você pode explicar o vínculo entre esses blocos.'
} as const;

export function isAllowedTdmConnection(sourceStage: TdmStage, targetStage: TdmStage): boolean {
  return ALLOWED_CONNECTIONS[sourceStage].includes(targetStage);
}

export function getTdmConnectionMessage(sourceStage: TdmStage, targetStage: TdmStage): string {
  if (isAllowedTdmConnection(sourceStage, targetStage)) {
    return STAGE_MESSAGES.valid;
  }

  if (sourceStage === targetStage) {
    return STAGE_MESSAGES.sameColumn;
  }

  const sourceIndex = TDM_STAGE_ORDER.indexOf(sourceStage);
  const targetIndex = TDM_STAGE_ORDER.indexOf(targetStage);

  if (sourceIndex > targetIndex) {
    return STAGE_MESSAGES.rightToLeft;
  }

  return STAGE_MESSAGES.skipStage;
}

export function getAllowedMarkerTypesForConnection(
  sourceStage: TdmStage,
  targetStage: TdmStage
): readonly TdmMarkerType[] {
  if (sourceStage === 'input' && targetStage === 'activity') {
    return ['risk'];
  }

  if (sourceStage === 'activity' && targetStage === 'output') {
    return ['risk'];
  }

  if (sourceStage === 'output' && targetStage === 'outcome') {
    return ['hypothesis'];
  }

  return [];
}

export function canConnectStages(sourceStage: TdmStage, targetStage: TdmStage): boolean {
  return isAllowedTdmConnection(sourceStage, targetStage);
}

export function getNextAllowedStages(stage: TdmStage): readonly TdmStage[] {
  return ALLOWED_CONNECTIONS[stage];
}

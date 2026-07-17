import { TDM_STAGE_ORDER, type TdmStage } from './tdm-stages';
import type { TdmConnectionKind, TdmMarkerType } from './tdm-types';

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

export const GUIDE_DEFAULT_TITLE = 'Guia da teoria';

export const GUIDE_DEFAULT_BODY = 'Conecte os blocos da esquerda para a direita. Cada etapa leva à próxima mudança.';

export const GUIDE_FLOW_LINE = 'Insumos -> Atividades -> Produtos -> Resultados';

export const GUIDE_RISK_HINT = 'Riscos explicam o que pode impedir uma passagem.';

export const GUIDE_HYPOTHESIS_HINT = 'Hipóteses explicam por que um produto deve gerar um resultado.';

export const GUIDE_INVALID_CONNECTION =
  'Essa conexão não segue a ordem da teoria. Use apenas a próxima etapa à direita.';

export const GUIDE_RISK_SAVED = 'Risco salvo nesta passagem.';

export const GUIDE_HYPOTHESIS_SAVED = 'Hipótese salva nesta passagem.';

export const GUIDE_RISK_DELETED = 'Risco removido. A conexão continua existindo.';

export const GUIDE_HYPOTHESIS_DELETED = 'Hipótese removida. A conexão continua existindo.';

const CONNECTION_START_GUIDE: Record<TdmStage, string> = {
  input: 'Leve este Insumo até uma Atividade.',
  activity: 'Leve esta Atividade até um Produto.',
  output: 'Leve este Produto até um Resultado.',
  outcome: 'Resultados encerram o fluxo. Eles não se conectam para frente.'
};

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

export function getConnectionKind(sourceStage: TdmStage, targetStage: TdmStage): TdmConnectionKind | undefined {
  if (sourceStage === 'input' && targetStage === 'activity') {
    return 'input-activity';
  }

  if (sourceStage === 'activity' && targetStage === 'output') {
    return 'activity-output';
  }

  if (sourceStage === 'output' && targetStage === 'outcome') {
    return 'output-outcome';
  }

  return undefined;
}

export function getAllowedTargetStage(sourceStage: TdmStage): TdmStage | undefined {
  return ALLOWED_CONNECTIONS[sourceStage][0];
}

/**
 * Exclusive V1 matrix — docs/tdm-clear-interpreter-standard-v2.1.md
 * input→activity: risk only
 * activity→output (product): risk only
 * output→outcome (result): hypothesis only
 */
export const CONNECTION_CONDITION_BY_TRANSITION = {
  'input->activity': 'risk',
  'activity->output': 'risk',
  'output->outcome': 'hypothesis'
} as const;

export type ConnectionTransitionKey = keyof typeof CONNECTION_CONDITION_BY_TRANSITION;
export type ConnectionConditionKind = (typeof CONNECTION_CONDITION_BY_TRANSITION)[ConnectionTransitionKey];

export function getTransitionKey(
  sourceStage: TdmStage,
  targetStage: TdmStage
): ConnectionTransitionKey | null {
  const key = `${sourceStage}->${targetStage}` as ConnectionTransitionKey;
  return key in CONNECTION_CONDITION_BY_TRANSITION ? key : null;
}

export function getAllowedConditionForTransition(
  sourceStage: TdmStage,
  targetStage: TdmStage
): ConnectionConditionKind | null {
  const key = getTransitionKey(sourceStage, targetStage);
  return key ? CONNECTION_CONDITION_BY_TRANSITION[key] : null;
}

export function isConditionAllowed(params: {
  sourceStage: TdmStage;
  targetStage: TdmStage;
  conditionKind: TdmMarkerType;
}): boolean {
  return (
    getAllowedConditionForTransition(params.sourceStage, params.targetStage) === params.conditionKind
  );
}

export function getAllowedMarkerTypesForConnection(
  sourceStage: TdmStage,
  targetStage: TdmStage
): readonly TdmMarkerType[] {
  const allowed = getAllowedConditionForTransition(sourceStage, targetStage);
  return allowed ? [allowed] : [];
}

export function canCreateRisk(sourceStage: TdmStage, targetStage: TdmStage): boolean {
  return getAllowedMarkerTypesForConnection(sourceStage, targetStage).includes('risk');
}

export function canCreateHypothesis(sourceStage: TdmStage, targetStage: TdmStage): boolean {
  return getAllowedMarkerTypesForConnection(sourceStage, targetStage).includes('hypothesis');
}

/** Report invalid legacy markers without mutating stored data. */
export function reportInvalidConnectionCondition(params: {
  edgeId: string;
  sourceStage: TdmStage;
  targetStage: TdmStage;
  conditionKind: TdmMarkerType;
}): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  if (isConditionAllowed(params)) {
    return;
  }

  console.info(
    `[tdm-interpreter] ignored invalid ${params.conditionKind} on ${params.sourceStage}→${params.targetStage} (edge ${params.edgeId})`
  );
}

export function canConnectStages(sourceStage: TdmStage, targetStage: TdmStage): boolean {
  return isAllowedTdmConnection(sourceStage, targetStage);
}

export function getNextAllowedStages(stage: TdmStage): readonly TdmStage[] {
  return ALLOWED_CONNECTIONS[stage];
}

export function getConnectionStartGuideMessage(sourceStage: TdmStage): string {
  return CONNECTION_START_GUIDE[sourceStage];
}

export function getInvalidConnectionMessage(_sourceStage: TdmStage, _targetStage: TdmStage): string {
  return GUIDE_INVALID_CONNECTION;
}

export function getInvalidConnectionGuideMessage(sourceStage: TdmStage, targetStage: TdmStage): string {
  if (isAllowedTdmConnection(sourceStage, targetStage)) {
    return STAGE_MESSAGES.valid;
  }

  return getInvalidConnectionMessage(sourceStage, targetStage);
}

export function getEdgeSelectionGuideMessage(sourceStage: TdmStage, targetStage: TdmStage): string | null {
  if (canCreateRisk(sourceStage, targetStage)) {
    return 'Esta passagem pode ter um Risco.';
  }

  if (canCreateHypothesis(sourceStage, targetStage)) {
    return 'Esta passagem pode ter uma Hipótese.';
  }

  return null;
}

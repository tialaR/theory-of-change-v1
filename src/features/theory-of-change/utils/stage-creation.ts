import { TDM_STAGE_LABELS, TDM_STAGE_ORDER, type TdmStage } from '../domain/tdm-stages';
import type { TdmNode } from '../domain/tdm-types';

export type StageCreation = TdmStage | 'ready-to-connect';

const STAGE_CREATION_COPY: Record<StageCreation, string> = {
  input: 'Liste os recursos que tornam a política possível.',
  activity: 'Descreva o que será feito usando esses recursos.',
  output: 'Registre as entregas concretas geradas pelas atividades.',
  outcome: 'Descreva a mudança esperada depois das entregas.',
  'ready-to-connect': 'Agora conecte os blocos da esquerda para a direita para mostrar como a mudança acontece.'
};

const STAGE_ACTION_LABELS: Record<TdmStage, string> = {
  input: 'Adicionar insumo',
  activity: 'Adicionar atividade',
  output: 'Adicionar produto',
  outcome: 'Adicionar resultado'
};

const STAGE_X_POSITIONS: Record<TdmStage, number> = {
  input: 120,
  activity: 460,
  output: 800,
  outcome: 1140
};

export const STAGE_ROW_GAP = 118;

export function getStageCreationCopy(stageCreation: StageCreation): string {
  return STAGE_CREATION_COPY[stageCreation];
}

export function getStageCreationTitle(stageCreation: StageCreation): string {
  return stageCreation === 'ready-to-connect' ? 'Pronto para conectar' : TDM_STAGE_LABELS[stageCreation];
}

export function getStageCreationActionLabel(stageCreation: StageCreation): string | undefined {
  return stageCreation === 'ready-to-connect' ? undefined : STAGE_ACTION_LABELS[stageCreation];
}

export function getStageCreationAdvanceLabel(): string {
  return 'Avançar para próxima etapa';
}

export function getStageCreationPosition(stage: TdmStage, index: number) {
  return {
    x: STAGE_X_POSITIONS[stage],
    y: 140 + index * STAGE_ROW_GAP
  };
}

export function getStageNodeTitle(stage: TdmStage, index: number) {
  return `${TDM_STAGE_LABELS[stage]} ${index + 1}`;
}

export function getStageCounts(nodes: TdmNode[]) {
  return TDM_STAGE_ORDER.reduce<Record<TdmStage, number>>((accumulator, stage) => {
    accumulator[stage] = nodes.filter((node) => node.stage === stage).length;
    return accumulator;
  }, {
    input: 0,
    activity: 0,
    output: 0,
    outcome: 0
  });
}

export function isReadyToConnect(nodes: TdmNode[]) {
  const counts = getStageCounts(nodes);

  return TDM_STAGE_ORDER.every((stage) => counts[stage] > 0);
}

export function getNextStageCreation(stageCreation: StageCreation): StageCreation {
  if (stageCreation === 'ready-to-connect') {
    return 'ready-to-connect';
  }

  const currentIndex = TDM_STAGE_ORDER.indexOf(stageCreation);
  const nextStage = TDM_STAGE_ORDER[currentIndex + 1];

  return nextStage ?? 'ready-to-connect';
}

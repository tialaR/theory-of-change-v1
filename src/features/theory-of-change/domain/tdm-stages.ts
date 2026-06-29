export const TDM_STAGE_ORDER = ['input', 'activity', 'output', 'outcome'] as const;

export type TdmStage = (typeof TDM_STAGE_ORDER)[number];

export type TdmStageId = TdmStage;

export const TDM_STAGE_LABELS: Record<TdmStage, string> = {
  input: 'Insumos',
  activity: 'Atividades',
  output: 'Produtos',
  outcome: 'Resultados'
};

export const TDM_STAGE_DESCRIPTIONS: Record<TdmStage, string> = {
  input: 'Liste os recursos que tornam a política possível.',
  activity: 'Descreva o que será feito usando esses recursos.',
  output: 'Registre as entregas concretas geradas pelas atividades.',
  outcome: 'Descreva a mudança esperada depois das entregas.'
};

export function getNextTdmStage(stage: TdmStage): TdmStage | undefined {
  const stageIndex = TDM_STAGE_ORDER.indexOf(stage);

  if (stageIndex < 0 || stageIndex === TDM_STAGE_ORDER.length - 1) {
    return undefined;
  }

  return TDM_STAGE_ORDER[stageIndex + 1];
}

export function canAdvanceFromStage(stage: TdmStage): boolean {
  return getNextTdmStage(stage) !== undefined;
}

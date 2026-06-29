import { TdmStage } from '../domain/tdm-stages';

const NEXT_STAGE_MESSAGES: Record<TdmStage, string> = {
  input: 'Depois dos insumos, a camada seguinte é atividades.',
  activity: 'Depois das atividades, a camada seguinte é produtos.',
  output: 'Depois dos produtos, a camada seguinte é resultados.',
  outcome: 'Os resultados fecham a sequência da V1.'
};

export function getNextStageMessage(stage: TdmStage): string {
  return NEXT_STAGE_MESSAGES[stage];
}

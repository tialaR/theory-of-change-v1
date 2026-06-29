import type { StageCreation } from '../../utils/stage-creation';
import type { TdmToastInput } from './tdm-toast-types';

const STAGE_ADVANCE_FLOW_DESCRIPTIONS: Partial<Record<StageCreation, string>> = {
  activity: 'Agora descreva as atividades realizadas com os insumos.',
  output: 'Agora registre as entregas concretas geradas pelas atividades.',
  outcome: 'Agora descreva as mudanças esperadas após as entregas.'
};

export function stageAdvancedFlowTooltipEvent(
  nextStage: StageCreation
): 'advance-stage-activity' | 'advance-stage-output' | 'advance-stage-outcome' | null {
  switch (nextStage) {
    case 'activity':
      return 'advance-stage-activity';
    case 'output':
      return 'advance-stage-output';
    case 'outcome':
      return 'advance-stage-outcome';
    default:
      return null;
  }
}

export function stageAdvancedToast(nextStage: StageCreation): TdmToastInput | null {
  const description = STAGE_ADVANCE_FLOW_DESCRIPTIONS[nextStage];

  if (!description) {
    return null;
  }

  return {
    status: 'success',
    title: 'Etapa atualizada',
    description,
    duration: 4900
  };
}

export function theoryCompleteToast(): TdmToastInput {
  return {
    status: 'success',
    title: 'Teoria pronta',
    description: 'Você já pode visualizar o resultado final da sua teoria da mudança.',
    duration: 6200
  };
}

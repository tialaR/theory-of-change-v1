import { getTdmConnectionMessage, isAllowedTdmConnection } from '../../domain/tdm-connection-rules';
import { TDM_STAGE_LABELS, type TdmStage } from '../../domain/tdm-stages';
import type { StageCreation } from '../../utils/stage-creation';
import { getStageCreationCopy } from '../../utils/stage-creation';
import type { TdmToastInput } from './tdm-toast-types';

export function connectionToast(sourceStage: TdmStage, targetStage: TdmStage): TdmToastInput {
  const description = getTdmConnectionMessage(sourceStage, targetStage);

  if (isAllowedTdmConnection(sourceStage, targetStage)) {
    return {
      status: 'success',
      title: 'Conexão criada',
      description
    };
  }

  return {
    status: 'error',
    title: 'Conexão não permitida',
    description
  };
}

export function stageAdvancedToast(nextStage: StageCreation): TdmToastInput {
  return {
    status: 'success',
    title: 'Etapa atualizada',
    description: getStageCreationCopy(nextStage)
  };
}

export function nodeAddedToast(title: string, stage: TdmStage): TdmToastInput {
  return {
    status: 'success',
    title: 'Bloco adicionado',
    description: `${title} foi adicionado em ${TDM_STAGE_LABELS[stage].toLowerCase()}.`
  };
}

export function nodeSelectionToast(hint: string): TdmToastInput {
  return {
    status: 'info',
    title: 'Dica da etapa',
    description: hint
  };
}

export function validationToast(message: string): TdmToastInput {
  return {
    status: 'warning',
    title: 'Complete os campos',
    description: message
  };
}

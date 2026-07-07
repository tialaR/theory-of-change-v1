import { TDM_STAGE_LABELS, TDM_STAGE_ORDER, type TdmStage } from './tdm-stages';
import type { TdmConnectionKind } from './tdm-types';

export type TheoryGuidePhase =
  | TdmStage
  | 'connect'
  | 'risk'
  | 'hypothesis'
  | 'contextual';

export type TheoryGuideContent = {
  phase: TheoryGuidePhase;
  title: string;
  message: string;
  action: string;
  accentPhase: TheoryGuidePhase;
  flowHighlight: TdmStage | 'connect';
};

export type TheoryGuideProgressInput = {
  stageCounts: Record<TdmStage, number>;
};

export type TheoryGuideContextInput = TheoryGuideProgressInput & {
  selectedConnectionKind?: TdmConnectionKind;
  connectingFromStage?: TdmStage | null;
  transientMessage?: string | null;
};

const PROGRESS_GUIDE: Record<TdmStage | 'connect', Omit<TheoryGuideContent, 'accentPhase' | 'flowHighlight'> & { accentPhase: TheoryGuidePhase; flowHighlight: TdmStage | 'connect' }> = {
  input: {
    phase: 'input',
    accentPhase: 'input',
    flowHighlight: 'input',
    title: 'Comece pelos Insumos',
    message: 'Insumos são recursos, pessoas, dados ou condições que tornam a mudança possível.',
    action: 'Crie pelo menos um Insumo para iniciar sua teoria.'
  },
  activity: {
    phase: 'activity',
    accentPhase: 'activity',
    flowHighlight: 'activity',
    title: 'Agora crie Atividades',
    message: 'Atividades são ações realizadas com os insumos.',
    action: 'Crie ações claras, como formar, acompanhar, aplicar ou monitorar.'
  },
  output: {
    phase: 'output',
    accentPhase: 'output',
    flowHighlight: 'output',
    title: 'Agora defina Produtos',
    message: 'Produtos são entregas observáveis geradas pelas atividades.',
    action: 'Registre o que foi produzido antes de medir mudança.'
  },
  outcome: {
    phase: 'outcome',
    accentPhase: 'outcome',
    flowHighlight: 'outcome',
    title: 'Agora descreva Resultados',
    message: 'Resultados são mudanças esperadas após as entregas.',
    action: 'Descreva mudanças em comportamento, prática, capacidade ou condição.'
  },
  connect: {
    phase: 'connect',
    accentPhase: 'connect',
    flowHighlight: 'connect',
    title: 'Agora conecte a teoria',
    message: 'Mostre como cada etapa leva à próxima.',
    action: 'Conecte Insumos → Atividades → Produtos → Resultados.'
  }
};

const EDGE_SELECTION_GUIDE: Record<TdmConnectionKind, TheoryGuideContent> = {
  'input-activity': {
    phase: 'risk',
    accentPhase: 'risk',
    flowHighlight: 'input',
    title: 'Passagem com possível Risco',
    message: 'Use Risco para registrar algo que pode impedir essa passagem.',
    action: 'Crie um risco somente se ele ajudar a explicar a fragilidade da conexão.'
  },
  'activity-output': {
    phase: 'risk',
    accentPhase: 'risk',
    flowHighlight: 'activity',
    title: 'Passagem com possível Risco',
    message: 'Use Risco para registrar algo que pode atrapalhar a entrega do produto.',
    action: 'Adicione risco se houver uma ameaça real nessa passagem.'
  },
  'output-outcome': {
    phase: 'hypothesis',
    accentPhase: 'hypothesis',
    flowHighlight: 'output',
    title: 'Passagem com possível Hipótese',
    message: 'Hipótese explica por que um produto deve gerar um resultado.',
    action: 'Adicione hipótese para explicitar a lógica dessa mudança.'
  }
};

const CONNECTION_DRAG_GUIDE: Record<TdmStage, Pick<TheoryGuideContent, 'title' | 'message' | 'action'>> = {
  input: {
    title: 'Conectando',
    message: 'Leve este Insumo até uma Atividade.',
    action: ''
  },
  activity: {
    title: 'Conectando',
    message: 'Leve esta Atividade até um Produto.',
    action: ''
  },
  output: {
    title: 'Conectando',
    message: 'Leve este Produto até um Resultado.',
    action: ''
  },
  outcome: {
    title: 'Conectando',
    message: 'Resultados encerram o fluxo. Eles não se conectam para frente.',
    action: ''
  }
};

export const THEORY_GUIDE_INVALID_CONNECTION =
  'Essa conexão não segue a ordem da teoria. Use apenas a próxima etapa à direita.';

export const THEORY_GUIDE_FLOW_STEPS = TDM_STAGE_ORDER.map((stage) => ({
  stage,
  label: TDM_STAGE_LABELS[stage]
}));

export function getTheoryGuideProgressStage({ stageCounts }: TheoryGuideProgressInput): TdmStage | 'connect' {
  if (stageCounts.input === 0) {
    return 'input';
  }

  if (stageCounts.activity === 0) {
    return 'activity';
  }

  if (stageCounts.output === 0) {
    return 'output';
  }

  if (stageCounts.outcome === 0) {
    return 'outcome';
  }

  return 'connect';
}

export function getTheoryGuideProgressContent(input: TheoryGuideProgressInput): TheoryGuideContent {
  const progressStage = getTheoryGuideProgressStage(input);
  return PROGRESS_GUIDE[progressStage];
}

export function getTheoryGuideContent({
  stageCounts,
  selectedConnectionKind,
  connectingFromStage,
  transientMessage
}: TheoryGuideContextInput): TheoryGuideContent {
  if (connectingFromStage) {
    const dragGuide = CONNECTION_DRAG_GUIDE[connectingFromStage];

    return {
      phase: 'contextual',
      accentPhase: 'connect',
      flowHighlight: 'connect',
      title: dragGuide.title,
      message: transientMessage ?? dragGuide.message,
      action: dragGuide.action
    };
  }

  if (transientMessage && !selectedConnectionKind) {
    const progress = getTheoryGuideProgressContent({ stageCounts });

    return {
      ...progress,
      phase: 'contextual',
      message: transientMessage,
      action: ''
    };
  }

  if (selectedConnectionKind) {
    const edgeGuide = EDGE_SELECTION_GUIDE[selectedConnectionKind];

    if (transientMessage) {
      return {
        ...edgeGuide,
        message: transientMessage
      };
    }

    return edgeGuide;
  }

  return getTheoryGuideProgressContent({ stageCounts });
}

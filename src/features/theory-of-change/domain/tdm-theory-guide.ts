import { TDM_STAGE_LABELS, TDM_STAGE_ORDER, type TdmStage } from './tdm-stages';
import type { TdmConnectionKind } from './tdm-types';
import type { StageCreation } from '../utils/stage-creation';

export type TheoryGuidePhase =
  | TdmStage
  | 'theory'
  | 'connect'
  | 'risk'
  | 'hypothesis'
  | 'review'
  | 'visualize'
  | 'contextual';

export type TheoryGuideStageId = TdmStage | 'theory' | 'connect' | 'review' | 'visualize';

export type TheoryGuideExpandedContent = {
  explanation: string;
  complement?: string;
  writingTip?: string;
  avoid?: string;
  examples?: string;
  tips?: string[];
  rule?: string;
  nextPreview: string;
};

export type TheoryGuideContent = {
  phase: TheoryGuidePhase;
  activeStage: TheoryGuideStageId;
  title: string;
  message: string;
  action: string;
  accentPhase: TheoryGuidePhase;
  flowHighlight: TheoryGuideStageId;
  nextStageLabel: string | null;
  expanded: TheoryGuideExpandedContent;
};

export type TheoryGuideProgressInput = {
  stageCounts: Record<TdmStage, number>;
  stageCreation?: StageCreation;
};

export type TheoryGuideContextInput = TheoryGuideProgressInput & {
  selectedConnectionKind?: TdmConnectionKind;
  connectingFromStage?: TdmStage | null;
  transientMessage?: string | null;
  isTheoryComplete?: boolean;
  hasEdgeMarkers?: boolean;
  isViewingResult?: boolean;
};

type StageGuideTemplate = Omit<TheoryGuideContent, 'phase' | 'activeStage' | 'accentPhase' | 'flowHighlight'> & {
  accentPhase: TheoryGuidePhase;
  flowHighlight: TheoryGuideStageId;
};

const THEORY_STAGE_GUIDE: StageGuideTemplate = {
  accentPhase: 'theory',
  flowHighlight: 'theory',
  title: 'Teoria da Mudança',
  message: 'Organize como recursos viram ações, ações geram entregas e entregas produzem mudanças.',
  action: 'Comece criando seus Insumos.',
  nextStageLabel: 'Insumos',
  expanded: {
    explanation:
      'Esta ferramenta ajuda a construir uma Teoria da Mudança seguindo a lógica CLEAR/FGV: Insumos → Atividades → Produtos → Resultados.',
    complement:
      'A ideia é tornar visível a coerência da intervenção, suas relações causais, suas hipóteses e os riscos de implementação.',
    nextPreview: 'Comece criando seus Insumos.'
  }
};

const STAGE_GUIDE: Record<TheoryGuideStageId, StageGuideTemplate> = {
  theory: THEORY_STAGE_GUIDE,
  input: {
    accentPhase: 'input',
    flowHighlight: 'input',
    title: 'Insumos',
    message: 'Liste os recursos que tornam a política possível.',
    action: 'Crie recursos, pessoas, dados, orçamento, materiais ou parcerias.',
    nextStageLabel: 'Atividades',
    expanded: {
      explanation:
        'Insumos são recursos, capacidades e condições de partida. Eles não são ações.',
      writingTip: 'Prefira nomes de recursos, como equipe técnica, financiamento anual ou parceria com municípios.',
      avoid: 'Evite começar com verbos como realizar, oferecer ou acompanhar. Esses verbos pertencem às Atividades.',
      examples: 'equipe técnica, financiamento anual, dados de aprendizagem, parceria com municípios',
      nextPreview: 'Depois, transforme esses recursos em Atividades.'
    }
  },
  activity: {
    accentPhase: 'activity',
    flowHighlight: 'activity',
    title: 'Atividades',
    message: 'Descreva o que a política faz com os insumos.',
    action: 'Crie ações como formar, acompanhar, aplicar ou monitorar.',
    nextStageLabel: 'Produtos',
    expanded: {
      explanation: 'Atividades são ações realizadas com os recursos disponíveis.',
      writingTip: 'Atividades costumam começar com verbos no infinitivo.',
      avoid: 'Não escreva mudanças finais aqui. Atividade é ação, não resultado.',
      examples: 'formar equipes, acompanhar escolas, aplicar diagnósticos, monitorar indicadores',
      nextPreview: 'Depois, registre os Produtos gerados por essas ações.'
    }
  },
  output: {
    accentPhase: 'output',
    flowHighlight: 'output',
    title: 'Produtos',
    message: 'Registre as entregas geradas diretamente pelas atividades.',
    action: 'Crie entregas observáveis, como oficinas, planos, relatórios ou visitas.',
    nextStageLabel: 'Resultados',
    expanded: {
      explanation: 'Produtos são bens, serviços ou entregas observáveis e contáveis.',
      writingTip: 'Prefira entregas concretas, como oficinas realizadas ou planos validados.',
      avoid: 'Não formule Produto como mudança de comportamento. Isso pertence aos Resultados.',
      examples: 'oficinas realizadas, planos validados, relatórios entregues, visitas técnicas',
      nextPreview: 'Depois, descreva os Resultados esperados.'
    }
  },
  outcome: {
    accentPhase: 'outcome',
    flowHighlight: 'outcome',
    title: 'Resultados',
    message: 'Descreva as mudanças esperadas nos públicos-alvo.',
    action: 'Registre mudanças em comportamento, prática, capacidade ou condição.',
    nextStageLabel: 'Conectar',
    expanded: {
      explanation: 'Resultados mostram o que deve melhorar após as entregas.',
      writingTip: 'Use frases como estudantes aumentam, famílias passam a, professores utilizam ou escolas melhoram.',
      avoid: 'Não escreva apenas uma entrega. Resultado precisa mostrar o que muda.',
      examples: 'estudantes aumentam o desempenho, professores utilizam os planos, escolas melhoram o acompanhamento',
      nextPreview: 'Depois, conecte a teoria.'
    }
  },
  connect: {
    accentPhase: 'connect',
    flowHighlight: 'connect',
    title: 'Conectar',
    message: 'Mostre como uma etapa leva à próxima.',
    action: 'Conecte Insumos → Atividades → Produtos → Resultados.',
    nextStageLabel: null,
    expanded: {
      explanation: 'As conexões mostram relações causais entre fases consecutivas.',
      tips: [
        'Insumos conectam com Atividades.',
        'Atividades conectam com Produtos.',
        'Produtos conectam com Resultados.',
        'Conecte sempre da esquerda para a direita.'
      ],
      nextPreview: 'Depois, qualifique passagens com risco ou hipótese, revise e visualize.'
    }
  },
  review: {
    accentPhase: 'review',
    flowHighlight: 'review',
    title: 'Revisar',
    message: 'Revise blocos, conexões, riscos e hipóteses antes de visualizar.',
    action: 'Você pode continuar editando livremente.',
    nextStageLabel: 'Visualizar',
    expanded: {
      explanation:
        'Antes da leitura final, confira se cada etapa está clara, se as conexões fazem sentido e se riscos e hipóteses qualificam as passagens certas.',
      tips: [
        'Riscos qualificam Insumos → Atividades e Atividades → Produtos.',
        'Hipóteses qualificam Produtos → Resultados.',
        'Você pode editar blocos e conexões a qualquer momento.'
      ],
      nextPreview: 'Quando estiver satisfeito, visualize a teoria organizada.'
    }
  },
  visualize: {
    accentPhase: 'visualize',
    flowHighlight: 'visualize',
    title: 'Visualizar',
    message: 'Veja sua teoria organizada em uma leitura final.',
    action: 'A visualização é uma apresentação da teoria, não um ponto sem volta.',
    nextStageLabel: null,
    expanded: {
      explanation:
        'A visualização reúne blocos, conexões, riscos e hipóteses em uma leitura contínua da teoria da mudança.',
      complement: 'Você pode voltar ao canvas para continuar refinando a qualquer momento.',
      nextPreview: 'Use a visualização para apresentar ou revisar a lógica da intervenção.'
    }
  }
};

const RISK_GUIDE: TheoryGuideContent = {
  phase: 'risk',
  activeStage: 'connect',
  accentPhase: 'risk',
  flowHighlight: 'connect',
  title: 'Riscos',
  message: 'Riscos mostram o que pode atrapalhar uma passagem.',
  action: 'Selecione uma conexão permitida para adicionar um risco.',
  nextStageLabel: null,
  expanded: {
    explanation: 'Riscos descrevem o que pode impedir ou dificultar a passagem entre etapas.',
    rule: 'Riscos podem aparecer em Insumos → Atividades e Atividades → Produtos.',
    nextPreview: 'Use hipóteses na passagem entre Produtos e Resultados.'
  }
};

const HYPOTHESIS_GUIDE: TheoryGuideContent = {
  phase: 'hypothesis',
  activeStage: 'connect',
  accentPhase: 'hypothesis',
  flowHighlight: 'connect',
  title: 'Hipóteses',
  message: 'Hipóteses explicam por que uma entrega deve gerar uma mudança.',
  action: 'Selecione uma conexão Produto → Resultado para adicionar uma hipótese.',
  nextStageLabel: null,
  expanded: {
    explanation: 'Hipóteses explicam a lógica causal entre uma entrega e a mudança esperada.',
    rule: 'Hipóteses aparecem apenas em Produtos → Resultados.',
    nextPreview: 'Continue qualificando ou revise a teoria antes de visualizar.'
  }
};

const RISK_EDGE_GUIDE: TheoryGuideContent = {
  ...RISK_GUIDE,
  action: 'Clique em + Risco na seta para registrar.',
  message: 'Você pode qualificar esta conexão com risco, se fizer sentido.'
};

const HYPOTHESIS_EDGE_GUIDE: TheoryGuideContent = {
  ...HYPOTHESIS_GUIDE,
  action: 'Clique em + Hipótese na seta para registrar.',
  message: 'Você pode qualificar esta conexão com hipótese, se fizer sentido.'
};

const THEORY_COMPLETE_GUIDE: TheoryGuideContent = {
  phase: 'connect',
  activeStage: 'connect',
  accentPhase: 'connect',
  flowHighlight: 'connect',
  title: 'Teoria conectada',
  message: 'Sua teoria percorre todas as etapas. Agora você pode qualificar passagens ou visualizar o resultado.',
  action: 'Clique em uma conexão para adicionar Risco ou Hipótese.',
  nextStageLabel: 'Revisar',
  expanded: {
    explanation: 'A jornada Insumos → Atividades → Produtos → Resultados está completa.',
    tips: [
      'Selecione uma conexão para editar ou excluir.',
      'Use risco ou hipótese apenas quando fizer sentido qualificar a passagem.',
      'Riscos: Insumos → Atividades e Atividades → Produtos.',
      'Hipóteses: Produtos → Resultados.'
    ],
    nextPreview: 'Revise a teoria ou visualize o resultado final.'
  }
};

const EDGE_SELECTION_GUIDE: Record<TdmConnectionKind, TheoryGuideContent> = {
  'input-activity': {
    ...RISK_EDGE_GUIDE,
    flowHighlight: 'input'
  },
  'activity-output': {
    ...RISK_EDGE_GUIDE,
    flowHighlight: 'activity'
  },
  'output-outcome': {
    ...HYPOTHESIS_EDGE_GUIDE,
    flowHighlight: 'output'
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

export const THEORY_GUIDE_MAIN_TABS: { id: TheoryGuideStageId; label: string }[] = [
  { id: 'theory', label: 'Teoria' },
  ...TDM_STAGE_ORDER.map((stage) => ({
    id: stage,
    label: TDM_STAGE_LABELS[stage]
  })),
  { id: 'connect', label: 'Conectar' }
];

export const THEORY_GUIDE_TIMELINE_STEPS: { id: TheoryGuideStageId; label: string }[] = [
  ...THEORY_GUIDE_MAIN_TABS
];

export const THEORY_GUIDE_QUALIFIER_STEPS: { id: TheoryGuidePhase; label: string; connection: string }[] = [
  { id: 'risk', label: 'Riscos', connection: 'Insumos → Atividades · Atividades → Produtos' },
  { id: 'hypothesis', label: 'Hipóteses', connection: 'Produtos → Resultados' }
];

export function mapStageCreationToGuideStage(stageCreation: StageCreation): TheoryGuideStageId {
  return stageCreation === 'ready-to-connect' ? 'connect' : stageCreation;
}

export function getTheoryGuideProgressStage({
  stageCounts,
  stageCreation
}: TheoryGuideProgressInput): TheoryGuideStageId {
  const totalCards = TDM_STAGE_ORDER.reduce((sum, stage) => sum + stageCounts[stage], 0);

  if (totalCards === 0) {
    return 'theory';
  }

  if (stageCreation) {
    return mapStageCreationToGuideStage(stageCreation);
  }

  for (const stage of TDM_STAGE_ORDER) {
    if (stageCounts[stage] === 0) {
      return stage;
    }
  }

  return 'connect';
}

function buildStageGuideContent(stage: TheoryGuideStageId): TheoryGuideContent {
  const template = STAGE_GUIDE[stage];

  return {
    phase: stage === 'connect' ? 'connect' : stage === 'theory' ? 'theory' : stage,
    activeStage: stage,
    accentPhase: template.accentPhase,
    flowHighlight: template.flowHighlight,
    title: template.title,
    message: template.message,
    action: template.action,
    nextStageLabel: template.nextStageLabel,
    expanded: template.expanded
  };
}

export function getTheoryGuideStageContent(
  stage: TheoryGuideStageId,
  _stageCounts: Record<TdmStage, number>
): TheoryGuideContent {
  return buildStageGuideContent(stage);
}

export function getTheoryGuideQualifierContent(phase: 'risk' | 'hypothesis'): TheoryGuideContent {
  return phase === 'risk' ? RISK_GUIDE : HYPOTHESIS_GUIDE;
}

export function getTheoryGuideProgressContent(input: TheoryGuideProgressInput): TheoryGuideContent {
  const progressStage = getTheoryGuideProgressStage(input);
  return buildStageGuideContent(progressStage);
}

export function getTheoryGuideContent({
  stageCounts,
  stageCreation,
  selectedConnectionKind,
  connectingFromStage,
  transientMessage,
  isTheoryComplete,
  hasEdgeMarkers,
  isViewingResult
}: TheoryGuideContextInput): TheoryGuideContent {
  if (connectingFromStage) {
    const dragGuide = CONNECTION_DRAG_GUIDE[connectingFromStage];
    const activeStage = stageCreation
      ? mapStageCreationToGuideStage(stageCreation)
      : getTheoryGuideProgressStage({ stageCounts, stageCreation });

    return {
      phase: 'contextual',
      activeStage,
      accentPhase: 'connect',
      flowHighlight: 'connect',
      title: dragGuide.title,
      message: transientMessage ?? dragGuide.message,
      action: dragGuide.action,
      nextStageLabel: null,
      expanded: STAGE_GUIDE.connect.expanded
    };
  }

  if (transientMessage && !selectedConnectionKind) {
    const progress = getTheoryGuideProgressContent({ stageCounts, stageCreation });

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

  if (isViewingResult) {
    return buildStageGuideContent('visualize');
  }

  if (isTheoryComplete && hasEdgeMarkers) {
    return buildStageGuideContent('review');
  }

  if (isTheoryComplete && !selectedConnectionKind && !connectingFromStage) {
    if (transientMessage) {
      return {
        ...THEORY_COMPLETE_GUIDE,
        message: transientMessage
      };
    }

    return THEORY_COMPLETE_GUIDE;
  }

  return getTheoryGuideProgressContent({ stageCounts, stageCreation });
}

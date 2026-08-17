export const LOGICAL_WIDTH = 1440;
export const LOGICAL_HEIGHT = 620;
export const MIN_READABLE_SCALE = 0.7;
export const EDGE_GAP = 16;
export const TICK_MS = 33;

export const BRAND_LOGO_SRC = '/assets/brand/tmd-construtor-guided-story-logo.png';
export const BRAND_MARK_SRC = '/assets/brand/tmd-construtor-guided-story-mark.png';

export type StageKey = 'insumo' | 'atividade' | 'produto' | 'resultado';
export type EdgeSceneKey = 'overview' | 'relations' | 'causality' | 'final';
export type ConnectionTuple = readonly [sourceId: string, targetId: string, group: number];

export type Chapter = {
  duration: number;
  label: string;
  title: string;
  description: string;
  footerTitle: string;
  footerDescription: string;
};

export type OverviewCard = {
  id: string;
  stage: StageKey;
  stageColor: string;
  kicker: string;
  title: string;
  description: string;
  items: string[];
};

export type FlowCard = {
  idSuffix: string;
  stage: StageKey;
  label: string;
  title: string;
  description: string;
};

export type FlowColumn = {
  stage: StageKey;
  stageColor: string;
  kicker: string;
  title: string;
  description: string;
  cards: FlowCard[];
};

export const STAGE_COLORS: Record<StageKey, string> = {
  insumo: 'var(--tdm-guided-story-stage-insumo)',
  atividade: 'var(--tdm-guided-story-stage-atividade)',
  produto: 'var(--tdm-guided-story-stage-produto)',
  resultado: 'var(--tdm-guided-story-stage-resultado)',
};

export const chapters: Chapter[] = [
  {
    duration: 7000,
    label: 'Prévia',
    title: 'Toda mudança precisa de um caminho.',
    description:
      'O TDM Construtor apresenta a lógica antes do detalhe e prepara o usuário para compreender a cadeia inteira.',
    footerTitle: 'Prévia',
    footerDescription:
      'A experiência estabelece a jornada com interação e proporciona a organização de recursos, ações, entregas e mudanças esperadas em uma narrativa causal.',
  },
  {
    duration: 12000,
    label: 'Etapas',
    title: 'Quatro etapas organizam a leitura.',
    description:
      'A visão compacta apresenta todas as funções desde o primeiro frame e destaca uma etapa por vez, sem esconder as demais.',
    footerTitle: 'A visão compacta',
    footerDescription:
      'Insumos sustentam, atividades transformam, produtos materializam e resultados mostram a mudança observada.',
  },
  {
    duration: 13000,
    label: 'Passagens',
    title: 'As conexões também carregam significado.',
    description:
      'As linhas-base permanecem discretas. Uma camada de leitura percorre cada passagem com pausa suficiente para risco e hipótese serem compreendidos.',
    footerTitle: 'Conexões, risco e hipótese',
    footerDescription:
      'Risco qualifica a passagem entre execução e entrega. Hipótese explicita o que precisa ser verdadeiro para produtos gerarem resultados.',
  },
  {
    duration: 9000,
    label: 'Colunas',
    title: 'A síntese abre espaço para o detalhe.',
    description:
      'As quatro colunas já estão presentes. O foco muda gradualmente para mostrar a função de cada agrupamento.',
    footerTitle: 'As colunas entram em cena',
    footerDescription:
      'A leitura muda de escala sem trocar de linguagem visual. O conteúdo continua organizado por função e na mesma direção causal.',
  },
  {
    duration: 16000,
    label: 'Detalhamento',
    title: 'Cada coluna revela elementos da mesma natureza.',
    description:
      'Os cards recebem foco em sequência, com tempo de leitura e sem saltos bruscos, sobreposição ou desaparecimento de contexto.',
    footerTitle: 'Uma coluna por função',
    footerDescription:
      'Cada grupo reúne elementos da mesma natureza. A progressão reduz o custo cognitivo e ajuda o usuário a entender por que cada item está ali.',
  },
  {
    duration: 17000,
    label: 'Encadeamento',
    title: 'Uma teoria coerente pode ser percorrida.',
    description:
      'As relações avançam da esquerda para a direita. Risco e hipótese aparecem no momento certo e permanecem subordinados à leitura dos cards.',
    footerTitle: 'Coerência acima da quantidade',
    footerDescription:
      'Uma teoria se fortalece quando suas relações podem ser explicadas, questionadas e acompanhadas, não quando acumula caixas e setas.',
  },
  {
    duration: Number.POSITIVE_INFINITY,
    label: 'Síntese',
    title: 'Do recurso à mudança esperada.',
    description:
      'O fluxo completo permanece visível e estático. A narrativa termina em repouso, pronta para revisão, explicação ou auditoria.',
    footerTitle: 'O TDM Construtor',
    footerDescription:
      'Proporciona a experiência de tornar visível o caminho que conecta recursos, ações, entregas e mudanças esperadas.',
  },
];

const finiteDurations = chapters.slice(0, -1).map((item) => item.duration);
export const chapterStarts = chapters.map((_, i) =>
  finiteDurations.slice(0, i).reduce((a, b) => a + b, 0),
);
export const FINAL_START = chapterStarts[chapterStarts.length - 1]!;

export const overviewCards: OverviewCard[] = [
  {
    id: 'insumo',
    stage: 'insumo',
    stageColor: STAGE_COLORS.insumo,
    kicker: 'Etapa 01',
    title: 'Insumos',
    description: 'O que sustenta a mudança.',
    items: ['Equipe técnica', 'Orçamento disponível', 'Dados e informação'],
  },
  {
    id: 'atividade',
    stage: 'atividade',
    stageColor: STAGE_COLORS.atividade,
    kicker: 'Etapa 02',
    title: 'Atividades',
    description: 'O trabalho que transforma recursos.',
    items: ['Planejar a intervenção', 'Executar as ações', 'Acompanhar a realização'],
  },
  {
    id: 'produto',
    stage: 'produto',
    stageColor: STAGE_COLORS.produto,
    kicker: 'Etapa 03',
    title: 'Produtos',
    description: 'Entregas verificáveis do processo.',
    items: ['Equipes capacitadas', 'Atendimentos realizados', 'Materiais entregues'],
  },
  {
    id: 'resultado',
    stage: 'resultado',
    stageColor: STAGE_COLORS.resultado,
    kicker: 'Etapa 04',
    title: 'Resultados',
    description: 'A mudança observada no contexto.',
    items: ['Acesso ampliado', 'Uso qualificado', 'Condição melhorada'],
  },
];

export const flowColumns: FlowColumn[] = [
  {
    stage: 'insumo',
    stageColor: STAGE_COLORS.insumo,
    kicker: 'Etapa 01',
    title: 'Insumos',
    description: 'O que sustenta a mudança.',
    cards: [
      {
        idSuffix: 'insumo-1',
        stage: 'insumo',
        label: 'Insumo',
        title: 'Equipe técnica',
        description: 'Pessoas com capacidade para executar.',
      },
      {
        idSuffix: 'insumo-2',
        stage: 'insumo',
        label: 'Insumo',
        title: 'Orçamento disponível',
        description: 'Recursos financeiros para sustentar a ação.',
      },
      {
        idSuffix: 'insumo-3',
        stage: 'insumo',
        label: 'Insumo',
        title: 'Dados e informação',
        description: 'Evidências para orientar decisões.',
      },
    ],
  },
  {
    stage: 'atividade',
    stageColor: STAGE_COLORS.atividade,
    kicker: 'Etapa 02',
    title: 'Atividades',
    description: 'O trabalho que transforma recursos.',
    cards: [
      {
        idSuffix: 'atividade-1',
        stage: 'atividade',
        label: 'Atividade',
        title: 'Planejar a intervenção',
        description: 'Definir prioridades, responsáveis e sequência.',
      },
      {
        idSuffix: 'atividade-2',
        stage: 'atividade',
        label: 'Atividade',
        title: 'Executar as ações',
        description: 'Mobilizar recursos e realizar o trabalho.',
      },
      {
        idSuffix: 'atividade-3',
        stage: 'atividade',
        label: 'Atividade',
        title: 'Acompanhar a realização',
        description: 'Observar se as ações ocorreram como esperado.',
      },
    ],
  },
  {
    stage: 'produto',
    stageColor: STAGE_COLORS.produto,
    kicker: 'Etapa 03',
    title: 'Produtos',
    description: 'Entregas verificáveis do processo.',
    cards: [
      {
        idSuffix: 'produto-1',
        stage: 'produto',
        label: 'Produto',
        title: 'Equipes capacitadas',
        description: 'Profissionais preparados para aplicar a proposta.',
      },
      {
        idSuffix: 'produto-2',
        stage: 'produto',
        label: 'Produto',
        title: 'Atendimentos realizados',
        description: 'Serviços entregues diretamente ao público.',
      },
      {
        idSuffix: 'produto-3',
        stage: 'produto',
        label: 'Produto',
        title: 'Materiais entregues',
        description: 'Recursos concretos disponibilizados.',
      },
    ],
  },
  {
    stage: 'resultado',
    stageColor: STAGE_COLORS.resultado,
    kicker: 'Etapa 04',
    title: 'Resultados',
    description: 'A mudança observada no contexto.',
    cards: [
      {
        idSuffix: 'resultado-1',
        stage: 'resultado',
        label: 'Resultado',
        title: 'Acesso ampliado',
        description: 'Mais pessoas alcançam a solução oferecida.',
      },
      {
        idSuffix: 'resultado-2',
        stage: 'resultado',
        label: 'Resultado',
        title: 'Uso qualificado',
        description: 'As entregas passam a ser utilizadas com qualidade.',
      },
      {
        idSuffix: 'resultado-3',
        stage: 'resultado',
        label: 'Resultado',
        title: 'Condição melhorada',
        description: 'A mudança esperada torna-se observável.',
      },
    ],
  },
];

export const OPENING_BRAND_COPY =
  'Transforme recursos, ações, entregas e resultados em uma narrativa causal coerente.';

export const RELATION_NOTES = {
  relations: {
    risk: 'Mesmo com recursos e planejamento definidos, a execução pode perder ritmo quando a mobilização atrasa ou acontece de forma incompleta.',
    hyp: 'As entregas precisam ser apropriadas e usadas com consistência para que a mudança esperada se torne observável.',
  },
  causality: {
    risk: 'Na passagem entre atividades e produtos, a execução pode não se converter em entregas se houver atraso operacional, baixa adesão ou mobilização incompleta.',
    hyp: 'Na passagem entre produtos e resultados, assume-se que as entregas serão usadas com continuidade e qualidade para gerar a mudança esperada.',
  },
} as const;

function buildRowConnections(prefix: 'causality' | 'final'): ConnectionTuple[] {
  const connections: ConnectionTuple[] = [];
  for (let group = 0; group < 3; group += 1) {
    const from = (['insumo', 'atividade', 'produto'] as const)[group]!;
    const to = (['atividade', 'produto', 'resultado'] as const)[group]!;
    for (let row = 1; row <= 3; row += 1) {
      connections.push([`${prefix}-${from}-${row}`, `${prefix}-${to}-${row}`, group]);
    }
  }
  return connections;
}

export const connectionSets: Record<EdgeSceneKey, ConnectionTuple[]> = {
  overview: [
    ['overview-insumo', 'overview-atividade', 0],
    ['overview-atividade', 'overview-produto', 1],
    ['overview-produto', 'overview-resultado', 2],
  ],
  relations: [
    ['relations-insumo', 'relations-atividade', 0],
    ['relations-atividade', 'relations-produto', 1],
    ['relations-produto', 'relations-resultado', 2],
  ],
  causality: buildRowConnections('causality'),
  final: buildRowConnections('final'),
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function chapterAt(elapsed: number): { index: number; local: number } {
  for (let i = chapters.length - 1; i >= 0; i -= 1) {
    const start = chapterStarts[i]!;
    if (elapsed >= start) return { index: i, local: elapsed - start };
  }
  return { index: 0, local: elapsed };
}

export function chapterProgressFill(elapsed: number, index: number): number {
  if (index === chapters.length - 1) return elapsed >= FINAL_START ? 1 : 0;
  if (elapsed >= chapterStarts[index + 1]!) return 1;
  if (elapsed > chapterStarts[index]!) {
    return (elapsed - chapterStarts[index]!) / chapters[index]!.duration;
  }
  return 0;
}

export type EdgeProgress = {
  progress: number;
  opacity: number;
};

export function edgeTimelineProgress(
  local: number,
  group: number,
  sameGroupIndex: number,
  startsByGroup: readonly number[],
  duration: number,
  stagger = 180,
  keep = false,
): EdgeProgress {
  const start = startsByGroup[group]! + sameGroupIndex * stagger;
  const progress = clamp((local - start) / duration, 0, 1);
  let opacity = 0;
  if (progress > 0 && progress < 1) {
    opacity = progress < 0.12 ? progress / 0.12 : progress > 0.82 ? (1 - progress) / 0.18 : 1;
  } else if (keep && progress >= 1) {
    opacity = 0.72;
  }
  return { progress, opacity };
}

export type FocusFlags = { active: boolean; complete: boolean };

export function overviewFocus(local: number, count: number): FocusFlags[] {
  const current = clamp(Math.floor((local - 900) / 2500), -1, count - 1);
  const flags = Array.from({ length: count }, (_, i) => ({
    active: i === current,
    complete: i < current,
  }));
  if (current >= count - 1 && local > 10300) {
    return flags.map(() => ({ active: false, complete: true }));
  }
  return flags;
}

export function structureColumnFocus(local: number, count: number): FocusFlags[] {
  const current = clamp(Math.floor((local - 700) / 1900), -1, count - 1);
  return Array.from({ length: count }, (_, i) => ({
    active: i === current,
    complete: i < current,
  }));
}

export function detailsFocus(
  local: number,
  cardCount: number,
): { cards: FocusFlags[]; columns: FocusFlags[] } {
  const count = clamp(Math.floor((local - 700) / 1050), -1, cardCount);
  const cards = Array.from({ length: cardCount }, (_, i) => ({
    active: i === count,
    complete: i < count,
  }));
  const activeColumn = count < 0 ? -1 : Math.min(3, Math.floor(Math.max(0, count) / 3));
  const columns = Array.from({ length: 4 }, (_, i) => ({
    active: i === activeColumn,
    complete: i < activeColumn,
  }));
  if (local > 14000) {
    return {
      cards: cards.map(() => ({ active: false, complete: true })),
      columns: columns.map(() => ({ active: false, complete: true })),
    };
  }
  return { cards, columns };
}

export function shouldPlaceRiskBadge(
  sceneKey: EdgeSceneKey,
  group: number,
  index: number,
): boolean {
  return (
    (sceneKey === 'relations' || sceneKey === 'causality' || sceneKey === 'final') &&
    ((group === 1 && index % 3 === 1) || (sceneKey === 'relations' && group === 1))
  );
}

export function shouldPlaceHypBadge(
  sceneKey: EdgeSceneKey,
  group: number,
  index: number,
): boolean {
  return (
    (sceneKey === 'relations' || sceneKey === 'causality' || sceneKey === 'final') &&
    ((group === 2 && index % 3 === 1) || (sceneKey === 'relations' && group === 2))
  );
}

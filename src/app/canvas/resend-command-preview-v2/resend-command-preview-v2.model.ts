export type StageId = 'input' | 'activity' | 'product' | 'outcome';

export type CanvasNode = {
  id: string;
  stage: StageId;
  title: string;
  description: string;
  x: number;
  y: number;
};

export type CanvasEdge = {
  id: string;
  source: string;
  target: string;
};

export type CanvasSnapshot = {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
};

export const STAGES: Array<{
  id: StageId;
  label: string;
  singular: string;
  hint: string;
}> = [
  { id: 'input', label: 'Insumos', singular: 'Insumo', hint: 'Recursos disponíveis' },
  { id: 'activity', label: 'Atividades', singular: 'Atividade', hint: 'Ações realizadas' },
  { id: 'product', label: 'Produtos', singular: 'Produto', hint: 'Entregas concretas' },
  { id: 'outcome', label: 'Resultados', singular: 'Resultado', hint: 'Mudanças esperadas' }
];

export const INITIAL_NODES: CanvasNode[] = [
  {
    id: 'node-input-1',
    stage: 'input',
    title: 'Equipe técnica',
    description: 'Profissionais preparados para conduzir o programa.',
    x: 140,
    y: 260
  },
  {
    id: 'node-activity-1',
    stage: 'activity',
    title: 'Capacitação local',
    description: 'Encontros práticos com lideranças do território.',
    x: 430,
    y: 176
  },
  {
    id: 'node-product-1',
    stage: 'product',
    title: 'Material formativo',
    description: 'Conteúdo aplicado produzido durante os encontros.',
    x: 720,
    y: 292
  },
  {
    id: 'node-outcome-1',
    stage: 'outcome',
    title: 'Adesão ampliada',
    description: 'Mais pessoas participam e concluem a jornada.',
    x: 1010,
    y: 196
  }
];

export const INITIAL_EDGES: CanvasEdge[] = [
  { id: 'edge-1', source: 'node-input-1', target: 'node-activity-1' },
  { id: 'edge-2', source: 'node-activity-1', target: 'node-product-1' },
  { id: 'edge-3', source: 'node-product-1', target: 'node-outcome-1' }
];

const ORDER: Record<StageId, number> = {
  input: 0,
  activity: 1,
  product: 2,
  outcome: 3
};

export function canConnect(source: StageId, target: StageId) {
  return ORDER[target] - ORDER[source] === 1;
}

export function stageMeta(stage: StageId) {
  return STAGES.find((item) => item.id === stage) ?? STAGES[0];
}

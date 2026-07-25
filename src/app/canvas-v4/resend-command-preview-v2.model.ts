export type StageId = 'input' | 'activity' | 'product' | 'outcome';
export type RelationKind = 'risk' | 'hypothesis';

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
  relationKind?: RelationKind;
  relationText?: string;
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

export const INITIAL_NODES: CanvasNode[] = [];
export const INITIAL_EDGES: CanvasEdge[] = [];

const ORDER: Record<StageId, number> = {
  input: 0,
  activity: 1,
  product: 2,
  outcome: 3
};

export function canConnect(source: StageId, target: StageId) {
  return ORDER[target] - ORDER[source] === 1;
}

export function allowedRelation(source: StageId, target: StageId): RelationKind | null {
  if (source === 'input' && target === 'activity') return 'risk';
  if (source === 'activity' && target === 'product') return 'risk';
  if (source === 'product' && target === 'outcome') return 'hypothesis';
  return null;
}

export function stageMeta(stage: StageId) {
  return STAGES.find((item) => item.id === stage) ?? STAGES[0];
}

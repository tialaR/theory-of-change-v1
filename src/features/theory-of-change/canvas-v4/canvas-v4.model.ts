import type { Edge, Node } from '@xyflow/react';

export type StageId = 'input' | 'activity' | 'product' | 'outcome';
export type RelationKind = 'risk' | 'hypothesis';

export type CanvasCardData = {
  stage: StageId;
  title: string;
  description: string;
  details: string;
  isEditing: boolean;
  menuOpen: boolean;
};

export type CanvasEdgeData = {
  relationKind: RelationKind | null;
  relationText: string;
};

export type CanvasCardNode = Node<CanvasCardData, 'canvasCard'>;
export type CanvasRelationEdge = Edge<CanvasEdgeData, 'canvasRelation'>;

export type CanvasDocument = {
  id: string;
  name: string;
  nodes: CanvasCardNode[];
  edges: CanvasRelationEdge[];
  updatedAt: string;
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

const STAGE_ORDER: Record<StageId, number> = {
  input: 0,
  activity: 1,
  product: 2,
  outcome: 3
};

export const EMPTY_DOCUMENT: CanvasDocument = {
  id: 'canvas-v4-local',
  name: 'Minha Teoria da Mudança',
  nodes: [],
  edges: [],
  updatedAt: new Date(0).toISOString()
};

export function stageMeta(stage: StageId) {
  return STAGES.find((item) => item.id === stage) ?? STAGES[0];
}

export function canConnect(source: StageId, target: StageId) {
  return STAGE_ORDER[target] - STAGE_ORDER[source] === 1;
}

export function allowedRelation(source: StageId, target: StageId): RelationKind | null {
  if (source === 'product' && target === 'outcome') return 'hypothesis';
  if (canConnect(source, target)) return 'risk';
  return null;
}

export function connectionMessage(source: StageId, target: StageId) {
  const sourceLabel = stageMeta(source).singular;
  const targetLabel = stageMeta(target).singular;
  return `${sourceLabel} não pode se conectar a ${targetLabel}. Use apenas Insumo → Atividade → Produto → Resultado.`;
}

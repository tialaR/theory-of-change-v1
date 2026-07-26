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
  risk: string;
  hypothesis: string;
};

export type CanvasSnapshot = {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
};

export const STAGES = [
  { id: 'input', label: 'Insumo', hint: 'Recurso disponível' },
  { id: 'activity', label: 'Atividade', hint: 'Ação realizada' },
  { id: 'product', label: 'Produto', hint: 'Entrega concreta' },
  { id: 'outcome', label: 'Resultado', hint: 'Mudança esperada' }
] as const;

const ORDER: Record<StageId, number> = { input: 0, activity: 1, product: 2, outcome: 3 };

export function stageMeta(stage: StageId) {
  return STAGES.find((item) => item.id === stage) ?? STAGES[0];
}

export function canConnect(source: StageId, target: StageId) {
  return ORDER[target] - ORDER[source] === 1;
}

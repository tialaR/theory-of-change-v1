export type StageId = 'input' | 'activity' | 'product' | 'outcome';

export type CanvasNode = {
  id: string;
  stage: StageId;
  title: string;
  description: string;
  details: string;
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

export type Snapshot = {
  id: string;
  label: string;
  createdAt: number;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  theoryName: string;
};

export const STAGES = [
  { id: 'input', label: 'Insumo', hint: 'Recurso necessário para a política acontecer.', question: 'O que precisa estar disponível?' },
  { id: 'activity', label: 'Atividade', hint: 'Ação realizada com os recursos disponíveis.', question: 'O que será feito na prática?' },
  { id: 'product', label: 'Produto', hint: 'Entrega concreta gerada pela atividade.', question: 'O que será entregue imediatamente?' },
  { id: 'outcome', label: 'Resultado', hint: 'Mudança esperada após as entregas.', question: 'Que mudança deve acontecer?' }
] as const;

const ORDER: Record<StageId, number> = { input: 0, activity: 1, product: 2, outcome: 3 };

export function stageMeta(stage: StageId) {
  return STAGES.find((item) => item.id === stage) ?? STAGES[0];
}

export function canConnect(source: StageId, target: StageId) {
  return ORDER[target] - ORDER[source] === 1;
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

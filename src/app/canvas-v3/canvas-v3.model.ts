export type StageId = 'input' | 'activity' | 'product' | 'outcome';
export type ConditionKind = 'risk' | 'hypothesis';

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
  { id: 'input', label: 'Insumo', hint: 'Recurso necessário para a mudança acontecer.', question: 'O que precisa estar disponível?', next: 'Atividade' },
  { id: 'activity', label: 'Atividade', hint: 'Ação realizada com os recursos disponíveis.', question: 'O que será feito na prática?', next: 'Produto' },
  { id: 'product', label: 'Produto', hint: 'Entrega concreta gerada pela atividade.', question: 'O que será entregue imediatamente?', next: 'Resultado' },
  { id: 'outcome', label: 'Resultado', hint: 'Mudança esperada depois das entregas.', question: 'Que mudança deve acontecer?', next: null }
] as const;

const ORDER: Record<StageId, number> = { input: 0, activity: 1, product: 2, outcome: 3 };

export function stageMeta(stage: StageId) {
  return STAGES.find((item) => item.id === stage) ?? STAGES[0];
}

export function canConnect(source: StageId, target: StageId) {
  return ORDER[target] - ORDER[source] === 1;
}

export function connectionMessage(source: StageId, target: StageId) {
  if (source === target) return 'Escolha um card da próxima etapa.';
  if (ORDER[target] < ORDER[source]) return 'A mudança avança da esquerda para a direita.';
  if (ORDER[target] - ORDER[source] > 1) return 'Conecte primeiro à etapa causal seguinte.';
  return 'Conexão válida.';
}

export function conditionFor(source: StageId, target: StageId): ConditionKind | null {
  if (source === 'input' && target === 'activity') return 'risk';
  if (source === 'activity' && target === 'product') return 'risk';
  if (source === 'product' && target === 'outcome') return 'hypothesis';
  return null;
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

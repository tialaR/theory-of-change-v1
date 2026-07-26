import type { CanvasDocument, StageDefinition, TdmStageId } from './canvas-v2.types';

export const CANVAS_DOCUMENT_ID = 'tdm-canvas-v2-local';
export const AUTOSAVE_DELAY_MS = 900;
export const MOCK_NETWORK_DELAY_MS = 520;
export const HISTORY_LIMIT = 40;
export const NODE_TYPE = 'tdm' as const;

export const STAGES: StageDefinition[] = [
  { id: 'input', label: 'Insumos', singular: 'Insumo', description: 'Recursos disponíveis', defaultPosition: { x: 120, y: 180 } },
  { id: 'activity', label: 'Atividades', singular: 'Atividade', description: 'Ações realizadas', defaultPosition: { x: 430, y: 260 } },
  { id: 'product', label: 'Produtos', singular: 'Produto', description: 'Entregas concretas', defaultPosition: { x: 740, y: 170 } },
  { id: 'outcome', label: 'Resultados', singular: 'Resultado', description: 'Mudanças esperadas', defaultPosition: { x: 1050, y: 260 } },
];

export const STAGE_ORDER: Record<TdmStageId, number> = {
  input: 0,
  activity: 1,
  product: 2,
  outcome: 3,
};

export const INITIAL_DOCUMENT: CanvasDocument = {
  id: CANVAS_DOCUMENT_ID,
  name: 'Teoria da Mudança sem título',
  updatedAt: new Date(0).toISOString(),
  nodes: [
    {
      id: 'input-1',
      type: NODE_TYPE,
      position: { x: 120, y: 240 },
      data: { stage: 'input', title: 'Equipe técnica', description: 'Profissionais preparados para conduzir o programa.', details: '' },
    },
    {
      id: 'activity-1',
      type: NODE_TYPE,
      position: { x: 440, y: 170 },
      data: { stage: 'activity', title: 'Capacitação local', description: 'Encontros práticos com lideranças do território.', details: '' },
    },
    {
      id: 'product-1',
      type: NODE_TYPE,
      position: { x: 760, y: 260 },
      data: { stage: 'product', title: 'Material formativo', description: 'Conteúdo aplicado produzido durante os encontros.', details: '' },
    },
    {
      id: 'outcome-1',
      type: NODE_TYPE,
      position: { x: 1080, y: 180 },
      data: { stage: 'outcome', title: 'Adesão ampliada', description: 'Mais pessoas participam e concluem a jornada.', details: '' },
    },
  ],
  edges: [
    { id: 'input-1-activity-1', source: 'input-1', target: 'activity-1', type: 'smoothstep', data: { risk: '', hypothesis: '' } },
    { id: 'activity-1-product-1', source: 'activity-1', target: 'product-1', type: 'smoothstep', data: { risk: '', hypothesis: '' } },
    { id: 'product-1-outcome-1', source: 'product-1', target: 'outcome-1', type: 'smoothstep', data: { risk: '', hypothesis: '' } },
  ],
};

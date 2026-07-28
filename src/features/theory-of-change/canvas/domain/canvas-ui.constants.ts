export const CANVAS_DIMENSIONS = {
  width: 1480,
  height: 820,
  nodeWidth: 238,
  nodeHeight: 126,
  nodeEdgeGap: 24,
  duplicateOffset: 34,
  columnGapY: 172,
  columnStartY: 120,
  historyLimit: 24
} as const;

export const CANVAS_COLUMN_X = {
  input: 120,
  activity: 430,
  product: 740,
  outcome: 1050
} as const;

export const CANVAS_DRAG_STAGE_MIME = 'application/x-tdm-stage';

export const CANVAS_FIELD_PLACEHOLDERS = {
  projectTitle: 'ex: Programa de desenvolvimento territorial',
  stage: {
    input: {
      title: 'ex: Equipe técnica disponível',
      description: 'ex: Profissionais, orçamento e estrutura necessários',
      advancedDetails: 'ex: Fontes, evidências ou observações sobre os recursos'
    },
    activity: {
      title: 'ex: Realizar oficinas de formação',
      description: 'ex: Encontros práticos com as pessoas participantes',
      advancedDetails: 'ex: Metodologia, responsáveis ou frequência das ações'
    },
    product: {
      title: 'ex: Material formativo produzido',
      description: 'ex: Entrega concreta gerada pelas atividades',
      advancedDetails: 'ex: Critérios de qualidade, quantidade ou prazo de entrega'
    },
    outcome: {
      title: 'ex: Maior adesão ao programa',
      description: 'ex: Mudança esperada após a entrega dos produtos',
      advancedDetails: 'ex: Indicadores, evidências ou prazo esperado para a mudança'
    }
  },
  relation: {
    risk: 'ex: Baixa participação pode reduzir o alcance da atividade',
    hypothesis: 'ex: O material será utilizado pelo público como planejado'
  }
} as const;

export const CANVAS_TOOLTIP_LABELS = {
  undo: 'Desfazer última alteração',
  redo: 'Refazer alteração',
  history: 'Abrir histórico',
  save: 'Salvar teoria',
  select: 'Selecionar blocos',
  zoomIn: 'Aproximar visualização',
  zoomOut: 'Afastar visualização',
  fit: 'Centralizar visualização',
  more: 'Abrir ações do card',
  closeToolbar: 'Fechar toolbar',
  edit: 'Editar card',
  duplicate: 'Duplicar card',
  delete: 'Excluir card',
  closeInspector: 'Fechar inspector',
  source: 'Definir como origem da conexão',
  target: 'Definir como destino da conexão',
  closeRelation: 'Fechar ações da conexão',
  deleteConnection: 'Excluir conexão',
  addRisk: 'Adicionar risco',
  editRisk: 'Editar risco',
  removeRisk: 'Excluir risco',
  addHypothesis: 'Adicionar hipótese',
  editHypothesis: 'Editar hipótese',
  removeHypothesis: 'Excluir hipótese',
  back: 'Voltar para o início',
  result: 'Visualizar resultado',
  columns: 'Centralizar em colunas',
  frame: 'Enquadrar visualização',
  guide: 'Visualizar guia da teoria',
  examples: 'Visualizar exemplos',
  flow: 'Organizar fluxo',
  fullCanvas: 'Expandir canvas em tela cheia',
  closeFullCanvas: 'Fechar tela cheia',
  openInspector: 'Abrir inspector',
  openCreator: 'Arrastar etapas para o canvas',
  closeCreator: 'Fechar painel de etapas'
} as const;

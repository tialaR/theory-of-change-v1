'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from 'react';
import { TdmIconButton } from '../../shared/ui/tdm-icon-button/tdm-icon-button';
import styles from './canvas-workspace.module.sass';
import { canvasIcons as icons } from './canvas-workspace.icons';
import {
  INITIAL_EDGES,
  INITIAL_NODES,
  STAGES,
  allowedRelation,
  canConnect,
  stageMeta,
  type CanvasEdge,
  type CanvasNode,
  type CanvasSnapshot,
  type RelationKind,
  type StageId
} from './canvas-workspace.model';
import { useCanvasFlowState } from './use-canvas-flow-state';
import { useCanvasProjectPersistence } from './use-canvas-project-persistence';
import { useRouter } from 'next/navigation';

const NODE_WIDTH = 238;
const NODE_HEIGHT = 126;
const CANVAS_WIDTH = 1480;
const CANVAS_HEIGHT = 820;
const NODE_EDGE_GAP = 24;
const NODE_DROP_OFFSET_X = NODE_WIDTH / 2;
const NODE_DROP_OFFSET_Y = 40;
const DUPLICATE_OFFSET = 34;
const HISTORY_LIMIT = 24;
const DRAG_STAGE_MIME = 'application/x-tdm-stage';
const EDGE_POPOVER_GAP = 14;
const EDGE_TOOLBAR_WIDTH = 176;
const EDGE_TOOLBAR_HEIGHT = 44;
const EDGE_FORM_WIDTH = 224;
const EDGE_FORM_HEIGHT = 196;
const COLUMN_X: Record<StageId, number> = { input: 120, activity: 430, product: 740, outcome: 1050 };
const COLUMN_GAP_Y = 172;
const COLUMN_START_Y = 120;


const FIELD_PLACEHOLDERS = {
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

const TOOLTIP_LABELS = {
  undo: 'Desfazer última alteração', redo: 'Refazer alteração', history: 'Abrir histórico', save: 'Salvar teoria',
  select: 'Selecionar blocos', zoomIn: 'Aproximar visualização', zoomOut: 'Afastar visualização', fit: 'Centralizar visualização',
  more: 'Abrir ações do card', closeToolbar: 'Fechar toolbar', edit: 'Editar card', duplicate: 'Duplicar card',
  delete: 'Excluir card', closeInspector: 'Fechar inspector', source: 'Definir como origem da conexão',
  target: 'Definir como destino da conexão', closeRelation: 'Fechar ações da conexão', deleteConnection: 'Excluir conexão',
  addRisk: 'Adicionar risco', editRisk: 'Editar risco', removeRisk: 'Excluir risco',
  addHypothesis: 'Adicionar hipótese', editHypothesis: 'Editar hipótese', removeHypothesis: 'Excluir hipótese',
  back: 'Voltar para o início', result: 'Visualizar resultado', columns: 'Centralizar em colunas',
  frame: 'Enquadrar visualização', guide: 'Visualizar guia da teoria', examples: 'Visualizar exemplos', flow: 'Organizar fluxo',
  fullCanvas: 'Expandir canvas em tela cheia', closeFullCanvas: 'Fechar tela cheia', openInspector: 'Abrir inspector',
  openCreator: 'Arrastar etapas para o canvas', closeCreator: 'Fechar painel de etapas'
} as const;


type ClearableFieldSize = 'sm' | 'md';

type ClearableFieldProps = {
  value: string;
  onClear: () => void;
  children: ReactNode;
  label: string;
  multiline?: boolean;
  size?: ClearableFieldSize;
  showEditWhenIdle?: boolean;
};

function ClearableField({
  value,
  onClear,
  children,
  label,
  multiline = false,
  size = 'md',
  showEditWhenIdle = false
}: ClearableFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [hasFieldFocus, setHasFieldFocus] = useState(false);
  const classNames = [
    styles.clearableField,
    multiline ? styles.clearableFieldMultiline : '',
    size === 'sm' ? styles.clearableFieldSmall : '',
    showEditWhenIdle ? styles.clearableFieldEditable : ''
  ].filter(Boolean).join(' ');

  function focusField() {
    const field = fieldRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
    field?.focus();
  }

  function handleClear(event: ReactMouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onClear();
    requestAnimationFrame(focusField);
  }

  function handleEdit(event: ReactMouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    focusField();
  }

  function stopPointerPropagation(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleBlurCapture() {
    requestAnimationFrame(() => {
      setHasFieldFocus(Boolean(fieldRef.current?.contains(document.activeElement)));
    });
  }

  const shouldShowClear = hasFieldFocus && value.length > 0;
  const shouldShowEdit = showEditWhenIdle && !hasFieldFocus;

  return (
    <div
      ref={fieldRef}
      className={classNames}
      data-field-focus={hasFieldFocus}
      onFocusCapture={() => setHasFieldFocus(true)}
      onBlurCapture={handleBlurCapture}
    >
      {children}
      {shouldShowClear && (
        <button
          type="button"
          className={styles.clearFieldButton}
          aria-label={label}
          data-tooltip={label}
          onPointerDown={stopPointerPropagation}
          onClick={handleClear}
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
      {shouldShowEdit && (
        <button
          type="button"
          className={`${styles.clearFieldButton} ${styles.editFieldButton}`}
          aria-label="Editar título da teoria"
          data-tooltip="Editar título da teoria"
          onPointerDown={stopPointerPropagation}
          onClick={handleEdit}
        >
          <span aria-hidden="true">{icons.edit}</span>
        </button>
      )}
    </div>
  );
}

type DragState = { id: string; offsetX: number; offsetY: number };
type ConnectionDragState = { sourceId: string; x: number; y: number; pointerId: number };
type NodeDraft = Pick<CanvasNode, 'title' | 'description' | 'advancedDetails'>;
type RelationDraft = { title: string; description: string; advancedDetails: string };
type RelationPanelMode = 'menu' | 'form';
type NodeMetric = { left: number; right: number; centerY: number };

function createNodeDraft(node: CanvasNode): NodeDraft {
  return { title: node.title, description: node.description, advancedDetails: node.advancedDetails };
}

function createRelationDraft(edge: CanvasEdge, kind: RelationKind): RelationDraft {
  return {
    title: edge.relationTitle ?? (kind === 'risk' ? 'Risco da conexão' : 'Hipótese da conexão'),
    description: edge.relationText ?? '',
    advancedDetails: edge.relationAdvancedDetails ?? ''
  };
}

function isStageId(value: string): value is StageId {
  return STAGES.some((stage) => stage.id === value);
}

export function CanvasWorkspace() {
  const { nodes, edges, setNodes, setEdges } = useCanvasFlowState(INITIAL_NODES, INITIAL_EDGES);
  const [history, setHistory] = useState<CanvasSnapshot[]>([]);
  const [future, setFuture] = useState<CanvasSnapshot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [connectionSourceId, setConnectionSourceId] = useState<string | null>(null);
  const [connectionDrag, setConnectionDrag] = useState<ConnectionDragState | null>(null);
  const [activeToolbarId, setActiveToolbarId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<NodeDraft | null>(null);
  const [relationPanelMode, setRelationPanelMode] = useState<RelationPanelMode>('menu');
  const [relationPopoverOpen, setRelationPopoverOpen] = useState(false);
  const [relationDraft, setRelationDraft] = useState<RelationDraft | null>(null);
  const [cardAdvancedOpenId, setCardAdvancedOpenId] = useState<string | null>(null);
  const [inspectorAdvancedOpenKey, setInspectorAdvancedOpenKey] = useState<string | null>(null);
  const [notice, setNotice] = useState('Canvas vazio. Arraste qualquer etapa para começar.');
  const [noticeTone, setNoticeTone] = useState<'info' | 'warning'>('info');
  const [saveState, setSaveState] = useState<'saved' | 'dirty' | 'saving'>('saved');
  const [projectTitle, setProjectTitle] = useState('Minha teoria da mudança');
  const router = useRouter();
  const { saveProject, saveAndOpenResult } = useCanvasProjectPersistence({
    title: projectTitle,
    nodes,
    edges
  });
  const [fullCanvasMode, setFullCanvasMode] = useState(false);
  const [nodeMetrics, setNodeMetrics] = useState<Record<string, NodeMetric>>({});
  const dragRef = useRef<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const idCounterRef = useRef(10);

  const selectedNode = nodes.find((node) => node.id === selectedId) ?? null;
  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId) ?? null;
  const selectedEdgeSource = selectedEdge ? nodes.find((node) => node.id === selectedEdge.source) ?? null : null;
  const selectedEdgeTarget = selectedEdge ? nodes.find((node) => node.id === selectedEdge.target) ?? null : null;
  const selectedRelationKind = selectedEdgeSource && selectedEdgeTarget
    ? allowedRelation(selectedEdgeSource.stage, selectedEdgeTarget.stage)
    : null;

  useEffect(() => {
    setInspectorAdvancedOpenKey(null);
  }, [selectedId, selectedEdgeId]);

  useEffect(() => {
    if (!relationPopoverOpen || !selectedEdgeId) return undefined;
    function closeRelationToolbarOnOutsidePointer(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const popover = target.closest('[data-edge-popover]');
      const edgeAction = target.closest(`[data-edge-action-id="${selectedEdgeId}"]`);
      if (!popover && !edgeAction) setRelationPopoverOpen(false);
    }
    document.addEventListener('pointerdown', closeRelationToolbarOnOutsidePointer, true);
    return () => document.removeEventListener('pointerdown', closeRelationToolbarOnOutsidePointer, true);
  }, [relationPopoverOpen, selectedEdgeId]);

  useEffect(() => {
    if (!activeToolbarId) return undefined;
    function closeToolbarOnOutsidePointer(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const card = target.closest(`[data-node-card-id="${activeToolbarId}"]`);
      const toolbar = target.closest(`[data-node-toolbar-id="${activeToolbarId}"]`);
      if (!card && !toolbar) setActiveToolbarId(null);
    }
    document.addEventListener('pointerdown', closeToolbarOnOutsidePointer, true);
    return () => document.removeEventListener('pointerdown', closeToolbarOnOutsidePointer, true);
  }, [activeToolbarId]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const canvasElement = canvas;
    let animationFrame = 0;
    function measureNodes() {
      const canvasRect = canvasElement.getBoundingClientRect();
      const next: Record<string, NodeMetric> = {};
      canvasElement.querySelectorAll<HTMLElement>('[data-canvas-node]').forEach((element) => {
        const nodeId = element.dataset.nodeCardId;
        if (!nodeId) return;
        const rect = element.getBoundingClientRect();
        next[nodeId] = {
          left: rect.left - canvasRect.left,
          right: rect.right - canvasRect.left,
          centerY: rect.top - canvasRect.top + rect.height / 2
        };
      });
      setNodeMetrics(next);
    }
    animationFrame = window.requestAnimationFrame(measureNodes);
    window.addEventListener('resize', measureNodes);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', measureNodes);
    };
  }, [nodes, editingNodeId, cardAdvancedOpenId]);

  const counts = useMemo(() => STAGES.reduce<Record<StageId, number>>((result, stage) => {
    result[stage.id] = nodes.filter((node) => node.stage === stage.id).length;
    return result;
  }, { input: 0, activity: 0, product: 0, outcome: 0 }), [nodes]);

  function capture() {
    setHistory((items) => [...items, { nodes, edges }].slice(-HISTORY_LIMIT));
    setFuture([]);
    setSaveState('dirty');
  }

  function clearSelection() {
    setSelectedId(null);
    setSelectedEdgeId(null);
    setRelationDraft(null);
    setRelationPanelMode('menu');
    setRelationPopoverOpen(false);
  }

  function createNode(stage: StageId, x: number, y: number) {
    const meta = stageMeta(stage);
    const count = counts[stage] + 1;
    idCounterRef.current += 1;
    const next: CanvasNode = {
      id: `node-${stage}-${idCounterRef.current}`, stage, title: `${meta.singular} ${count}`,
      description: meta.hint, advancedDetails: '', x, y
    };
    capture();
    setNodes((items) => [...items, next]);
    setSelectedId(next.id);
    setSelectedEdgeId(null);
    setInspectorOpen(true);
    setCreatorOpen(false);
    setNotice(`${meta.singular} adicionado. Você pode posicioná-lo livremente.`);
  }

  function startStageDrag(event: ReactDragEvent<HTMLButtonElement>, stage: StageId) {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData(DRAG_STAGE_MIME, stage);
    setNotice(`Arraste ${stageMeta(stage).singular.toLowerCase()} para a posição desejada no canvas.`);
  }

  function allowStageDrop(event: ReactDragEvent<HTMLDivElement>) {
    if (!event.dataTransfer.types.includes(DRAG_STAGE_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }

  function dropStage(event: ReactDragEvent<HTMLDivElement>) {
    const stageValue = event.dataTransfer.getData(DRAG_STAGE_MIME);
    if (!isStageId(stageValue)) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const maxX = CANVAS_WIDTH - NODE_WIDTH - NODE_EDGE_GAP;
    const maxY = CANVAS_HEIGHT - NODE_HEIGHT - NODE_EDGE_GAP;
    createNode(
      stageValue,
      Math.max(NODE_EDGE_GAP, Math.min(maxX, event.clientX - rect.left - NODE_DROP_OFFSET_X)),
      Math.max(NODE_EDGE_GAP, Math.min(maxY, event.clientY - rect.top - NODE_DROP_OFFSET_Y))
    );
  }

  function updateSelected(field: keyof NodeDraft, value: string) {
    if (!selectedId) return;
    setNodes((items) => items.map((node) => node.id === selectedId ? { ...node, [field]: value } : node));
    setSaveState('dirty');
  }

  function duplicateNode(nodeId: string) {
    const source = nodes.find((node) => node.id === nodeId);
    if (!source) return;
    idCounterRef.current += 1;
    const duplicate: CanvasNode = {
      ...source, id: `node-${source.stage}-${idCounterRef.current}`, title: `${source.title} cópia`,
      x: Math.min(CANVAS_WIDTH - NODE_WIDTH - NODE_EDGE_GAP, source.x + DUPLICATE_OFFSET),
      y: Math.min(CANVAS_HEIGHT - NODE_HEIGHT - NODE_EDGE_GAP, source.y + DUPLICATE_OFFSET)
    };
    capture();
    setNodes((items) => [...items, duplicate]);
    setSelectedId(duplicate.id);
    setSelectedEdgeId(null);
    setActiveToolbarId(duplicate.id);
    setNotice('Card duplicado sem alterar o original.');
  }

  function deleteNode(nodeId: string) {
    const node = nodes.find((item) => item.id === nodeId);
    if (!node) return;
    capture();
    setNodes((items) => items.filter((item) => item.id !== nodeId));
    setEdges((items) => items.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    clearSelection();
    setActiveToolbarId(null);
    setEditingNodeId(null);
    setEditDraft(null);
    setNotice(`${stageMeta(node.stage).singular} excluído.`);
  }

  function openCardEditor(node: CanvasNode) {
    setSelectedId(node.id);
    setSelectedEdgeId(null);
    setEditingNodeId(node.id);
    setEditDraft(createNodeDraft(node));
    setActiveToolbarId(node.id);
    setInspectorOpen(true);
    setCardAdvancedOpenId(null);
  }

  function saveCardEditor(nodeId: string) {
    if (!editDraft) return;
    capture();
    setNodes((items) => items.map((node) => node.id === nodeId ? { ...node, ...editDraft } : node));
    setEditingNodeId(null);
    setEditDraft(null);
    setCardAdvancedOpenId(null);
    setNotice('Card atualizado no próprio canvas.');
  }

  function startDrag(event: ReactPointerEvent<HTMLElement>, node: CanvasNode) {
    const target = event.target as HTMLElement;
    if (target.closest('button, input, textarea, summary, details')) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    dragRef.current = { id: node.id, offsetX: event.clientX - rect.left - node.x, offsetY: event.clientY - rect.top - node.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(node.id);
  }

  function moveDrag(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const maxX = CANVAS_WIDTH - NODE_WIDTH - NODE_EDGE_GAP;
    const maxY = CANVAS_HEIGHT - NODE_HEIGHT - NODE_EDGE_GAP;
    const x = Math.max(NODE_EDGE_GAP, Math.min(maxX, event.clientX - rect.left - drag.offsetX));
    const y = Math.max(72, Math.min(maxY, event.clientY - rect.top - drag.offsetY));
    setNodes((items) => items.map((node) => node.id === drag.id ? { ...node, x, y } : node));
    setSaveState('dirty');
  }

  function getCanvasPoint(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function beginConnectionDrag(event: ReactPointerEvent<HTMLButtonElement>, sourceId: string) {
    const point = getCanvasPoint(event.clientX, event.clientY);
    if (!point) return;
    event.stopPropagation();
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setConnectionSourceId(sourceId);
    setConnectionDrag({ sourceId, x: point.x, y: point.y, pointerId: event.pointerId });
    clearSelection();
    setNoticeTone('info');
    setNotice('Conexão iniciada. Arraste até um dot da etapa causal seguinte.');
  }

  function moveConnectionDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!connectionDrag) return;
    const point = getCanvasPoint(event.clientX, event.clientY);
    if (!point) return;
    setConnectionDrag((current) => current ? { ...current, x: point.x, y: point.y } : current);
  }

  function finishConnectionDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!connectionDrag) return;
    const targetElement = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-connection-target]');
    const targetId = targetElement?.dataset.connectionTarget ?? null;
    setConnectionDrag(null);
    if (!targetId) {
      setConnectionSourceId(null);
      setNoticeTone('warning');
      setNotice('Conexão não concluída. Solte a linha em um dot de um card compatível à direita.');
      return;
    }
    completeManualConnection(targetId);
  }

  function completeManualConnection(targetId: string) {
    const sourceId = connectionSourceId;
    if (!sourceId) {
      setNoticeTone('warning');
      setNotice('Escolha primeiro um dot de origem.');
      return;
    }
    if (sourceId === targetId) {
      setConnectionSourceId(null);
      setNoticeTone('warning');
      setNotice('Escolha outro card como destino da conexão.');
      return;
    }
    const source = nodes.find((node) => node.id === sourceId);
    const target = nodes.find((node) => node.id === targetId);
    if (!source || !target) return;
    if (!canConnect(source.stage, target.stage)) {
      setConnectionSourceId(null);
      setNoticeTone('warning');
      if (source.stage === target.stage) {
        setNotice(`Escolha uma etapa diferente. ${stageMeta(source.stage).label} não se conectam entre si.`);
        return;
      }
      if (source.stage === 'outcome') {
        setNotice('Resultados encerram esta cadeia causal. Para continuar, inicie a conexão em uma etapa anterior.');
        return;
      }
      const nextStage = source.stage === 'input' ? 'activity' : source.stage === 'activity' ? 'product' : 'outcome';
      setNotice(`${stageMeta(source.stage).label} se conectam a ${stageMeta(nextStage).label}. Escolha um card dessa próxima etapa para continuar.`);
      return;
    }
    if (edges.some((edge) => edge.source === source.id && edge.target === target.id)) {
      setConnectionSourceId(null);
      setNoticeTone('warning');
      setNotice('Essa conexão já existe no canvas.');
      return;
    }
    capture();
    idCounterRef.current += 1;
    setEdges((items) => [...items, { id: `edge-${idCounterRef.current}`, source: source.id, target: target.id }]);
    setConnectionSourceId(null);
    setNoticeTone('info');
    setNotice('Conexão criada. Clique na seta para qualificar ou excluir.');
  }

  function selectConnection(edge: CanvasEdge) {
    const source = nodes.find((node) => node.id === edge.source);
    const target = nodes.find((node) => node.id === edge.target);
    if (!source || !target) return;
    const kind = allowedRelation(source.stage, target.stage);
    if (!kind) return;
    setSelectedId(null);
    setSelectedEdgeId(edge.id);
    setRelationDraft(createRelationDraft(edge, kind));
    setRelationPanelMode('menu');
    setRelationPopoverOpen(true);
    setInspectorOpen(true);
    setNotice('Conexão selecionada. As ações disponíveis respeitam a regra causal.');
  }

  function openRelationForm() {
    if (!selectedEdge || !selectedRelationKind) return;
    setRelationDraft(createRelationDraft(selectedEdge, selectedRelationKind));
    setRelationPanelMode('form');
  }

  function updateRelationDraft(field: keyof RelationDraft, value: string) {
    setRelationDraft((current) => current ? { ...current, [field]: value } : current);
  }

  function saveRelation() {
    if (!selectedEdge || !selectedRelationKind || !relationDraft) return;
    if (!relationDraft.description.trim()) {
      setNotice(selectedRelationKind === 'risk' ? 'Descreva o risco antes de salvar.' : 'Descreva a hipótese antes de salvar.');
      return;
    }
    capture();
    setEdges((items) => items.map((edge) => edge.id === selectedEdge.id ? {
      ...edge,
      relationKind: selectedRelationKind,
      relationTitle: relationDraft.title.trim(),
      relationText: relationDraft.description.trim(),
      relationAdvancedDetails: relationDraft.advancedDetails.trim()
    } : edge));
    setRelationPanelMode('menu');
    setNotice(selectedRelationKind === 'risk' ? 'Risco salvo na conexão.' : 'Hipótese salva na conexão.');
  }

  function removeRelationMarker() {
    if (!selectedEdge || !selectedEdge.relationKind) return;
    capture();
    setEdges((items) => items.map((edge) => edge.id === selectedEdge.id ? {
      ...edge,
      relationKind: undefined,
      relationTitle: undefined,
      relationText: undefined,
      relationAdvancedDetails: undefined
    } : edge));
    setRelationDraft(selectedRelationKind ? createRelationDraft({ ...selectedEdge, relationKind: undefined, relationTitle: undefined, relationText: undefined, relationAdvancedDetails: undefined }, selectedRelationKind) : null);
    setRelationPanelMode('menu');
    setNotice('Marcador removido. A conexão causal foi preservada.');
  }

  function deleteConnection() {
    if (!selectedEdge) return;
    capture();
    setEdges((items) => items.filter((edge) => edge.id !== selectedEdge.id));
    clearSelection();
    setNotice('Conexão excluída sem alterar os blocos.');
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setFuture((items) => [{ nodes, edges }, ...items]);
    setHistory((items) => items.slice(0, -1));
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setNotice('Última alteração desfeita.');
    setSaveState('dirty');
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setHistory((items) => [...items, { nodes, edges }]);
    setFuture((items) => items.slice(1));
    setNodes(next.nodes);
    setEdges(next.edges);
    setNotice('Alteração refeita.');
    setSaveState('dirty');
  }

  async function save() {
    setSaveState('saving');
    setNoticeTone('info');
    setNotice('Salvando teoria…');
    try {
      await saveProject();
      setSaveState('saved');
      setNotice('Tudo salvo.');
    } catch {
      setSaveState('dirty');
      setNoticeTone('warning');
      setNotice('Não foi possível salvar agora. Tente novamente.');
    }
  }

  function nodeAnchor(node: CanvasNode, side: 'left' | 'right') {
    const metric = nodeMetrics[node.id];
    if (metric) return { x: side === 'left' ? metric.left : metric.right, y: metric.centerY };
    return { x: side === 'left' ? node.x : node.x + NODE_WIDTH, y: node.y + NODE_HEIGHT / 2 };
  }

  function relationOverlayPosition(midX: number, midY: number) {
    const isForm = relationPanelMode === 'form';
    const width = isForm ? EDGE_FORM_WIDTH : EDGE_TOOLBAR_WIDTH;
    const height = isForm ? EDGE_FORM_HEIGHT : EDGE_TOOLBAR_HEIGHT;
    const unclampedLeft = midX - width / 2;
    const left = Math.max(EDGE_POPOVER_GAP, Math.min(CANVAS_WIDTH - width - EDGE_POPOVER_GAP, unclampedLeft));
    const preferredTop = midY - height - EDGE_POPOVER_GAP;
    const top = preferredTop >= EDGE_POPOVER_GAP
      ? preferredTop
      : Math.min(CANVAS_HEIGHT - height - EDGE_POPOVER_GAP, midY + EDGE_POPOVER_GAP);
    return { left, top };
  }

  function updateNodeLayout(nextNodes: CanvasNode[], message: string) {
    capture();
    setNodes(nextNodes);
    setNoticeTone('info');
    setNotice(message);
  }

  function centralizeColumns() {
    const nextNodes = nodes.map((node) => {
      const stageNodes = nodes
        .filter((candidate) => candidate.stage === node.stage)
        .sort((first, second) => first.y - second.y || first.id.localeCompare(second.id));
      const index = stageNodes.findIndex((candidate) => candidate.id === node.id);
      return { ...node, x: COLUMN_X[node.stage], y: COLUMN_START_Y + Math.max(index, 0) * COLUMN_GAP_Y };
    });
    updateNodeLayout(nextNodes, 'As etapas foram centralizadas em colunas.');
  }

  function organizeFlow() {
    const connectionCount = (nodeId: string) => edges.filter((edge) => edge.source === nodeId || edge.target === nodeId).length;
    const nextNodes = nodes.map((node) => {
      const stageNodes = nodes
        .filter((candidate) => candidate.stage === node.stage)
        .sort((first, second) => connectionCount(second.id) - connectionCount(first.id) || first.y - second.y);
      const index = stageNodes.findIndex((candidate) => candidate.id === node.id);
      return { ...node, x: COLUMN_X[node.stage], y: COLUMN_START_Y + Math.max(index, 0) * COLUMN_GAP_Y };
    });
    updateNodeLayout(nextNodes, 'O fluxo foi organizado para facilitar a leitura das conexões.');
  }

  function frameVisualization() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (!nodes.length) {
      viewport.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
      setNotice('A visualização foi centralizada.');
      return;
    }
    const minX = Math.min(...nodes.map((node) => node.x));
    const minY = Math.min(...nodes.map((node) => node.y));
    const maxX = Math.max(...nodes.map((node) => node.x + NODE_WIDTH));
    const maxY = Math.max(...nodes.map((node) => node.y + NODE_HEIGHT));
    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;
    viewport.scrollTo({
      left: Math.max(0, contentCenterX - viewport.clientWidth / 2),
      top: Math.max(0, contentCenterY - viewport.clientHeight / 2),
      behavior: 'smooth'
    });
    setNotice('A teoria foi enquadrada na área de trabalho.');
  }

  function openGuide() {
    router.push('/guia-de-aprendizado');
  }

  function openExamples() {
    router.push('/exemplos');
  }

  async function openResult() {
    setSaveState('saving');
    setNoticeTone('info');
    setNotice('Preparando resultado…');
    try {
      await saveAndOpenResult();
      setSaveState('saved');
    } catch {
      setSaveState('dirty');
      setNoticeTone('warning');
      setNotice('Não foi possível abrir o resultado agora. Tente novamente.');
    }
  }


  return (
    <main className={styles.page} data-full-canvas={fullCanvasMode}>
      {!fullCanvasMode && <header className={styles.topbar}>
        <div className={styles.brandNavigation}><TdmIconButton href="/" aria-label={TOOLTIP_LABELS.back} tooltip={TOOLTIP_LABELS.back} tooltipPosition="right" variant="ghost" size="sm" className={styles.backButton}><span aria-hidden="true">{icons.chevron}</span></TdmIconButton><div className={styles.brandGroup}><img className={styles.brandLogo} src="/brand/tmd-construtor-header-canonical.webp" alt="TMD Construtor" /></div></div>
        <ClearableField value={projectTitle} onClear={() => setProjectTitle('')} label="Apagar título da teoria" showEditWhenIdle>
          <input className={styles.projectTitle} aria-label="Título da teoria" value={projectTitle} onChange={(event) => { setProjectTitle(event.target.value); setSaveState('dirty'); }} maxLength={96} placeholder={FIELD_PLACEHOLDERS.projectTitle} />
        </ClearableField>
        <div className={styles.topActions}>
          <button type="button" className={styles.headerIconButton} onClick={undo} disabled={!history.length} data-tooltip={TOOLTIP_LABELS.undo}>{icons.undo}</button>
          <button type="button" className={styles.headerIconButton} onClick={redo} disabled={!future.length} data-tooltip={TOOLTIP_LABELS.redo}>{icons.redo}</button>
          <button type="button" className={styles.headerActionButton} onClick={() => setHistoryOpen((value) => !value)} data-active={historyOpen} data-tooltip={TOOLTIP_LABELS.history}>{icons.history}<span>Histórico</span></button>
          <button type="button" className={`${styles.headerActionButton} ${styles.resultButton}`} onClick={openResult} aria-label={TOOLTIP_LABELS.result} data-tooltip={TOOLTIP_LABELS.result}><span className={styles.eyeIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M2.8 12s3.3-5.4 9.2-5.4S21.2 12 21.2 12 17.9 17.4 12 17.4 2.8 12 2.8 12Z"/><circle cx="12" cy="12" r="2.4"/></svg></span><span>Resultado</span></button>
          <button type="button" className={`${styles.headerActionButton} ${styles.saveButton}`} onClick={save} aria-label={TOOLTIP_LABELS.save} data-tooltip={TOOLTIP_LABELS.save}>{icons.save}<span>Salvar</span></button>
        </div>
      </header>}

      <section className={styles.workspace} data-full-canvas={fullCanvasMode}>
        <aside className={styles.rail} aria-label="Ferramentas do canvas">
          <button type="button" data-active="true" data-tooltip={TOOLTIP_LABELS.select}>{icons.cursor}</button>
          <span className={styles.railDivider} />
          <button type="button" data-tooltip={TOOLTIP_LABELS.zoomIn}>{icons.zoomIn}</button>
          <button type="button" data-tooltip={TOOLTIP_LABELS.zoomOut}>{icons.zoomOut}</button>
          <button type="button" data-tooltip={TOOLTIP_LABELS.fit} onClick={frameVisualization}>{icons.fit}</button>
          <button type="button" data-tooltip={TOOLTIP_LABELS.fullCanvas} title={TOOLTIP_LABELS.fullCanvas} onClick={() => { setFullCanvasMode(true); setInspectorOpen(false); setHistoryOpen(false); }} aria-label={TOOLTIP_LABELS.fullCanvas}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9 5 5m0 0v4m0-4h4M15 9l4-4m0 0v4m0-4h-4M9 15l-4 4m0 0v-4m0 4h4M15 15l4 4m0 0v-4m0 4h-4"/></svg></button>
        </aside>

        {fullCanvasMode && <div className={styles.fullCanvasActions} role="toolbar" aria-label="Ações do canvas completo">
          <button type="button" onClick={undo} disabled={!history.length} data-tooltip={TOOLTIP_LABELS.undo} title={TOOLTIP_LABELS.undo} aria-label={TOOLTIP_LABELS.undo}>{icons.undo}</button>
          <button type="button" onClick={redo} disabled={!future.length} data-tooltip={TOOLTIP_LABELS.redo} title={TOOLTIP_LABELS.redo} aria-label={TOOLTIP_LABELS.redo}>{icons.redo}</button>
          <button type="button" onClick={save} data-tooltip={TOOLTIP_LABELS.save} title={TOOLTIP_LABELS.save} aria-label={TOOLTIP_LABELS.save}>{icons.save}</button>
          <button type="button" onClick={() => setFullCanvasMode(false)} data-tooltip={TOOLTIP_LABELS.closeFullCanvas} title={TOOLTIP_LABELS.closeFullCanvas} aria-label={TOOLTIP_LABELS.closeFullCanvas}>{icons.close}</button>
        </div>}

        <div ref={viewportRef} className={styles.canvasViewport}>
          <div ref={canvasRef} className={styles.canvas} style={{ minWidth: `${CANVAS_WIDTH}px`, minHeight: `${CANVAS_HEIGHT}px` }}
            onPointerMove={(event) => { moveDrag(event); moveConnectionDrag(event); }}
            onPointerUp={(event) => {
              if (connectionDrag) finishConnectionDrag(event);
              if (dragRef.current) setNotice('Posição atualizada.');
              dragRef.current = null;
            }}
            onPointerCancel={() => { dragRef.current = null; setConnectionDrag(null); setConnectionSourceId(null); }} onDragOver={allowStageDrop} onDrop={dropStage}>
            <svg className={styles.connections} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} aria-hidden="true">
              {edges.map((edge) => {
                const source = nodes.find((node) => node.id === edge.source);
                const target = nodes.find((node) => node.id === edge.target);
                if (!source || !target) return null;
                const sourceAnchor = nodeAnchor(source, 'right');
                const targetAnchor = nodeAnchor(target, 'left');
                const x1 = sourceAnchor.x; const y1 = sourceAnchor.y;
                const x2 = targetAnchor.x; const y2 = targetAnchor.y;
                const bend = Math.max(54, Math.abs(x2 - x1) * 0.45);
                const midX = (x1 + x2) / 2; const midY = (y1 + y2) / 2;
                return <g key={edge.id} className={styles.connectionGroup} data-selected={selectedEdgeId === edge.id}>
                  <path d={`M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`} />
                  <foreignObject x={midX - 18} y={midY - 18} width="36" height="36">
                    <button type="button" data-edge-action-id={edge.id} className={styles.edgeAction} data-kind={edge.relationKind ?? 'empty'} onClick={() => selectConnection(edge)} aria-label="Selecionar conexão">
                      {edge.relationKind === 'risk' ? 'R' : edge.relationKind === 'hypothesis' ? 'H' : '›'}
                    </button>
                  </foreignObject>
                </g>;
              })}
              {connectionDrag && (() => {
                const source = nodes.find((node) => node.id === connectionDrag.sourceId);
                if (!source) return null;
                const sourceAnchor = nodeAnchor(source, 'right');
                const x1 = sourceAnchor.x;
                const y1 = sourceAnchor.y;
                const x2 = connectionDrag.x;
                const y2 = connectionDrag.y;
                const bend = Math.max(48, Math.abs(x2 - x1) * 0.42);
                return <path className={styles.connectionPreview} d={`M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`} />;
              })()}
            </svg>

            {nodes.map((node) => {
              const isEditing = editingNodeId === node.id && editDraft;
              const toolbarOpen = activeToolbarId === node.id;
              return <article key={node.id} className={styles.node} data-canvas-node data-node-card-id={node.id} data-stage={node.stage} data-selected={selectedId === node.id}
                data-connecting={connectionSourceId === node.id} data-editing={Boolean(isEditing)} style={{ transform: `translate3d(${node.x}px, ${node.y}px, 0)` }}
                onPointerDown={(event) => startDrag(event, node)} onClick={() => { setSelectedId(node.id); setSelectedEdgeId(null); setInspectorOpen(true); }}>
                {toolbarOpen && <div className={styles.nodeToolbar} data-node-toolbar-id={node.id} role="toolbar" aria-label={`Ações de ${node.title}`}>
                  <button type="button" onClick={(event) => { event.stopPropagation(); setActiveToolbarId(null); }} data-tooltip={TOOLTIP_LABELS.closeToolbar}>{icons.close}</button>
                  <button type="button" onClick={(event) => { event.stopPropagation(); openCardEditor(node); }} data-tooltip={TOOLTIP_LABELS.edit}>{icons.edit}</button>
                  <button type="button" onClick={(event) => { event.stopPropagation(); duplicateNode(node.id); }} data-tooltip={TOOLTIP_LABELS.duplicate}>{icons.duplicate}</button>
                  <button type="button" onClick={(event) => { event.stopPropagation(); deleteNode(node.id); }} data-tooltip={TOOLTIP_LABELS.delete}>{icons.trash}</button>
                </div>}
                <button type="button" className={`${styles.nodeHandle} ${styles.nodeHandleTarget}`} aria-label={`Conectar a partir de ${node.title}`} data-tooltip={TOOLTIP_LABELS.target} data-connection-target={node.id} onPointerDown={(event) => beginConnectionDrag(event, node.id)} />
                <button type="button" className={`${styles.nodeHandle} ${styles.nodeHandleSource}`} aria-label={`Conectar a partir de ${node.title}`} data-tooltip={TOOLTIP_LABELS.source} data-connection-target={node.id} onPointerDown={(event) => beginConnectionDrag(event, node.id)} />
                <div className={styles.nodeMeta}><span>{stageMeta(node.stage).singular}</span><button type="button" aria-label="Mais opções" data-tooltip={TOOLTIP_LABELS.more} onClick={(event) => { event.stopPropagation(); setActiveToolbarId((current) => current === node.id ? null : node.id); }}>{icons.more}</button></div>
                {isEditing ? <div className={styles.nodeEditor} onClick={(event) => event.stopPropagation()}>
                  <label><span>Título</span><ClearableField value={editDraft.title} onClear={() => setEditDraft({ ...editDraft, title: '' })} label="Apagar título" size="sm"><input value={editDraft.title} onChange={(event) => setEditDraft({ ...editDraft, title: event.target.value })} placeholder={FIELD_PLACEHOLDERS.stage[node.stage].title} /></ClearableField></label>
                  <label><span>Descrição</span><ClearableField value={editDraft.description} onClear={() => setEditDraft({ ...editDraft, description: '' })} label="Apagar descrição" multiline size="sm"><textarea value={editDraft.description} onChange={(event) => setEditDraft({ ...editDraft, description: event.target.value })} placeholder={FIELD_PLACEHOLDERS.stage[node.stage].description} /></ClearableField></label>
                  <div className={styles.nodeAdvanced} data-open={cardAdvancedOpenId === node.id}>
                    <button type="button" className={styles.advancedToggle} aria-expanded={cardAdvancedOpenId === node.id} onClick={(event) => { event.stopPropagation(); setCardAdvancedOpenId((current) => current === node.id ? null : node.id); }}>
                      <span className={styles.advancedChevron} aria-hidden="true">{icons.chevron}</span>
                      <span>Detalhes avançados</span>
                    </button>
                    {cardAdvancedOpenId === node.id && <ClearableField value={editDraft.advancedDetails} onClear={() => setEditDraft({ ...editDraft, advancedDetails: '' })} label="Apagar detalhes avançados" multiline size="sm"><textarea className={styles.advancedField} value={editDraft.advancedDetails} onChange={(event) => setEditDraft({ ...editDraft, advancedDetails: event.target.value })} placeholder={FIELD_PLACEHOLDERS.stage[node.stage].advancedDetails} /></ClearableField>}
                  </div>
                  <div className={styles.nodeEditorActions}><button type="button" onClick={() => { setEditingNodeId(null); setEditDraft(null); }}><span>Cancelar</span></button><button type="button" onClick={() => saveCardEditor(node.id)}><span>Salvar</span></button></div>
                </div> : <><h2>{node.title}</h2><p>{node.description}</p><div className={styles.nodeFooter}><span>Conectar</span><small>Arraste para mover</small></div></>}
              </article>;
            })}

            {selectedEdge && relationPopoverOpen && selectedEdgeSource && selectedEdgeTarget && selectedRelationKind && (() => {
              const sourceAnchor = nodeAnchor(selectedEdgeSource, 'right');
              const targetAnchor = nodeAnchor(selectedEdgeTarget, 'left');
              const midX = (sourceAnchor.x + targetAnchor.x) / 2;
              const midY = (sourceAnchor.y + targetAnchor.y) / 2;
              const position = relationOverlayPosition(midX, midY);
              const hasRelation = Boolean(selectedEdge.relationKind);
              const relationLabel = selectedRelationKind === 'risk' ? 'R' : 'H';
              const addLabel = selectedRelationKind === 'risk' ? TOOLTIP_LABELS.addRisk : TOOLTIP_LABELS.addHypothesis;
              const editLabel = selectedRelationKind === 'risk' ? TOOLTIP_LABELS.editRisk : TOOLTIP_LABELS.editHypothesis;
              const removeLabel = selectedRelationKind === 'risk' ? TOOLTIP_LABELS.removeRisk : TOOLTIP_LABELS.removeHypothesis;
              return <section data-edge-popover className={styles.edgePopover} data-mode={relationPanelMode} data-kind="neutral" style={position} onPointerDown={(event) => event.stopPropagation()}>
                {relationPanelMode === 'menu' ? <div className={styles.edgeToolbar} role="toolbar" aria-label="Ações da conexão">
                  <button type="button" data-tooltip={TOOLTIP_LABELS.closeRelation} onClick={clearSelection}>{icons.close}</button>
                  <button type="button" className={styles.relationKindButton} data-tooltip={hasRelation ? editLabel : addLabel} onClick={openRelationForm}><span>{relationLabel}</span></button>
                  {hasRelation && <button type="button" className={styles.relationRemoveButton} data-tooltip={removeLabel} onClick={removeRelationMarker}><span data-remove="true">{relationLabel}</span></button>}
                  <button type="button" data-tooltip={TOOLTIP_LABELS.deleteConnection} onClick={deleteConnection}>{icons.trash}</button>
                </div> : <>
                  <div className={styles.compactRelationHeader}><span className={styles.relationBadge}>{relationLabel}</span><strong>{selectedRelationKind === 'risk' ? 'Risco' : 'Hipótese'}</strong></div>
                  <label className={styles.compactRelationField}><span>Descrição</span><ClearableField value={relationDraft?.description ?? ''} onClear={() => updateRelationDraft('description', '')} label="Apagar descrição" multiline size="sm"><textarea autoFocus value={relationDraft?.description ?? ''} onChange={(event) => updateRelationDraft('description', event.target.value)} placeholder={selectedRelationKind === 'risk' ? FIELD_PLACEHOLDERS.relation.risk : FIELD_PLACEHOLDERS.relation.hypothesis} /></ClearableField></label>
                  <div className={styles.edgeFormActions}><button type="button" onClick={() => setRelationPanelMode('menu')}>Cancelar</button><button type="button" onClick={saveRelation}>Salvar</button></div>
                </>}
              </section>;
            })()}

            <section className={styles.creator} data-open={creatorOpen}>
              <button type="button" className={styles.creatorToggle} onClick={() => setCreatorOpen((value) => !value)} aria-expanded={creatorOpen} aria-label={creatorOpen ? TOOLTIP_LABELS.closeCreator : TOOLTIP_LABELS.openCreator} title={creatorOpen ? TOOLTIP_LABELS.closeCreator : TOOLTIP_LABELS.openCreator} data-tooltip={creatorOpen ? TOOLTIP_LABELS.closeCreator : TOOLTIP_LABELS.openCreator}><span className={styles.creatorIcon}><i /><i /><i /></span>{creatorOpen && <span className={styles.creatorHeading}><strong>Adicionar ao canvas</strong><small>Arraste qualquer etapa</small></span>}<span className={styles.creatorChevron}>{creatorOpen ? icons.collapse : icons.expand}</span></button>
              {creatorOpen && <div className={styles.creatorBody}>{STAGES.map((stage) => <button type="button" key={stage.id} data-stage={stage.id} draggable onDragStart={(event) => startStageDrag(event, stage.id)} aria-label={`Arrastar ${stage.singular} para o canvas`}><span className={styles.stageGlyph}>{icons.add}</span><span><strong>{stage.singular}</strong><small>{stage.hint}</small></span><em>{counts[stage.id]}</em></button>)}<div className={styles.creatorActions} role="toolbar" aria-label="Organização e apoio do canvas"><button type="button" onClick={centralizeColumns} data-tooltip={TOOLTIP_LABELS.columns} title={TOOLTIP_LABELS.columns} aria-label={TOOLTIP_LABELS.columns}><svg viewBox="0 0 24 24"><rect x="3" y="5" width="4" height="14" rx="1"/><rect x="10" y="5" width="4" height="14" rx="1"/><rect x="17" y="5" width="4" height="14" rx="1"/></svg></button><button type="button" onClick={frameVisualization} data-tooltip={TOOLTIP_LABELS.frame} title={TOOLTIP_LABELS.frame} aria-label={TOOLTIP_LABELS.frame}>{icons.fit}</button><button type="button" onClick={openGuide} data-tooltip={TOOLTIP_LABELS.guide} title={TOOLTIP_LABELS.guide} aria-label={TOOLTIP_LABELS.guide}><svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z"/></svg></button><button type="button" onClick={openExamples} data-tooltip={TOOLTIP_LABELS.examples} title={TOOLTIP_LABELS.examples} aria-label={TOOLTIP_LABELS.examples}><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 15 3-3 2.5 2.5L16 10l2 2.5"/><circle cx="8" cy="8" r="1"/></svg></button><button type="button" onClick={organizeFlow} data-tooltip={TOOLTIP_LABELS.flow} title={TOOLTIP_LABELS.flow} aria-label={TOOLTIP_LABELS.flow}><svg viewBox="0 0 24 24"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="18" r="2"/><path d="M7 6h4a3 3 0 0 1 3 3v0a3 3 0 0 0 3 3"/><path d="M7 18h4a3 3 0 0 0 3-3v0a3 3 0 0 1 3-3"/></svg></button></div><p>{icons.lock}<span>Riscos e hipóteses permanecem disponíveis somente entre relações válidas.</span></p></div>}
            </section>
            <div className={styles.notice} data-tone={noticeTone} role="status"><span />{notice}</div>
          </div>
        </div>

        {!fullCanvasMode && inspectorOpen && <aside className={styles.inspector}>
          <div className={styles.inspectorHeader}><div><span>Inspector</span><strong>{selectedNode ? stageMeta(selectedNode.stage).singular : selectedEdge ? 'Conexão' : 'Canvas'}</strong></div><button type="button" onClick={() => setInspectorOpen(false)} aria-label="Fechar inspector" title={TOOLTIP_LABELS.closeInspector} data-tooltip={TOOLTIP_LABELS.closeInspector}>{icons.close}</button></div>
          {selectedNode ? <div className={styles.inspectorContent} data-stage={selectedNode.stage}>
            <div className={styles.inspectorSummary}><span className={styles.inspectorStageDot} /><div><strong>{stageMeta(selectedNode.stage).label}</strong><small>Bloco selecionado</small></div></div>
            <label>Título<ClearableField value={selectedNode.title} onClear={() => updateSelected('title', '')} label="Apagar título"><input value={selectedNode.title} onChange={(event) => updateSelected('title', event.target.value)} placeholder={FIELD_PLACEHOLDERS.stage[selectedNode.stage].title} /></ClearableField></label>
            <label>Descrição<ClearableField value={selectedNode.description} onClear={() => updateSelected('description', '')} label="Apagar descrição" multiline><textarea value={selectedNode.description} onChange={(event) => updateSelected('description', event.target.value)} placeholder={FIELD_PLACEHOLDERS.stage[selectedNode.stage].description} /></ClearableField></label>
            <div key={`node-advanced-${selectedNode.id}`} className={styles.inspectorAdvanced} data-open={inspectorAdvancedOpenKey === `node:${selectedNode.id}`}>
              <button type="button" className={styles.advancedToggle} aria-expanded={inspectorAdvancedOpenKey === `node:${selectedNode.id}`} onClick={() => setInspectorAdvancedOpenKey((current) => current === `node:${selectedNode.id}` ? null : `node:${selectedNode.id}`)}>
                <span className={styles.advancedChevron} aria-hidden="true">{icons.chevron}</span>
                <span>Detalhes avançados</span>
              </button>
              {inspectorAdvancedOpenKey === `node:${selectedNode.id}` && <ClearableField value={selectedNode.advancedDetails} onClear={() => updateSelected('advancedDetails', '')} label="Apagar detalhes avançados" multiline><textarea className={styles.advancedField} value={selectedNode.advancedDetails} onChange={(event) => updateSelected('advancedDetails', event.target.value)} placeholder={FIELD_PLACEHOLDERS.stage[selectedNode.stage].advancedDetails} /></ClearableField>}
            </div>
            <div className={styles.logicCard}><span>Lógica causal</span><strong>{edges.filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id).length} conexões válidas</strong><p>Use o dot direito como origem e o dot esquerdo como destino. Ações incoerentes são bloqueadas sem alterar o mapa.</p></div>
            <button type="button" className={styles.inspectorAction} onClick={() => { setSaveState('dirty'); setNotice(`${stageMeta(selectedNode.stage).singular} atualizado.`); }}>{icons.save}<span>Salvar</span></button>
            <div className={styles.inspectorSecondaryActions}><button type="button" onClick={() => duplicateNode(selectedNode.id)}>{icons.duplicate}<span>Duplicar</span></button><button type="button" onClick={() => deleteNode(selectedNode.id)}>{icons.trash}<span>Excluir</span></button></div>
          </div> : selectedEdge && selectedRelationKind && relationDraft ? <div className={styles.inspectorContent} data-stage="neutral">
            <div className={styles.inspectorSummary}><span className={styles.inspectorStageDot} /><div><strong>{selectedRelationKind === 'risk' ? 'Risco' : 'Hipótese'}</strong><small>{selectedEdgeSource ? stageMeta(selectedEdgeSource.stage).singular : ''} → {selectedEdgeTarget ? stageMeta(selectedEdgeTarget.stage).singular : ''}</small></div></div>
            <label>Descrição<ClearableField value={relationDraft.description} onClear={() => updateRelationDraft('description', '')} label="Apagar descrição" multiline><textarea value={relationDraft.description} onChange={(event) => updateRelationDraft('description', event.target.value)} placeholder={selectedRelationKind === 'risk' ? FIELD_PLACEHOLDERS.relation.risk : FIELD_PLACEHOLDERS.relation.hypothesis} /></ClearableField></label>
            <button type="button" className={styles.inspectorAction} onClick={saveRelation}>{icons.save}<span>Salvar</span></button>
            <div className={styles.inspectorSecondaryActions}>
              {selectedEdge.relationKind && <button type="button" onClick={removeRelationMarker}>{icons.trash}<span>Excluir {selectedRelationKind === 'risk' ? 'risco' : 'hipótese'}</span></button>}
              <button type="button" onClick={deleteConnection}>{icons.trash}<span>Excluir conexão</span></button>
            </div>
          </div> : <div className={styles.emptyInspector}>Selecione um bloco ou uma conexão.</div>}
          <div className={styles.progressPanel}><div><span>Estrutura da teoria</span><small>{nodes.length} blocos · {edges.length} conexões</small></div>{STAGES.map((stage) => <div className={styles.progressRow} key={stage.id} data-stage={stage.id}><span /><strong>{stage.label}</strong><em>{counts[stage.id]}</em></div>)}</div>
        </aside>}

        {!fullCanvasMode && !inspectorOpen && <div className={styles.workspaceTopRightControls}><button type="button" className={styles.inspectorReopen} onClick={() => setInspectorOpen(true)} aria-label={TOOLTIP_LABELS.openInspector} data-tooltip={TOOLTIP_LABELS.openInspector} title={TOOLTIP_LABELS.openInspector}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16M18 9l3 3-3 3"/></svg></button></div>}
        {!fullCanvasMode && historyOpen && <aside className={styles.historyPanel}><div className={styles.historyHeader}><div><span>Histórico</span><strong>Esta sessão</strong></div><button type="button" onClick={() => setHistoryOpen(false)} data-tooltip="Fechar histórico">{icons.close}</button></div><ol><li><span>{icons.check}</span><div><strong>Estado atual</strong><small>{nodes.length} blocos no canvas</small></div></li>{history.slice().reverse().map((_, index) => <li key={index}><span>{index + 1}</span><div><strong>Alteração registrada</strong><small>Versão {history.length - index}</small></div></li>)}</ol></aside>}
      </section>
    </main>
  );
}

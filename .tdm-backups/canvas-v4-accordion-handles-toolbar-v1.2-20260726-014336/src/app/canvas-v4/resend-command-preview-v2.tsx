'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type PointerEvent as ReactPointerEvent
} from 'react';
import styles from './resend-command-preview-v2.module.sass';
import { previewIcons as icons } from './resend-command-preview-v2.icons';
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
} from './resend-command-preview-v2.model';

const NODE_WIDTH = 238;
const NODE_HEIGHT = 126;
const CANVAS_WIDTH = 1480;
const CANVAS_HEIGHT = 820;
const NODE_EDGE_GAP = 24;
const NODE_DROP_OFFSET_X = NODE_WIDTH / 2;
const NODE_DROP_OFFSET_Y = 40;
const DUPLICATE_OFFSET = 34;
const HISTORY_LIMIT = 24;
const SAVE_DELAY_MS = 680;
const DRAG_STAGE_MIME = 'application/x-tdm-stage';

const TOOLTIP_LABELS = {
  undo: 'Desfazer última alteração', redo: 'Refazer alteração', history: 'Abrir histórico', save: 'Salvar teoria',
  select: 'Selecionar blocos', zoomIn: 'Aproximar visualização', zoomOut: 'Afastar visualização', fit: 'Centralizar visualização',
  more: 'Abrir ações do card', closeToolbar: 'Fechar toolbar', edit: 'Editar card', duplicate: 'Duplicar card',
  delete: 'Excluir card', closeInspector: 'Fechar inspector', source: 'Definir como origem da conexão',
  target: 'Definir como destino da conexão', closeRelation: 'Fechar ações da conexão', deleteConnection: 'Excluir conexão'
} as const;

type DragState = { id: string; offsetX: number; offsetY: number };
type NodeDraft = Pick<CanvasNode, 'title' | 'description' | 'advancedDetails'>;
type RelationDraft = { title: string; description: string; advancedDetails: string };
type RelationPanelMode = 'menu' | 'form';

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

export function ResendCommandPreviewV2() {
  const [nodes, setNodes] = useState<CanvasNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<CanvasEdge[]>(INITIAL_EDGES);
  const [history, setHistory] = useState<CanvasSnapshot[]>([]);
  const [future, setFuture] = useState<CanvasSnapshot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [connectionSourceId, setConnectionSourceId] = useState<string | null>(null);
  const [activeToolbarId, setActiveToolbarId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<NodeDraft | null>(null);
  const [relationPanelMode, setRelationPanelMode] = useState<RelationPanelMode>('menu');
  const [relationDraft, setRelationDraft] = useState<RelationDraft | null>(null);
  const [cardAdvancedOpenId, setCardAdvancedOpenId] = useState<string | null>(null);
  const [inspectorAdvancedOpenKey, setInspectorAdvancedOpenKey] = useState<string | null>(null);
  const [notice, setNotice] = useState('Canvas vazio. Arraste qualquer etapa para começar.');
  const [saveState, setSaveState] = useState<'saved' | 'dirty' | 'saving'>('saved');
  const dragRef = useRef<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
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

  function beginManualConnection(sourceId: string) {
    setConnectionSourceId(sourceId);
    clearSelection();
    setNotice('Origem definida. Clique no dot de destino do próximo bloco.');
  }

  function completeManualConnection(targetId: string) {
    const sourceId = connectionSourceId;
    if (!sourceId) {
      setNotice('Defina primeiro o dot de origem.');
      return;
    }
    if (sourceId === targetId) {
      setConnectionSourceId(null);
      setNotice('Origem e destino precisam ser blocos diferentes.');
      return;
    }
    const source = nodes.find((node) => node.id === sourceId);
    const target = nodes.find((node) => node.id === targetId);
    if (!source || !target) return;
    if (!canConnect(source.stage, target.stage)) {
      setConnectionSourceId(null);
      setNotice(`Conexão incoerente: ${stageMeta(source.stage).singular} só pode se conectar à etapa causal seguinte.`);
      return;
    }
    if (edges.some((edge) => edge.source === source.id && edge.target === target.id)) {
      setConnectionSourceId(null);
      setNotice('Essa conexão já existe.');
      return;
    }
    capture();
    idCounterRef.current += 1;
    setEdges((items) => [...items, { id: `edge-${idCounterRef.current}`, source: source.id, target: target.id }]);
    setConnectionSourceId(null);
    setNotice('Conexão criada. Clique nela para adicionar risco, hipótese ou excluir.');
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

  function save() {
    setSaveState('saving');
    setNotice('Salvando versão local…');
    window.setTimeout(() => { setSaveState('saved'); setNotice('Tudo salvo.'); }, SAVE_DELAY_MS);
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brandGroup}><img className={styles.brandLogo} src="/brand/tmd-construtor-header-canonical.webp" alt="TMD Construtor" /></div>
        <div className={styles.documentState} data-state={saveState}><span className={styles.stateDot} />{saveState === 'saved' ? 'Salvo' : saveState === 'saving' ? 'Salvando…' : 'Alterações não salvas'}</div>
        <div className={styles.topActions}>
          <button type="button" onClick={undo} disabled={!history.length} data-tooltip={TOOLTIP_LABELS.undo}>{icons.undo}</button>
          <button type="button" onClick={redo} disabled={!future.length} data-tooltip={TOOLTIP_LABELS.redo}>{icons.redo}</button>
          <button type="button" onClick={() => setHistoryOpen((value) => !value)} data-active={historyOpen} data-tooltip={TOOLTIP_LABELS.history}>{icons.history}<span>Histórico</span></button>
          <button type="button" className={styles.saveButton} onClick={save} data-tooltip={TOOLTIP_LABELS.save}>{icons.save}<span>Salvar</span></button>
        </div>
      </header>

      <section className={styles.workspace}>
        <aside className={styles.rail} aria-label="Ferramentas do canvas">
          <button type="button" data-active="true" data-tooltip={TOOLTIP_LABELS.select}>{icons.cursor}</button>
          <span className={styles.railDivider} />
          <button type="button" data-tooltip={TOOLTIP_LABELS.zoomIn}>{icons.zoomIn}</button>
          <button type="button" data-tooltip={TOOLTIP_LABELS.zoomOut}>{icons.zoomOut}</button>
          <button type="button" data-tooltip={TOOLTIP_LABELS.fit}>{icons.fit}</button>
        </aside>

        <div className={styles.canvasViewport}>
          <div ref={canvasRef} className={styles.canvas} style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
            onPointerMove={moveDrag} onPointerUp={() => { if (dragRef.current) setNotice('Posição atualizada.'); dragRef.current = null; }}
            onPointerCancel={() => { dragRef.current = null; }} onDragOver={allowStageDrop} onDrop={dropStage}>
            <svg className={styles.connections} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} aria-hidden="true">
              {edges.map((edge) => {
                const source = nodes.find((node) => node.id === edge.source);
                const target = nodes.find((node) => node.id === edge.target);
                if (!source || !target) return null;
                const x1 = source.x + NODE_WIDTH; const y1 = source.y + NODE_HEIGHT / 2;
                const x2 = target.x; const y2 = target.y + NODE_HEIGHT / 2;
                const bend = Math.max(54, Math.abs(x2 - x1) * 0.45);
                const midX = (x1 + x2) / 2; const midY = (y1 + y2) / 2;
                return <g key={edge.id} className={styles.connectionGroup} data-selected={selectedEdgeId === edge.id}>
                  <path d={`M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`} />
                  <foreignObject x={midX - 18} y={midY - 18} width="36" height="36">
                    <button type="button" className={styles.edgeAction} data-kind={edge.relationKind ?? 'empty'} onClick={() => selectConnection(edge)} aria-label="Selecionar conexão">
                      {edge.relationKind === 'risk' ? 'R' : edge.relationKind === 'hypothesis' ? 'H' : '›'}
                    </button>
                  </foreignObject>
                </g>;
              })}
            </svg>

            {nodes.map((node) => {
              const isEditing = editingNodeId === node.id && editDraft;
              const toolbarOpen = activeToolbarId === node.id;
              return <article key={node.id} className={styles.node} data-stage={node.stage} data-selected={selectedId === node.id}
                data-connecting={connectionSourceId === node.id} data-editing={Boolean(isEditing)} style={{ transform: `translate3d(${node.x}px, ${node.y}px, 0)` }}
                onPointerDown={(event) => startDrag(event, node)} onClick={() => { setSelectedId(node.id); setSelectedEdgeId(null); setInspectorOpen(true); }}>
                {toolbarOpen && <div className={styles.nodeToolbar} role="toolbar" aria-label={`Ações de ${node.title}`}>
                  <button type="button" onClick={(event) => { event.stopPropagation(); setActiveToolbarId(null); }} data-tooltip={TOOLTIP_LABELS.closeToolbar}>{icons.close}</button>
                  <button type="button" onClick={(event) => { event.stopPropagation(); openCardEditor(node); }} data-tooltip={TOOLTIP_LABELS.edit}>{icons.edit}</button>
                  <button type="button" onClick={(event) => { event.stopPropagation(); duplicateNode(node.id); }} data-tooltip={TOOLTIP_LABELS.duplicate}>{icons.duplicate}</button>
                  <button type="button" onClick={(event) => { event.stopPropagation(); deleteNode(node.id); }} data-tooltip={TOOLTIP_LABELS.delete}>{icons.trash}</button>
                </div>}
                <button type="button" className={`${styles.nodeHandle} ${styles.nodeHandleTarget}`} aria-label={`Destino de ${node.title}`} data-tooltip={TOOLTIP_LABELS.target} onClick={(event) => { event.stopPropagation(); completeManualConnection(node.id); }} />
                <button type="button" className={`${styles.nodeHandle} ${styles.nodeHandleSource}`} aria-label={`Origem de ${node.title}`} data-tooltip={TOOLTIP_LABELS.source} onClick={(event) => { event.stopPropagation(); beginManualConnection(node.id); }} />
                <div className={styles.nodeMeta}><span>{stageMeta(node.stage).singular}</span><button type="button" aria-label="Mais opções" data-tooltip={TOOLTIP_LABELS.more} onClick={(event) => { event.stopPropagation(); setActiveToolbarId((current) => current === node.id ? null : node.id); }}>{icons.more}</button></div>
                {isEditing ? <div className={styles.nodeEditor} onClick={(event) => event.stopPropagation()}>
                  <label><span>Título</span><input value={editDraft.title} onChange={(event) => setEditDraft({ ...editDraft, title: event.target.value })} /></label>
                  <label><span>Descrição</span><textarea value={editDraft.description} onChange={(event) => setEditDraft({ ...editDraft, description: event.target.value })} /></label>
                  <div className={styles.nodeAdvanced} data-open={cardAdvancedOpenId === node.id}>
                    <button type="button" className={styles.advancedToggle} aria-expanded={cardAdvancedOpenId === node.id} onClick={(event) => { event.stopPropagation(); setCardAdvancedOpenId((current) => current === node.id ? null : node.id); }}>
                      <span className={styles.advancedChevron} aria-hidden="true">{icons.chevron}</span>
                      <span>Detalhes avançados</span>
                    </button>
                    {cardAdvancedOpenId === node.id && <textarea className={styles.advancedField} value={editDraft.advancedDetails} onChange={(event) => setEditDraft({ ...editDraft, advancedDetails: event.target.value })} placeholder="Inclua contexto adicional" />}
                  </div>
                  <div className={styles.nodeEditorActions}><button type="button" onClick={() => { setEditingNodeId(null); setEditDraft(null); }}>{icons.cancel}<span>Cancelar</span></button><button type="button" onClick={() => saveCardEditor(node.id)}>{icons.save}<span>Salvar</span></button></div>
                </div> : <><h2>{node.title}</h2><p>{node.description}</p><div className={styles.nodeFooter}><span>Dot esquerdo: destino</span><small>Dot direito: origem</small></div></>}
              </article>;
            })}

            {selectedEdge && selectedEdgeSource && selectedEdgeTarget && selectedRelationKind && (() => {
              const x1 = selectedEdgeSource.x + NODE_WIDTH; const y1 = selectedEdgeSource.y + NODE_HEIGHT / 2;
              const x2 = selectedEdgeTarget.x; const y2 = selectedEdgeTarget.y + NODE_HEIGHT / 2;
              const left = (x1 + x2) / 2; const top = (y1 + y2) / 2;
              return <section className={styles.edgePopover} data-mode={relationPanelMode} data-kind={selectedRelationKind} style={{ left, top }} onPointerDown={(event) => event.stopPropagation()}>
                {relationPanelMode === 'menu' ? <>
                  <div className={styles.edgePopoverHeader}><div><span>Conexão</span><strong>{stageMeta(selectedEdgeSource.stage).singular} → {stageMeta(selectedEdgeTarget.stage).singular}</strong></div><button type="button" data-tooltip={TOOLTIP_LABELS.closeRelation} onClick={clearSelection}>{icons.close}</button></div>
                  <button type="button" className={styles.edgePrimaryAction} onClick={openRelationForm}>{selectedRelationKind === 'risk' ? 'Adicionar ou editar risco' : 'Adicionar ou editar hipótese'}</button>
                  <button type="button" className={styles.edgeDeleteAction} data-tooltip={TOOLTIP_LABELS.deleteConnection} onClick={deleteConnection}>{icons.trash}<span>Excluir conexão</span></button>
                </> : <>
                  <div className={styles.edgePopoverHeader}><div><span>{selectedRelationKind === 'risk' ? 'Risco' : 'Hipótese'}</span><strong>Qualificar conexão</strong></div><button type="button" data-tooltip={TOOLTIP_LABELS.closeRelation} onClick={() => setRelationPanelMode('menu')}>{icons.close}</button></div>
                  <label><span>Título</span><input value={relationDraft?.title ?? ''} onChange={(event) => updateRelationDraft('title', event.target.value)} /></label>
                  <label><span>Descrição</span><textarea value={relationDraft?.description ?? ''} onChange={(event) => updateRelationDraft('description', event.target.value)} /></label>
                  <details className={styles.edgeAdvanced}><summary>Detalhes avançados</summary><textarea value={relationDraft?.advancedDetails ?? ''} onChange={(event) => updateRelationDraft('advancedDetails', event.target.value)} /></details>
                  <div className={styles.edgeFormActions}><button type="button" onClick={() => setRelationPanelMode('menu')}>Cancelar</button><button type="button" onClick={saveRelation}>Salvar</button></div>
                </>}
              </section>;
            })()}

            <section className={styles.creator} data-open={creatorOpen} data-stage={selectedNode?.stage ?? 'input'}>
              <button type="button" className={styles.creatorToggle} onClick={() => setCreatorOpen((value) => !value)} aria-expanded={creatorOpen}><span className={styles.creatorIcon}><i /><i /><i /></span>{creatorOpen && <span className={styles.creatorHeading}><strong>Adicionar ao canvas</strong><small>Arraste qualquer etapa</small></span>}<span className={styles.creatorChevron}>{creatorOpen ? icons.collapse : icons.expand}</span></button>
              {creatorOpen && <div className={styles.creatorBody}>{STAGES.map((stage) => <button type="button" key={stage.id} data-stage={stage.id} draggable onDragStart={(event) => startStageDrag(event, stage.id)} aria-label={`Arrastar ${stage.singular} para o canvas`}><span className={styles.stageGlyph}>{icons.add}</span><span><strong>{stage.singular}</strong><small>{stage.hint}</small></span><em>{counts[stage.id]}</em></button>)}<p>{icons.lock}<span>Riscos e hipóteses permanecem disponíveis somente entre relações válidas.</span></p></div>}
            </section>
            <div className={styles.notice} role="status"><span />{notice}</div>
          </div>
        </div>

        <aside className={styles.inspector} data-open={inspectorOpen}>
          <div className={styles.inspectorHeader}><div><span>Inspector</span><strong>{selectedNode ? stageMeta(selectedNode.stage).singular : selectedEdge ? 'Conexão' : 'Canvas'}</strong></div><button type="button" onClick={() => setInspectorOpen(false)} aria-label="Fechar inspector" data-tooltip={TOOLTIP_LABELS.closeInspector}>{icons.close}</button></div>
          {selectedNode ? <div className={styles.inspectorContent} data-stage={selectedNode.stage}>
            <div className={styles.inspectorSummary}><span className={styles.inspectorStageDot} /><div><strong>{stageMeta(selectedNode.stage).label}</strong><small>Bloco selecionado</small></div></div>
            <label>Título<input value={selectedNode.title} onChange={(event) => updateSelected('title', event.target.value)} /></label>
            <label>Descrição<textarea value={selectedNode.description} onChange={(event) => updateSelected('description', event.target.value)} /></label>
            <div key={`node-advanced-${selectedNode.id}`} className={styles.inspectorAdvanced} data-open={inspectorAdvancedOpenKey === `node:${selectedNode.id}`}>
              <button type="button" className={styles.advancedToggle} aria-expanded={inspectorAdvancedOpenKey === `node:${selectedNode.id}`} onClick={() => setInspectorAdvancedOpenKey((current) => current === `node:${selectedNode.id}` ? null : `node:${selectedNode.id}`)}>
                <span className={styles.advancedChevron} aria-hidden="true">{icons.chevron}</span>
                <span>Detalhes avançados</span>
              </button>
              {inspectorAdvancedOpenKey === `node:${selectedNode.id}` && <textarea className={styles.advancedField} value={selectedNode.advancedDetails} onChange={(event) => updateSelected('advancedDetails', event.target.value)} placeholder="Inclua contexto, evidências ou observações" />}
            </div>
            <div className={styles.logicCard}><span>Lógica causal</span><strong>{edges.filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id).length} conexões válidas</strong><p>Use o dot direito como origem e o dot esquerdo como destino. Ações incoerentes são bloqueadas sem alterar o mapa.</p></div>
            <button type="button" className={styles.inspectorAction} onClick={() => { setSaveState('dirty'); setNotice(`${stageMeta(selectedNode.stage).singular} atualizado.`); }}><span>Salvar</span>{icons.save}</button>
            <div className={styles.inspectorSecondaryActions}><button type="button" onClick={() => duplicateNode(selectedNode.id)}><span>Duplicar</span>{icons.duplicate}</button><button type="button" onClick={() => deleteNode(selectedNode.id)}><span>Excluir</span>{icons.trash}</button></div>
          </div> : selectedEdge && selectedRelationKind && relationDraft ? <div className={styles.inspectorContent} data-stage={selectedRelationKind === 'hypothesis' ? 'neutral' : selectedEdgeSource?.stage}>
            <div className={styles.inspectorSummary}><span className={styles.inspectorStageDot} /><div><strong>{selectedRelationKind === 'risk' ? 'Risco da conexão' : 'Hipótese da conexão'}</strong><small>{selectedEdgeSource ? stageMeta(selectedEdgeSource.stage).singular : ''} → {selectedEdgeTarget ? stageMeta(selectedEdgeTarget.stage).singular : ''}</small></div></div>
            <label>Título<input value={relationDraft.title} onChange={(event) => updateRelationDraft('title', event.target.value)} /></label>
            <label>Descrição<textarea value={relationDraft.description} onChange={(event) => updateRelationDraft('description', event.target.value)} /></label>
            <div key={`edge-advanced-${selectedEdge.id}`} className={styles.inspectorAdvanced} data-open={inspectorAdvancedOpenKey === `edge:${selectedEdge.id}`}>
              <button type="button" className={styles.advancedToggle} aria-expanded={inspectorAdvancedOpenKey === `edge:${selectedEdge.id}`} onClick={() => setInspectorAdvancedOpenKey((current) => current === `edge:${selectedEdge.id}` ? null : `edge:${selectedEdge.id}`)}>
                <span className={styles.advancedChevron} aria-hidden="true">{icons.chevron}</span>
                <span>Detalhes avançados</span>
              </button>
              {inspectorAdvancedOpenKey === `edge:${selectedEdge.id}` && <textarea className={styles.advancedField} value={relationDraft.advancedDetails} onChange={(event) => updateRelationDraft('advancedDetails', event.target.value)} placeholder="Inclua contexto, evidências ou observações" />}
            </div>
            <button type="button" className={styles.inspectorAction} onClick={saveRelation}><span>Salvar {selectedRelationKind === 'risk' ? 'risco' : 'hipótese'}</span>{icons.save}</button>
            <div className={styles.inspectorSecondaryActions}><button type="button" onClick={openRelationForm}><span>Editar no canvas</span>{icons.edit}</button><button type="button" onClick={deleteConnection}><span>Excluir conexão</span>{icons.trash}</button></div>
          </div> : <div className={styles.emptyInspector}>Selecione um bloco ou uma conexão.</div>}
          <div className={styles.progressPanel}><div><span>Estrutura da teoria</span><small>{nodes.length} blocos · {edges.length} conexões</small></div>{STAGES.map((stage) => <div className={styles.progressRow} key={stage.id} data-stage={stage.id}><span /><strong>{stage.label}</strong><em>{counts[stage.id]}</em></div>)}</div>
        </aside>

        {!inspectorOpen && <button type="button" className={styles.inspectorReopen} onClick={() => setInspectorOpen(true)}>{icons.chevron}<span>Abrir inspector</span></button>}
        {historyOpen && <aside className={styles.historyPanel}><div className={styles.historyHeader}><div><span>Histórico</span><strong>Esta sessão</strong></div><button type="button" onClick={() => setHistoryOpen(false)} data-tooltip="Fechar histórico">{icons.close}</button></div><ol><li><span>{icons.check}</span><div><strong>Estado atual</strong><small>{nodes.length} blocos no canvas</small></div></li>{history.slice().reverse().map((_, index) => <li key={index}><span>{index + 1}</span><div><strong>Alteração registrada</strong><small>Versão {history.length - index}</small></div></li>)}</ol></aside>}
      </section>
    </main>
  );
}

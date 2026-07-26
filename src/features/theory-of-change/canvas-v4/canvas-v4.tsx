'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addEdge,
  Background,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { saveCanvasV4 } from './canvas-v4.actions';
import { CanvasCardNodeView } from './canvas-card-node';
import { CanvasRelationEdgeView } from './canvas-relation-edge';
import { BrowserCanvasV4Repository } from './canvas-v4.repository';
import {
  EMPTY_DOCUMENT,
  STAGES,
  allowedRelation,
  canConnect,
  connectionMessage,
  stageMeta,
  type CanvasCardNode,
  type CanvasDocument,
  type CanvasRelationEdge,
  type RelationKind,
  type StageId
} from './canvas-v4.model';
import styles from './canvas-v4.module.sass';

const nodeTypes = { canvasCard: CanvasCardNodeView };
const edgeTypes = { canvasRelation: CanvasRelationEdgeView };
const repository = new BrowserCanvasV4Repository();
const MAX_HISTORY = 40;

function CanvasV4Inner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasCardNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CanvasRelationEdge>([]);
  const [name, setName] = useState(EMPTY_DOCUMENT.name);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [relationEditor, setRelationEditor] = useState<string | null>(null);
  const [notice, setNotice] = useState('Canvas vazio. Arraste qualquer etapa para começar.');
  const [saveState, setSaveState] = useState<'saved' | 'dirty' | 'saving'>('saved');
  const [past, setPast] = useState<CanvasDocument[]>([]);
  const [future, setFuture] = useState<CanvasDocument[]>([]);
  const dragStageRef = useRef<StageId | null>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId) ?? null;

  const snapshot = useCallback((): CanvasDocument => ({
    id: EMPTY_DOCUMENT.id,
    name,
    nodes,
    edges,
    updatedAt: new Date().toISOString()
  }), [edges, name, nodes]);

  const commit = useCallback(() => {
    setPast((items) => [...items, snapshot()].slice(-MAX_HISTORY));
    setFuture([]);
    setSaveState('dirty');
  }, [snapshot]);

  useEffect(() => {
    const saved = repository.read();
    if (!saved) return;
    setName(saved.name);
    setNodes(saved.nodes);
    setEdges(saved.edges);
    setNotice('Rascunho local recuperado.');
  }, [setEdges, setNodes]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const menu = target.closest<HTMLElement>('[data-node-menu]');
      const edit = target.closest<HTMLElement>('[data-node-edit]');
      const duplicate = target.closest<HTMLElement>('[data-node-duplicate]');
      const remove = target.closest<HTMLElement>('[data-node-delete]');
      const cancel = target.closest<HTMLElement>('[data-node-cancel]');
      const save = target.closest<HTMLElement>('[data-node-save]');
      const edgeAction = target.closest<HTMLElement>('[data-edge-action]');

      if (menu?.dataset.nodeMenu) {
        const id = menu.dataset.nodeMenu;
        setNodes((items) => items.map((node) => ({ ...node, data: { ...node.data, menuOpen: node.id === id ? !node.data.menuOpen : false } })));
      }
      if (edit?.dataset.nodeEdit) {
        const id = edit.dataset.nodeEdit;
        setNodes((items) => items.map((node) => ({ ...node, data: { ...node.data, isEditing: node.id === id, menuOpen: false } })));
      }
      if (duplicate?.dataset.nodeDuplicate) duplicateNode(duplicate.dataset.nodeDuplicate);
      if (remove?.dataset.nodeDelete) deleteNode(remove.dataset.nodeDelete);
      if (cancel?.dataset.nodeCancel) setNodes((items) => items.map((node) => node.id === cancel.dataset.nodeCancel ? { ...node, data: { ...node.data, isEditing: false } } : node));
      if (save?.dataset.nodeSave) saveNodeForm(save.dataset.nodeSave, target);
      if (edgeAction?.dataset.edgeAction) {
        setSelectedEdgeId(edgeAction.dataset.edgeAction);
        setSelectedNodeId(null);
        setRelationEditor(edgeAction.dataset.edgeAction);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  });

  const counts = useMemo(() => Object.fromEntries(STAGES.map((stage) => [stage.id, nodes.filter((node) => node.data.stage === stage.id).length])) as Record<StageId, number>, [nodes]);

  function addStage(stage: StageId, position?: { x: number; y: number }) {
    commit();
    const meta = stageMeta(stage);
    const id = `${stage}-${crypto.randomUUID()}`;
    const fallback = { x: 180 + nodes.length * 24, y: 150 + nodes.length * 18 };
    const node: CanvasCardNode = {
      id,
      type: 'canvasCard',
      position: position ?? fallback,
      data: {
        stage,
        title: `${meta.singular} ${counts[stage] + 1}`,
        description: meta.hint,
        details: '',
        isEditing: false,
        menuOpen: false
      }
    };
    setNodes((items) => [...items, node]);
    setSelectedNodeId(id);
    setSelectedEdgeId(null);
    setCreatorOpen(false);
    setNotice(`${meta.singular} criado. Você pode posicioná-lo livremente.`);
  }

  function duplicateNode(id: string) {
    const source = nodes.find((node) => node.id === id);
    if (!source) return;
    commit();
    const duplicate: CanvasCardNode = {
      ...source,
      id: `${source.data.stage}-${crypto.randomUUID()}`,
      position: { x: source.position.x + 36, y: source.position.y + 36 },
      selected: false,
      data: { ...source.data, title: `${source.data.title} cópia`, menuOpen: false, isEditing: false }
    };
    setNodes((items) => [...items, duplicate]);
    setSelectedNodeId(duplicate.id);
  }

  function deleteNode(id: string) {
    commit();
    setNodes((items) => items.filter((node) => node.id !== id));
    setEdges((items) => items.filter((edge) => edge.source !== id && edge.target !== id));
    setSelectedNodeId(null);
    setNotice('Bloco removido.');
  }

  function saveNodeForm(id: string, target: HTMLElement) {
    const card = target.closest(`.${styles.cardNode}`);
    if (!card) return;
    const title = card.querySelector<HTMLInputElement>('[data-node-field="title"]')?.value.trim() ?? '';
    const description = card.querySelector<HTMLTextAreaElement>('[data-node-field="description"]')?.value.trim() ?? '';
    const details = card.querySelector<HTMLTextAreaElement>('[data-node-field="details"]')?.value.trim() ?? '';
    commit();
    setNodes((items) => items.map((node) => node.id === id ? { ...node, data: { ...node.data, title: title || node.data.title, description, details, isEditing: false } } : node));
    setNotice('Bloco atualizado.');
  }

  function validateConnection(connection: Connection) {
    const source = nodes.find((node) => node.id === connection.source);
    const target = nodes.find((node) => node.id === connection.target);
    if (!source || !target) return false;
    if (canConnect(source.data.stage, target.data.stage)) return true;
    setNotice(connectionMessage(source.data.stage, target.data.stage));
    return false;
  }

  function connect(connection: Connection) {
    const source = nodes.find((node) => node.id === connection.source);
    const target = nodes.find((node) => node.id === connection.target);
    if (!source || !target || !validateConnection(connection)) return;
    if (edges.some((edge) => edge.source === connection.source && edge.target === connection.target)) {
      setNotice('Essa conexão já existe.');
      return;
    }
    commit();
    const edge: CanvasRelationEdge = {
      ...connection,
      id: `edge-${crypto.randomUUID()}`,
      type: 'canvasRelation',
      markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
      data: { relationKind: null, relationText: '' }
    };
    setEdges((items) => addEdge(edge, items));
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
    setNotice('Conexão criada. Clique na seta para qualificar a passagem.');
  }

  function saveRelation(kind: RelationKind, text: string) {
    if (!selectedEdge) return;
    const source = nodes.find((node) => node.id === selectedEdge.source);
    const target = nodes.find((node) => node.id === selectedEdge.target);
    if (!source || !target) return;
    const allowed = allowedRelation(source.data.stage, target.data.stage);
    if (allowed !== kind) {
      setNotice(kind === 'risk' ? 'Risco só pode ser usado antes do Resultado.' : 'Hipótese só pode ser usada entre Produto e Resultado.');
      return;
    }
    commit();
    setEdges((items) => items.map((edge) => edge.id === selectedEdge.id ? { ...edge, data: { relationKind: kind, relationText: text } } : edge));
    setRelationEditor(null);
    setNotice(kind === 'risk' ? 'Risco adicionado à conexão.' : 'Hipótese adicionada à conexão.');
  }

  function deleteEdge(id: string) {
    commit();
    setEdges((items) => items.filter((edge) => edge.id !== id));
    setSelectedEdgeId(null);
    setRelationEditor(null);
    setNotice('Conexão removida.');
  }

  function undo() {
    const previous = past.at(-1);
    if (!previous) return;
    setFuture((items) => [snapshot(), ...items]);
    setPast((items) => items.slice(0, -1));
    setName(previous.name);
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setSaveState('dirty');
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setPast((items) => [...items, snapshot()]);
    setFuture((items) => items.slice(1));
    setName(next.name);
    setNodes(next.nodes);
    setEdges(next.edges);
    setSaveState('dirty');
  }

  async function saveDocument() {
    setSaveState('saving');
    const saved = await saveCanvasV4(snapshot());
    repository.write(saved);
    setSaveState('saved');
    setNotice('Tudo salvo.');
  }

  function onStageDragStart(stage: StageId) {
    dragStageRef.current = stage;
  }

  function onCanvasDrop(event: React.DragEvent) {
    event.preventDefault();
    const stage = dragStageRef.current;
    if (!stage) return;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    addStage(stage, position);
    dragStageRef.current = null;
  }

  return (
    <main className={styles.page} onClick={() => setNodes((items) => items.map((node) => ({ ...node, data: { ...node.data, menuOpen: false } })))}>
      <header className={styles.header}>
        <img src="/brand/tmd-construtor-header-canonical.webp" alt="TMD Construtor" />
        <input aria-label="Nome da teoria" value={name} onChange={(event) => { setName(event.target.value); setSaveState('dirty'); }} />
        <div className={styles.headerActions}>
          <button type="button" onClick={undo} disabled={!past.length} title="Desfazer">↶</button>
          <button type="button" onClick={redo} disabled={!future.length} title="Refazer">↷</button>
          <span data-state={saveState}>{saveState === 'saved' ? 'Salvo' : saveState === 'saving' ? 'Salvando…' : 'Não salvo'}</span>
          <button type="button" onClick={saveDocument} title="Salvar">Salvar</button>
        </div>
      </header>

      <section className={styles.workspace}>
        <ReactFlow<CanvasCardNode, CanvasRelationEdge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={connect}
          isValidConnection={validateConnection}
          connectionMode={ConnectionMode.Strict}
          onNodeClick={(_, node) => { setSelectedNodeId(node.id); setSelectedEdgeId(null); }}
          onEdgeClick={(_, edge) => { setSelectedEdgeId(edge.id); setSelectedNodeId(null); }}
          onDrop={onCanvasDrop}
          onDragOver={(event) => event.preventDefault()}
          fitView={false}
          minZoom={0.35}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} size={1} />
        </ReactFlow>

        <section className={styles.creator} data-open={creatorOpen}>
          <button type="button" onClick={() => setCreatorOpen((value) => !value)} title="Adicionar etapas">＋</button>
          {creatorOpen && (
            <div>
              {STAGES.map((stage) => (
                <button
                  type="button"
                  key={stage.id}
                  draggable
                  onDragStart={() => onStageDragStart(stage.id)}
                  onClick={() => addStage(stage.id)}
                >
                  <span>{stage.singular}</span><em>{counts[stage.id]}</em>
                </button>
              ))}
            </div>
          )}
        </section>

        <nav className={styles.canvasToolbar} aria-label="Ações do canvas">
          <button type="button" onClick={() => fitView({ padding: 0.2, duration: 280 })} title="Centralizar visualização">⌖</button>
          <button type="button" onClick={() => setNotice('Alinhamento em colunas será aplicado sem bloquear o arraste livre.')} title="Alinhar em colunas">⇥</button>
          <button type="button" onClick={() => setNotice('Guia aberto.')} title="Guia">?</button>
          <button type="button" onClick={() => setNotice('Exemplos abertos.')} title="Exemplos">☆</button>
          <button type="button" onClick={() => setNotice('Resultado pronto para visualização.')} title="Ver resultado">◫</button>
        </nav>

        <aside className={styles.sidebar} data-empty={!selectedNode && !selectedEdge} data-stage={selectedNode?.data.stage ?? 'input'}>
          {!selectedNode && !selectedEdge && <p>Selecione um bloco ou conexão para editar.</p>}
          {selectedNode && (
            <>
              <div className={styles.sidebarHeading}><span className={styles.stageDot} /><div><small>Bloco selecionado</small><strong>{stageMeta(selectedNode.data.stage).singular}</strong></div></div>
              <label>Título<input value={selectedNode.data.title} onChange={(event) => setNodes((items) => items.map((node) => node.id === selectedNode.id ? { ...node, data: { ...node.data, title: event.target.value } } : node))} /></label>
              <label>Descrição<textarea value={selectedNode.data.description} onChange={(event) => setNodes((items) => items.map((node) => node.id === selectedNode.id ? { ...node, data: { ...node.data, description: event.target.value } } : node))} /></label>
              <details><summary>Mais detalhes</summary><textarea value={selectedNode.data.details} onChange={(event) => setNodes((items) => items.map((node) => node.id === selectedNode.id ? { ...node, data: { ...node.data, details: event.target.value } } : node))} /></details>
              <div className={styles.sidebarActions}>
                <button type="button" onClick={() => setNodes((items) => items.map((node) => node.id === selectedNode.id ? { ...node, data: { ...node.data, isEditing: true } } : node))}>Editar no card</button>
                <button type="button" onClick={() => duplicateNode(selectedNode.id)}>Duplicar</button>
                <button type="button" onClick={() => deleteNode(selectedNode.id)}>Excluir</button>
              </div>
              <button type="button" className={styles.primaryAction} onClick={() => { setSaveState('dirty'); setNotice('Alterações do bloco prontas para salvar.'); }}>Salvar alterações</button>
            </>
          )}
          {selectedEdge && (
            <>
              <div className={styles.sidebarHeading}><span /><div><small>Conexão selecionada</small><strong>Passagem causal</strong></div></div>
              <p>{selectedEdge.data?.relationText || 'Clique na seta da conexão para adicionar risco ou hipótese.'}</p>
              <button type="button" onClick={() => setRelationEditor(selectedEdge.id)}>Editar relação</button>
              <button type="button" onClick={() => deleteEdge(selectedEdge.id)}>Excluir conexão</button>
            </>
          )}
        </aside>

        {relationEditor && selectedEdge && (
          <RelationEditor
            edge={selectedEdge}
            nodes={nodes}
            onClose={() => setRelationEditor(null)}
            onSave={saveRelation}
            onDelete={() => deleteEdge(selectedEdge.id)}
          />
        )}

        <div className={styles.notice} role="status">{notice}</div>
      </section>
    </main>
  );
}

function RelationEditor({ edge, nodes, onClose, onSave, onDelete }: {
  edge: CanvasRelationEdge;
  nodes: CanvasCardNode[];
  onClose(): void;
  onSave(kind: RelationKind, text: string): void;
  onDelete(): void;
}) {
  const source = nodes.find((node) => node.id === edge.source);
  const target = nodes.find((node) => node.id === edge.target);
  const kind = source && target ? allowedRelation(source.data.stage, target.data.stage) : null;
  const [text, setText] = useState(edge.data?.relationText ?? '');
  if (!kind) return null;
  return (
    <section className={styles.relationEditor} data-kind={kind}>
      <div><strong>{kind === 'risk' ? 'Risco da passagem' : 'Hipótese da passagem'}</strong><button type="button" onClick={onClose}>×</button></div>
      <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder={kind === 'risk' ? 'O que pode comprometer esta passagem?' : 'O que precisa ser verdadeiro para esta mudança acontecer?'} />
      <footer><button type="button" onClick={onDelete}>Excluir conexão</button><button type="button" onClick={() => onSave(kind, text)}>Salvar</button></footer>
    </section>
  );
}

export function CanvasV4() {
  return <ReactFlowProvider><CanvasV4Inner /></ReactFlowProvider>;
}

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  ReactFlow,
  ReactFlowProvider,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type OnConnectStartParams,
  type ReactFlowInstance,
} from '@xyflow/react';
import { CANVAS_DOCUMENT_ID, INITIAL_DOCUMENT, NODE_TYPE, STAGES } from './domain/canvas-v2.constants';
import { getConnectionError, isValidCausalConnection } from './domain/canvas-v2.rules';
import type { CanvasDocument, CanvasSnapshot, EdgeEditorKind, TdmCanvasEdge, TdmCanvasNode, TdmStageId } from './domain/canvas-v2.types';
import { LocalCanvasV2Repository } from './repository/local-canvas-v2.repository';
import { useCanvasAutosave } from './hooks/use-canvas-autosave';
import { useCanvasHistory } from './hooks/use-canvas-history';
import { CanvasHeader } from './components/canvas-header';
import { CanvasSidebar } from './components/canvas-sidebar';
import { CanvasToolbar } from './components/canvas-toolbar';
import { StagePalette } from './components/stage-palette';
import { TdmNode } from './components/tdm-node';
import styles from './canvas-v2.module.sass';

const NODE_TYPES = { [NODE_TYPE]: TdmNode };
const REPOSITORY = new LocalCanvasV2Repository();

function CanvasV2Experience() {
  const [document, setDocument] = useState<CanvasDocument>(INITIAL_DOCUMENT);
  const [ready, setReady] = useState(false);
  const [fullMode, setFullMode] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('activity-1');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [edgeEditor, setEdgeEditor] = useState<EdgeEditorKind>(null);
  const [notice, setNotice] = useState('Canvas pronto para editar.');
  const flowRef = useRef<ReactFlowInstance<TdmCanvasNode, TdmCanvasEdge> | null>(null);
  const connectionSourceRef = useRef<string | null>(null);

  const snapshot = useMemo<CanvasSnapshot>(() => ({ nodes: document.nodes, edges: document.edges }), [document.edges, document.nodes]);
  const restore = useCallback((next: CanvasSnapshot) => setDocument((current) => ({ ...current, ...next })), []);
  const history = useCanvasHistory(snapshot, restore);
  const saveStatus = useCanvasAutosave(document, ready, REPOSITORY);

  useEffect(() => {
    let active = true;
    REPOSITORY.load(CANVAS_DOCUMENT_ID).then((stored) => {
      if (!active) return;
      if (stored) setDocument(stored);
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  const counts = useMemo(() => {
    return STAGES.reduce<Record<TdmStageId, number>>((result, stage) => {
      result[stage.id] = document.nodes.filter((node) => node.data.stage === stage.id).length;
      return result;
    }, { input: 0, activity: 0, product: 0, outcome: 0 });
  }, [document.nodes]);

  const selectedNode = document.nodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedEdge = document.edges.find((edge) => edge.id === selectedEdgeId) ?? null;

  const checkpoint = useCallback(() => history.checkpoint(snapshot), [history, snapshot]);

  const addNodeAt = useCallback((stage: TdmStageId, position?: { x: number; y: number }) => {
    checkpoint();
    const definition = STAGES.find((item) => item.id === stage) ?? STAGES[0];
    const count = counts[stage] + 1;
    const next: TdmCanvasNode = {
      id: `${stage}-${crypto.randomUUID()}`,
      type: NODE_TYPE,
      position: position ?? { x: definition.defaultPosition.x + count * 24, y: definition.defaultPosition.y + count * 18 },
      data: { stage, title: `${definition.singular} ${count}`, description: definition.description, details: '' },
    };
    setDocument((current) => ({ ...current, nodes: [...current.nodes, next] }));
    setSelectedNodeId(next.id);
    setSelectedEdgeId(null);
    setSidebarOpen(true);
    setPaletteOpen(false);
    setNotice(`${definition.singular} adicionado.`);
  }, [checkpoint, counts]);

  const onNodesChange = useCallback((changes: NodeChange<TdmCanvasNode>[]) => {
    const structuralChange = changes.some((change) => change.type === 'remove');
    if (structuralChange) checkpoint();
    setDocument((current) => ({ ...current, nodes: applyNodeChanges(changes, current.nodes) }));
  }, [checkpoint]);

  const onEdgesChange = useCallback((changes: EdgeChange<TdmCanvasEdge>[]) => {
    const structuralChange = changes.some((change) => change.type === 'remove');
    if (structuralChange) checkpoint();
    setDocument((current) => ({ ...current, edges: applyEdgeChanges(changes, current.edges) }));
  }, [checkpoint]);

  const validateConnection = useCallback((connection: Connection) => {
    const source = document.nodes.find((node) => node.id === connection.source);
    const target = document.nodes.find((node) => node.id === connection.target);
    if (!source || !target) return false;
    return isValidCausalConnection(source.data.stage, target.data.stage);
  }, [document.nodes]);

  const onConnect = useCallback((connection: Connection) => {
    const source = document.nodes.find((node) => node.id === connection.source);
    const target = document.nodes.find((node) => node.id === connection.target);
    if (!source || !target) return;
    const error = getConnectionError(source, target);
    if (error) {
      setNotice(error);
      return;
    }
    checkpoint();
    const edge: TdmCanvasEdge = { ...connection, id: `${connection.source}-${connection.target}-${crypto.randomUUID()}`, type: 'smoothstep', data: { risk: '', hypothesis: '' } };
    setDocument((current) => ({ ...current, edges: addEdge(edge, current.edges) }));
    setNotice('Conexão criada.');
  }, [checkpoint, document.nodes]);

  const onConnectStart = useCallback((_: MouseEvent | TouchEvent, params: OnConnectStartParams) => {
    connectionSourceRef.current = params.nodeId ?? null;
  }, []);

  const onConnectEnd = useCallback(() => {
    connectionSourceRef.current = null;
  }, []);

  const updateNode = useCallback((field: 'title' | 'description' | 'details', value: string) => {
    if (!selectedNodeId) return;
    setDocument((current) => ({ ...current, nodes: current.nodes.map((node) => node.id === selectedNodeId ? { ...node, data: { ...node.data, [field]: value } } : node) }));
  }, [selectedNodeId]);

  const updateEdge = useCallback((kind: 'risk' | 'hypothesis', value: string) => {
    if (!selectedEdgeId) return;
    setDocument((current) => ({ ...current, edges: current.edges.map((edge) => edge.id === selectedEdgeId ? { ...edge, data: { risk: edge.data?.risk ?? '', hypothesis: edge.data?.hypothesis ?? '', [kind]: value } } : edge) }));
  }, [selectedEdgeId]);

  const duplicateNode = useCallback(() => {
    if (!selectedNode) return;
    checkpoint();
    const duplicate: TdmCanvasNode = { ...selectedNode, id: `${selectedNode.data.stage}-${crypto.randomUUID()}`, position: { x: selectedNode.position.x + 36, y: selectedNode.position.y + 36 }, selected: false };
    setDocument((current) => ({ ...current, nodes: [...current.nodes, duplicate] }));
    setSelectedNodeId(duplicate.id);
  }, [checkpoint, selectedNode]);

  const deleteSelection = useCallback(() => {
    checkpoint();
    if (selectedNodeId) {
      setDocument((current) => ({ ...current, nodes: current.nodes.filter((node) => node.id !== selectedNodeId), edges: current.edges.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId) }));
      setSelectedNodeId(null);
    }
    if (selectedEdgeId) {
      setDocument((current) => ({ ...current, edges: current.edges.filter((edge) => edge.id !== selectedEdgeId) }));
      setSelectedEdgeId(null);
    }
  }, [checkpoint, selectedEdgeId, selectedNodeId]);

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const stage = event.dataTransfer.getData('application/tdm-stage') as TdmStageId;
    if (!STAGES.some((item) => item.id === stage)) return;
    const flow = flowRef.current;
    if (!flow) return;
    addNodeAt(stage, flow.screenToFlowPosition({ x: event.clientX, y: event.clientY }));
  }

  if (!ready) return <div className={styles.clientLoading}>Preparando seu canvas…</div>;

  return (
    <main className={styles.page} data-full={fullMode}>
      <CanvasHeader name={document.name} status={saveStatus} fullMode={fullMode} canUndo={history.canUndo} canRedo={history.canRedo} onNameChange={(name) => setDocument((current) => ({ ...current, name }))} onUndo={history.undo} onRedo={history.redo} onToggleFull={() => setFullMode(true)} />
      <section className={styles.workspace} onDrop={onDrop} onDragOver={(event) => event.preventDefault()}>
        <ReactFlow<TdmCanvasNode, TdmCanvasEdge>
          nodes={document.nodes}
          edges={document.edges}
          nodeTypes={NODE_TYPES}
          onInit={(instance) => { flowRef.current = instance; }}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          isValidConnection={validateConnection}
          onNodeClick={(_, node) => { setSelectedNodeId(node.id); setSelectedEdgeId(null); setSidebarOpen(true); }}
          onEdgeClick={(_, edge) => { setSelectedEdgeId(edge.id); setSelectedNodeId(null); setSidebarOpen(true); }}
          onPaneClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }}
          fitView
          minZoom={0.35}
          maxZoom={1.8}
          deleteKeyCode={['Backspace', 'Delete']}
          className={styles.flow}
          defaultEdgeOptions={{ type: 'smoothstep' }}
        >
          <Background gap={24} size={1} className={styles.flowBackground} />
          <CanvasToolbar fullMode={fullMode} onExitFull={() => setFullMode(false)} />
          <StagePalette open={paletteOpen} counts={counts} onToggle={() => setPaletteOpen((value) => !value)} onAdd={addNodeAt} />
          <div className={styles.notice} role="status">{notice}</div>
        </ReactFlow>
        {!fullMode ? <CanvasSidebar open={sidebarOpen} node={selectedNode} edge={selectedEdge} counts={counts} edgeEditor={edgeEditor} onClose={() => setSidebarOpen(false)} onUpdateNode={updateNode} onDuplicate={duplicateNode} onDelete={deleteSelection} onOpenEdgeEditor={setEdgeEditor} onCloseEdgeEditor={() => setEdgeEditor(null)} onUpdateEdge={updateEdge} /> : null}
      </section>
    </main>
  );
}

export function CanvasV2Page() {
  return <ReactFlowProvider><CanvasV2Experience /></ReactFlowProvider>;
}

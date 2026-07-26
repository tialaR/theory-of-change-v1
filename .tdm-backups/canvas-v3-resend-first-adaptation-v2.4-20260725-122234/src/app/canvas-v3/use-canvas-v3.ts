'use client';

import { useMemo, useRef, useState } from 'react';
import { canConnect, connectionMessage, createId, stageMeta, STAGES, type CanvasEdge, type CanvasNode, type Snapshot, type StageId } from './canvas-v3.model';

const NODE_WIDTH = 260;
const NODE_HEIGHT = 176;
const CANVAS_WIDTH = 2200;
const CANVAS_HEIGHT = 1280;

type DragState = { id: string; offsetX: number; offsetY: number };
type NoticeTone = 'neutral' | 'success' | 'warning';

export function useCanvasV3() {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const [savedVersions, setSavedVersions] = useState<Snapshot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [connectSource, setConnectSource] = useState<string | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [notice, setNotice] = useState({ text: 'Arraste uma etapa para começar.', tone: 'neutral' as NoticeTone });
  const [zoom, setZoom] = useState(1);
  const [theoryName, setTheoryName] = useState('Minha Teoria da Mudança');
  const dragRef = useRef<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const counts = useMemo(() => STAGES.reduce<Record<StageId, number>>((result, stage) => {
    result[stage.id] = nodes.filter((node) => node.stage === stage.id).length;
    return result;
  }, { input: 0, activity: 0, product: 0, outcome: 0 }), [nodes]);

  function snapshot(label: string): Snapshot {
    return { id: createId('snapshot'), label, createdAt: Date.now(), nodes, edges, theoryName };
  }

  function capture(label: string) {
    setPast((items) => [...items, snapshot(label)].slice(-40));
    setFuture([]);
  }

  function notify(text: string, tone: NoticeTone = 'neutral') {
    setNotice({ text, tone });
  }

  function createNode(stage: StageId, x: number, y: number) {
    capture('Etapa criada');
    const meta = stageMeta(stage);
    const count = counts[stage] + 1;
    const node: CanvasNode = {
      id: createId(`node-${stage}`),
      stage,
      title: `${meta.label} ${count}`,
      description: meta.hint,
      details: '',
      x: Math.max(32, Math.min(CANVAS_WIDTH - NODE_WIDTH - 32, x)),
      y: Math.max(32, Math.min(CANVAS_HEIGHT - NODE_HEIGHT - 32, y))
    };
    setNodes((items) => [...items, node]);
    setSelectedId(node.id);
    setEditingId(node.id);
    setMenuId(null);
    notify(`${meta.label} adicionado. Edite no próprio card.`, 'success');
  }

  function startNodeDrag(event: React.PointerEvent<HTMLElement>, node: CanvasNode) {
    const target = event.target as HTMLElement;
    if (target.closest('button, input, textarea, summary, [data-no-drag]')) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    dragRef.current = {
      id: node.id,
      offsetX: (event.clientX - rect.left) / zoom - node.x,
      offsetY: (event.clientY - rect.top) / zoom - node.y
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(node.id);
    setMenuId(null);
  }

  function moveNode(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(24, Math.min(CANVAS_WIDTH - NODE_WIDTH - 24, (event.clientX - rect.left) / zoom - drag.offsetX));
    const y = Math.max(24, Math.min(CANVAS_HEIGHT - NODE_HEIGHT - 24, (event.clientY - rect.top) / zoom - drag.offsetY));
    setNodes((items) => items.map((node) => node.id === drag.id ? { ...node, x, y } : node));
  }

  function finishNodeDrag() {
    if (!dragRef.current) return;
    dragRef.current = null;
    notify('Posição atualizada.', 'success');
  }

  function startConnection(nodeId: string) {
    const source = nodes.find((node) => node.id === nodeId);
    if (!source) return;
    if (source.stage === 'outcome') {
      notify('Resultados encerram o fluxo e não se conectam para frente.', 'warning');
      return;
    }
    setConnectSource(nodeId);
    setSelectedId(nodeId);
    setMenuId(null);
    notify(`Agora clique no ponto esquerdo de uma ${stageMeta(source.stage).next}.`, 'neutral');
  }

  function completeConnection(targetId: string) {
    if (!connectSource) {
      notify('Clique primeiro no ponto direito do card de origem.', 'warning');
      return;
    }
    if (connectSource === targetId) {
      setConnectSource(null);
      notify('Conexão cancelada.', 'neutral');
      return;
    }
    const source = nodes.find((node) => node.id === connectSource);
    const target = nodes.find((node) => node.id === targetId);
    if (!source || !target) return;
    if (!canConnect(source.stage, target.stage)) {
      setConnectSource(null);
      notify(connectionMessage(source.stage, target.stage), 'warning');
      return;
    }
    if (edges.some((edge) => edge.source === source.id && edge.target === target.id)) {
      setConnectSource(null);
      notify('Essa conexão já existe.', 'warning');
      return;
    }
    capture('Conexão criada');
    const edge: CanvasEdge = { id: createId('edge'), source: source.id, target: target.id, risk: '', hypothesis: '' };
    setEdges((items) => [...items, edge]);
    setConnectSource(null);
    setEditingEdgeId(null);
    notify('Conexão criada. Use a seta para qualificar a passagem.', 'success');
  }

  function cancelConnection() {
    setConnectSource(null);
    notify('Conexão cancelada.', 'neutral');
  }

  function updateNode(nodeId: string, patch: Partial<Pick<CanvasNode, 'title' | 'description' | 'details'>>) {
    setNodes((items) => items.map((node) => node.id === nodeId ? { ...node, ...patch } : node));
  }

  function saveNode(nodeId: string) {
    setEditingId(null);
    setSelectedId(nodeId);
    notify('Card atualizado.', 'success');
  }

  function duplicateNode(nodeId: string) {
    const node = nodes.find((item) => item.id === nodeId);
    if (!node) return;
    capture('Card duplicado');
    const copy = { ...node, id: createId(`node-${node.stage}`), x: node.x + 32, y: node.y + 32, title: `${node.title} (cópia)` };
    setNodes((items) => [...items, copy]);
    setSelectedId(copy.id);
    setMenuId(null);
    notify('Card duplicado.', 'success');
  }

  function deleteNode(nodeId: string) {
    capture('Card excluído');
    setNodes((items) => items.filter((node) => node.id !== nodeId));
    setEdges((items) => items.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedId(null);
    setMenuId(null);
    if (connectSource === nodeId) setConnectSource(null);
    notify('Card excluído.', 'neutral');
  }

  function updateEdge(edgeId: string, patch: Partial<Pick<CanvasEdge, 'risk' | 'hypothesis'>>) {
    setEdges((items) => items.map((edge) => edge.id === edgeId ? { ...edge, ...patch } : edge));
  }

  function deleteEdge(edgeId: string) {
    capture('Conexão excluída');
    setEdges((items) => items.filter((edge) => edge.id !== edgeId));
    setEditingEdgeId(null);
    notify('Conexão excluída.', 'neutral');
  }

  function undo() {
    const previous = past.at(-1);
    if (!previous) return;
    setFuture((items) => [snapshot('Refazer'), ...items]);
    setPast((items) => items.slice(0, -1));
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setTheoryName(previous.theoryName);
    notify('Alteração desfeita.', 'neutral');
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setPast((items) => [...items, snapshot('Desfazer')]);
    setFuture((items) => items.slice(1));
    setNodes(next.nodes);
    setEdges(next.edges);
    setTheoryName(next.theoryName);
    notify('Alteração refeita.', 'neutral');
  }

  function saveVersion() {
    const version = snapshot(`Versão ${savedVersions.length + 1}`);
    setSavedVersions((items) => [version, ...items].slice(0, 12));
    try { localStorage.setItem('tdm-canvas-v3', JSON.stringify(version)); } catch {}
    notify('Versão salva neste navegador.', 'success');
  }

  function restoreVersion(version: Snapshot) {
    capture('Versão restaurada');
    setNodes(version.nodes);
    setEdges(version.edges);
    setTheoryName(version.theoryName);
    notify(`${version.label} restaurada.`, 'success');
  }

  function alignColumns() {
    if (!nodes.length) return;
    capture('Alinhamento em colunas');
    const columns: Record<StageId, number> = { input: 160, activity: 640, product: 1120, outcome: 1600 };
    const next = STAGES.flatMap((stage) => nodes.filter((node) => node.stage === stage.id).map((node, index) => ({ ...node, x: columns[stage.id], y: 180 + index * 230 })));
    setNodes(next);
    notify('Etapas alinhadas em colunas.', 'success');
  }

  function centerFlow() {
    if (!nodes.length) return;
    capture('Fluxo centralizado');
    const minX = Math.min(...nodes.map((node) => node.x));
    const maxX = Math.max(...nodes.map((node) => node.x + NODE_WIDTH));
    const minY = Math.min(...nodes.map((node) => node.y));
    const maxY = Math.max(...nodes.map((node) => node.y + NODE_HEIGHT));
    const dx = CANVAS_WIDTH / 2 - (minX + maxX) / 2;
    const dy = CANVAS_HEIGHT / 2 - (minY + maxY) / 2;
    setNodes((items) => items.map((node) => ({ ...node, x: node.x + dx, y: node.y + dy })));
    notify('Fluxo centralizado.', 'success');
  }

  return {
    canvasRef, nodes, edges, counts, past, future, savedVersions, selectedId, editingId, menuId, connectSource, editingEdgeId, notice, zoom, theoryName,
    constants: { NODE_WIDTH, NODE_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT },
    setSelectedId, setEditingId, setMenuId, setEditingEdgeId, setZoom, setTheoryName,
    createNode, startNodeDrag, moveNode, finishNodeDrag, startConnection, completeConnection, cancelConnection, updateNode, saveNode,
    duplicateNode, deleteNode, updateEdge, deleteEdge, undo, redo, saveVersion, restoreVersion, alignColumns, centerFlow, notify
  };
}

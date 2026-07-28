'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  useEdgesState,
  useNodesState,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type XYPosition
} from '@xyflow/react';
import { centralizeCanvasColumns, organizeCanvasFlow } from '../../application/canvas-layout';
import { evaluateCanvasConnection } from '../../domain/canvas-connection-policy';
import type { CanvasRelationKind, CanvasStageId } from '../../domain/canvas-project';
import { CANVAS_DIMENSIONS } from '../../domain/canvas-ui.constants';
import { getCanvasStageMeta } from '../../domain/canvas-stage.constants';
import type {
  CanvasCausalEdge,
  CanvasFlowSnapshot,
  CanvasStageNode
} from '../../react-flow/canvas-flow.types';

export type CanvasRelationDraftInput = {
  title: string;
  description: string;
  advancedDetails: string;
};

export type CanvasConnectResult =
  | { ok: true; edge: CanvasCausalEdge; relationKind: CanvasRelationKind }
  | { ok: false; message: string };

function cloneSnapshot(nodes: CanvasStageNode[], edges: CanvasCausalEdge[]): CanvasFlowSnapshot {
  return {
    nodes: structuredClone(nodes),
    edges: structuredClone(edges)
  };
}

function createInitialNode(stage: CanvasStageId, id: string, count: number, position: XYPosition): CanvasStageNode {
  const meta = getCanvasStageMeta(stage);

  return {
    id,
    type: 'canvas-stage',
    position,
    data: {
      stage,
      title: `${meta.singular} ${count}`,
      description: meta.hint,
      advancedDetails: ''
    }
  };
}

export function useCanvasFlowController(
  initialNodes: CanvasStageNode[] = [],
  initialEdges: CanvasCausalEdge[] = []
) {
  const [nodes, setNodes, onNodesChangeBase] = useNodesState<CanvasStageNode>(initialNodes);
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState<CanvasCausalEdge>(initialEdges);
  const [history, setHistory] = useState<CanvasFlowSnapshot[]>([]);
  const [future, setFuture] = useState<CanvasFlowSnapshot[]>([]);
  const idCounterRef = useRef(10);
  const dragSnapshotCapturedRef = useRef(false);

  const counts = useMemo(() => ({
    input: nodes.filter((node) => node.data.stage === 'input').length,
    activity: nodes.filter((node) => node.data.stage === 'activity').length,
    product: nodes.filter((node) => node.data.stage === 'product').length,
    outcome: nodes.filter((node) => node.data.stage === 'outcome').length
  }), [nodes]);

  const capture = useCallback(() => {
    const snapshot = cloneSnapshot(nodes, edges);
    setHistory((items) => [...items, snapshot].slice(-CANVAS_DIMENSIONS.historyLimit));
    setFuture([]);
  }, [edges, nodes]);

  const createNode = useCallback((stage: CanvasStageId, position: XYPosition) => {
    capture();
    idCounterRef.current += 1;
    const node = createInitialNode(
      stage,
      `node-${stage}-${idCounterRef.current}`,
      counts[stage] + 1,
      position
    );
    setNodes((items) => [...items, node]);
    return node;
  }, [capture, counts, setNodes]);

  const updateNode = useCallback((nodeId: string, patch: Partial<CanvasStageNode['data']>) => {
    setNodes((items) => items.map((node) => (
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...patch } }
        : node
    )));
  }, [setNodes]);

  const saveNodeDraft = useCallback((nodeId: string, patch: CanvasStageNode['data']) => {
    capture();
    updateNode(nodeId, patch);
  }, [capture, updateNode]);

  const duplicateNode = useCallback((nodeId: string) => {
    const source = nodes.find((node) => node.id === nodeId);
    if (!source) return null;
    capture();
    idCounterRef.current += 1;
    const duplicate: CanvasStageNode = {
      ...structuredClone(source),
      id: `node-${source.data.stage}-${idCounterRef.current}`,
      position: {
        x: Math.min(
          CANVAS_DIMENSIONS.width - CANVAS_DIMENSIONS.nodeWidth - CANVAS_DIMENSIONS.nodeEdgeGap,
          source.position.x + CANVAS_DIMENSIONS.duplicateOffset
        ),
        y: Math.min(
          CANVAS_DIMENSIONS.height - CANVAS_DIMENSIONS.nodeHeight - CANVAS_DIMENSIONS.nodeEdgeGap,
          source.position.y + CANVAS_DIMENSIONS.duplicateOffset
        )
      },
      data: { ...source.data, title: `${source.data.title} cópia` },
      selected: false
    };
    setNodes((items) => [...items, duplicate]);
    return duplicate;
  }, [capture, nodes, setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    const node = nodes.find((item) => item.id === nodeId);
    if (!node) return null;
    capture();
    setNodes((items) => items.filter((item) => item.id !== nodeId));
    setEdges((items) => items.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    return node;
  }, [capture, nodes, setEdges, setNodes]);

  const connectNodes = useCallback((connection: Connection): CanvasConnectResult => {
    if (!connection.source || !connection.target || connection.source === connection.target) {
      return { ok: false, message: 'Escolha outro card como destino da conexão.' };
    }
    const source = nodes.find((node) => node.id === connection.source);
    const target = nodes.find((node) => node.id === connection.target);
    if (!source || !target) {
      return { ok: false, message: 'Não foi possível localizar os cards dessa conexão.' };
    }
    const decision = evaluateCanvasConnection(source.data.stage, target.data.stage);
    if (!decision.allowed) return { ok: false, message: decision.message };
    if (edges.some((edge) => edge.source === source.id && edge.target === target.id)) {
      return { ok: false, message: 'Essa conexão já existe no canvas.' };
    }

    capture();
    idCounterRef.current += 1;
    const edge: CanvasCausalEdge = {
      id: `edge-${idCounterRef.current}`,
      type: 'canvas-causal',
      source: source.id,
      target: target.id,
      data: {}
    };
    setEdges((items) => [...items, edge]);
    return { ok: true, edge, relationKind: decision.relationKind };
  }, [capture, edges, nodes, setEdges]);

  const getRelationKind = useCallback((edge: CanvasCausalEdge): CanvasRelationKind | null => {
    const source = nodes.find((node) => node.id === edge.source);
    const target = nodes.find((node) => node.id === edge.target);
    if (!source || !target) return null;
    const decision = evaluateCanvasConnection(source.data.stage, target.data.stage);
    return decision.allowed ? decision.relationKind : null;
  }, [nodes]);

  const saveRelation = useCallback((edgeId: string, kind: CanvasRelationKind, draft: CanvasRelationDraftInput) => {
    capture();
    setEdges((items) => items.map((edge) => (
      edge.id === edgeId
        ? {
            ...edge,
            data: {
              relationKind: kind,
              relationTitle: draft.title.trim(),
              relationText: draft.description.trim(),
              relationAdvancedDetails: draft.advancedDetails.trim()
            }
          }
        : edge
    )));
  }, [capture, setEdges]);

  const removeRelation = useCallback((edgeId: string) => {
    capture();
    setEdges((items) => items.map((edge) => (
      edge.id === edgeId ? { ...edge, data: {} } : edge
    )));
  }, [capture, setEdges]);

  const deleteEdge = useCallback((edgeId: string) => {
    capture();
    setEdges((items) => items.filter((edge) => edge.id !== edgeId));
  }, [capture, setEdges]);

  const undo = useCallback(() => {
    const previous = history.at(-1);
    if (!previous) return false;
    setFuture((items) => [cloneSnapshot(nodes, edges), ...items]);
    setHistory((items) => items.slice(0, -1));
    setNodes(previous.nodes);
    setEdges(previous.edges);
    return true;
  }, [edges, history, nodes, setEdges, setNodes]);

  const redo = useCallback(() => {
    const next = future[0];
    if (!next) return false;
    setHistory((items) => [...items, cloneSnapshot(nodes, edges)]);
    setFuture((items) => items.slice(1));
    setNodes(next.nodes);
    setEdges(next.edges);
    return true;
  }, [edges, future, nodes, setEdges, setNodes]);

  const centralizeColumns = useCallback(() => {
    capture();
    setNodes((items) => centralizeCanvasColumns(items));
  }, [capture, setNodes]);

  const organizeFlow = useCallback(() => {
    capture();
    setNodes((items) => organizeCanvasFlow(items, edges));
  }, [capture, edges, setNodes]);

  const onNodesChange = useCallback((changes: NodeChange<CanvasStageNode>[]) => {
    onNodesChangeBase(changes);
  }, [onNodesChangeBase]);

  const onEdgesChange = useCallback((changes: EdgeChange<CanvasCausalEdge>[]) => {
    onEdgesChangeBase(changes);
  }, [onEdgesChangeBase]);

  const beginNodeDrag = useCallback(() => {
    if (dragSnapshotCapturedRef.current) return;
    capture();
    dragSnapshotCapturedRef.current = true;
  }, [capture]);

  const finishNodeDrag = useCallback(() => {
    dragSnapshotCapturedRef.current = false;
  }, []);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    counts,
    history,
    future,
    canUndo: history.length > 0,
    canRedo: future.length > 0,
    createNode,
    updateNode,
    saveNodeDraft,
    duplicateNode,
    deleteNode,
    connectNodes,
    getRelationKind,
    saveRelation,
    removeRelation,
    deleteEdge,
    undo,
    redo,
    centralizeColumns,
    organizeFlow,
    beginNodeDrag,
    finishNodeDrag
  };
}

export type CanvasFlowController = ReturnType<typeof useCanvasFlowController>;

'use client';

import { useCallback } from 'react';
import { evaluateCanvasConnection } from '../../../domain/canvas-connection-policy';
import { createCanvasEdgeId, type CanvasIdTokenFactory } from '../../../domain/canvas-element-id';
import type { CanvasRelationKind } from '../../../domain/canvas-project';
import { appendCanvasEngineEdge, removeCanvasEngineEdge, updateCanvasEngineEdge } from '../../../engine/canvas-engine';
import { resolveCanvasEngineConnection } from '../../../engine/canvas-engine';
import type { CanvasConnectionCandidate } from '../../../react-flow/canvas-flow.contracts';
import type { CanvasCausalEdge, CanvasStageNode } from '../../../react-flow/canvas-flow.types';
import type { CanvasConnectResult, CanvasRelationDraftInput, CaptureCanvasSnapshot, SetCanvasEdges } from './types';

type Options = {
  nodes: CanvasStageNode[];
  edges: CanvasCausalEdge[];
  setEdges: SetCanvasEdges;
  capture: CaptureCanvasSnapshot;
  createIdToken: CanvasIdTokenFactory;
};

export function useCanvasEdgeCommands({ nodes, edges, setEdges, capture, createIdToken }: Options) {
  const connectNodes = useCallback((connection: CanvasConnectionCandidate): CanvasConnectResult => {
    const resolution = resolveCanvasEngineConnection({
      nodes,
      edges,
      candidate: connection,
      evaluateTransition: evaluateCanvasConnection
    });

    if (!resolution.ok) return resolution;

    capture();
    const occupiedIds = new Set([...nodes.map((node) => node.id), ...edges.map((edge) => edge.id)]);
    const edge: CanvasCausalEdge = {
      id: createCanvasEdgeId(occupiedIds, createIdToken),
      type: 'canvas-causal',
      source: resolution.source.id,
      target: resolution.target.id,
      data: {}
    };
    setEdges((items) => appendCanvasEngineEdge({ nodes, edges: items }, edge).state.edges);
    return { ok: true, edge, relationKind: resolution.relationKind };
  }, [capture, createIdToken, edges, nodes, setEdges]);

  const getRelationKind = useCallback((edge: CanvasCausalEdge): CanvasRelationKind | null => {
    const source = nodes.find((node) => node.id === edge.source);
    const target = nodes.find((node) => node.id === edge.target);
    if (!source || !target) return null;
    const decision = evaluateCanvasConnection(source.data.stage, target.data.stage);
    return decision.allowed ? decision.relationKind : null;
  }, [nodes]);

  const saveRelation = useCallback((edgeId: string, kind: CanvasRelationKind, draft: CanvasRelationDraftInput) => {
    capture();
    setEdges((items) => updateCanvasEngineEdge({ nodes, edges: items }, edgeId, (edge) => ({
      ...edge,
      data: {
        relationKind: kind,
        relationTitle: draft.title.trim(),
        relationText: draft.description.trim(),
        relationAdvancedDetails: draft.advancedDetails.trim()
      }
    })).state.edges);
  }, [capture, nodes, setEdges]);

  const removeRelation = useCallback((edgeId: string) => {
    capture();
    setEdges((items) => updateCanvasEngineEdge({ nodes, edges: items }, edgeId, (edge) => ({ ...edge, data: {} })).state.edges);
  }, [capture, nodes, setEdges]);

  const deleteEdge = useCallback((edgeId: string) => {
    capture();
    setEdges((items) => removeCanvasEngineEdge({ nodes, edges: items }, edgeId).state.edges);
  }, [capture, nodes, setEdges]);

  return { connectNodes, getRelationKind, saveRelation, removeRelation, deleteEdge };
}

import { useMemo } from 'react';
import type { CanvasRelationKind } from '../../domain/canvas-project';
import type { CanvasCausalEdge, CanvasStageNode } from '../../react-flow/canvas-flow.types';

type UseCanvasSelectionInput = {
  nodes: CanvasStageNode[];
  edges: CanvasCausalEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  getRelationKind: (edge: CanvasCausalEdge) => CanvasRelationKind | null;
};

export function useCanvasSelection({
  nodes,
  edges,
  selectedNodeId,
  selectedEdgeId,
  getRelationKind
}: UseCanvasSelectionInput) {
  return useMemo(() => {
    const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
    const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId) ?? null;
    const selectedEdgeSource = selectedEdge
      ? nodes.find((node) => node.id === selectedEdge.source) ?? null
      : null;
    const selectedEdgeTarget = selectedEdge
      ? nodes.find((node) => node.id === selectedEdge.target) ?? null
      : null;
    const selectedRelationKind = selectedEdge ? getRelationKind(selectedEdge) : null;

    return {
      selectedNode,
      selectedEdge,
      selectedEdgeSource,
      selectedEdgeTarget,
      selectedRelationKind
    };
  }, [edges, getRelationKind, nodes, selectedEdgeId, selectedNodeId]);
}

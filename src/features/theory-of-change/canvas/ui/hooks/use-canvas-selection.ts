import { useMemo } from 'react';
import type { CanvasRelationKind } from '../../domain/canvas-project';
import { resolveCanvasEngineSelection } from '../../engine/canvas-engine';
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
    const selection = resolveCanvasEngineSelection({
      nodes,
      edges,
      selectedNodeId,
      selectedEdgeId,
      resolveEdgeMetadata: getRelationKind
    });

    return {
      selectedNode: selection.selectedNode,
      selectedEdge: selection.selectedEdge,
      selectedEdgeSource: selection.selectedEdgeSource,
      selectedEdgeTarget: selection.selectedEdgeTarget,
      selectedRelationKind: selection.selectedEdgeMetadata
    };
  }, [edges, getRelationKind, nodes, selectedEdgeId, selectedNodeId]);
}

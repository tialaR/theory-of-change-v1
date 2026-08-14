export type CanvasEngineSelectableNode = {
  id: string;
};

export type CanvasEngineSelectableEdge = {
  id: string;
  source: string;
  target: string;
};

export type CanvasEngineSelection<TNode, TEdge, TEdgeMetadata> = {
  selectedNode: TNode | null;
  selectedEdge: TEdge | null;
  selectedEdgeSource: TNode | null;
  selectedEdgeTarget: TNode | null;
  selectedEdgeMetadata: TEdgeMetadata | null;
};

type ResolveCanvasEngineSelectionInput<
  TNode extends CanvasEngineSelectableNode,
  TEdge extends CanvasEngineSelectableEdge,
  TEdgeMetadata
> = {
  nodes: readonly TNode[];
  edges: readonly TEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  resolveEdgeMetadata: (edge: TEdge) => TEdgeMetadata | null;
};

export function resolveCanvasEngineSelection<
  TNode extends CanvasEngineSelectableNode,
  TEdge extends CanvasEngineSelectableEdge,
  TEdgeMetadata
>({
  nodes,
  edges,
  selectedNodeId,
  selectedEdgeId,
  resolveEdgeMetadata
}: ResolveCanvasEngineSelectionInput<TNode, TEdge, TEdgeMetadata>): CanvasEngineSelection<TNode, TEdge, TEdgeMetadata> {
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId) ?? null;
  const selectedEdgeSource = selectedEdge
    ? nodes.find((node) => node.id === selectedEdge.source) ?? null
    : null;
  const selectedEdgeTarget = selectedEdge
    ? nodes.find((node) => node.id === selectedEdge.target) ?? null
    : null;

  return {
    selectedNode,
    selectedEdge,
    selectedEdgeSource,
    selectedEdgeTarget,
    selectedEdgeMetadata: selectedEdge ? resolveEdgeMetadata(selectedEdge) : null
  };
}

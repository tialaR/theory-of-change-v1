export type CanvasEngineEntity = { id: string };
export type CanvasEngineEdgeEntity = CanvasEngineEntity & { source: string; target: string };

export type CanvasEngineCommandResult<TNode, TEdge, TEntity> = {
  state: { nodes: TNode[]; edges: TEdge[] };
  entity: TEntity | null;
};

export function appendCanvasEngineNode<TNode extends CanvasEngineEntity, TEdge>(state: { nodes: TNode[]; edges: TEdge[] }, node: TNode) {
  return { state: { nodes: [...state.nodes, node], edges: state.edges }, entity: node };
}

export function updateCanvasEngineNode<TNode extends CanvasEngineEntity, TEdge>(
  state: { nodes: TNode[]; edges: TEdge[] }, nodeId: string, update: (node: TNode) => TNode
): CanvasEngineCommandResult<TNode, TEdge, TNode> {
  const node = state.nodes.find((item) => item.id === nodeId);
  if (!node) return { state, entity: null };
  const updated = update(node);
  return { state: { nodes: state.nodes.map((item) => item.id === nodeId ? updated : item), edges: state.edges }, entity: updated };
}

export function removeCanvasEngineNode<TNode extends CanvasEngineEntity, TEdge extends CanvasEngineEdgeEntity>(
  state: { nodes: TNode[]; edges: TEdge[] }, nodeId: string
): CanvasEngineCommandResult<TNode, TEdge, TNode> {
  const node = state.nodes.find((item) => item.id === nodeId);
  if (!node) return { state, entity: null };
  return {
    state: {
      nodes: state.nodes.filter((item) => item.id !== nodeId),
      edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    },
    entity: node
  };
}

export function appendCanvasEngineEdge<TNode, TEdge extends CanvasEngineEntity>(state: { nodes: TNode[]; edges: TEdge[] }, edge: TEdge) {
  return { state: { nodes: state.nodes, edges: [...state.edges, edge] }, entity: edge };
}

export function updateCanvasEngineEdge<TNode, TEdge extends CanvasEngineEntity>(
  state: { nodes: TNode[]; edges: TEdge[] }, edgeId: string, update: (edge: TEdge) => TEdge
): CanvasEngineCommandResult<TNode, TEdge, TEdge> {
  const edge = state.edges.find((item) => item.id === edgeId);
  if (!edge) return { state, entity: null };
  const updated = update(edge);
  return { state: { nodes: state.nodes, edges: state.edges.map((item) => item.id === edgeId ? updated : item) }, entity: updated };
}

export function removeCanvasEngineEdge<TNode, TEdge extends CanvasEngineEntity>(
  state: { nodes: TNode[]; edges: TEdge[] }, edgeId: string
): CanvasEngineCommandResult<TNode, TEdge, TEdge> {
  const edge = state.edges.find((item) => item.id === edgeId);
  if (!edge) return { state, entity: null };
  return { state: { nodes: state.nodes, edges: state.edges.filter((item) => item.id !== edgeId) }, entity: edge };
}

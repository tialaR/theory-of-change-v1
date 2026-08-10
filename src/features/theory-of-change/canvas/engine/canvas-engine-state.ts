export type CanvasEngineState<TNode, TEdge> = {
  nodes: TNode[];
  edges: TEdge[];
};

export function cloneCanvasEngineState<TNode, TEdge>(state: CanvasEngineState<TNode, TEdge>): CanvasEngineState<TNode, TEdge> {
  return structuredClone(state);
}

export function createCanvasEngineState<TNode, TEdge>(nodes: TNode[] = [], edges: TEdge[] = []): CanvasEngineState<TNode, TEdge> {
  return cloneCanvasEngineState({ nodes, edges });
}

export function appendCanvasEngineHistory<TNode, TEdge>(
  history: CanvasEngineState<TNode, TEdge>[],
  state: CanvasEngineState<TNode, TEdge>,
  limit: number
): CanvasEngineState<TNode, TEdge>[] {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError('Canvas engine history limit must be a positive integer.');
  }

  return [...history, cloneCanvasEngineState(state)].slice(-limit);
}

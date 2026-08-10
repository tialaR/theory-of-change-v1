export type CanvasEngineLayoutPosition = { x: number; y: number };

export type CanvasEngineLayoutNode<TStage extends string> = {
  id: string;
  position: CanvasEngineLayoutPosition;
  measured?: { height?: number };
  data: { stage: TStage };
};

export type CanvasEngineLayoutEdge = {
  source: string;
  target: string;
};

export type CanvasEngineLayoutPolicy<TStage extends string> = {
  stages: readonly TStage[];
  columnX: Readonly<Record<TStage, number>>;
  columnStartY: number;
  defaultNodeHeight: number;
  nodeGap: number;
};

function positionStageNodes<TStage extends string, TNode extends CanvasEngineLayoutNode<TStage>>(
  stageNodes: TNode[],
  stage: TStage,
  policy: CanvasEngineLayoutPolicy<TStage>
): Map<string, CanvasEngineLayoutPosition> {
  let nextY = policy.columnStartY;
  const positions = new Map<string, CanvasEngineLayoutPosition>();

  stageNodes.forEach((node) => {
    positions.set(node.id, { x: policy.columnX[stage], y: nextY });
    nextY += (node.measured?.height ?? policy.defaultNodeHeight) + policy.nodeGap;
  });

  return positions;
}

function applyPositions<TStage extends string, TNode extends CanvasEngineLayoutNode<TStage>>(
  nodes: TNode[],
  positionsById: Map<string, CanvasEngineLayoutPosition>
): TNode[] {
  return nodes.map((node) => ({
    ...node,
    position: positionsById.get(node.id) ?? node.position
  }));
}

export function centralizeCanvasEngineColumns<
  TStage extends string,
  TNode extends CanvasEngineLayoutNode<TStage>
>(nodes: TNode[], policy: CanvasEngineLayoutPolicy<TStage>): TNode[] {
  const positionsById = new Map<string, CanvasEngineLayoutPosition>();

  policy.stages.forEach((stage) => {
    const stageNodes = nodes
      .filter((node) => node.data.stage === stage)
      .sort((first, second) => first.position.y - second.position.y || first.id.localeCompare(second.id));

    positionStageNodes(stageNodes, stage, policy).forEach((position, nodeId) => {
      positionsById.set(nodeId, position);
    });
  });

  return applyPositions(nodes, positionsById);
}

export function organizeCanvasEngineFlow<
  TStage extends string,
  TNode extends CanvasEngineLayoutNode<TStage>
>(
  nodes: TNode[],
  edges: CanvasEngineLayoutEdge[],
  policy: CanvasEngineLayoutPolicy<TStage>
): TNode[] {
  const connectionCounts = new Map<string, number>();

  edges.forEach((edge) => {
    connectionCounts.set(edge.source, (connectionCounts.get(edge.source) ?? 0) + 1);
    connectionCounts.set(edge.target, (connectionCounts.get(edge.target) ?? 0) + 1);
  });

  const positionsById = new Map<string, CanvasEngineLayoutPosition>();

  policy.stages.forEach((stage) => {
    const stageNodes = nodes
      .filter((node) => node.data.stage === stage)
      .sort((first, second) => (
        (connectionCounts.get(second.id) ?? 0) - (connectionCounts.get(first.id) ?? 0)
        || first.position.y - second.position.y
        || first.id.localeCompare(second.id)
      ));

    positionStageNodes(stageNodes, stage, policy).forEach((position, nodeId) => {
      positionsById.set(nodeId, position);
    });
  });

  return applyPositions(nodes, positionsById);
}

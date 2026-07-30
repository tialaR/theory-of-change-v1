import type { CanvasProject, CanvasStageId } from '../domain/canvas-project';
import type { CanvasCausalEdge, CanvasStageNode } from './canvas-flow.types';

export type CanvasFlowGraph = {
  nodes: CanvasStageNode[];
  edges: CanvasCausalEdge[];
};

function isValidOrder(order: number | undefined) {
  return Number.isSafeInteger(order) && (order ?? -1) >= 0;
}

function createOrderByNodeId(nodes: CanvasStageNode[]) {
  const orderByNodeId = new Map<string, number>();
  const stages: CanvasStageId[] = ['input', 'activity', 'product', 'outcome'];

  for (const stage of stages) {
    const stageNodes = nodes.filter((node) => node.data.stage === stage);
    const existingOrdersAreUsable = stageNodes.every((node) => isValidOrder(node.data.order))
      && new Set(stageNodes.map((node) => node.data.order)).size === stageNodes.length;

    const ordered = [...stageNodes].sort((first, second) => {
      if (existingOrdersAreUsable) {
        return (first.data.order ?? 0) - (second.data.order ?? 0)
          || first.id.localeCompare(second.id);
      }

      return first.position.y - second.position.y
        || first.position.x - second.position.x
        || first.id.localeCompare(second.id);
    });

    ordered.forEach((node, order) => orderByNodeId.set(node.id, order));
  }

  return orderByNodeId;
}

export function toCanvasFlowGraph(project: CanvasProject): CanvasFlowGraph {
  return {
    nodes: project.nodes.map((node) => ({
      id: node.id,
      type: 'canvas-stage',
      position: node.position,
      data: {
        stage: node.stage,
        order: node.order,
        title: node.title,
        description: node.description,
        advancedDetails: node.advancedDetails
      }
    })),
    edges: project.connections.map((connection) => ({
      id: connection.id,
      type: 'canvas-causal',
      source: connection.sourceId,
      target: connection.targetId,
      data: connection.relation
        ? {
            relationKind: connection.relation.kind,
            relationTitle: connection.relation.title,
            relationText: connection.relation.description,
            relationAdvancedDetails: connection.relation.advancedDetails
          }
        : {}
    }))
  };
}

export function applyCanvasFlowGraph(project: CanvasProject, graph: CanvasFlowGraph): CanvasProject {
  const orderByNodeId = createOrderByNodeId(graph.nodes);

  return {
    ...project,
    nodes: graph.nodes.map((node) => ({
      id: node.id,
      stage: node.data.stage,
      order: orderByNodeId.get(node.id) ?? 0,
      title: node.data.title,
      description: node.data.description,
      advancedDetails: node.data.advancedDetails,
      position: node.position
    })),
    connections: graph.edges.map((edge) => ({
      id: edge.id,
      sourceId: edge.source,
      targetId: edge.target,
      relation: edge.data?.relationKind
        ? {
            kind: edge.data.relationKind,
            title: edge.data.relationTitle ?? '',
            description: edge.data.relationText ?? '',
            advancedDetails: edge.data.relationAdvancedDetails ?? ''
          }
        : undefined
    }))
  };
}

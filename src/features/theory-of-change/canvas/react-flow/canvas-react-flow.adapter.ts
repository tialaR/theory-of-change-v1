import type { CanvasProject } from '../domain/canvas-project';
import type { CanvasCausalEdge, CanvasStageNode } from './canvas-flow.types';

export type CanvasFlowGraph = {
  nodes: CanvasStageNode[];
  edges: CanvasCausalEdge[];
};

export function toCanvasFlowGraph(project: CanvasProject): CanvasFlowGraph {
  return {
    nodes: project.nodes.map((node) => ({
      id: node.id,
      type: 'canvas-stage',
      position: node.position,
      data: {
        stage: node.stage,
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
  return {
    ...project,
    nodes: graph.nodes.map((node) => ({
      id: node.id,
      stage: node.data.stage,
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

import type { Edge, Node } from '@xyflow/react';
import type { CanvasProject } from '../domain/canvas-project';

export type CanvasFlowNodeData = {
  projectNodeId: string;
  stage: string;
  title: string;
  description: string;
  advancedDetails: string;
};

export type CanvasFlowEdgeData = {
  projectConnectionId: string;
  relationKind?: 'risk' | 'hypothesis';
};

export type CanvasFlowGraph = {
  nodes: Array<Node<CanvasFlowNodeData>>;
  edges: Array<Edge<CanvasFlowEdgeData>>;
};

export function toCanvasFlowGraph(project: CanvasProject): CanvasFlowGraph {
  return {
    nodes: project.nodes.map((node) => ({
      id: node.id,
      type: 'canvas-stage',
      position: node.position,
      data: {
        projectNodeId: node.id,
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
      data: {
        projectConnectionId: connection.id,
        relationKind: connection.relation?.kind
      }
    }))
  };
}

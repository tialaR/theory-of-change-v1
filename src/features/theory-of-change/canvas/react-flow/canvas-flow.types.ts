import type { Edge, Node } from '@xyflow/react';
import type { CanvasRelationKind, CanvasStageId } from '../domain/canvas-project';

export type CanvasStageNodeData = {
  stage: CanvasStageId;
  title: string;
  description: string;
  advancedDetails: string;
};

export type CanvasStageNode = Node<CanvasStageNodeData, 'canvas-stage'>;

export type CanvasCausalEdgeData = {
  relationKind?: CanvasRelationKind;
  relationTitle?: string;
  relationText?: string;
  relationAdvancedDetails?: string;
};

export type CanvasCausalEdge = Edge<CanvasCausalEdgeData, 'canvas-causal'>;

export type CanvasFlowSnapshot = {
  nodes: CanvasStageNode[];
  edges: CanvasCausalEdge[];
};

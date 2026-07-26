import type { Edge, Node, XYPosition } from '@xyflow/react';

export const TDM_STAGE_IDS = ['input', 'activity', 'product', 'outcome'] as const;
export type TdmStageId = (typeof TDM_STAGE_IDS)[number];

export type TdmNodeData = {
  stage: TdmStageId;
  title: string;
  description: string;
  details: string;
};

export type TdmEdgeData = {
  risk: string;
  hypothesis: string;
};

export type TdmCanvasNode = Node<TdmNodeData, 'tdm'>;
export type TdmCanvasEdge = Edge<TdmEdgeData>;

export type CanvasDocument = {
  id: string;
  name: string;
  nodes: TdmCanvasNode[];
  edges: TdmCanvasEdge[];
  updatedAt: string;
};

export type CanvasSnapshot = Pick<CanvasDocument, 'nodes' | 'edges'>;

export type SaveStatus = 'saved' | 'dirty' | 'saving' | 'error';
export type EditorMode = 'node' | 'edge' | 'summary';
export type EdgeEditorKind = 'risk' | 'hypothesis' | null;

export type StageDefinition = {
  id: TdmStageId;
  label: string;
  singular: string;
  description: string;
  defaultPosition: XYPosition;
};

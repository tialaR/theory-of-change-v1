import type { CanvasStageId } from '../domain/canvas-project';
import { CANVAS_COLUMN_X, CANVAS_DIMENSIONS } from '../domain/canvas-ui.constants';
import {
  centralizeCanvasEngineColumns,
  organizeCanvasEngineFlow,
  type CanvasEngineLayoutEdge,
  type CanvasEngineLayoutNode,
  type CanvasEngineLayoutPolicy,
  type CanvasEngineLayoutPosition
} from '../engine/canvas-engine';

export type CanvasLayoutPosition = CanvasEngineLayoutPosition;
export type CanvasLayoutNode = CanvasEngineLayoutNode<CanvasStageId>;
export type CanvasLayoutEdge = CanvasEngineLayoutEdge;

const CANVAS_LAYOUT_POLICY: CanvasEngineLayoutPolicy<CanvasStageId> = {
  stages: Object.keys(CANVAS_COLUMN_X) as CanvasStageId[],
  columnX: CANVAS_COLUMN_X,
  columnStartY: CANVAS_DIMENSIONS.columnStartY,
  defaultNodeHeight: CANVAS_DIMENSIONS.nodeHeight,
  nodeGap: 42
};

export function centralizeCanvasColumns<TNode extends CanvasLayoutNode>(nodes: TNode[]): TNode[] {
  return centralizeCanvasEngineColumns(nodes, CANVAS_LAYOUT_POLICY);
}

export function organizeCanvasFlow<TNode extends CanvasLayoutNode>(
  nodes: TNode[],
  edges: CanvasLayoutEdge[]
): TNode[] {
  return organizeCanvasEngineFlow(nodes, edges, CANVAS_LAYOUT_POLICY);
}

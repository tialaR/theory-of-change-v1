import type { CanvasStageId } from '../domain/canvas-project';
import { CANVAS_COLUMN_X, CANVAS_DIMENSIONS } from '../domain/canvas-ui.constants';
import type { CanvasCausalEdge, CanvasStageNode } from '../react-flow/canvas-flow.types';

function getStageNodes(nodes: CanvasStageNode[], stage: CanvasStageId) {
  return nodes.filter((node) => node.data.stage === stage);
}

export function centralizeCanvasColumns(nodes: CanvasStageNode[]): CanvasStageNode[] {
  return nodes.map((node) => {
    const stageNodes = getStageNodes(nodes, node.data.stage)
      .sort((first, second) => first.position.y - second.position.y || first.id.localeCompare(second.id));
    const index = stageNodes.findIndex((candidate) => candidate.id === node.id);

    return {
      ...node,
      position: {
        x: CANVAS_COLUMN_X[node.data.stage],
        y: CANVAS_DIMENSIONS.columnStartY + Math.max(index, 0) * CANVAS_DIMENSIONS.columnGapY
      }
    };
  });
}

export function organizeCanvasFlow(
  nodes: CanvasStageNode[],
  edges: CanvasCausalEdge[]
): CanvasStageNode[] {
  function connectionCount(nodeId: string) {
    return edges.filter((edge) => edge.source === nodeId || edge.target === nodeId).length;
  }

  return nodes.map((node) => {
    const stageNodes = getStageNodes(nodes, node.data.stage)
      .sort((first, second) => (
        connectionCount(second.id) - connectionCount(first.id)
        || first.position.y - second.position.y
      ));
    const index = stageNodes.findIndex((candidate) => candidate.id === node.id);

    return {
      ...node,
      position: {
        x: CANVAS_COLUMN_X[node.data.stage],
        y: CANVAS_DIMENSIONS.columnStartY + Math.max(index, 0) * CANVAS_DIMENSIONS.columnGapY
      }
    };
  });
}

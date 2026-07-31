import type { CanvasStageId } from '../domain/canvas-project';
import { CANVAS_COLUMN_X, CANVAS_DIMENSIONS } from '../domain/canvas-ui.constants';
import type { CanvasCausalEdge, CanvasStageNode } from '../react-flow/canvas-flow.types';

const DEFAULT_NODE_HEIGHT = CANVAS_DIMENSIONS.nodeHeight;
const COLUMN_NODE_GAP = 42;

function getStageNodes(nodes: CanvasStageNode[], stage: CanvasStageId) {
  return nodes.filter((node) => node.data.stage === stage);
}

function getNodeHeight(node: CanvasStageNode) {
  return node.measured?.height ?? DEFAULT_NODE_HEIGHT;
}

function positionStageNodes(
  stageNodes: CanvasStageNode[],
  stage: CanvasStageId
): Map<string, CanvasStageNode['position']> {
  let nextY = CANVAS_DIMENSIONS.columnStartY;
  const positions = new Map<string, CanvasStageNode['position']>();

  stageNodes.forEach((node) => {
    positions.set(node.id, { x: CANVAS_COLUMN_X[stage], y: nextY });
    nextY += getNodeHeight(node) + COLUMN_NODE_GAP;
  });

  return positions;
}

export function centralizeCanvasColumns(nodes: CanvasStageNode[]): CanvasStageNode[] {
  const positionsById = new Map<string, CanvasStageNode['position']>();

  (Object.keys(CANVAS_COLUMN_X) as CanvasStageId[]).forEach((stage) => {
    const stageNodes = getStageNodes(nodes, stage)
      .sort((first, second) => first.position.y - second.position.y || first.id.localeCompare(second.id));

    positionStageNodes(stageNodes, stage).forEach((position, nodeId) => {
      positionsById.set(nodeId, position);
    });
  });

  return nodes.map((node) => ({
    ...node,
    position: positionsById.get(node.id) ?? node.position
  }));
}

export function organizeCanvasFlow(
  nodes: CanvasStageNode[],
  edges: CanvasCausalEdge[]
): CanvasStageNode[] {
  function connectionCount(nodeId: string) {
    return edges.filter((edge) => edge.source === nodeId || edge.target === nodeId).length;
  }

  const positionsById = new Map<string, CanvasStageNode['position']>();

  (Object.keys(CANVAS_COLUMN_X) as CanvasStageId[]).forEach((stage) => {
    const stageNodes = getStageNodes(nodes, stage)
      .sort((first, second) => (
        connectionCount(second.id) - connectionCount(first.id)
        || first.position.y - second.position.y
        || first.id.localeCompare(second.id)
      ));

    positionStageNodes(stageNodes, stage).forEach((position, nodeId) => {
      positionsById.set(nodeId, position);
    });
  });

  return nodes.map((node) => ({
    ...node,
    position: positionsById.get(node.id) ?? node.position
  }));
}

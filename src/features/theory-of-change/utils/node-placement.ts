import type { XYPosition } from '@xyflow/react';
import type { TdmStage } from '../domain/tdm-stages';
import type { TdmNode } from '../domain/tdm-types';
import { getStageCreationPosition } from './stage-creation';

const DUPLICATE_OFFSET_X = 24;
const DUPLICATE_OFFSET_Y = 84;
const FORM_CREATE_GAP_Y = 84;
const COLLISION_WIDTH = 140;
const COLLISION_HEIGHT = 72;
const MAX_DUPLICATE_COLLISION_ATTEMPTS = 3;

function hasNodeCollision(candidate: XYPosition, nodes: TdmNode[], excludeNodeId?: string) {
  return nodes.some((node) => {
    if (excludeNodeId && node.id === excludeNodeId) {
      return false;
    }

    const deltaX = Math.abs(node.position.x - candidate.x);
    const deltaY = Math.abs(node.position.y - candidate.y);

    return deltaX < COLLISION_WIDTH && deltaY < COLLISION_HEIGHT;
  });
}

function getNearbyDuplicatePosition(sourceNode: TdmNode, nodes: TdmNode[]): XYPosition {
  for (let index = 1; index <= MAX_DUPLICATE_COLLISION_ATTEMPTS; index += 1) {
    const candidate = {
      x: sourceNode.position.x + DUPLICATE_OFFSET_X * index,
      y: sourceNode.position.y + DUPLICATE_OFFSET_Y * index
    };

    if (!hasNodeCollision(candidate, nodes, sourceNode.id)) {
      return candidate;
    }
  }

  return {
    x: sourceNode.position.x + DUPLICATE_OFFSET_X,
    y: sourceNode.position.y + DUPLICATE_OFFSET_Y
  };
}

export function getDuplicateNodePosition(sourceNode: TdmNode, nodes: TdmNode[]): XYPosition {
  return getNearbyDuplicatePosition(sourceNode, nodes);
}

function getInitialStagePosition(stage: TdmStage): XYPosition {
  return getStageCreationPosition(stage, 0);
}

export function getCreateNodePosition(stage: TdmStage, nodes: TdmNode[]): XYPosition {
  const sameStageNodes = nodes.filter((node) => node.stage === stage);

  if (sameStageNodes.length > 0) {
    const lowestNode = sameStageNodes.reduce((lowest, node) => {
      return node.position.y > lowest.position.y ? node : lowest;
    }, sameStageNodes[0]);

    return {
      x: lowestNode.position.x,
      y: lowestNode.position.y + FORM_CREATE_GAP_Y
    };
  }

  return getInitialStagePosition(stage);
}

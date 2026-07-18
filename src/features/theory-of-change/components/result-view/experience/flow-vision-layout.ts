import { TDM_STAGE_ORDER, type TdmStage } from '@/features/theory-of-change/domain/tdm-stages';
import type { TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import { groupNodesByStage } from '../result-view-utils';

export type FlowVisionCardPosition = {
  x: number;
  y: number;
};

export type FlowVisionStageLane = {
  stage: TdmStage;
  x: number;
  y: number;
  width: number;
};

/** Compact card slot for free-form placement (~14.5rem × content height). */
export const FLOW_VISION_CARD_WIDTH = 232;
export const FLOW_VISION_CARD_SLOT_HEIGHT = 148;
export const FLOW_VISION_COLUMN_GAP = 104;
export const FLOW_VISION_ORIGIN_X = 36;
export const FLOW_VISION_ORIGIN_Y = 44;
export const FLOW_VISION_BOARD_PADDING_X = 36;
export const FLOW_VISION_BOARD_PADDING_Y = 36;
export const FLOW_VISION_STAGE_INDICATOR_WIDTH = 40;

const STAGE_COLUMN_INDEX: Record<TdmStage, number> = {
  input: 0,
  activity: 1,
  output: 2,
  outcome: 3
};

function stageColumnX(stage: TdmStage) {
  return FLOW_VISION_ORIGIN_X + STAGE_COLUMN_INDEX[stage] * (FLOW_VISION_CARD_WIDTH + FLOW_VISION_COLUMN_GAP);
}

function rowY(rowIndex: number) {
  return FLOW_VISION_ORIGIN_Y + rowIndex * FLOW_VISION_CARD_SLOT_HEIGHT;
}

/**
 * Deterministic free-form positions by stage column + row index.
 * Outcome is vertically centered against the product column span.
 */
export function getFlowVisionNodePositions(nodes: TdmNode[]): Map<string, FlowVisionCardPosition> {
  const grouped = groupNodesByStage(nodes);
  const positions = new Map<string, FlowVisionCardPosition>();

  TDM_STAGE_ORDER.forEach((stage) => {
    const stageNodes = grouped[stage];
    const x = stageColumnX(stage);

    if (stage === 'outcome' && stageNodes.length > 0) {
      const products = grouped.output;
      const productYs = products.map((_, index) => rowY(index));
      const centerY =
        productYs.length > 0
          ? productYs.reduce((sum, value) => sum + value, 0) / productYs.length
          : rowY(0);

      stageNodes.forEach((node, index) => {
        const offset = (index - (stageNodes.length - 1) / 2) * FLOW_VISION_CARD_SLOT_HEIGHT;
        positions.set(node.id, { x, y: centerY + offset });
      });
      return;
    }

    stageNodes.forEach((node, index) => {
      positions.set(node.id, { x, y: rowY(index) });
    });
  });

  return positions;
}

export function getFlowVisionStageLanes(nodes: TdmNode[]): FlowVisionStageLane[] {
  const grouped = groupNodesByStage(nodes);

  return TDM_STAGE_ORDER.filter((stage) => grouped[stage].length > 0).map((stage) => ({
    stage,
    x: stageColumnX(stage),
    y: FLOW_VISION_ORIGIN_Y - 22,
    width: FLOW_VISION_STAGE_INDICATOR_WIDTH
  }));
}

export function getFlowVisionBoardSize(nodes: TdmNode[]) {
  const positions = getFlowVisionNodePositions(nodes);
  let maxRight = FLOW_VISION_ORIGIN_X + FLOW_VISION_CARD_WIDTH;
  let maxBottom = FLOW_VISION_ORIGIN_Y + FLOW_VISION_CARD_SLOT_HEIGHT;

  positions.forEach((position) => {
    maxRight = Math.max(maxRight, position.x + FLOW_VISION_CARD_WIDTH);
    maxBottom = Math.max(maxBottom, position.y + FLOW_VISION_CARD_SLOT_HEIGHT);
  });

  return {
    width: Math.ceil(maxRight + FLOW_VISION_BOARD_PADDING_X),
    height: Math.ceil(maxBottom + FLOW_VISION_BOARD_PADDING_Y)
  };
}

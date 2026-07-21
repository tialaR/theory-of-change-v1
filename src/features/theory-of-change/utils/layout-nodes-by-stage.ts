import { TDM_STAGE_ORDER } from '../domain/tdm-stages';
import { TdmNode } from '../domain/tdm-types';
import { CANVAS_COLUMN_ROW_GAP, getNodeLayoutHeight } from './stage-creation';

const BASE_Y = 140;

export function layoutNodesByStage(nodes: TdmNode[]) {
  const columnXByStage = {
    input: 120,
    activity: 460,
    output: 800,
    outcome: 1140
  } as const;

  const columnYByStage = {
    input: BASE_Y,
    activity: BASE_Y,
    output: BASE_Y,
    outcome: BASE_Y
  } as Record<(typeof TDM_STAGE_ORDER)[number], number>;

  return nodes.map((node) => {
    const stageIndex = Math.max(TDM_STAGE_ORDER.indexOf(node.stage), 0);
    const stage = TDM_STAGE_ORDER[stageIndex];
    const currentY = columnYByStage[stage];
    const measuredHeight = getNodeLayoutHeight(node);

    columnYByStage[stage] = currentY + measuredHeight + CANVAS_COLUMN_ROW_GAP;

    return {
      ...node,
      position: {
        x: columnXByStage[stage],
        y: currentY
      }
    };
  });
}

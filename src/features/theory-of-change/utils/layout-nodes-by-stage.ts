import { TDM_STAGE_ORDER } from '../domain/tdm-stages';
import { TdmNode } from '../domain/tdm-types';
import { STAGE_ROW_GAP } from './stage-creation';

export function layoutNodesByStage(nodes: TdmNode[]) {
  const columnXByStage = {
    input: 120,
    activity: 460,
    output: 800,
    outcome: 1140
  } as const;

  const stageOffsets = {
    input: 0,
    activity: 0,
    output: 0,
    outcome: 0
  } as Record<(typeof TDM_STAGE_ORDER)[number], number>;

  return nodes.map((node) => {
    const stageIndex = Math.max(TDM_STAGE_ORDER.indexOf(node.stage), 0);
    const stage = TDM_STAGE_ORDER[stageIndex];
    const offset = stageOffsets[stage];

    stageOffsets[stage] += 1;

    return {
      ...node,
      position: {
        x: columnXByStage[stage],
        y: 140 + offset * STAGE_ROW_GAP
      }
    };
  });
}

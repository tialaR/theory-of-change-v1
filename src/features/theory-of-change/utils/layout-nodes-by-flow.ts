import { TDM_STAGE_ORDER, type TdmStage } from '../domain/tdm-stages';
import type { TdmEdge, TdmNode } from '../domain/tdm-types';
import { CANVAS_COLUMN_ROW_GAP, getNodeLayoutHeight } from './stage-creation';

const COLUMN_X_BY_STAGE: Record<TdmStage, number> = {
  input: 120,
  activity: 460,
  output: 800,
  outcome: 1140
};

const BASE_Y = 140;

function computeFlowRanks(nodes: TdmNode[], edges: TdmEdge[]): Map<string, number> {
  const ranks = new Map<string, number>();
  const nodesByStage = TDM_STAGE_ORDER.reduce(
    (accumulator, stage) => {
      accumulator[stage] = nodes.filter((node) => node.stage === stage);
      return accumulator;
    },
    {} as Record<TdmStage, TdmNode[]>
  );

  nodesByStage.input.forEach((node, index) => {
    ranks.set(node.id, index);
  });

  for (const stage of TDM_STAGE_ORDER.slice(1)) {
    const stageNodes = nodesByStage[stage];

    const rankedNodes = stageNodes
      .map((node) => {
        const incomingEdges = edges.filter((edge) => edge.target === node.id);
        const sourceRanks = incomingEdges
          .map((edge) => ranks.get(edge.source))
          .filter((rank): rank is number => rank !== undefined);

        const flowRank =
          sourceRanks.length > 0
            ? sourceRanks.reduce((sum, rank) => sum + rank, 0) / sourceRanks.length
            : ranks.size + stageNodes.indexOf(node) * 0.01;

        return { node, flowRank };
      })
      .sort((left, right) => left.flowRank - right.flowRank || left.node.id.localeCompare(right.node.id));

    rankedNodes.forEach(({ node, flowRank }, index) => {
      ranks.set(node.id, flowRank + index * 0.001);
    });
  }

  return ranks;
}

export function layoutNodesByFlow(nodes: TdmNode[], edges: TdmEdge[]) {
  const flowRanks = computeFlowRanks(nodes, edges);

  const columnYByStage = {
    input: BASE_Y,
    activity: BASE_Y,
    output: BASE_Y,
    outcome: BASE_Y
  } as Record<TdmStage, number>;

  const sortedNodes = [...nodes].sort((left, right) => {
    const stageDiff = TDM_STAGE_ORDER.indexOf(left.stage) - TDM_STAGE_ORDER.indexOf(right.stage);
    if (stageDiff !== 0) {
      return stageDiff;
    }

    const leftRank = flowRanks.get(left.id) ?? 0;
    const rightRank = flowRanks.get(right.id) ?? 0;
    return leftRank - rightRank || left.id.localeCompare(right.id);
  });

  return sortedNodes.map((node) => {
    const currentY = columnYByStage[node.stage];
    const measuredHeight = getNodeLayoutHeight(node);

    columnYByStage[node.stage] = currentY + measuredHeight + CANVAS_COLUMN_ROW_GAP;

    return {
      ...node,
      position: {
        x: COLUMN_X_BY_STAGE[node.stage],
        y: currentY
      }
    };
  });
}

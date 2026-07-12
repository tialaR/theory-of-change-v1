import { TDM_STAGE_ORDER, type TdmStage } from '../../../domain/tdm-stages';
import { TDM_STAGE_LABELS } from '../../../domain/tdm-stages';
import type { TdmEdge, TdmNode, TdmMarkerType } from '../../../domain/tdm-types';
import { getEdgeMarkerText, getEdgeMarkerType, groupNodesByStage } from '../result-view-utils';
import type { DiagramEdge, DiagramNode } from './types';

const STAGE_X: Record<TdmStage, number> = {
  input: 110,
  activity: 380,
  output: 650,
  outcome: 890
};

const ROW_Y = [150, 295, 440, 585];

export function buildDiagramNodes(nodes: TdmNode[]): DiagramNode[] {
  const grouped = groupNodesByStage(nodes);

  return TDM_STAGE_ORDER.flatMap((stage, columnIndex) =>
    grouped[stage].map((node, rowIndex) => ({
      ...node,
      columnIndex,
      rowIndex,
      x: STAGE_X[stage],
      y: ROW_Y[rowIndex] ?? ROW_Y[ROW_Y.length - 1] + (rowIndex - ROW_Y.length + 1) * 130
    }))
  );
}

export function buildDiagramEdges(edges: TdmEdge[], diagramNodes: DiagramNode[]): DiagramEdge[] {
  const nodeMap = new Map(diagramNodes.map((node) => [node.id, node]));

  return edges
    .map((edge) => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);

      if (!source || !target) {
        return null;
      }

      const startX = source.x + 91;
      const startY = source.y;
      const endX = target.x - 91;
      const endY = target.y;
      const control = Math.max(Math.abs(endX - startX) * 0.42, 76);
      const path = `M ${startX} ${startY} C ${startX + control} ${startY}, ${endX - control} ${endY}, ${endX} ${endY}`;

      return {
        ...edge,
        path,
        startX,
        startY,
        endX,
        endY,
        midX: (startX + endX) / 2,
        midY: (startY + endY) / 2
      };
    })
    .filter(Boolean) as DiagramEdge[];
}

export type ConnectedFlow = {
  nodeIds: Set<string>;
  edgeIds: Set<string>;
};

function collectEdgeFlowAncestors(nodeId: string, edges: TdmEdge[], nodeIds: Set<string>, edgeIds: Set<string>) {
  for (const edge of edges) {
    if (edge.target !== nodeId || nodeIds.has(edge.source)) {
      continue;
    }

    nodeIds.add(edge.source);
    edgeIds.add(edge.id);
    collectEdgeFlowAncestors(edge.source, edges, nodeIds, edgeIds);
  }
}

function collectEdgeFlowDescendants(nodeId: string, edges: TdmEdge[], nodeIds: Set<string>, edgeIds: Set<string>) {
  for (const edge of edges) {
    if (edge.source !== nodeId || nodeIds.has(edge.target)) {
      continue;
    }

    nodeIds.add(edge.target);
    edgeIds.add(edge.id);
    collectEdgeFlowDescendants(edge.target, edges, nodeIds, edgeIds);
  }
}

export function getConnectedFlowFromNode(nodeId: string | null, edges: TdmEdge[]): ConnectedFlow {
  if (!nodeId) {
    return { nodeIds: new Set(), edgeIds: new Set() };
  }

  const nodeIds = new Set<string>([nodeId]);
  const edgeIds = new Set<string>();

  collectEdgeFlowAncestors(nodeId, edges, nodeIds, edgeIds);
  collectEdgeFlowDescendants(nodeId, edges, nodeIds, edgeIds);

  return { nodeIds, edgeIds };
}

export function getNodeRelationSet(nodeId: string | null, edges: TdmEdge[]): Set<string> {
  return getConnectedFlowFromNode(nodeId, edges).nodeIds;
}

export function getEdgeRelationSet(relatedNodes: Set<string>, edges: TdmEdge[]): Set<string> {
  const relatedEdges = new Set<string>();

  edges.forEach((edge) => {
    if (relatedNodes.has(edge.source) && relatedNodes.has(edge.target)) {
      relatedEdges.add(edge.id);
    }
  });

  return relatedEdges;
}

export function getConnectionBadge(edge: TdmEdge): 'R' | 'H' | 'R/H' | null {
  const badges = getEdgeBadges(edge);
  const hasRisk = badges.some((badge) => badge.label === 'R');
  const hasHypothesis = badges.some((badge) => badge.label === 'H');

  if (hasRisk && hasHypothesis) {
    return 'R/H';
  }

  if (hasRisk) {
    return 'R';
  }

  if (hasHypothesis) {
    return 'H';
  }

  return null;
}

export function getFlowPathSummary(nodeId: string, nodes: TdmNode[], edges: TdmEdge[]): string {
  const { nodeIds } = getConnectedFlowFromNode(nodeId, edges);
  const selectedNodes = nodes.filter((node) => nodeIds.has(node.id));

  return TDM_STAGE_ORDER.map((stage) => {
    const titles = selectedNodes.filter((node) => node.stage === stage).map((node) => node.title);
    return titles.length ? titles.join(' · ') : null;
  })
    .filter(Boolean)
    .join(' → ');
}

export function getFlowMarkerTexts(nodeId: string, edges: TdmEdge[]) {
  const { edgeIds } = getConnectedFlowFromNode(nodeId, edges);
  const risks: string[] = [];
  const hypotheses: string[] = [];

  edges.forEach((edge) => {
    if (!edgeIds.has(edge.id)) {
      return;
    }

    getEdgeBadges(edge).forEach((badge) => {
      if (badge.label === 'R' && badge.text) {
        risks.push(badge.text);
      }

      if (badge.label === 'H' && badge.text) {
        hypotheses.push(badge.text);
      }
    });
  });

  return { risks, hypotheses };
}

export function getEdgeBadges(edge: TdmEdge): Array<{ type: TdmMarkerType; label: 'R' | 'H'; text: string }> {
  const primaryType = getEdgeMarkerType(edge);
  const badges: Array<{ type: TdmMarkerType; label: 'R' | 'H'; text: string }> = [];
  const riskText = getEdgeMarkerText(edge, 'risk')?.trim();
  const hypothesisText = getEdgeMarkerText(edge, 'hypothesis')?.trim();

  if (primaryType === 'risk' && edge.markerText?.trim() && !riskText) {
    badges.push({ type: 'risk', label: 'R', text: edge.markerText.trim() });
  }

  if (riskText) {
    badges.push({ type: 'risk', label: 'R', text: riskText });
  }

  if (primaryType === 'hypothesis' && edge.markerText?.trim() && !hypothesisText) {
    badges.push({ type: 'hypothesis', label: 'H', text: edge.markerText.trim() });
  }

  if (hypothesisText) {
    badges.push({ type: 'hypothesis', label: 'H', text: hypothesisText });
  }

  return badges;
}

export function getStageCounts(nodes: TdmNode[]) {
  const grouped = groupNodesByStage(nodes);

  return TDM_STAGE_ORDER.map((stage) => ({
    stage,
    count: grouped[stage].length
  }));
}

type StageBucket = {
  stage: TdmStage;
  label: string;
  accent: string;
  nodes: TdmNode[];
};

type ExperienceConnection = {
  edge: TdmEdge;
  source: TdmNode;
  target: TdmNode;
  badges: string[];
};

export function getStageBuckets(nodes: TdmNode[]): StageBucket[] {
  const grouped = groupNodesByStage(nodes);

  return TDM_STAGE_ORDER.map((stage) => ({
    stage,
    label: TDM_STAGE_LABELS[stage],
    accent: stage === 'outcome' ? 'rgba(74, 222, 128, 0.85)' : 'rgba(244, 244, 245, 0.72)',
    nodes: grouped[stage]
  }));
}

function getNodeBucketPosition(node: TdmNode, buckets: StageBucket[]) {
  const stageIndex = buckets.findIndex((bucket) => bucket.stage === node.stage);
  const bucket = buckets[stageIndex];
  const itemIndex = bucket?.nodes.findIndex((item) => item.id === node.id) ?? 0;
  const count = bucket?.nodes.length ?? 1;
  const x = 6 + stageIndex * 24;
  const baseY = 18;
  const gap = count === 1 ? 0 : 14;
  const y = baseY + itemIndex * gap + (count === 1 ? 8 : 0);
  return { x, y };
}

export function getConnectionLinePoints(source: TdmNode, target: TdmNode, buckets: StageBucket[]) {
  const sourcePos = getNodeBucketPosition(source, buckets);
  const targetPos = getNodeBucketPosition(target, buckets);
  return {
    sourceX: sourcePos.x + 14,
    sourceY: sourcePos.y + 5,
    targetX: targetPos.x,
    targetY: targetPos.y + 5
  };
}

export function getExperienceConnections(nodes: TdmNode[], edges: TdmEdge[]): ExperienceConnection[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return edges
    .map((edge) => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) return null;
      const badges = getEdgeBadges(edge).map((badge) => badge.label);
      return { edge, source, target, badges };
    })
    .filter(Boolean) as ExperienceConnection[];
}

export function isNodeRelatedToSelection(
  nodeId: string,
  selectedNodeId: string | null,
  connections: ExperienceConnection[]
) {
  if (!selectedNodeId) return true;
  if (nodeId === selectedNodeId) return true;

  const related = new Set<string>([selectedNodeId]);
  collectFlowDescendants(selectedNodeId, connections, related);
  collectFlowAncestors(selectedNodeId, connections, related);
  return related.has(nodeId);
}

function collectFlowDescendants(nodeId: string, connections: ExperienceConnection[], ids: Set<string>) {
  for (const connection of connections) {
    if (connection.source.id === nodeId && !ids.has(connection.target.id)) {
      ids.add(connection.target.id);
      collectFlowDescendants(connection.target.id, connections, ids);
    }
  }
}

function collectFlowAncestors(nodeId: string, connections: ExperienceConnection[], ids: Set<string>) {
  for (const connection of connections) {
    if (connection.target.id === nodeId && !ids.has(connection.source.id)) {
      ids.add(connection.source.id);
      collectFlowAncestors(connection.source.id, connections, ids);
    }
  }
}

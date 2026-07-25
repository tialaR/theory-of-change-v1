import type { TdmEdge, TdmNode, TdmMarkerType } from '../../domain/tdm-types';
import { TDM_STAGE_ORDER, type TdmStage } from '../../domain/tdm-stages';
import type {
  CausalFamily,
  ColumnHeaderState,
  ResultBridgeKind,
  ResultMarkerItem
} from './result-view-utils.types';
import { FOCUS_STAGE_TITLES } from './result-view-utils.shared';

export function groupNodesByStage(nodes: TdmNode[]): Record<TdmStage, TdmNode[]> {
  return TDM_STAGE_ORDER.reduce<Record<TdmStage, TdmNode[]>>(
    (accumulator, stage) => {
      accumulator[stage] = nodes.filter((node) => node.stage === stage);
      return accumulator;
    },
    { input: [], activity: [], output: [], outcome: [] }
  );
}

export function getEdgeMarkerText(edge: TdmEdge, markerType: TdmMarkerType): string | undefined {
  if (markerType === 'risk') {
    return edge.data?.riskText ?? (edge.markerType === 'risk' ? edge.markerText : undefined);
  }

  return edge.data?.hypothesisText ?? (edge.markerType === 'hypothesis' ? edge.markerText : undefined);
}

export function getEdgeMarkerType(edge: TdmEdge): TdmMarkerType | undefined {
  return edge.markerType ?? edge.data?.markerType;
}

/** @deprecated Prefer getCausalFamily — kept for backward compatibility */
export function getRelatedNodeIds(nodeId: string, edges: TdmEdge[]): Set<string> {
  return new Set<string>([nodeId, ...getAncestors(nodeId, edges), ...getDescendants(nodeId, edges)]);
}

/** @deprecated Prefer getCausalFamily — kept for backward compatibility */
export function getRelatedEdgeIds(nodeId: string, edges: TdmEdge[]): Set<string> {
  return getRelatedConnections(getRelatedNodeIds(nodeId, edges), edges);
}

/** Ancestors along causal edges (sources → selected). */
export function getAncestors(nodeId: string, edges: TdmEdge[]): Set<string> {
  return getConnectedAncestors(nodeId, edges);
}

/** Descendants along causal edges (selected → targets). */
export function getDescendants(nodeId: string, edges: TdmEdge[]): Set<string> {
  return getConnectedDescendants(nodeId, edges);
}

export function getConnectedAncestors(nodeId: string, edges: TdmEdge[]): Set<string> {
  const ancestors = new Set<string>();
  const queue = [nodeId];
  const visited = new Set<string>([nodeId]);

  while (queue.length > 0) {
    const current = queue.shift()!;

    edges.forEach((edge) => {
      if (edge.target !== current || visited.has(edge.source)) {
        return;
      }

      visited.add(edge.source);
      ancestors.add(edge.source);
      queue.push(edge.source);
    });
  }

  return ancestors;
}

export function getConnectedDescendants(nodeId: string, edges: TdmEdge[]): Set<string> {
  const descendants = new Set<string>();
  const queue = [nodeId];
  const visited = new Set<string>([nodeId]);

  while (queue.length > 0) {
    const current = queue.shift()!;

    edges.forEach((edge) => {
      if (edge.source !== current || visited.has(edge.target)) {
        return;
      }

      visited.add(edge.target);
      descendants.add(edge.target);
      queue.push(edge.target);
    });
  }

  return descendants;
}

function collectFamilyEdges(relatedNodeIds: Set<string>, edges: TdmEdge[]): Set<string> {
  const relatedEdgeIds = new Set<string>();

  edges.forEach((edge) => {
    if (relatedNodeIds.has(edge.source) && relatedNodeIds.has(edge.target)) {
      relatedEdgeIds.add(edge.id);
    }
  });

  return relatedEdgeIds;
}

/** All edges whose endpoints belong to the causal family. */
export function getRelatedConnections(relatedNodeIds: Set<string>, edges: TdmEdge[]): Set<string> {
  return collectFamilyEdges(relatedNodeIds, edges);
}

export function getConnectionMarkersForFamily(
  relatedEdgeIds: Set<string>,
  nodes: TdmNode[],
  edges: TdmEdge[]
): { risks: ResultMarkerItem[]; hypotheses: ResultMarkerItem[] } {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const risks: ResultMarkerItem[] = [];
  const hypotheses: ResultMarkerItem[] = [];

  relatedEdgeIds.forEach((edgeId) => {
    const edge = edges.find((candidate) => candidate.id === edgeId);

    if (!edge) {
      return;
    }

    const markerType = getEdgeMarkerType(edge);

    if (!markerType) {
      return;
    }

    const text = getEdgeMarkerText(edge, markerType)?.trim();

    if (!text) {
      return;
    }

    const item: ResultMarkerItem = {
      edgeId,
      kind: markerType === 'risk' ? 'risk' : 'hypothesis',
      text,
      sourceTitle: nodeMap.get(edge.source)?.title ?? '—',
      targetTitle: nodeMap.get(edge.target)?.title ?? '—'
    };

    if (markerType === 'risk') {
      risks.push(item);
      return;
    }

    hypotheses.push(item);
  });

  return { risks, hypotheses };
}

export function getIncomingNodes(nodeId: string, nodes: TdmNode[], edges: TdmEdge[]): TdmNode[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return edges
    .filter((edge) => edge.target === nodeId)
    .map((edge) => nodeMap.get(edge.source))
    .filter(Boolean) as TdmNode[];
}

export function getOutgoingNodes(nodeId: string, nodes: TdmNode[], edges: TdmEdge[]): TdmNode[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return edges
    .filter((edge) => edge.source === nodeId)
    .map((edge) => nodeMap.get(edge.target))
    .filter(Boolean) as TdmNode[];
}

export function getMarkersForFocus(
  nodeId: string,
  nodes: TdmNode[],
  edges: TdmEdge[],
  kind: ResultBridgeKind
): ResultMarkerItem[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const relatedEdgeIds = getRelatedConnections(getRelatedNodeIds(nodeId, edges), edges);
  const items: ResultMarkerItem[] = [];

  relatedEdgeIds.forEach((edgeId) => {
    const edge = edges.find((candidate) => candidate.id === edgeId);

    if (!edge || getEdgeMarkerType(edge) !== kind) {
      return;
    }

    const text = getEdgeMarkerText(edge, kind)?.trim();

    if (!text) {
      return;
    }

    items.push({
      edgeId,
      kind,
      text,
      sourceTitle: nodeMap.get(edge.source)?.title ?? '—',
      targetTitle: nodeMap.get(edge.target)?.title ?? '—'
    });
  });

  return items;
}

export function getRisksForFocus(nodeId: string, nodes: TdmNode[], edges: TdmEdge[]): ResultMarkerItem[] {
  return getMarkersForFocus(nodeId, nodes, edges, 'risk');
}

export function getHypothesesForFocus(nodeId: string, nodes: TdmNode[], edges: TdmEdge[]): ResultMarkerItem[] {
  return getMarkersForFocus(nodeId, nodes, edges, 'hypothesis');
}

export function isEdgeRelatedToFocus(edgeId: string, focusedNodeId: string | null, edges: TdmEdge[]): boolean {
  if (!focusedNodeId) {
    return true;
  }

  const edge = edges.find((candidate) => candidate.id === edgeId);

  if (!edge) {
    return false;
  }

  return edge.source === focusedNodeId || edge.target === focusedNodeId;
}

export function countNodeConnections(nodeId: string, edges: TdmEdge[]) {
  let incoming = 0;
  let outgoing = 0;

  edges.forEach((edge) => {
    if (edge.source === nodeId) {
      outgoing += 1;
    }

    if (edge.target === nodeId) {
      incoming += 1;
    }
  });

  return { incoming, outgoing };
}

export function buildConnectionCountMap(edges: TdmEdge[]): Map<string, { incoming: number; outgoing: number }> {
  const counts = new Map<string, { incoming: number; outgoing: number }>();

  edges.forEach((edge) => {
    const sourceCounts = counts.get(edge.source) ?? { incoming: 0, outgoing: 0 };
    sourceCounts.outgoing += 1;
    counts.set(edge.source, sourceCounts);

    const targetCounts = counts.get(edge.target) ?? { incoming: 0, outgoing: 0 };
    targetCounts.incoming += 1;
    counts.set(edge.target, targetCounts);
  });

  return counts;
}

export function buildTheoryStatusSummary(nodes: TdmNode[], edges: TdmEdge[]) {
  const grouped = groupNodesByStage(nodes);
  const stageCounts = TDM_STAGE_ORDER.reduce<Record<TdmStage, number>>(
    (accumulator, stage) => {
      accumulator[stage] = grouped[stage].length;
      return accumulator;
    },
    { input: 0, activity: 0, output: 0, outcome: 0 }
  );

  const riskCount = edges.filter(
    (edge) => getEdgeMarkerType(edge) === 'risk' && getEdgeMarkerText(edge, 'risk')?.trim()
  ).length;
  const hypothesisCount = edges.filter(
    (edge) => getEdgeMarkerType(edge) === 'hypothesis' && getEdgeMarkerText(edge, 'hypothesis')?.trim()
  ).length;

  return {
    stageCounts,
    connectionCount: edges.length,
    riskCount,
    hypothesisCount,
    totalBlocks: nodes.length
  };
}

export function getFocusStageTitle(stage: TdmStage): string {
  return FOCUS_STAGE_TITLES[stage];
}

export function isNodeDisconnected(
  nodeId: string,
  connectionCounts: Map<string, { incoming: number; outgoing: number }>
): boolean {
  const counts = connectionCounts.get(nodeId) ?? { incoming: 0, outgoing: 0 };
  return counts.incoming === 0 && counts.outgoing === 0;
}

export function getCardHighlightState(
  nodeId: string,
  focusedNodeId: string | null,
  focusedEdgeId: string | null,
  relatedNodeIds: Set<string>,
  connectionCounts: Map<string, { incoming: number; outgoing: number }>
) {
  const hasFocus = focusedNodeId !== null || focusedEdgeId !== null;
  const disconnected = isNodeDisconnected(nodeId, connectionCounts);

  if (disconnected) {
    return {
      isFocused: focusedNodeId === nodeId,
      isHighlighted: focusedNodeId === nodeId,
      isDimmed: true,
      isDisabled: true
    };
  }

  if (!hasFocus) {
    return {
      isFocused: false,
      isHighlighted: true,
      isDimmed: false,
      isDisabled: false
    };
  }

  const inFamily = relatedNodeIds.has(nodeId);

  return {
    isFocused: focusedNodeId === nodeId,
    isHighlighted: inFamily,
    isDimmed: !inFamily,
    isDisabled: !inFamily && !disconnected
  };
}

export function getMarkerHighlightState(
  edgeId: string,
  focusedNodeId: string | null,
  focusedEdgeId: string | null,
  relatedEdgeIds: Set<string>
) {
  const hasFocus = focusedNodeId !== null || focusedEdgeId !== null;

  return {
    isHighlighted: !hasFocus || relatedEdgeIds.has(edgeId),
    isDimmed: hasFocus && !relatedEdgeIds.has(edgeId),
    isVisible: !hasFocus || relatedEdgeIds.has(edgeId)
  };
}


import type { TdmEdge } from '../../../domain/tdm-types';

function collectDescendants(nodeId: string, edges: TdmEdge[], ids: Set<string>) {
  ids.add(nodeId);
  for (const edge of edges) {
    if (edge.source === nodeId && !ids.has(edge.target)) {
      collectDescendants(edge.target, edges, ids);
    }
  }
}

function collectAncestors(nodeId: string, edges: TdmEdge[], ids: Set<string>) {
  ids.add(nodeId);
  for (const edge of edges) {
    if (edge.target === nodeId && !ids.has(edge.source)) {
      collectAncestors(edge.source, edges, ids);
    }
  }
}

export function getFlowRelationSet(nodeId: string | null, edges: TdmEdge[]): Set<string> {
  if (!nodeId) return new Set();
  const ids = new Set<string>();
  collectDescendants(nodeId, edges, ids);
  collectAncestors(nodeId, edges, ids);
  return ids;
}

import { exampleTheory } from '../../data/example-theory';

function collectDescendants(
  nodeId: string,
  edges: typeof exampleTheory.edges,
  ids: Set<string>
) {
  ids.add(nodeId);
  for (const edge of edges) {
    if (edge.source === nodeId && !ids.has(edge.target)) {
      collectDescendants(edge.target, edges, ids);
    }
  }
}

function collectAncestors(
  nodeId: string,
  edges: typeof exampleTheory.edges,
  ids: Set<string>
) {
  ids.add(nodeId);
  for (const edge of edges) {
    if (edge.target === nodeId && !ids.has(edge.source)) {
      collectAncestors(edge.source, edges, ids);
    }
  }
}

export function getFlowRelationSet(
  nodeId: string | null,
  edges: typeof exampleTheory.edges
) {
  if (!nodeId) return new Set<string>();

  const ids = new Set<string>();
  collectDescendants(nodeId, edges, ids);
  collectAncestors(nodeId, edges, ids);
  return ids;
}

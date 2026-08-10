import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import {
  buildNarrativeGraph,
  compareNarrativeNodes,
  enumerateLinearPaths,
  findWeaklyConnectedComponents,
  resolveScopedFlow,
  type NarrativeGraph
} from '../theory-narrative.graph';
import type {
  NarrativeNodeFields,
  TheoryNarrativeSelection
} from '../theory-narrative.types';

export type PreparedNarrativeGraph = {
  scope: 'macro' | 'scoped';
  graph: NarrativeGraph;
};

export function prepareNarrativeGraph(
  selection: TheoryNarrativeSelection,
  nodes: TdmNode[],
  edges: TdmEdge[]
): PreparedNarrativeGraph | null {
  if (nodes.length === 0) {
    return null;
  }

  if (!selection) {
    return {
      scope: 'macro',
      graph: buildNarrativeGraph(nodes, edges)
    };
  }

  const flow = resolveScopedFlow(selection, edges);
  if (flow.nodeIds.size === 0) {
    return null;
  }

  const graph = buildNarrativeGraph(nodes, edges, flow);
  if (graph.nodes.size === 0) {
    return null;
  }

  return {
    scope: 'scoped',
    graph
  };
}

export function resolveNarrativeEndpoints(graph: NarrativeGraph): {
  roots: NarrativeNodeFields[];
  terminals: NarrativeNodeFields[];
  startTitle: string;
  endTitle: string;
} {
  const orderedNodes = [...graph.nodes.values()].sort(compareNarrativeNodes);
  const roots = graph.roots
    .map((id) => graph.nodes.get(id))
    .filter((node): node is NarrativeNodeFields => Boolean(node))
    .sort(compareNarrativeNodes);
  const terminals = graph.terminals
    .map((id) => graph.nodes.get(id))
    .filter((node): node is NarrativeNodeFields => Boolean(node))
    .sort(compareNarrativeNodes);
  const startTitle = roots[0]?.title ?? orderedNodes[0]?.title ?? 'fluxo';
  const endTitle = terminals.at(-1)?.title ?? orderedNodes.at(-1)?.title ?? startTitle;

  return { roots, terminals, startTitle, endTitle };
}

export function countNarrativePaths(graph: NarrativeGraph): number {
  return Math.max(
    enumerateLinearPaths(graph).length,
    findWeaklyConnectedComponents(graph).length,
    1
  );
}

export function findDisconnectedNarrativeNodes(
  graph: NarrativeGraph,
  emittedNodes: ReadonlySet<string>
): NarrativeNodeFields[] {
  return [...graph.nodes.values()]
    .filter((node) => {
      const inCount = graph.incoming.get(node.id)?.length ?? 0;
      const outCount = graph.outgoing.get(node.id)?.length ?? 0;
      return inCount === 0 && outCount === 0 && !emittedNodes.has(node.id);
    })
    .sort(compareNarrativeNodes);
}

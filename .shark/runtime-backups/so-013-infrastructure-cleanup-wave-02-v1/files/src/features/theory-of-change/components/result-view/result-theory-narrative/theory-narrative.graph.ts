import { TDM_STAGE_ORDER } from '@/features/theory-of-change/domain/tdm-stages';
import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import { getConnectedFlowFromNode, getEdgeBadges } from '../result-view.utils';
import { trimField } from './theory-narrative.normalizers';
import type {
  NarrativeEdgeMarkers,
  NarrativeNodeFields,
  TheoryNarrativeSelection
} from './theory-narrative.types';

export type NarrativeGraph = {
  nodes: Map<string, NarrativeNodeFields>;
  edges: Map<string, NarrativeEdgeMarkers>;
  outgoing: Map<string, string[]>;
  incoming: Map<string, string[]>;
  roots: string[];
  terminals: string[];
};

function stageRank(stage: string | undefined): number {
  if (!stage) {
    return Number.MAX_SAFE_INTEGER;
  }
  const index = TDM_STAGE_ORDER.indexOf(stage as (typeof TDM_STAGE_ORDER)[number]);
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

export function compareNarrativeNodes(left: NarrativeNodeFields, right: NarrativeNodeFields): number {
  const stageDiff = stageRank(left.stage) - stageRank(right.stage);
  if (stageDiff !== 0) {
    return stageDiff;
  }

  const yDiff = (left.position?.y ?? 0) - (right.position?.y ?? 0);
  if (yDiff !== 0) {
    return yDiff;
  }

  const xDiff = (left.position?.x ?? 0) - (right.position?.x ?? 0);
  if (xDiff !== 0) {
    return xDiff;
  }

  return left.id.localeCompare(right.id);
}

function toNarrativeNode(node: TdmNode): NarrativeNodeFields {
  return {
    id: node.id,
    stage: node.stage,
    title: node.title,
    description: trimField(node.description),
    details: trimField(node.advancedDetails),
    notes: trimField(node.shortNotes),
    position: {
      x: node.position?.x ?? 0,
      y: node.position?.y ?? 0
    }
  };
}

function toEdgeMarkers(
  edge: TdmEdge,
  nodeMap: Map<string, NarrativeNodeFields>
): NarrativeEdgeMarkers {
  const risks: Array<{ id: string; text: string }> = [];
  const hypotheses: Array<{ id: string; text: string }> = [];
  const sourceStage = edge.sourceStage ?? edge.data?.sourceStage ?? nodeMap.get(edge.source)?.stage;
  const targetStage = edge.targetStage ?? edge.data?.targetStage ?? nodeMap.get(edge.target)?.stage;
  const edgeForBadges: TdmEdge =
    sourceStage && targetStage
      ? { ...edge, sourceStage, targetStage }
      : edge;

  getEdgeBadges(edgeForBadges).forEach((badge, index) => {
    const text = trimField(badge.text);
    if (!text) {
      return;
    }

    const id = `${edge.id}-${badge.type}-${index}`;
    if (badge.type === 'risk') {
      risks.push({ id, text });
      return;
    }
    hypotheses.push({ id, text });
  });

  return {
    edgeId: edge.id,
    sourceId: edge.source,
    targetId: edge.target,
    sourceStage,
    targetStage,
    label: typeof edge.label === 'string' ? trimField(edge.label) : undefined,
    risks,
    hypotheses
  };
}

export function buildNarrativeGraph(
  nodes: TdmNode[],
  edges: TdmEdge[],
  scope?: { nodeIds: Set<string>; edgeIds: Set<string> }
): NarrativeGraph {
  const scopedNodes = scope ? nodes.filter((node) => scope.nodeIds.has(node.id)) : nodes;
  const scopedEdges = scope
    ? edges.filter(
        (edge) =>
          scope.edgeIds.has(edge.id) &&
          scope.nodeIds.has(edge.source) &&
          scope.nodeIds.has(edge.target)
      )
    : edges;

  const nodeMap = new Map(scopedNodes.map((node) => [node.id, toNarrativeNode(node)]));
  const edgeMap = new Map<string, NarrativeEdgeMarkers>();
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();

  nodeMap.forEach((_, id) => {
    outgoing.set(id, []);
    incoming.set(id, []);
  });

  scopedEdges.forEach((edge) => {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) {
      return;
    }
    const markers = toEdgeMarkers(edge, nodeMap);
    edgeMap.set(edge.id, markers);
    outgoing.get(edge.source)?.push(edge.id);
    incoming.get(edge.target)?.push(edge.id);
  });

  const sortEdgeIds = (edgeIds: string[]) => {
    edgeIds.sort((leftId, rightId) => {
      const left = edgeMap.get(leftId);
      const right = edgeMap.get(rightId);
      if (!left || !right) {
        return leftId.localeCompare(rightId);
      }
      const leftNode = nodeMap.get(left.targetId);
      const rightNode = nodeMap.get(right.targetId);
      if (!leftNode || !rightNode) {
        return leftId.localeCompare(rightId);
      }
      return compareNarrativeNodes(leftNode, rightNode);
    });
  };

  outgoing.forEach((bucket, key) => {
    sortEdgeIds(bucket);
    outgoing.set(key, bucket);
  });
  incoming.forEach((bucket, key) => {
    sortEdgeIds(bucket);
    incoming.set(key, bucket);
  });

  const roots = [...nodeMap.values()]
    .filter((node) => (incoming.get(node.id)?.length ?? 0) === 0)
    .sort(compareNarrativeNodes)
    .map((node) => node.id);

  const terminals = [...nodeMap.values()]
    .filter((node) => (outgoing.get(node.id)?.length ?? 0) === 0)
    .sort(compareNarrativeNodes)
    .map((node) => node.id);

  return { nodes: nodeMap, edges: edgeMap, outgoing, incoming, roots, terminals };
}

export function findWeaklyConnectedComponents(graph: NarrativeGraph): string[][] {
  const visited = new Set<string>();
  const adjacency = new Map<string, Set<string>>();

  graph.nodes.forEach((_, id) => {
    adjacency.set(id, new Set());
  });

  graph.edges.forEach((edge) => {
    adjacency.get(edge.sourceId)?.add(edge.targetId);
    adjacency.get(edge.targetId)?.add(edge.sourceId);
  });

  const components: string[][] = [];

  graph.nodes.forEach((_, startId) => {
    if (visited.has(startId)) {
      return;
    }

    const stack = [startId];
    const component: string[] = [];
    visited.add(startId);

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }
      component.push(current);
      adjacency.get(current)?.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          stack.push(neighbor);
        }
      });
    }

    const ordered = component
      .map((id) => graph.nodes.get(id))
      .filter((node): node is NarrativeNodeFields => Boolean(node))
      .sort(compareNarrativeNodes)
      .map((node) => node.id);

    components.push(ordered);
  });

  components.sort((left, right) => {
    const leftRoot = graph.nodes.get(left[0] ?? '');
    const rightRoot = graph.nodes.get(right[0] ?? '');
    if (!leftRoot || !rightRoot) {
      return 0;
    }
    return compareNarrativeNodes(leftRoot, rightRoot);
  });

  return components;
}

export function resolveScopedFlow(
  selection: Exclude<TheoryNarrativeSelection, null>,
  edges: TdmEdge[]
): { nodeIds: Set<string>; edgeIds: Set<string> } {
  if (selection.type === 'edge') {
    const edge = edges.find((item) => item.id === selection.id);
    if (!edge) {
      return { nodeIds: new Set(), edgeIds: new Set() };
    }

    // Connection selection: origin → destination, with that edge's risks/hypotheses.
    return {
      nodeIds: new Set([edge.source, edge.target]),
      edgeIds: new Set([edge.id])
    };
  }

  return getConnectedFlowFromNode(selection.id, edges);
}

export function enumerateLinearPaths(graph: NarrativeGraph): string[][] {
  const paths: string[][] = [];

  const walk = (nodeId: string, trail: string[]) => {
    const nextEdges = graph.outgoing.get(nodeId) ?? [];
    if (nextEdges.length === 0) {
      paths.push(trail);
      return;
    }

    nextEdges.forEach((edgeId) => {
      const edge = graph.edges.get(edgeId);
      if (!edge || trail.includes(edge.targetId)) {
        return;
      }
      walk(edge.targetId, [...trail, edge.targetId]);
    });
  };

  const starts = graph.roots.length > 0 ? graph.roots : [...graph.nodes.keys()].sort((left, right) => {
    const leftNode = graph.nodes.get(left);
    const rightNode = graph.nodes.get(right);
    if (!leftNode || !rightNode) {
      return 0;
    }
    return compareNarrativeNodes(leftNode, rightNode);
  });

  starts.forEach((rootId) => walk(rootId, [rootId]));

  if (paths.length === 0 && graph.nodes.size > 0) {
    paths.push(
      [...graph.nodes.values()]
        .sort(compareNarrativeNodes)
        .map((node) => node.id)
    );
  }

  return paths;
}

export function countStagesByType(graph: NarrativeGraph) {
  let inputsCount = 0;
  let activitiesCount = 0;
  let productsCount = 0;
  let resultsCount = 0;

  graph.nodes.forEach((node) => {
    if (node.stage === 'input') {
      inputsCount += 1;
    } else if (node.stage === 'activity') {
      activitiesCount += 1;
    } else if (node.stage === 'output') {
      productsCount += 1;
    } else if (node.stage === 'outcome') {
      resultsCount += 1;
    }
  });

  return { inputsCount, activitiesCount, productsCount, resultsCount };
}

/** Counts only matrix-valid conditions already filtered into the narrative graph. */
export function countValidConditions(graph: NarrativeGraph) {
  let riskCount = 0;
  let hypothesisCount = 0;

  graph.edges.forEach((edge) => {
    riskCount += edge.risks.length;
    hypothesisCount += edge.hypotheses.length;
  });

  return { riskCount, hypothesisCount };
}

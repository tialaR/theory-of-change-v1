import type { TdmConnectionKind, TdmEdge, TdmNode } from '../../domain/tdm-types';
import { TDM_STAGE_LABELS, TDM_STAGE_ORDER, type TdmStage } from '../../domain/tdm-stages';
import type {
  CausalFamily,
  ColumnHeaderState,
  ConnectionInsightCopy,
  FlowReportContent,
  FlowReportPlacement,
  RelationLensContent,
  ResultMarkerItem
} from './result-view-utils.types';
import {
  getAncestors,
  getConnectionMarkersForFamily,
  getDescendants,
  getEdgeMarkerText,
  getEdgeMarkerType,
  getFocusStageTitle,
  getIncomingNodes,
  getOutgoingNodes,
  getRelatedConnections
} from './result-view-utils.network';

export const CONNECTION_INSIGHTS: Record<TdmConnectionKind, ConnectionInsightCopy> = {
  'input-activity': {
    title: 'Esta ligação usa recursos para viabilizar ações',
    body: 'Este insumo sustenta a atividade conectada. Confira se a ação depende claramente deste recurso.'
  },
  'activity-output': {
    title: 'Esta ligação transforma ação em entrega',
    body: 'A atividade deve gerar um produto observável. Verifique se a entrega é direta e concreta.'
  },
  'output-outcome': {
    title: 'Esta ligação sustenta a mudança esperada',
    body: 'O produto deve explicar por que o resultado pode acontecer. Aqui entram hipóteses importantes.'
  }
};

export function getEdgeConnectionKind(edge: TdmEdge): TdmConnectionKind | undefined {
  if (edge.data?.connectionKind) {
    return edge.data.connectionKind;
  }

  const stagePairs: Record<string, TdmConnectionKind> = {
    'input-activity': 'input-activity',
    'activity-output': 'activity-output',
    'output-outcome': 'output-outcome'
  };

  return stagePairs[`${edge.sourceStage}-${edge.targetStage}`];
}

export function getCausalFamily(nodeId: string, nodes: TdmNode[], edges: TdmEdge[]): CausalFamily {
  const ancestorIds = getAncestors(nodeId, edges);
  const descendantIds = getDescendants(nodeId, edges);
  const relatedNodeIds = new Set<string>([nodeId, ...ancestorIds, ...descendantIds]);
  const relatedEdgeIds = getRelatedConnections(relatedNodeIds, edges);
  const markers = getConnectionMarkersForFamily(relatedEdgeIds, nodes, edges);

  return {
    selectedId: nodeId,
    selectedEdgeId: null,
    incomingIds: edges.filter((edge) => edge.target === nodeId).map((edge) => edge.source),
    outgoingIds: edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target),
    ancestorIds,
    descendantIds,
    relatedNodeIds,
    relatedEdgeIds,
    risks: markers.risks,
    hypotheses: markers.hypotheses
  };
}

export function getCausalFamilyForEdge(edgeId: string, nodes: TdmNode[], edges: TdmEdge[]): CausalFamily | null {
  const edge = edges.find((candidate) => candidate.id === edgeId);

  if (!edge) {
    return null;
  }

  const sourceAncestors = getAncestors(edge.source, edges);
  const targetDescendants = getDescendants(edge.target, edges);
  const relatedNodeIds = new Set<string>([
    edge.source,
    edge.target,
    ...sourceAncestors,
    ...targetDescendants
  ]);
  const relatedEdgeIds = getRelatedConnections(relatedNodeIds, edges);
  const markers = getConnectionMarkersForFamily(relatedEdgeIds, nodes, edges);

  return {
    selectedId: null,
    selectedEdgeId: edgeId,
    incomingIds: [edge.source],
    outgoingIds: [edge.target],
    ancestorIds: sourceAncestors,
    descendantIds: targetDescendants,
    relatedNodeIds,
    relatedEdgeIds,
    risks: markers.risks,
    hypotheses: markers.hypotheses
  };
}

export function getStageFocusState(
  stageNodes: TdmNode[],
  focusedNodeId: string | null,
  focusedEdgeId: string | null,
  relatedNodeIds: Set<string>,
  priorityNodeIds: Set<string> = new Set()
): ColumnHeaderState {
  return getColumnHeaderState(stageNodes, focusedNodeId, focusedEdgeId, relatedNodeIds, priorityNodeIds);
}

export function getColumnHeaderState(
  stageNodes: TdmNode[],
  focusedNodeId: string | null,
  focusedEdgeId: string | null,
  relatedNodeIds: Set<string>,
  priorityNodeIds: Set<string> = new Set()
): ColumnHeaderState {
  const hasFocus = focusedNodeId !== null || focusedEdgeId !== null;

  if (!hasFocus) {
    return { isActive: true, isSelected: false, isDimmed: false };
  }

  const hasRelatedInColumn = stageNodes.some((node) => relatedNodeIds.has(node.id));
  const isSelected = stageNodes.some(
    (node) => node.id === focusedNodeId || priorityNodeIds.has(node.id)
  );

  return {
    isActive: hasRelatedInColumn,
    isSelected,
    isDimmed: !hasRelatedInColumn
  };
}

export function getPrimaryRelationForFocus(
  nodeId: string,
  nodes: TdmNode[],
  edges: TdmEdge[]
): RelationLensContent | null {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const focusedNode = nodeMap.get(nodeId);

  if (!focusedNode) {
    return null;
  }

  const relatedEdges = edges.filter((edge) => edge.source === nodeId || edge.target === nodeId);

  if (relatedEdges.length === 0) {
    return null;
  }

  const prioritizedEdge =
    relatedEdges.find((edge) => edge.source === nodeId) ??
    relatedEdges.find((edge) => edge.target === nodeId) ??
    relatedEdges[0];

  const connectionKind = getEdgeConnectionKind(prioritizedEdge);

  if (!connectionKind) {
    return null;
  }

  const insight = CONNECTION_INSIGHTS[connectionKind];
  const sourceNode = nodeMap.get(prioritizedEdge.source);
  const targetNode = nodeMap.get(prioritizedEdge.target);
  const markerType = getEdgeMarkerType(prioritizedEdge);
  const markerText = markerType ? getEdgeMarkerText(prioritizedEdge, markerType)?.trim() : undefined;

  const base: RelationLensContent = {
    connectionKind,
    title: insight.title,
    body: insight.body,
    sourceTitle: sourceNode?.title ?? '—',
    targetTitle: targetNode?.title ?? '—',
    totalRelations: relatedEdges.length
  };

  if (markerType === 'risk' && markerText) {
    base.risk = {
      edgeId: prioritizedEdge.id,
      kind: 'risk',
      text: markerText,
      sourceTitle: sourceNode?.title ?? '—',
      targetTitle: targetNode?.title ?? '—'
    };
  }

  if (markerType === 'hypothesis' && markerText) {
    base.hypothesis = {
      edgeId: prioritizedEdge.id,
      kind: 'hypothesis',
      text: markerText,
      sourceTitle: sourceNode?.title ?? '—',
      targetTitle: targetNode?.title ?? '—'
    };
  }

  return base;
}

export function getLensPlacementClass(stage: TdmStage): 'lensLeft' | 'lensCenter' | 'lensRight' {
  if (stage === 'input' || stage === 'activity') {
    return 'lensLeft';
  }

  if (stage === 'output') {
    return 'lensCenter';
  }

  return 'lensRight';
}

function buildDidacticNote(family: CausalFamily, nodes: TdmNode[]): string {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  if (family.selectedEdgeId) {
    const edgeFamilySize = family.relatedNodeIds.size;

    if (edgeFamilySize <= 2) {
      return 'Esta ligação conecta dois blocos. Observe como o fluxo avança entre etapas.';
    }

    return 'Esta ligação integra um caminho maior. Os blocos destacados mostram a cadeia causal completa.';
  }

  const focusedNode = family.selectedId ? nodeMap.get(family.selectedId) : null;

  if (!focusedNode) {
    return 'Selecione um bloco ou conexão para ler o caminho causal.';
  }

  if (family.ancestorIds.size === 0 && family.descendantIds.size === 0) {
    return 'Este bloco ainda não participa de um caminho conectado na teoria.';
  }

  if (family.ancestorIds.size > 0 && family.descendantIds.size > 0) {
    return 'O destaque mostra de onde vem e para onde vai este bloco na lógica da intervenção.';
  }

  if (family.ancestorIds.size > 0) {
    return 'Este bloco recebe insumos do caminho destacado. Siga as conexões para entender a origem.';
  }

  return 'Este bloco alimenta entregas e resultados à frente. Siga as conexões para ver o efeito esperado.';
}

function getFamilyNodeTitles(family: CausalFamily, nodes: TdmNode[]): string[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return TDM_STAGE_ORDER.flatMap((stage) =>
    nodes
      .filter((node) => node.stage === stage && family.relatedNodeIds.has(node.id))
      .map((node) => nodeMap.get(node.id)?.title ?? node.title)
  );
}

function getFullCausalPathLabels(family: CausalFamily, nodes: TdmNode[], edges: TdmEdge[]): string[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const paths: string[] = [];

  if (family.selectedEdgeId) {
    const edge = edges.find((candidate) => candidate.id === family.selectedEdgeId);

    if (edge) {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);

      if (source && target) {
        paths.push(`${source.title} → ${target.title}`);
      }
    }
  }

  family.relatedEdgeIds.forEach((edgeId) => {
    const edge = edges.find((candidate) => candidate.id === edgeId);

    if (!edge) {
      return;
    }

    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    const label = `${source?.title ?? '—'} → ${target?.title ?? '—'}`;

    if (!paths.includes(label)) {
      paths.push(label);
    }
  });

  return paths.slice(0, 12);
}

export function buildFlowReportContent(
  nodeId: string,
  nodes: TdmNode[],
  edges: TdmEdge[]
): FlowReportContent | null {
  const node = nodes.find((candidate) => candidate.id === nodeId);

  if (!node) {
    return null;
  }

  const family = getCausalFamily(nodeId, nodes, edges);
  const incoming = getIncomingNodes(nodeId, nodes, edges).filter((item) => family.relatedNodeIds.has(item.id));
  const outgoing = getOutgoingNodes(nodeId, nodes, edges).filter((item) => family.relatedNodeIds.has(item.id));
  const hasConnections = incoming.length > 0 || outgoing.length > 0;

  return {
    focusKind: 'node',
    nodeId,
    edgeId: null,
    nodeTitle: node.title,
    stage: node.stage,
    stageLabel: TDM_STAGE_LABELS[node.stage],
    hasConnections,
    incomingTitles: incoming.map((item) => item.title),
    outgoingTitles: outgoing.map((item) => item.title),
    risks: family.risks,
    hypotheses: family.hypotheses,
    causalPaths: getFullCausalPathLabels(family, nodes, edges),
    primaryRelation: hasConnections ? getPrimaryRelationForFocus(nodeId, nodes, edges) : null,
    focusStageTitle: getFocusStageTitle(node.stage),
    didacticNote: buildDidacticNote(family, nodes),
    familyNodeTitles: getFamilyNodeTitles(family, nodes)
  };
}

export function buildFlowReportContentForEdge(
  edgeId: string,
  nodes: TdmNode[],
  edges: TdmEdge[]
): FlowReportContent | null {
  const family = getCausalFamilyForEdge(edgeId, nodes, edges);
  const edge = edges.find((candidate) => candidate.id === edgeId);

  if (!family || !edge) {
    return null;
  }

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const sourceNode = nodeMap.get(edge.source);
  const targetNode = nodeMap.get(edge.target);
  const connectionKind = getEdgeConnectionKind(edge);
  const insight = connectionKind ? CONNECTION_INSIGHTS[connectionKind] : null;
  const markerType = getEdgeMarkerType(edge);
  const markerText = markerType ? getEdgeMarkerText(edge, markerType)?.trim() : undefined;

  const primaryRelation: RelationLensContent | null = connectionKind
    ? {
        connectionKind,
        title: insight?.title ?? 'Ligação selecionada',
        body: insight?.body ?? 'Esta conexão integra a lógica da teoria.',
        sourceTitle: sourceNode?.title ?? '—',
        targetTitle: targetNode?.title ?? '—',
        totalRelations: 1,
        ...(markerType === 'risk' && markerText
          ? {
              risk: {
                edgeId,
                kind: 'risk' as const,
                text: markerText,
                sourceTitle: sourceNode?.title ?? '—',
                targetTitle: targetNode?.title ?? '—'
              }
            }
          : {}),
        ...(markerType === 'hypothesis' && markerText
          ? {
              hypothesis: {
                edgeId,
                kind: 'hypothesis' as const,
                text: markerText,
                sourceTitle: sourceNode?.title ?? '—',
                targetTitle: targetNode?.title ?? '—'
              }
            }
          : {})
      }
    : null;

  const incomingTitles = [...family.ancestorIds]
    .map((id) => nodeMap.get(id)?.title)
    .filter(Boolean) as string[];
  const outgoingTitles = [...family.descendantIds]
    .map((id) => nodeMap.get(id)?.title)
    .filter(Boolean) as string[];

  return {
    focusKind: 'edge',
    nodeId: null,
    edgeId,
    nodeTitle: `${sourceNode?.title ?? '—'} → ${targetNode?.title ?? '—'}`,
    stage: targetNode?.stage ?? sourceNode?.stage ?? null,
    stageLabel: connectionKind
      ? {
          'input-activity': 'Insumo → Atividade',
          'activity-output': 'Atividade → Produto',
          'output-outcome': 'Produto → Resultado'
        }[connectionKind]
      : 'Conexão',
    hasConnections: true,
    incomingTitles,
    outgoingTitles,
    risks: family.risks,
    hypotheses: family.hypotheses,
    causalPaths: getFullCausalPathLabels(family, nodes, edges),
    primaryRelation,
    focusStageTitle: 'Ligação em foco',
    didacticNote: buildDidacticNote(family, nodes),
    familyNodeTitles: getFamilyNodeTitles(family, nodes)
  };
}

export function getFlowReportPlacement(stage: TdmStage): FlowReportPlacement {
  const map: Record<TdmStage, FlowReportPlacement> = {
    input: 'reportInputs',
    activity: 'reportActivities',
    output: 'reportOutputs',
    outcome: 'reportOutcomes'
  };

  return map[stage];
}

/** Layout rect relative to container — ignores CSS transform on the element. */

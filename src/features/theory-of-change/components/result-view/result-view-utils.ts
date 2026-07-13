import type { TdmConnectionKind } from '../../domain/tdm-types';
import type { TdmEdge, TdmNode, TdmMarkerType } from '../../domain/tdm-types';
import { TDM_STAGE_LABELS, TDM_STAGE_ORDER, type TdmStage } from '../../domain/tdm-stages';

export type ResultBridgeKind = 'risk' | 'hypothesis';
export type ResultExportFormat = 'pdf' | 'png' | 'jpeg' | 'svg' | 'word';

export interface ResultBridgeConfig {
  id: string;
  connectionKind: TdmConnectionKind;
  markerKind: ResultBridgeKind;
  sourceStage: TdmStage;
  targetStage: TdmStage;
}

export interface ResultMarkerItem {
  edgeId: string;
  kind: ResultBridgeKind;
  text: string;
  sourceTitle: string;
  targetTitle: string;
}

export interface ExportFormatOption {
  id: ResultExportFormat;
  label: string;
  description: string;
  available: boolean;
  unavailableNote?: string;
}

const FOCUS_STAGE_TITLES: Record<TdmStage, string> = {
  input: 'Foco no Insumo',
  activity: 'Foco na Atividade',
  output: 'Foco no Produto',
  outcome: 'Foco no Resultado'
};

export const EXPORT_FORMAT_OPTIONS: ExportFormatOption[] = [
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Documento para impressão ou compartilhamento.',
    available: true
  },
  {
    id: 'png',
    label: 'PNG',
    description: 'Imagem em alta qualidade.',
    available: false,
    unavailableNote: 'Em breve — não disponível'
  },
  {
    id: 'jpeg',
    label: 'JPEG',
    description: 'Imagem leve para anexos e apresentações.',
    available: false,
    unavailableNote: 'Em breve — não disponível'
  },
  {
    id: 'svg',
    label: 'SVG',
    description: 'Versão vetorial quando disponível.',
    available: false,
    unavailableNote: 'Em breve — não disponível'
  },
  {
    id: 'word',
    label: 'Word',
    description: 'Documento editável (.doc).',
    available: true
  }
];

/** Stage accents for Result view — clear identity without carnival */
export const RESULT_STAGE_ACCENTS: Record<
  TdmStage,
  { accent: string; accentSoft: string; border: string; glow: string }
> = {
  input: {
    accent: 'rgba(167, 139, 250, 0.9)',
    accentSoft: 'rgba(167, 139, 250, 0.12)',
    border: 'rgba(167, 139, 250, 0.32)',
    glow: 'rgba(167, 139, 250, 0.16)'
  },
  activity: {
    accent: 'rgba(96, 165, 250, 0.9)',
    accentSoft: 'rgba(96, 165, 250, 0.12)',
    border: 'rgba(96, 165, 250, 0.32)',
    glow: 'rgba(96, 165, 250, 0.16)'
  },
  output: {
    accent: 'rgba(245, 158, 66, 0.88)',
    accentSoft: 'rgba(245, 158, 66, 0.12)',
    border: 'rgba(245, 158, 66, 0.32)',
    glow: 'rgba(245, 158, 66, 0.16)'
  },
  outcome: {
    accent: 'rgba(72, 211, 165, 0.88)',
    accentSoft: 'rgba(72, 211, 165, 0.12)',
    border: 'rgba(72, 211, 165, 0.32)',
    glow: 'rgba(72, 211, 165, 0.16)'
  }
};

export const RESULT_STAGE_CLASS_NAMES: Record<TdmStage, string> = {
  input: 'stageInsumos',
  activity: 'stageAtividades',
  output: 'stageProdutos',
  outcome: 'stageResultados'
};

export const RESULT_BRIDGE_ACCENTS = {
  risk: {
    accent: 'rgba(224, 164, 96, 0.42)',
    glow: 'rgba(224, 164, 96, 0.1)'
  },
  hypothesis: {
    accent: 'rgba(184, 195, 208, 0.42)',
    glow: 'rgba(184, 195, 208, 0.08)'
  }
} as const;

export const HERO_COMPACT_SCROLL_THRESHOLD = 12;

export const RESULT_VIEW_TITLE = 'Sua Teoria da Mudança';

export function getResultStageAccent(stage: TdmStage) {
  return RESULT_STAGE_ACCENTS[stage];
}

export function getResultStageClassName(stage: TdmStage): string {
  return RESULT_STAGE_CLASS_NAMES[stage];
}

export const RESULT_FLOW_BRIDGES: ResultBridgeConfig[] = [
  {
    id: 'input-activity',
    connectionKind: 'input-activity',
    markerKind: 'risk',
    sourceStage: 'input',
    targetStage: 'activity'
  },
  {
    id: 'activity-output',
    connectionKind: 'activity-output',
    markerKind: 'risk',
    sourceStage: 'activity',
    targetStage: 'output'
  },
  {
    id: 'output-outcome',
    connectionKind: 'output-outcome',
    markerKind: 'hypothesis',
    sourceStage: 'output',
    targetStage: 'outcome'
  }
];

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
  return getCausalFamily(nodeId, [], edges).relatedNodeIds;
}

/** @deprecated Prefer getCausalFamily — kept for backward compatibility */
export function getRelatedEdgeIds(nodeId: string, edges: TdmEdge[]): Set<string> {
  return getCausalFamily(nodeId, [], edges).relatedEdgeIds;
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
  const relatedEdgeIds = getCausalFamily(nodeId, nodes, edges).relatedEdgeIds;
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

export interface CausalFamily {
  selectedId: string | null;
  selectedEdgeId: string | null;
  incomingIds: string[];
  outgoingIds: string[];
  ancestorIds: Set<string>;
  descendantIds: Set<string>;
  relatedNodeIds: Set<string>;
  relatedEdgeIds: Set<string>;
  risks: ResultMarkerItem[];
  hypotheses: ResultMarkerItem[];
}

export interface ColumnHeaderState {
  isActive: boolean;
  isSelected: boolean;
  isDimmed: boolean;
}

export interface ConnectionInsightCopy {
  title: string;
  body: string;
}

export interface RelationLensContent {
  connectionKind: TdmConnectionKind;
  title: string;
  body: string;
  sourceTitle: string;
  targetTitle: string;
  risk?: ResultMarkerItem;
  hypothesis?: ResultMarkerItem;
  totalRelations: number;
}

export interface CardAnchorPoint {
  x: number;
  y: number;
}

export interface FlowPathDescriptor {
  edgeId: string;
  d: string;
  connectionKind: TdmConnectionKind;
  markerType?: TdmMarkerType;
  markerText?: string;
  markerPoint: CardAnchorPoint;
  drawDelay: number;
}

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

export type FlowReportPlacement = 'reportInputs' | 'reportActivities' | 'reportOutputs' | 'reportOutcomes';

export type FlowReportFocusKind = 'node' | 'edge';

export interface FlowReportContent {
  focusKind: FlowReportFocusKind;
  nodeId: string | null;
  edgeId: string | null;
  nodeTitle: string;
  stage: TdmStage | null;
  stageLabel: string;
  hasConnections: boolean;
  incomingTitles: string[];
  outgoingTitles: string[];
  risks: ResultMarkerItem[];
  hypotheses: ResultMarkerItem[];
  causalPaths: string[];
  primaryRelation: RelationLensContent | null;
  focusStageTitle: string;
  didacticNote: string;
  familyNodeTitles: string[];
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
export function getElementLayoutRect(element: HTMLElement, container: HTMLElement): DOMRect {
  let left = 0;
  let top = 0;
  let current: HTMLElement | null = element;

  while (current && current !== container) {
    left += current.offsetLeft;
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  return new DOMRect(left, top, element.offsetWidth, element.offsetHeight);
}

export function buildCardConnectionPath(
  sourceRect: DOMRect,
  targetRect: DOMRect
): { d: string; midpoint: CardAnchorPoint } {
  const sourceCenterY = sourceRect.top + sourceRect.height / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;
  const sourceIsLeft = sourceRect.left <= targetRect.left;

  const startX = sourceIsLeft ? sourceRect.right : sourceRect.left;
  const endX = sourceIsLeft ? targetRect.left : targetRect.right;
  const startY = sourceCenterY;
  const endY = targetCenterY;
  const deltaX = Math.abs(endX - startX);
  const controlOffset = Math.max(deltaX * 0.42, 28);

  const c1x = sourceIsLeft ? startX + controlOffset : startX - controlOffset;
  const c2x = sourceIsLeft ? endX - controlOffset : endX + controlOffset;

  const d = `M ${startX} ${startY} C ${c1x} ${startY}, ${c2x} ${endY}, ${endX} ${endY}`;

  return {
    d,
    midpoint: {
      x: (startX + endX) / 2,
      y: (startY + endY) / 2
    }
  };
}

export function buildFlowPathDescriptors(
  relatedEdgeIds: Set<string>,
  edges: TdmEdge[],
  cardElements: Map<string, HTMLElement>,
  containerElement: HTMLElement
): FlowPathDescriptor[] {
  const descriptors: FlowPathDescriptor[] = [];
  let delayIndex = 0;

  relatedEdgeIds.forEach((edgeId) => {
    const edge = edges.find((candidate) => candidate.id === edgeId);

    if (!edge) {
      return;
    }

    const connectionKind = getEdgeConnectionKind(edge);

    if (!connectionKind) {
      return;
    }

    const sourceElement = cardElements.get(edge.source);
    const targetElement = cardElements.get(edge.target);

    if (!sourceElement || !targetElement) {
      return;
    }

    const sourceRect = getElementLayoutRect(sourceElement, containerElement);
    const targetRect = getElementLayoutRect(targetElement, containerElement);
    const { d, midpoint } = buildCardConnectionPath(sourceRect, targetRect);
    const markerType = getEdgeMarkerType(edge);
    const markerText = markerType ? getEdgeMarkerText(edge, markerType)?.trim() : undefined;

    descriptors.push({
      edgeId,
      d,
      connectionKind,
      markerType: markerText ? markerType : undefined,
      markerText,
      markerPoint: midpoint,
      drawDelay: delayIndex * 0.07
    });

    delayIndex += 1;
  });

  return descriptors;
}

export function getCausalPathLabels(nodeId: string, nodes: TdmNode[], edges: TdmEdge[]): string[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const focusedNode = nodeMap.get(nodeId);

  if (!focusedNode) {
    return [];
  }

  const upstream = edges
    .filter((edge) => edge.target === nodeId)
    .map((edge) => nodeMap.get(edge.source))
    .filter(Boolean) as TdmNode[];

  const downstream = edges
    .filter((edge) => edge.source === nodeId)
    .map((edge) => nodeMap.get(edge.target))
    .filter(Boolean) as TdmNode[];

  const segments: string[] = [];

  upstream.forEach((node) => {
    segments.push(`${node.title} → ${focusedNode.title}`);
  });

  downstream.forEach((node) => {
    segments.push(`${focusedNode.title} → ${node.title}`);
  });

  return segments;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildWordExportHtml({
  title,
  description,
  nodes,
  edges
}: {
  title: string;
  description?: string;
  nodes: TdmNode[];
  edges: TdmEdge[];
}): string {
  const grouped = groupNodesByStage(nodes);
  const status = buildTheoryStatusSummary(nodes, edges);
  const summary = description?.trim() || 'Teoria da Mudança organizada em etapas, conexões, riscos e hipóteses.';

  const stageSections = TDM_STAGE_ORDER.map((stage) => {
    const stageNodes = grouped[stage];

    if (stageNodes.length === 0) {
      return '';
    }

    const blocks = stageNodes
      .map((node) => {
        const parts = [
          `<h3>${escapeHtml(node.title)}</h3>`,
          `<p>${escapeHtml(node.description?.trim() || 'Sem descrição registrada.')}</p>`
        ];

        if (node.advancedDetails?.trim()) {
          parts.push(`<p><strong>Detalhes:</strong> ${escapeHtml(node.advancedDetails)}</p>`);
        }

        if (node.shortNotes?.trim()) {
          parts.push(`<p><strong>Notas:</strong> ${escapeHtml(node.shortNotes)}</p>`);
        }

        return `<div>${parts.join('')}</div>`;
      })
      .join('');

    return `<section><h2>${escapeHtml(TDM_STAGE_LABELS[stage])}</h2>${blocks}</section>`;
  }).join('');

  const connectionLines = edges
    .map((edge) => {
      const source = nodes.find((node) => node.id === edge.source);
      const target = nodes.find((node) => node.id === edge.target);
      const markerType = getEdgeMarkerType(edge);
      const markerText =
        markerType === 'risk'
          ? getEdgeMarkerText(edge, 'risk')
          : markerType === 'hypothesis'
            ? getEdgeMarkerText(edge, 'hypothesis')
            : undefined;

      let line = `${source?.title ?? '—'} → ${target?.title ?? '—'}`;

      if (markerText?.trim()) {
        line += ` (${markerType === 'risk' ? 'Risco' : 'Hipótese'}: ${markerText.trim()})`;
      }

      return `<li>${escapeHtml(line)}</li>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(summary)}</p>
  <p><strong>Resumo:</strong> ${status.totalBlocks} blocos, ${status.connectionCount} conexões, ${status.riskCount} riscos, ${status.hypothesisCount} hipóteses.</p>
  ${stageSections}
  <section>
    <h2>Conexões</h2>
    <ul>${connectionLines}</ul>
  </section>
</body>
</html>`;
}

export function downloadWordDocument(html: string, filename: string) {
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function sanitizeExportFilename(title: string): string {
  const normalized = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9à-úãõâêîôûç\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'teoria-da-mudanca';
}

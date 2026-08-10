import {
  compareNarrativeNodes,
  countStagesByType,
  countValidConditions,
  type NarrativeGraph
} from '../theory-narrative.graph';
import { FIGURE_SOURCES } from '../theory-narrative.templates';
import type {
  NarrativeNodeFields,
  TheoryDocumentFigure,
  TheoryFigureEdge,
  TheoryFigureNode
} from '../theory-narrative.types';

export function titlesByStage(
  graph: NarrativeGraph,
  stage: NarrativeNodeFields['stage']
): string[] {
  return [...graph.nodes.values()]
    .filter((node) => node.stage === stage)
    .sort(compareNarrativeNodes)
    .map((node) => node.title);
}

function toFigureNodes(
  graph: NarrativeGraph,
  filter?: (node: NarrativeNodeFields) => boolean
): TheoryFigureNode[] {
  return [...graph.nodes.values()]
    .filter((node) => (filter ? filter(node) : true))
    .sort(compareNarrativeNodes)
    .map((node) => ({ id: node.id, title: node.title, stage: node.stage }));
}

function toFigureEdges(
  graph: NarrativeGraph,
  filter?: (edge: { sourceStage?: string; targetStage?: string }) => boolean
): TheoryFigureEdge[] {
  return [...graph.edges.values()]
    .filter((edge) => {
      const sourceStage = edge.sourceStage ?? graph.nodes.get(edge.sourceId)?.stage;
      const targetStage = edge.targetStage ?? graph.nodes.get(edge.targetId)?.stage;
      if (!sourceStage || !targetStage) {
        return false;
      }
      return filter ? filter({ sourceStage, targetStage }) : true;
    })
    .map((edge) => {
      const sourceStage = (edge.sourceStage ?? graph.nodes.get(edge.sourceId)?.stage)!;
      const targetStage = (edge.targetStage ?? graph.nodes.get(edge.targetId)?.stage)!;
      const marker: 'R' | 'H' | null =
        edge.risks.length > 0 ? 'R' : edge.hypotheses.length > 0 ? 'H' : null;
      return {
        id: edge.edgeId,
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        sourceStage,
        targetStage,
        marker
      };
    });
}

export function buildOverviewFigure(
  graph: NarrativeGraph,
  mode: 'macro' | 'scoped',
  counts: ReturnType<typeof countStagesByType>
): TheoryDocumentFigure {
  const conditionCounts = countValidConditions(graph);
  return {
    id: 'figure-overview',
    kind: mode === 'scoped' ? 'selected-path' : 'overview',
    number: 1,
    title:
      mode === 'scoped'
        ? 'Figura 1 – Encadeamento geral do fluxo selecionado'
        : 'Figura 1 – Encadeamento geral da teoria da mudança',
    sourceNote: FIGURE_SOURCES.overview,
    altText: `Encadeamento com quatro etapas: insumos (${counts.inputsCount}), atividades (${counts.activitiesCount}), produtos (${counts.productsCount}) e resultados (${counts.resultsCount}). Há ${conditionCounts.riskCount} risco(s) nas duas primeiras transições e ${conditionCounts.hypothesisCount} hipótese(s) na última.`,
    stageCounts: {
      inputs: counts.inputsCount,
      activities: counts.activitiesCount,
      products: counts.productsCount,
      results: counts.resultsCount
    },
    nodes: toFigureNodes(graph),
    edges: toFigureEdges(graph)
  };
}

export function buildResourcesFigure(graph: NarrativeGraph): TheoryDocumentFigure | null {
  const nodes = toFigureNodes(graph, (node) => node.stage === 'input' || node.stage === 'activity');
  const edges = toFigureEdges(
    graph,
    (edge) => edge.sourceStage === 'input' && edge.targetStage === 'activity'
  );
  if (nodes.length === 0) {
    return null;
  }
  return {
    id: 'figure-resources',
    kind: 'resources-map',
    number: 2,
    title: 'Figura 2 – Mapa dos recursos e das atividades registradas',
    sourceNote: FIGURE_SOURCES.resources,
    altText: `Mapa com ${nodes.filter((n) => n.stage === 'input').length} insumos e ${nodes.filter((n) => n.stage === 'activity').length} atividades, conectados pelas relações registradas.`,
    nodes,
    edges
  };
}

export function buildConvergenceFigure(graph: NarrativeGraph): TheoryDocumentFigure | null {
  const nodes = toFigureNodes(
    graph,
    (node) => node.stage === 'activity' || node.stage === 'output' || node.stage === 'outcome'
  );
  const edges = toFigureEdges(
    graph,
    (edge) =>
      (edge.sourceStage === 'activity' && edge.targetStage === 'output') ||
      (edge.sourceStage === 'output' && edge.targetStage === 'outcome')
  );
  if (nodes.length < 2 || edges.length === 0) {
    return null;
  }
  const hasConvergence = [...graph.nodes.values()].some(
    (node) => (graph.incoming.get(node.id)?.length ?? 0) > 1
  );
  if (!hasConvergence && nodes.length <= 3 && edges.length < 2) {
    return null;
  }
  return {
    id: 'figure-convergence',
    kind: 'convergence-map',
    number: 3,
    title: 'Figura 3 – Mapa de convergência entre atividades, produtos e resultado',
    sourceNote: FIGURE_SOURCES.convergence,
    altText: `Mapa de convergência com ${nodes.length} blocos e ${edges.length} conexões registradas entre atividades, produtos e resultado.`,
    nodes,
    edges
  };
}

import {
  countStagesByType,
  countValidConditions,
  type NarrativeGraph
} from '../theory-narrative.graph';
import { NARRATIVE_TITLES } from '../theory-narrative.templates';
import type {
  TheoryDocumentModel,
  TheoryNarrativeSelection
} from '../theory-narrative.types';
import type { BuilderCounters } from './theory-document-builders';
import { countNarrativePaths } from './theory-graph-traversal';
import { buildMacroPages, buildScopedPages } from './theory-page-builders';

interface AssembleTheoryDocumentInput {
  scope: 'macro' | 'scoped';
  graph: NarrativeGraph;
  selection: TheoryNarrativeSelection;
  includeReferencesPage: boolean;
}

export function assembleTheoryDocument({
  scope,
  graph,
  selection,
  includeReferencesPage
}: AssembleTheoryDocumentInput): TheoryDocumentModel {
  const counters: BuilderCounters = {
    paragraph: 0,
    section: 0,
    callout: 0,
    figure: 0
  };
  const markerIds: string[] = [];
  const counts = countStagesByType(graph);
  const conditionCounts = countValidConditions(graph);
  const pathsCount = countNarrativePaths(graph);

  const built =
    scope === 'macro'
      ? buildMacroPages(graph, counters, markerIds)
      : buildScopedPages(graph, counters, markerIds, includeReferencesPage);

  return {
    scope,
    mode: scope,
    title: scope === 'macro' ? NARRATIVE_TITLES.macro : NARRATIVE_TITLES.scoped,
    metadata: {
      stagesCount: graph.nodes.size,
      connectionsCount: graph.edges.size,
      pathsCount,
      riskCount: conditionCounts.riskCount,
      hypothesisCount: conditionCounts.hypothesisCount,
      inputsCount: counts.inputsCount,
      activitiesCount: counts.activitiesCount,
      productsCount: counts.productsCount,
      resultsCount: counts.resultsCount
    },
    executiveSummary: built.executiveSummary,
    pages: built.pages,
    references: built.references,
    selection,
    markerIds
  };
}

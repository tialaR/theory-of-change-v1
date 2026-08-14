import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import {
  countStagesByType,
  countValidConditions,
  type NarrativeGraph
} from './theory-narrative.graph';
import { NARRATIVE_TITLES } from './theory-narrative.templates';
import {
  type BuilderCounters
} from './narrative-mapping/theory-document-builders';
import {
  countNarrativePaths,
  prepareNarrativeGraph
} from './narrative-mapping/theory-graph-traversal';
import {
  buildMacroPages,
  buildScopedPages
} from './narrative-mapping/theory-page-builders';
import type {
  TheoryDocumentModel,
  TheoryNarrativeSelection
} from './theory-narrative.types';


function assembleDocument(
  scope: 'macro' | 'scoped',
  graph: NarrativeGraph,
  selection: TheoryNarrativeSelection,
  options?: { includeReferencesPage?: boolean }
): TheoryDocumentModel {
  const counters: BuilderCounters = { paragraph: 0, section: 0, callout: 0, figure: 0 };
  const markerIds: string[] = [];
  const counts = countStagesByType(graph);
  const conditionCounts = countValidConditions(graph);
  const pathsCount = countNarrativePaths(graph);

  const built =
    scope === 'macro'
      ? buildMacroPages(graph, counters, markerIds)
      : buildScopedPages(graph, counters, markerIds, options?.includeReferencesPage ?? false);

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

/**
 * Deterministic document ViewModel for the Intérprete V2.3.
 * Source: 03-MOTOR-NARRATIVO-DETERMINISTICO-V2.3.md
 */
export function buildTheoryNarrativeDocument(
  selection: TheoryNarrativeSelection,
  nodes: TdmNode[],
  edges: TdmEdge[],
  options?: { includeReferencesPage?: boolean }
): TheoryDocumentModel | null {
  const prepared = prepareNarrativeGraph(selection, nodes, edges);
  if (!prepared) {
    return null;
  }

  return assembleDocument(prepared.scope, prepared.graph, selection, {
    includeReferencesPage: options?.includeReferencesPage ?? false
  });
}

/** Alias for clarity in newer call sites. */
export const buildTheoryDocument = buildTheoryNarrativeDocument;

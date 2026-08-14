import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import { stageLabel } from './theory-narrative.grammar';
import {
  compareNarrativeNodes,
  countStagesByType,
  countValidConditions,
  type NarrativeGraph
} from './theory-narrative.graph';
import {
  activityToProductParagraph,
  branchParagraph,
  CLEAR_METHODOLOGICAL_REFERENCES,
  CLEAR_SCOPED_EXPORT_REFERENCES,
  convergenceParagraph,
  disconnectedParagraph,
  macroConclusion,
  macroExecutiveSummary,
  NARRATIVE_LABELS,
  NARRATIVE_TITLES,
  productToResultParagraph,
  readingOrientationParagraph,
  scopedConclusion,
  scopedIntroduction
} from './theory-narrative.templates';
import {
  emitHypothesisConditions,
  emitRiskConditions
} from './narrative-mapping/theory-condition-builders';
import {
  type BuilderCounters,
  nextId,
  nodeRefs,
  numberSections,
  pushParagraph
} from './narrative-mapping/theory-document-builders';
import {
  countNarrativePaths,
  findDisconnectedNarrativeNodes,
  prepareNarrativeGraph,
  resolveNarrativeEndpoints
} from './narrative-mapping/theory-graph-traversal';
import { narrateResourcesAndActions } from './narrative-mapping/theory-resource-action-builders';
import {
  buildConvergenceFigure,
  buildOverviewFigure,
  buildResourcesFigure,
  titlesByStage
} from './narrative-mapping/theory-figure-builders';
import type {
  NarrativeNodeFields,
  NarrativeParagraph,
  TheoryDocumentCallout,
  TheoryDocumentModel,
  TheoryDocumentPageModel,
  TheoryDocumentSection,
  TheoryNarrativeSelection,
  TheorySourceRef
} from './theory-narrative.types';

type NarrativeBundle = {
  paragraphs: NarrativeParagraph[];
  callouts: TheoryDocumentCallout[];
};

function narrateDeliveriesAndResult(
  graph: NarrativeGraph,
  counters: BuilderCounters,
  markerIds: string[],
  emittedNodes: Set<string>,
  emittedEdges: Set<string>
): { sections: TheoryDocumentSection[]; conclusion: NarrativeParagraph[] } {
  const sections: TheoryDocumentSection[] = [];
  const activities = [...graph.nodes.values()]
    .filter((node) => node.stage === 'activity')
    .sort(compareNarrativeNodes);

  activities.forEach((activity) => {
    const outgoing = (graph.outgoing.get(activity.id) ?? []).filter((edgeId) => {
      const edge = graph.edges.get(edgeId);
      const target = edge ? graph.nodes.get(edge.targetId) : undefined;
      return target?.stage === 'output';
    });

    outgoing.forEach((edgeId) => {
      if (emittedEdges.has(edgeId)) {
        return;
      }
      emittedEdges.add(edgeId);
      const edge = graph.edges.get(edgeId);
      const product = edge ? graph.nodes.get(edge.targetId) : undefined;
      if (!edge || !product) {
        return;
      }

      const paragraphs: NarrativeParagraph[] = [];
      const callouts: TheoryDocumentCallout[] = [];

      if ((graph.outgoing.get(activity.id)?.length ?? 0) > 1 && !sections.some((s) => s.id.includes(activity.id))) {
        const targets = (graph.outgoing.get(activity.id) ?? [])
          .map((id) => graph.edges.get(id)?.targetId)
          .map((id) => (id ? graph.nodes.get(id)?.title : undefined))
          .filter((title): title is string => Boolean(title));
        if (targets.length > 1) {
          pushParagraph(
            paragraphs,
            counters,
            branchParagraph(activity.title, targets),
            'branch',
            [{ kind: 'node', id: activity.id, field: 'title' }],
            true
          );
        }
      }

      if ((graph.incoming.get(product.id)?.length ?? 0) > 1 && emittedNodes.has(product.id)) {
        const sources = (graph.incoming.get(product.id) ?? [])
          .map((id) => graph.edges.get(id)?.sourceId)
          .map((id) => (id ? graph.nodes.get(id)?.title : undefined))
          .filter((title): title is string => Boolean(title));
        pushParagraph(
          paragraphs,
          counters,
          convergenceParagraph(sources, product.title, graph.incoming.get(product.id)?.length ?? 0),
          'convergence',
          [{ kind: 'node', id: product.id, field: 'title' }, { kind: 'edge', id: edgeId }],
          true
        );
      } else {
        const body = activityToProductParagraph(activity.title, product);
        pushParagraph(
          paragraphs,
          counters,
          body.text,
          'transition',
          [
            { kind: 'node', id: activity.id, field: 'title' },
            ...nodeRefs(product, body.fieldsUsed),
            { kind: 'edge', id: edgeId }
          ],
          true
        );
        emittedNodes.add(product.id);
      }

      emitRiskConditions({
        counters,
        markerIds,
        edgeId,
        sourceTitle: activity.title,
        targetTitle: product.title,
        risks: edge.risks,
        paragraphs,
        callouts
      });

      sections.push({
        id: nextId(counters, 's'),
        title: product.title,
        level: 2,
        paragraphs,
        callouts: callouts.length > 0 ? callouts : undefined,
        sourceRefs: [
          { kind: 'node', id: product.id, field: 'title' },
          { kind: 'edge', id: edgeId }
        ]
      });
    });
  });

  const products = [...graph.nodes.values()]
    .filter((node) => node.stage === 'output')
    .sort(compareNarrativeNodes);

  const resultSections: TheoryDocumentSection[] = [];
  products.forEach((product) => {
    const outgoing = (graph.outgoing.get(product.id) ?? []).filter((edgeId) => {
      const edge = graph.edges.get(edgeId);
      const target = edge ? graph.nodes.get(edge.targetId) : undefined;
      return target?.stage === 'outcome';
    });

    outgoing.forEach((edgeId) => {
      if (emittedEdges.has(edgeId)) {
        return;
      }
      emittedEdges.add(edgeId);
      const edge = graph.edges.get(edgeId);
      const result = edge ? graph.nodes.get(edge.targetId) : undefined;
      if (!edge || !result) {
        return;
      }

      const paragraphs: NarrativeParagraph[] = [];
      const callouts: TheoryDocumentCallout[] = [];

      if ((graph.incoming.get(result.id)?.length ?? 0) > 1 && emittedNodes.has(result.id)) {
        const sources = (graph.incoming.get(result.id) ?? [])
          .map((id) => graph.edges.get(id)?.sourceId)
          .map((id) => (id ? graph.nodes.get(id)?.title : undefined))
          .filter((title): title is string => Boolean(title));
        pushParagraph(
          paragraphs,
          counters,
          convergenceParagraph(sources, result.title, graph.incoming.get(result.id)?.length ?? 0),
          'convergence',
          [{ kind: 'node', id: result.id, field: 'title' }, { kind: 'edge', id: edgeId }],
          true
        );
      } else {
        const body = productToResultParagraph(product.title, result);
        pushParagraph(
          paragraphs,
          counters,
          body.text,
          'transition',
          [
            { kind: 'node', id: product.id, field: 'title' },
            ...nodeRefs(result, body.fieldsUsed),
            { kind: 'edge', id: edgeId }
          ],
          true
        );
        emittedNodes.add(result.id);
      }

      emitHypothesisConditions({
        counters,
        markerIds,
        edgeId,
        sourceTitle: product.title,
        targetTitle: result.title,
        hypotheses: edge.hypotheses,
        paragraphs,
        callouts
      });

      resultSections.push({
        id: nextId(counters, 's'),
        title: 'Resultado esperado',
        level: 2,
        paragraphs,
        callouts: callouts.length > 0 ? callouts : undefined,
        sourceRefs: [
          { kind: 'node', id: result.id, field: 'title' },
          { kind: 'edge', id: edgeId }
        ]
      });
    });
  });

  // Deduplicate repeated "Resultado esperado" headings into one section when possible
  const mergedResult: TheoryDocumentSection | null =
    resultSections.length === 0
      ? null
      : {
          id: nextId(counters, 's'),
          number: undefined,
          title: 'Resultado esperado',
          level: 2,
          paragraphs: resultSections.flatMap((section) => section.paragraphs ?? []),
          callouts: resultSections.flatMap((section) => section.callouts ?? []),
          sourceRefs: resultSections.flatMap((section) => section.sourceRefs)
        };

  const conclusion: NarrativeParagraph[] = [];
  return {
    sections: mergedResult ? [...sections, mergedResult] : sections,
    conclusion
  };
}

function narrateDisconnected(
  graph: NarrativeGraph,
  counters: BuilderCounters,
  emittedNodes: Set<string>
): TheoryDocumentSection[] {
  const disconnected = findDisconnectedNarrativeNodes(graph, emittedNodes);

  return disconnected.map((node) => {
    const paragraphs: NarrativeParagraph[] = [];
    pushParagraph(
      paragraphs,
      counters,
      disconnectedParagraph(node.title, stageLabel(node.stage)),
      'stage-description',
      [{ kind: 'node', id: node.id, field: 'title' }, { kind: 'node', id: node.id, field: 'stage' }],
      true
    );
    emittedNodes.add(node.id);
    return {
      id: nextId(counters, 's'),
      title: node.title,
      level: 2,
      paragraphs,
      sourceRefs: [{ kind: 'node', id: node.id, field: 'title' }]
    };
  });
}

function buildMacroPages(
  graph: NarrativeGraph,
  counters: BuilderCounters,
  markerIds: string[]
): {
  pages: TheoryDocumentPageModel[];
  executiveSummary: NarrativeParagraph[];
  references: typeof CLEAR_METHODOLOGICAL_REFERENCES;
} {
  const counts = countStagesByType(graph);
  const conditionCounts = countValidConditions(graph);
  const inputTitles = titlesByStage(graph, 'input');
  const activityTitles = titlesByStage(graph, 'activity');
  const productTitles = titlesByStage(graph, 'output');
  const resultTitles = titlesByStage(graph, 'outcome');
  const resultTitle = resultTitles[0] ?? '';

  const executiveSummary: NarrativeParagraph[] = [];
  pushParagraph(
    executiveSummary,
    counters,
    macroExecutiveSummary({
      ...counts,
      edgeCount: graph.edges.size,
      riskCount: conditionCounts.riskCount,
      hypothesisCount: conditionCounts.hypothesisCount,
      inputTitles,
      activityTitles,
      productTitles,
      resultTitle
    }),
    'executive-summary',
    [
      { kind: 'count', field: 'label' },
      ...[...graph.nodes.values()].map((node) => ({ kind: 'node' as const, id: node.id, field: 'title' as const }))
    ],
    true
  );
  pushParagraph(
    executiveSummary,
    counters,
    readingOrientationParagraph(),
    'orientation',
    [{ kind: 'count', field: 'label' }]
  );

  const overviewFigure = buildOverviewFigure(graph, 'macro', counts);
  const resourcesFigure = buildResourcesFigure(graph);
  const convergenceFigure = buildConvergenceFigure(graph);

  const emittedNodes = new Set<string>();
  const emittedEdges = new Set<string>();

  const resourceSections = numberSections(
    [
      ...narrateResourcesAndActions(graph, counters, markerIds, emittedNodes, emittedEdges),
      ...narrateDisconnected(graph, counters, emittedNodes)
    ],
    2
  );

  const delivery = narrateDeliveriesAndResult(graph, counters, markerIds, emittedNodes, emittedEdges);
  const deliverySections = numberSections(delivery.sections, 3);

  const conclusionParagraphs: NarrativeParagraph[] = [];
  pushParagraph(
    conclusionParagraphs,
    counters,
    macroConclusion({
      inputTitles,
      activityTitles,
      productTitles,
      resultTitle,
      riskCount: conditionCounts.riskCount,
      hypothesisCount: conditionCounts.hypothesisCount
    }),
    'conclusion',
    [{ kind: 'count', field: 'label' }],
    true
  );

  const page1: TheoryDocumentPageModel = {
    id: 'page-overview',
    kind: 'overview',
    pageNumber: 1,
    title: 'Visão geral da teoria',
    sections: [
      {
        id: nextId(counters, 's'),
        number: '1',
        title: 'Visão geral da teoria',
        level: 1,
        paragraphs: executiveSummary,
        figure: overviewFigure,
        sourceRefs: [{ kind: 'count', field: 'label' }]
      }
    ]
  };

  const page2Sections: TheoryDocumentSection[] = [
    {
      id: nextId(counters, 's'),
      number: '2',
      title: 'Recursos mobilizados e ações previstas',
      level: 1,
      paragraphs: [],
      sourceRefs: []
    },
    ...resourceSections
  ];
  if (resourcesFigure) {
    page2Sections.push({
      id: nextId(counters, 's'),
      level: 1,
      figure: resourcesFigure,
      sourceRefs: resourcesFigure.nodes?.map((node) => ({ kind: 'node' as const, id: node.id, field: 'title' as const })) ?? []
    });
  }

  const page2: TheoryDocumentPageModel = {
    id: 'page-resources',
    kind: 'narrative',
    pageNumber: 2,
    title: 'Recursos e ações previstas',
    sections: page2Sections
  };

  const page3Sections: TheoryDocumentSection[] = [
    {
      id: nextId(counters, 's'),
      number: '3',
      title: 'Entregas, condições e resultado esperado',
      level: 1,
      paragraphs: [],
      sourceRefs: []
    },
    ...deliverySections
  ];
  if (convergenceFigure) {
    page3Sections.push({
      id: nextId(counters, 's'),
      level: 1,
      figure: convergenceFigure,
      sourceRefs: convergenceFigure.nodes?.map((node) => ({ kind: 'node' as const, id: node.id, field: 'title' as const })) ?? []
    });
  }
  page3Sections.push({
    id: nextId(counters, 's'),
    number: `${3}.${deliverySections.length + 1}`,
    title: 'Síntese',
    level: 2,
    paragraphs: conclusionParagraphs,
    sourceRefs: [{ kind: 'count', field: 'label' }]
  });

  const page3: TheoryDocumentPageModel = {
    id: 'page-analysis',
    kind: 'analysis',
    pageNumber: 3,
    title: 'Entregas, condições e resultado',
    sections: page3Sections
  };

  const references = CLEAR_METHODOLOGICAL_REFERENCES;
  const page4: TheoryDocumentPageModel = {
    id: 'page-references',
    kind: 'references',
    pageNumber: 4,
    title: NARRATIVE_LABELS.references,
    sections: [
      {
        id: nextId(counters, 's'),
        title: NARRATIVE_LABELS.references,
        level: 1,
        paragraphs: [],
        sourceRefs: references.map((ref) => ({ kind: 'reference' as const, id: ref.id }))
      }
    ]
  };

  return {
    pages: [page1, page2, page3, page4],
    executiveSummary,
    references
  };
}

function buildScopedPages(
  graph: NarrativeGraph,
  counters: BuilderCounters,
  markerIds: string[],
  includeReferencesPage: boolean
): {
  pages: TheoryDocumentPageModel[];
  executiveSummary: NarrativeParagraph[];
  references: typeof CLEAR_SCOPED_EXPORT_REFERENCES;
} {
  const counts = countStagesByType(graph);
  const conditionCounts = countValidConditions(graph);
  const { startTitle, endTitle } = resolveNarrativeEndpoints(graph);

  const executiveSummary: NarrativeParagraph[] = [];
  pushParagraph(
    executiveSummary,
    counters,
    scopedIntroduction(startTitle, endTitle),
    'executive-summary',
    [...graph.nodes.values()].map((node) => ({ kind: 'node' as const, id: node.id, field: 'title' as const })),
    true
  );

  const overviewFigure = buildOverviewFigure(graph, 'scoped', counts);
  const emittedNodes = new Set<string>();
  const emittedEdges = new Set<string>();
  const resourceSections = narrateResourcesAndActions(graph, counters, markerIds, emittedNodes, emittedEdges);
  const delivery = narrateDeliveriesAndResult(graph, counters, markerIds, emittedNodes, emittedEdges);
  const disconnected = narrateDisconnected(graph, counters, emittedNodes);

  const conclusionParagraphs: NarrativeParagraph[] = [];
  pushParagraph(
    conclusionParagraphs,
    counters,
    scopedConclusion(startTitle, endTitle, conditionCounts.riskCount, conditionCounts.hypothesisCount),
    'conclusion',
    [{ kind: 'count', field: 'label' }],
    true
  );

  const page1: TheoryDocumentPageModel = {
    id: 'page-scoped-overview',
    kind: 'overview',
    pageNumber: 1,
    title: 'Recorte selecionado',
    sections: [
      {
        id: nextId(counters, 's'),
        number: '1',
        title: 'Recorte do fluxo selecionado',
        level: 1,
        paragraphs: executiveSummary,
        figure: overviewFigure,
        sourceRefs: [{ kind: 'count', field: 'label' }]
      }
    ]
  };

  const narrativeSections = numberSections(
    [...resourceSections, ...delivery.sections, ...disconnected],
    2
  );
  const page2: TheoryDocumentPageModel = {
    id: 'page-scoped-narrative',
    kind: 'narrative',
    pageNumber: 2,
    title: 'Narrativa do recorte',
    sections: [
      {
        id: nextId(counters, 's'),
        number: '2',
        title: 'Percurso registrado',
        level: 1,
        paragraphs: [],
        sourceRefs: []
      },
      ...narrativeSections,
      {
        id: nextId(counters, 's'),
        number: `2.${narrativeSections.length + 1}`,
        title: 'Síntese',
        level: 2,
        paragraphs: conclusionParagraphs,
        sourceRefs: [{ kind: 'count', field: 'label' }]
      }
    ]
  };

  const pages = [page1, page2];
  const references = CLEAR_SCOPED_EXPORT_REFERENCES;

  if (includeReferencesPage) {
    pages.push({
      id: 'page-scoped-references',
      kind: 'references',
      pageNumber: pages.length + 1,
      title: NARRATIVE_LABELS.references,
      sections: [
        {
          id: nextId(counters, 's'),
          title: NARRATIVE_LABELS.references,
          level: 1,
          paragraphs: [],
          sourceRefs: references.map((ref) => ({ kind: 'reference' as const, id: ref.id }))
        }
      ]
    });
  }

  // If narrative is thin, keep a single content page + optional refs
  const hasBody =
    narrativeSections.some(
      (section) => (section.paragraphs?.length ?? 0) > 0 || (section.callouts?.length ?? 0) > 0
    );
  if (!hasBody) {
    page1.sections[0] = {
      ...page1.sections[0],
      paragraphs: [...executiveSummary, ...conclusionParagraphs]
    };
    return {
      pages: includeReferencesPage ? [page1, pages[pages.length - 1]] : [page1],
      executiveSummary,
      references
    };
  }

  return { pages, executiveSummary, references };
}

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

import { stageLabel } from '../theory-narrative.grammar';
import {
  countStagesByType,
  countValidConditions,
  type NarrativeGraph
} from '../theory-narrative.graph';
import {
  CLEAR_METHODOLOGICAL_REFERENCES,
  CLEAR_SCOPED_EXPORT_REFERENCES,
  disconnectedParagraph,
  macroConclusion,
  macroExecutiveSummary,
  NARRATIVE_LABELS,
  readingOrientationParagraph,
  scopedConclusion,
  scopedIntroduction
} from '../theory-narrative.templates';
import type {
  NarrativeParagraph,
  TheoryDocumentPageModel,
  TheoryDocumentSection
} from '../theory-narrative.types';
import {
  type BuilderCounters,
  nextId,
  numberSections,
  pushParagraph
} from './theory-document-builders';
import {
  findDisconnectedNarrativeNodes,
  resolveNarrativeEndpoints
} from './theory-graph-traversal';
import { narrateResourcesAndActions } from './theory-resource-action-builders';
import { narrateDeliveriesAndResult } from './theory-delivery-result-builders';
import {
  buildConvergenceFigure,
  buildOverviewFigure,
  buildResourcesFigure,
  titlesByStage
} from './theory-figure-builders';

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

export function buildMacroPages(
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

export function buildScopedPages(
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

  const hasBody = narrativeSections.some(
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

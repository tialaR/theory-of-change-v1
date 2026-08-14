import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import { stageLabel } from './theory-narrative.grammar';
import {
  buildNarrativeGraph,
  compareNarrativeNodes,
  countStagesByType,
  countValidConditions,
  enumerateLinearPaths,
  findWeaklyConnectedComponents,
  resolveScopedFlow,
  type NarrativeGraph
} from './theory-narrative.graph';
import {
  activityToProductParagraph,
  branchParagraph,
  CLEAR_METHODOLOGICAL_REFERENCES,
  CLEAR_SCOPED_EXPORT_REFERENCES,
  convergenceParagraph,
  disconnectedParagraph,
  FIGURE_SOURCES,
  hypothesisTransitionSentence,
  inputOpeningParagraph,
  inputToActivityParagraph,
  macroConclusion,
  macroExecutiveSummary,
  NARRATIVE_LABELS,
  NARRATIVE_TITLES,
  productToResultParagraph,
  readingOrientationParagraph,
  riskTransitionSentence,
  scopedConclusion,
  scopedIntroduction
} from './theory-narrative.templates';
import type {
  NarrativeNodeFields,
  NarrativeParagraph,
  TheoryDocumentCallout,
  TheoryDocumentFigure,
  TheoryDocumentModel,
  TheoryDocumentPageModel,
  TheoryDocumentSection,
  TheoryFigureEdge,
  TheoryFigureNode,
  TheoryNarrativeSelection,
  TheorySourceRef
} from './theory-narrative.types';

type BuilderCounters = {
  paragraph: number;
  section: number;
  callout: number;
  figure: number;
};

function nextId(counters: BuilderCounters, prefix: 'p' | 's' | 'c' | 'f'): string {
  if (prefix === 'p') {
    counters.paragraph += 1;
    return `p-${counters.paragraph}`;
  }
  if (prefix === 's') {
    counters.section += 1;
    return `s-${counters.section}`;
  }
  if (prefix === 'c') {
    counters.callout += 1;
    return `c-${counters.callout}`;
  }
  counters.figure += 1;
  return `f-${counters.figure}`;
}

function nodeRefs(node: NarrativeNodeFields, fields: Array<'title' | 'description' | 'details' | 'notes'>): TheorySourceRef[] {
  return fields.map((field) => ({ kind: 'node' as const, id: node.id, field }));
}

function titlesByStage(graph: NarrativeGraph, stage: NarrativeNodeFields['stage']): string[] {
  return [...graph.nodes.values()]
    .filter((node) => node.stage === stage)
    .sort(compareNarrativeNodes)
    .map((node) => node.title);
}

function toFigureNodes(graph: NarrativeGraph, filter?: (node: NarrativeNodeFields) => boolean): TheoryFigureNode[] {
  return [...graph.nodes.values()]
    .filter((node) => (filter ? filter(node) : true))
    .sort(compareNarrativeNodes)
    .map((node) => ({ id: node.id, title: node.title, stage: node.stage }));
}

function toFigureEdges(graph: NarrativeGraph, filter?: (edge: { sourceStage?: string; targetStage?: string }) => boolean): TheoryFigureEdge[] {
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

function paragraph(
  counters: BuilderCounters,
  text: string,
  role: NarrativeParagraph['role'],
  sourceRefs: TheorySourceRef[],
  suppressIndent = false
): NarrativeParagraph | null {
  const clean = text.trim();
  if (!clean) {
    return null;
  }
  return {
    id: nextId(counters, 'p'),
    text: clean,
    role,
    sourceRefs,
    suppressIndent
  };
}

function pushParagraph(
  list: NarrativeParagraph[],
  counters: BuilderCounters,
  text: string,
  role: NarrativeParagraph['role'],
  sourceRefs: TheorySourceRef[],
  suppressIndent = false
) {
  const item = paragraph(counters, text, role, sourceRefs, suppressIndent);
  if (item) {
    list.push(item);
  }
}

function buildOverviewFigure(graph: NarrativeGraph, mode: 'macro' | 'scoped', counts: ReturnType<typeof countStagesByType>): TheoryDocumentFigure {
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

function buildResourcesFigure(graph: NarrativeGraph): TheoryDocumentFigure | null {
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

function buildConvergenceFigure(graph: NarrativeGraph): TheoryDocumentFigure | null {
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
  if (!hasConvergence && nodes.length <= 3) {
    // Still useful when there are multiple products/results linked.
    if (edges.length < 2) {
      return null;
    }
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

function emitRiskCallouts(
  counters: BuilderCounters,
  markerIds: string[],
  edgeId: string,
  sourceTitle: string,
  targetTitle: string,
  risks: Array<{ id: string; text: string }>,
  paragraphs: NarrativeParagraph[],
  callouts: TheoryDocumentCallout[]
) {
  if (risks.length === 0) {
    return;
  }
  pushParagraph(
    paragraphs,
    counters,
    riskTransitionSentence(sourceTitle, targetTitle),
    'risk',
    [
      { kind: 'edge', id: edgeId },
      ...risks.map((risk) => ({ kind: 'risk' as const, id: risk.id, field: 'text' as const }))
    ],
    true
  );
  risks.forEach((risk) => {
    callouts.push({
      id: risk.id,
      kind: 'risk',
      label: NARRATIVE_LABELS.risk,
      text: risk.text,
      edgeId,
      sourceRefs: [
        { kind: 'risk', id: risk.id, field: 'text' },
        { kind: 'edge', id: edgeId }
      ]
    });
    markerIds.push(risk.id);
  });
}

function emitHypothesisCallouts(
  counters: BuilderCounters,
  markerIds: string[],
  edgeId: string,
  productTitle: string,
  resultTitle: string,
  hypotheses: Array<{ id: string; text: string }>,
  paragraphs: NarrativeParagraph[],
  callouts: TheoryDocumentCallout[]
) {
  if (hypotheses.length === 0) {
    return;
  }
  pushParagraph(
    paragraphs,
    counters,
    hypothesisTransitionSentence(productTitle, resultTitle),
    'hypothesis',
    [
      { kind: 'edge', id: edgeId },
      ...hypotheses.map((item) => ({ kind: 'hypothesis' as const, id: item.id, field: 'text' as const }))
    ],
    true
  );
  hypotheses.forEach((hypothesis) => {
    callouts.push({
      id: hypothesis.id,
      kind: 'hypothesis',
      label: NARRATIVE_LABELS.hypothesis,
      text: hypothesis.text,
      edgeId,
      sourceRefs: [
        { kind: 'hypothesis', id: hypothesis.id, field: 'text' },
        { kind: 'edge', id: edgeId }
      ]
    });
    markerIds.push(hypothesis.id);
  });
}

type NarrativeBundle = {
  paragraphs: NarrativeParagraph[];
  callouts: TheoryDocumentCallout[];
};

function narrateResourcesAndActions(
  graph: NarrativeGraph,
  counters: BuilderCounters,
  markerIds: string[],
  emittedNodes: Set<string>,
  emittedEdges: Set<string>
): TheoryDocumentSection[] {
  const sections: TheoryDocumentSection[] = [];
  const inputs = [...graph.nodes.values()]
    .filter((node) => node.stage === 'input')
    .sort(compareNarrativeNodes);

  inputs.forEach((input) => {
    const outgoing = graph.outgoing.get(input.id) ?? [];
    const paragraphs: NarrativeParagraph[] = [];
    const callouts: TheoryDocumentCallout[] = [];
    const sourceRefs: TheorySourceRef[] = [{ kind: 'node', id: input.id, field: 'title' }];

    if (outgoing.length === 0) {
      return;
    }

    if (!emittedNodes.has(input.id)) {
      const opening = inputOpeningParagraph(input);
      pushParagraph(paragraphs, counters, opening.text, 'opening', nodeRefs(input, opening.fieldsUsed), true);
      emittedNodes.add(input.id);
    }

    const targetIds = outgoing
      .map((edgeId) => graph.edges.get(edgeId)?.targetId)
      .filter((id): id is string => Boolean(id));
    const uniqueTargets = [...new Set(targetIds)];

    if (uniqueTargets.length > 1) {
      const titles = uniqueTargets
        .map((id) => graph.nodes.get(id)?.title)
        .filter((title): title is string => Boolean(title));
      pushParagraph(
        paragraphs,
        counters,
        branchParagraph(input.title, titles),
        'branch',
        [{ kind: 'node', id: input.id, field: 'title' }, ...outgoing.map((id) => ({ kind: 'edge' as const, id }))]
      );
    }

    outgoing.forEach((edgeId) => {
      if (emittedEdges.has(edgeId)) {
        return;
      }
      emittedEdges.add(edgeId);
      const edge = graph.edges.get(edgeId);
      const activity = edge ? graph.nodes.get(edge.targetId) : undefined;
      if (!edge || !activity) {
        return;
      }

      if ((graph.incoming.get(activity.id)?.length ?? 0) > 1 && emittedNodes.has(activity.id)) {
        const sources = (graph.incoming.get(activity.id) ?? [])
          .map((id) => graph.edges.get(id)?.sourceId)
          .map((id) => (id ? graph.nodes.get(id)?.title : undefined))
          .filter((title): title is string => Boolean(title));
        pushParagraph(
          paragraphs,
          counters,
          convergenceParagraph(sources, activity.title, graph.incoming.get(activity.id)?.length ?? 0),
          'convergence',
          [{ kind: 'node', id: activity.id, field: 'title' }, { kind: 'edge', id: edgeId }]
        );
      } else if (!emittedNodes.has(activity.id)) {
        const body = inputToActivityParagraph(activity);
        pushParagraph(
          paragraphs,
          counters,
          body.text,
          'transition',
          [...nodeRefs(activity, body.fieldsUsed), { kind: 'edge', id: edgeId }]
        );
        emittedNodes.add(activity.id);
      } else {
        pushParagraph(
          paragraphs,
          counters,
          `Esses recursos sustentam a realização da atividade “${activity.title}”.`,
          'transition',
          [{ kind: 'node', id: activity.id, field: 'title' }, { kind: 'edge', id: edgeId }]
        );
      }

      emitRiskCallouts(
        counters,
        markerIds,
        edgeId,
        input.title,
        activity.title,
        edge.risks,
        paragraphs,
        callouts
      );
    });

    if (paragraphs.length === 0 && callouts.length === 0) {
      return;
    }

    sections.push({
      id: nextId(counters, 's'),
      number: undefined,
      title: input.title,
      level: 2,
      paragraphs,
      callouts: callouts.length > 0 ? callouts : undefined,
      sourceRefs
    });
  });

  // Activities reached only as orphans with connections already handled above.
  // Fully disconnected nodes are left for narrateDisconnected.
  const orphanActivities = [...graph.nodes.values()]
    .filter((node) => {
      if (node.stage !== 'activity' || emittedNodes.has(node.id)) {
        return false;
      }
      const inCount = graph.incoming.get(node.id)?.length ?? 0;
      const outCount = graph.outgoing.get(node.id)?.length ?? 0;
      return inCount > 0 || outCount > 0;
    })
    .sort(compareNarrativeNodes);

  orphanActivities.forEach((activity) => {
    const body = inputToActivityParagraph(activity);
    const paragraphs: NarrativeParagraph[] = [];
    pushParagraph(paragraphs, counters, body.text, 'stage-description', nodeRefs(activity, body.fieldsUsed), true);
    emittedNodes.add(activity.id);
    sections.push({
      id: nextId(counters, 's'),
      title: activity.title,
      level: 2,
      paragraphs,
      sourceRefs: [{ kind: 'node', id: activity.id, field: 'title' }]
    });
  });

  return sections;
}

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

      emitRiskCallouts(
        counters,
        markerIds,
        edgeId,
        activity.title,
        product.title,
        edge.risks,
        paragraphs,
        callouts
      );

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

      emitHypothesisCallouts(
        counters,
        markerIds,
        edgeId,
        product.title,
        result.title,
        edge.hypotheses,
        paragraphs,
        callouts
      );

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
  const disconnected = [...graph.nodes.values()]
    .filter((node) => {
      const inCount = graph.incoming.get(node.id)?.length ?? 0;
      const outCount = graph.outgoing.get(node.id)?.length ?? 0;
      return inCount === 0 && outCount === 0 && !emittedNodes.has(node.id);
    })
    .sort(compareNarrativeNodes);

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

function numberSections(sections: TheoryDocumentSection[], chapter: number): TheoryDocumentSection[] {
  let index = 0;
  return sections.map((section) => {
    if (!section.title) {
      return section;
    }
    index += 1;
    return {
      ...section,
      number: `${chapter}.${index}`
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
  const paths = enumerateLinearPaths(graph);
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

  void paths;
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
  const roots = graph.roots
    .map((id) => graph.nodes.get(id))
    .filter((node): node is NarrativeNodeFields => Boolean(node))
    .sort(compareNarrativeNodes);
  const terminals = graph.terminals
    .map((id) => graph.nodes.get(id))
    .filter((node): node is NarrativeNodeFields => Boolean(node))
    .sort(compareNarrativeNodes);
  const startTitle = roots[0]?.title ?? [...graph.nodes.values()].sort(compareNarrativeNodes)[0]?.title ?? 'fluxo';
  const endTitle =
    terminals[terminals.length - 1]?.title ??
    [...graph.nodes.values()].sort(compareNarrativeNodes).at(-1)?.title ??
    startTitle;

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
  const paths = enumerateLinearPaths(graph);
  const components = findWeaklyConnectedComponents(graph);

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
      pathsCount: Math.max(paths.length, components.length, 1),
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
  if (nodes.length === 0) {
    return null;
  }

  if (!selection) {
    return assembleDocument('macro', buildNarrativeGraph(nodes, edges), null);
  }

  const flow = resolveScopedFlow(selection, edges);
  if (flow.nodeIds.size === 0) {
    return null;
  }

  const graph = buildNarrativeGraph(nodes, edges, flow);
  if (graph.nodes.size === 0) {
    return null;
  }

  return assembleDocument('scoped', graph, selection, {
    includeReferencesPage: options?.includeReferencesPage ?? false
  });
}

/** Alias for clarity in newer call sites. */
export const buildTheoryDocument = buildTheoryNarrativeDocument;

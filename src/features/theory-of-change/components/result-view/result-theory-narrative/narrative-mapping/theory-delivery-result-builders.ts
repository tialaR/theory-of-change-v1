import {
  compareNarrativeNodes,
  type NarrativeGraph
} from '../theory-narrative.graph';
import {
  activityToProductParagraph,
  branchParagraph,
  convergenceParagraph,
  productToResultParagraph
} from '../theory-narrative.templates';
import {
  emitHypothesisConditions,
  emitRiskConditions
} from './theory-condition-builders';
import {
  type BuilderCounters,
  nextId,
  nodeRefs,
  pushParagraph
} from './theory-document-builders';
import type {
  NarrativeParagraph,
  TheoryDocumentCallout,
  TheoryDocumentSection
} from '../theory-narrative.types';

export function narrateDeliveriesAndResult(
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


import { compareNarrativeNodes, type NarrativeGraph } from '../theory-narrative.graph';
import {
  branchParagraph,
  convergenceParagraph,
  inputOpeningParagraph,
  inputToActivityParagraph
} from '../theory-narrative.templates';
import { emitRiskConditions } from './theory-condition-builders';
import {
  type BuilderCounters,
  nextId,
  nodeRefs,
  pushParagraph
} from './theory-document-builders';
import type {
  NarrativeParagraph,
  TheoryDocumentCallout,
  TheoryDocumentSection,
  TheorySourceRef
} from '../theory-narrative.types';

export function narrateResourcesAndActions(
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

      emitRiskConditions({
        counters,
        markerIds,
        edgeId,
        sourceTitle: input.title,
        targetTitle: activity.title,
        risks: edge.risks,
        paragraphs,
        callouts
      });
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


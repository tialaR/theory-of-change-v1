import {
  hypothesisTransitionSentence,
  NARRATIVE_LABELS,
  riskTransitionSentence
} from '../theory-narrative.templates';
import type {
  NarrativeParagraph,
  TheoryDocumentCallout
} from '../theory-narrative.types';
import {
  type BuilderCounters,
  pushParagraph
} from './theory-document-builders';

type NarrativeCondition = {
  id: string;
  text: string;
};

type ConditionEmissionOptions = {
  counters: BuilderCounters;
  markerIds: string[];
  edgeId: string;
  sourceTitle: string;
  targetTitle: string;
  paragraphs: NarrativeParagraph[];
  callouts: TheoryDocumentCallout[];
};

function appendMarkerCallout(
  markerIds: string[],
  callouts: TheoryDocumentCallout[],
  edgeId: string,
  condition: NarrativeCondition,
  kind: 'risk' | 'hypothesis',
  label: string
) {
  callouts.push({
    id: condition.id,
    kind,
    label,
    text: condition.text,
    edgeId,
    sourceRefs: [
      { kind, id: condition.id, field: 'text' },
      { kind: 'edge', id: edgeId }
    ]
  });
  markerIds.push(condition.id);
}

export function emitRiskConditions(
  options: ConditionEmissionOptions & { risks: NarrativeCondition[] }
) {
  const {
    counters,
    markerIds,
    edgeId,
    sourceTitle,
    targetTitle,
    risks,
    paragraphs,
    callouts
  } = options;

  if (risks.length === 0) return;

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
    appendMarkerCallout(markerIds, callouts, edgeId, risk, 'risk', NARRATIVE_LABELS.risk);
  });
}

export function emitHypothesisConditions(
  options: ConditionEmissionOptions & { hypotheses: NarrativeCondition[] }
) {
  const {
    counters,
    markerIds,
    edgeId,
    sourceTitle,
    targetTitle,
    hypotheses,
    paragraphs,
    callouts
  } = options;

  if (hypotheses.length === 0) return;

  pushParagraph(
    paragraphs,
    counters,
    hypothesisTransitionSentence(sourceTitle, targetTitle),
    'hypothesis',
    [
      { kind: 'edge', id: edgeId },
      ...hypotheses.map((item) => ({ kind: 'hypothesis' as const, id: item.id, field: 'text' as const }))
    ],
    true
  );

  hypotheses.forEach((hypothesis) => {
    appendMarkerCallout(
      markerIds,
      callouts,
      edgeId,
      hypothesis,
      'hypothesis',
      NARRATIVE_LABELS.hypothesis
    );
  });
}

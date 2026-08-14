import type { TdmStage } from '@/features/theory-of-change/domain/tdm-stages';

/** Official narrative modes — V2.3 document model. */
export type TheoryNarrativeMode = 'macro' | 'scoped';

/** Screen vs export presentation — same DocumentModel. */
export type TheoryDocumentPresentation = 'screen' | 'export';

export type TheoryNarrativeSelection =
  | { type: 'node'; id: string }
  | { type: 'edge'; id: string }
  | null;

export type TheorySourceRef = {
  kind: 'node' | 'edge' | 'risk' | 'hypothesis' | 'count' | 'stage' | 'reference';
  id?: string;
  field?: 'title' | 'description' | 'details' | 'notes' | 'text' | 'stage' | 'label';
};

export type NarrativeParagraphRole =
  | 'executive-summary'
  | 'opening'
  | 'orientation'
  | 'stage-description'
  | 'transition'
  | 'branch'
  | 'convergence'
  | 'risk'
  | 'hypothesis'
  | 'conclusion';

export type NarrativeParagraph = {
  id: string;
  text: string;
  role: NarrativeParagraphRole;
  sourceRefs: TheorySourceRef[];
  /** First paragraph after heading/figure/callout has no first-line indent. */
  suppressIndent?: boolean;
};

export type TheoryDocumentCallout = {
  id: string;
  kind: 'risk' | 'hypothesis';
  label: string;
  /** Original registered text — never rewritten. */
  text: string;
  edgeId: string;
  sourceRefs: TheorySourceRef[];
};

export type TheoryDocumentFigureKind =
  | 'overview'
  | 'resources-map'
  | 'convergence-map'
  | 'selected-path';

export type TheoryFigureNode = {
  id: string;
  title: string;
  stage: TdmStage;
};

export type TheoryFigureEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  sourceStage: TdmStage;
  targetStage: TdmStage;
  marker: 'R' | 'H' | null;
};

export type TheoryDocumentFigure = {
  id: string;
  kind: TheoryDocumentFigureKind;
  number: number;
  title: string;
  sourceNote: string;
  altText: string;
  stageCounts?: {
    inputs: number;
    activities: number;
    products: number;
    results: number;
  };
  nodes?: TheoryFigureNode[];
  edges?: TheoryFigureEdge[];
};

export type TheoryDocumentSection = {
  id: string;
  number?: string;
  title?: string;
  level: 1 | 2 | 3;
  paragraphs?: NarrativeParagraph[];
  figure?: TheoryDocumentFigure;
  callouts?: TheoryDocumentCallout[];
  sourceRefs: TheorySourceRef[];
};

export type TheoryDocumentPageKind = 'overview' | 'narrative' | 'analysis' | 'references';

export type TheoryDocumentPageModel = {
  id: string;
  kind: TheoryDocumentPageKind;
  pageNumber: number;
  title?: string;
  sections: TheoryDocumentSection[];
};

export type TheoryReference = {
  id: string;
  text: string;
};

export type TheoryDocumentMetadata = {
  stagesCount: number;
  connectionsCount: number;
  pathsCount: number;
  riskCount: number;
  hypothesisCount: number;
  inputsCount: number;
  activitiesCount: number;
  productsCount: number;
  resultsCount: number;
};

/** Canonical V2.3 document ViewModel (screen + export). */
export type TheoryDocumentModel = {
  scope: TheoryNarrativeMode;
  title: string;
  subtitle?: string;
  metadata: TheoryDocumentMetadata;
  executiveSummary: NarrativeParagraph[];
  pages: TheoryDocumentPageModel[];
  references: TheoryReference[];
  selection: TheoryNarrativeSelection;
  markerIds: string[];
  /** @deprecated Prefer `scope`. Kept for pane compatibility. */
  mode: TheoryNarrativeMode;
};

/** @deprecated Alias — use TheoryDocumentModel. */
export type TheoryNarrativeDocumentViewModel = TheoryDocumentModel;

/** Legacy flowchart shape retained for export SVG helpers. */
export type TheoryNarrativeFlowchartTransition = {
  id: string;
  sourceStage: TdmStage;
  targetStage: TdmStage;
  conditionKind: 'risk' | 'hypothesis';
  structuralLabel: 'RISCO' | 'HIPÓTESE';
  compactLabel: string | null;
  count: number;
};

export type TheoryNarrativeFlowchartViewModel = {
  figureTitle: string;
  caption: string;
  sourceNote: string;
  altText: string;
  stages: Array<{
    stage: TdmStage;
    title: string;
    subtitle: string;
  }>;
  transitions: TheoryNarrativeFlowchartTransition[];
};

export type NarrativeNodeFields = {
  id: string;
  stage: TdmStage;
  title: string;
  description?: string;
  details?: string;
  notes?: string;
  position: { x: number; y: number };
};

export type NarrativeEdgeMarkers = {
  edgeId: string;
  sourceId: string;
  targetId: string;
  sourceStage?: TdmStage;
  targetStage?: TdmStage;
  label?: string;
  risks: Array<{ id: string; text: string }>;
  hypotheses: Array<{ id: string; text: string }>;
};

/** Invalid condition reports from matrix filtering. */
export type NarrativeConditionReport = {
  edgeId: string;
  kind: 'risk' | 'hypothesis';
  reason: string;
};

import type { TdmConnectionKind, TdmMarkerType } from '../../domain/tdm-types';
import type { TdmStage } from '../../domain/tdm-stages';

export type ResultBridgeKind = 'risk' | 'hypothesis';
export type ResultExportFormat = 'pdf' | 'png' | 'jpeg' | 'svg' | 'word';

export interface ResultBridgeConfig {
  id: string;
  connectionKind: TdmConnectionKind;
  markerKind: ResultBridgeKind;
  sourceStage: TdmStage;
  targetStage: TdmStage;
}

export interface ResultMarkerItem {
  edgeId: string;
  kind: ResultBridgeKind;
  text: string;
  sourceTitle: string;
  targetTitle: string;
}

export interface ExportFormatOption {
  id: ResultExportFormat;
  label: string;
  description: string;
  available: boolean;
  unavailableNote?: string;
}
export interface CausalFamily {
  selectedId: string | null;
  selectedEdgeId: string | null;
  incomingIds: string[];
  outgoingIds: string[];
  ancestorIds: Set<string>;
  descendantIds: Set<string>;
  relatedNodeIds: Set<string>;
  relatedEdgeIds: Set<string>;
  risks: ResultMarkerItem[];
  hypotheses: ResultMarkerItem[];
}

export interface ColumnHeaderState {
  isActive: boolean;
  isSelected: boolean;
  isDimmed: boolean;
}

export interface ConnectionInsightCopy {
  title: string;
  body: string;
}

export interface RelationLensContent {
  connectionKind: TdmConnectionKind;
  title: string;
  body: string;
  sourceTitle: string;
  targetTitle: string;
  risk?: ResultMarkerItem;
  hypothesis?: ResultMarkerItem;
  totalRelations: number;
}

export interface CardAnchorPoint {
  x: number;
  y: number;
}

export interface FlowPathDescriptor {
  edgeId: string;
  d: string;
  connectionKind: TdmConnectionKind;
  markerType?: TdmMarkerType;
  markerText?: string;
  markerPoint: CardAnchorPoint;
  drawDelay: number;
}
export type FlowReportPlacement = 'reportInputs' | 'reportActivities' | 'reportOutputs' | 'reportOutcomes';

export type FlowReportFocusKind = 'node' | 'edge';

export interface FlowReportContent {
  focusKind: FlowReportFocusKind;
  nodeId: string | null;
  edgeId: string | null;
  nodeTitle: string;
  stage: TdmStage | null;
  stageLabel: string;
  hasConnections: boolean;
  incomingTitles: string[];
  outgoingTitles: string[];
  risks: ResultMarkerItem[];
  hypotheses: ResultMarkerItem[];
  causalPaths: string[];
  primaryRelation: RelationLensContent | null;
  focusStageTitle: string;
  didacticNote: string;
  familyNodeTitles: string[];
}


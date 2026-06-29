import type { Edge, Node } from '@xyflow/react';
import type { TdmStage } from './tdm-stages';

export type TdmMarkerType = 'risk' | 'hypothesis';
export type TdmValidationStatus = 'valid' | 'invalid';

export interface TdmNodeDraft {
  title: string;
  description: string;
  advancedDetails: string;
  shortNotes: string;
}

export interface TdmNodeData extends Record<string, unknown> {
  stage: TdmStage;
  title: string;
  description: string;
  advancedDetails: string;
  shortNotes: string;
  nodeId?: string;
  isSelected?: boolean;
  isToolbarVisible?: boolean;
  onSelectNode?: (nodeId: string) => void;
  onCloseToolbar?: () => void;
  onStartInlineEdit?: (nodeId: string) => void;
  onUpdateNode?: (nodeId: string, payload: TdmNodeDraft) => boolean;
  onDuplicateNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
}

export interface TdmNode extends Node<TdmNodeData> {
  stage: TdmStage;
  title: string;
  description: string;
  advancedDetails: string;
  shortNotes: string;
  position: {
    x: number;
    y: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TdmEdgeData extends Record<string, unknown> {
  markerType?: TdmMarkerType;
  markerText?: string;
  validationStatus: TdmValidationStatus;
  validationMessage?: string;
}

export interface TdmEdge extends Edge<TdmEdgeData> {
  sourceStage: TdmStage;
  targetStage: TdmStage;
  markerType?: TdmMarkerType;
  markerText?: string;
  validationStatus: TdmValidationStatus;
  validationMessage?: string;
  createdAt: string;
  updatedAt: string;
}

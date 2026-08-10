import type { Dispatch, SetStateAction } from 'react';

import type { TdmStage } from '../../../../domain/tdm-stages';
import type { TdmEdge, TdmNode, TdmNodeDraft } from '../../../../domain/tdm-types';
import type { StageCreation } from '../../../../utils/stage-creation';

export type ViewMode = 'canvas' | 'example-preview' | 'result';

export type TheorySnapshot = {
  nodes: TdmNode[];
  edges: TdmEdge[];
  theoryTitle: string;
  stageCreation: StageCreation;
  creationDrafts: Record<TdmStage, TdmNodeDraft>;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
};

export type NavigationState = Omit<TheorySnapshot, never> & {
  canvasVariant: 'custom' | 'example';
};

export type NavigationSetters = {
  setNodes: Dispatch<SetStateAction<TdmNode[]>>;
  setEdges: Dispatch<SetStateAction<TdmEdge[]>>;
  setTheoryTitle: Dispatch<SetStateAction<string>>;
  setStageCreation: Dispatch<SetStateAction<StageCreation>>;
  setCreationDrafts: Dispatch<SetStateAction<Record<TdmStage, TdmNodeDraft>>>;
  setSelectedNodeId: Dispatch<SetStateAction<string | null>>;
  setToolbarNodeId: Dispatch<SetStateAction<string | null>>;
  setSelectedEdgeId: Dispatch<SetStateAction<string | null>>;
  setEditDraft: Dispatch<SetStateAction<TdmNodeDraft>>;
  setCreationError: Dispatch<SetStateAction<string | undefined>>;
  setEditError: Dispatch<SetStateAction<string | undefined>>;
  setEditingNodeId: Dispatch<SetStateAction<string | null>>;
  setCanvasVariant: Dispatch<SetStateAction<'custom' | 'example'>>;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
};

export type NavigationControllerParams = NavigationState &
  NavigationSetters & {
    emptyDraft: TdmNodeDraft;
    createEmptyDraftMap: () => Record<TdmStage, TdmNodeDraft>;
    resetCanvasSelection: () => void;
    bumpViewportReset: () => void;
  };

import type { ContextualFlowTooltipEvent } from '../../../toast/use-contextual-flow-tooltip';
import type { TdmToastInput } from '../../../toast/tdm-toast-types';
import type { TdmEdge, TdmNode, TdmNodeDraft } from '../../../../domain/tdm-types';
import type { StageCreation } from '../../../../utils/stage-creation';

export type UseCanvasStageGuideControllerParams = {
  nodes: TdmNode[];
  edges: TdmEdge[];
  stageCreation: StageCreation;
  selectedEdge: TdmEdge | null;
  emptyDraft: TdmNodeDraft;
  showFlowTooltip: (event: ContextualFlowTooltipEvent, message: TdmToastInput) => void;
  clearFlowTooltipEvent: (event: ContextualFlowTooltipEvent) => void;
  setStageCreation: (stage: StageCreation) => void;
  setSelectedNodeId: (id: string | null) => void;
  setToolbarNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
  setEditingNodeId: (id: string | null) => void;
  setEditDraft: (draft: TdmNodeDraft) => void;
  setEditError: (message: string | undefined) => void;
  setCreationError: (message: string | undefined) => void;
  setMarkerDraft: (draft: string) => void;
  setIsCreateAccordionOpen: (open: boolean) => void;
  setIsEditAccordionOpen: (open: boolean) => void;
};

export type StageAdvanceActions = Pick<
  UseCanvasStageGuideControllerParams,
  | 'emptyDraft'
  | 'showFlowTooltip'
  | 'setStageCreation'
  | 'setSelectedNodeId'
  | 'setToolbarNodeId'
  | 'setSelectedEdgeId'
  | 'setEditingNodeId'
  | 'setEditDraft'
  | 'setEditError'
  | 'setCreationError'
  | 'setMarkerDraft'
  | 'setIsCreateAccordionOpen'
  | 'setIsEditAccordionOpen'
>;

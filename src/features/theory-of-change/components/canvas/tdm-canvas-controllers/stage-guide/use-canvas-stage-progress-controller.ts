import { useCallback, useMemo } from 'react';

import {
  stageAdvancedFlowTooltipEvent,
  stageAdvancedToast
} from '../../../toast/tdm-toast-messages';
import {
  getNextStageCreation,
  getStageCounts,
  type StageCreation
} from '../../../../utils/stage-creation';
import type { TdmNode } from '../../../../domain/tdm-types';
import type { StageAdvanceActions } from './types';

type UseCanvasStageProgressControllerParams = StageAdvanceActions & {
  nodes: TdmNode[];
  stageCreation: StageCreation;
};

export function useCanvasStageProgressController({
  nodes,
  stageCreation,
  emptyDraft,
  showFlowTooltip,
  setStageCreation,
  setSelectedNodeId,
  setToolbarNodeId,
  setSelectedEdgeId,
  setEditingNodeId,
  setEditDraft,
  setEditError,
  setCreationError,
  setMarkerDraft,
  setIsCreateAccordionOpen,
  setIsEditAccordionOpen
}: UseCanvasStageProgressControllerParams) {
  const stageCounts = useMemo(() => getStageCounts(nodes), [nodes]);
  const canConnectNodes = stageCreation === 'ready-to-connect';
  const currentStageCount = canConnectNodes ? 0 : stageCounts[stageCreation];
  const canAdvance = !canConnectNodes && currentStageCount > 0;

  const advanceStage = useCallback(() => {
    if (stageCreation === 'ready-to-connect' || currentStageCount === 0) return;

    const nextStage = getNextStageCreation(stageCreation);
    if (nextStage === stageCreation) return;

    setStageCreation(nextStage);
    setSelectedNodeId(null);
    setToolbarNodeId(null);
    setSelectedEdgeId(null);
    setEditingNodeId(null);
    setEditDraft({ ...emptyDraft });
    setEditError(undefined);
    setCreationError(undefined);
    setMarkerDraft('');
    setIsCreateAccordionOpen(true);
    setIsEditAccordionOpen(false);

    const event = stageAdvancedFlowTooltipEvent(nextStage);
    const toast = stageAdvancedToast(nextStage);
    if (event && toast) showFlowTooltip(event, toast);
  }, [
    currentStageCount,
    emptyDraft,
    setCreationError,
    setEditDraft,
    setEditError,
    setEditingNodeId,
    setIsCreateAccordionOpen,
    setIsEditAccordionOpen,
    setMarkerDraft,
    setSelectedEdgeId,
    setSelectedNodeId,
    setStageCreation,
    setToolbarNodeId,
    showFlowTooltip,
    stageCreation
  ]);

  return { stageCounts, canConnectNodes, canAdvance, advanceStage };
}

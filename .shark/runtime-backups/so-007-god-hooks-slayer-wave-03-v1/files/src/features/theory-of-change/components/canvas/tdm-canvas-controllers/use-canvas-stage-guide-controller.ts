import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  stageAdvancedFlowTooltipEvent,
  stageAdvancedToast,
  theoryCompleteToast
} from '../../toast/tdm-toast-messages';
import { getConnectionKind } from '../../../domain/tdm-connection-rules';
import type { ContextualFlowTooltipEvent } from '../../toast/use-contextual-flow-tooltip';
import type { TdmToastInput } from '../../toast/tdm-toast-types';
import { getTheoryGuideContent } from '../../../domain/tdm-theory-guide';
import type { TdmStage } from '../../../domain/tdm-stages';
import type { TdmEdge, TdmNode, TdmNodeDraft } from '../../../domain/tdm-types';
import { canViewTdmResult, getTdmResultAvailabilityMessage } from '../../../utils/tdm-result';
import {
  getNextStageCreation,
  getStageCounts,
  type StageCreation
} from '../../../utils/stage-creation';

type UseCanvasStageGuideControllerParams = {
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

export function useCanvasStageGuideController({
  nodes,
  edges,
  stageCreation,
  selectedEdge,
  emptyDraft,
  showFlowTooltip,
  clearFlowTooltipEvent,
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
}: UseCanvasStageGuideControllerParams) {
  const [guideTransientMessage, setGuideTransientMessage] = useState<string | null>(null);
  const [connectingFromStage, setConnectingFromStage] = useState<TdmStage | null>(null);
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);

  const stageCounts = useMemo(() => getStageCounts(nodes), [nodes]);
  const canConnectNodes = stageCreation === 'ready-to-connect';
  const currentStageCount = stageCreation === 'ready-to-connect' ? 0 : stageCounts[stageCreation];
  const canAdvance = stageCreation !== 'ready-to-connect' && currentStageCount > 0;
  const canGenerateResult = canViewTdmResult(nodes, edges);
  const resultAvailabilityMessage = getTdmResultAvailabilityMessage(nodes, edges);

  const selectedConnectionKind = useMemo(() => {
    if (!selectedEdge) return undefined;
    return selectedEdge.data?.connectionKind ?? getConnectionKind(selectedEdge.sourceStage, selectedEdge.targetStage);
  }, [selectedEdge]);

  const hasEdgeMarkers = useMemo(
    () => edges.some((edge) => Boolean(edge.markerType && edge.markerText?.trim())),
    [edges]
  );

  const guideContent = useMemo(
    () =>
      getTheoryGuideContent({
        stageCounts,
        stageCreation,
        selectedConnectionKind,
        connectingFromStage,
        transientMessage: guideTransientMessage,
        isTheoryComplete: canGenerateResult,
        hasEdgeMarkers
      }),
    [
      canGenerateResult,
      connectingFromStage,
      guideTransientMessage,
      hasEdgeMarkers,
      selectedConnectionKind,
      stageCounts,
      stageCreation
    ]
  );

  const hasInitializedFlowTooltipRef = useRef(false);
  const previousCanGenerateResultRef = useRef(canGenerateResult);

  useEffect(() => {
    if (!hasInitializedFlowTooltipRef.current) {
      hasInitializedFlowTooltipRef.current = true;
      previousCanGenerateResultRef.current = canGenerateResult;
      return;
    }

    if (canGenerateResult && !previousCanGenerateResultRef.current) {
      showFlowTooltip('theory-complete', theoryCompleteToast());
    }

    if (!canGenerateResult && previousCanGenerateResultRef.current) {
      clearFlowTooltipEvent('theory-complete');
    }

    previousCanGenerateResultRef.current = canGenerateResult;
  }, [canGenerateResult, clearFlowTooltipEvent, showFlowTooltip]);

  const toggleGuideExpanded = useCallback(() => {
    setIsGuideExpanded((current) => !current);
  }, []);

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

    const flowTooltipEvent = stageAdvancedFlowTooltipEvent(nextStage);
    const flowTooltip = stageAdvancedToast(nextStage);
    if (flowTooltipEvent && flowTooltip) showFlowTooltip(flowTooltipEvent, flowTooltip);
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

  return {
    stageCounts,
    canConnectNodes,
    canAdvance,
    canGenerateResult,
    resultAvailabilityMessage,
    guideContent,
    guideTransientMessage,
    connectingFromStage,
    isGuideExpanded,
    setGuideTransientMessage,
    setConnectingFromStage,
    setIsGuideExpanded,
    toggleGuideExpanded,
    advanceStage
  };
}

import { useCallback, useMemo, useState } from 'react';

import { getConnectionKind } from '../../../../domain/tdm-connection-rules';
import { getTheoryGuideContent } from '../../../../domain/tdm-theory-guide';
import type { TdmStage } from '../../../../domain/tdm-stages';
import type { TdmEdge } from '../../../../domain/tdm-types';
import { getStageCounts, type StageCreation } from '../../../../utils/stage-creation';

type UseCanvasGuidePresentationControllerParams = {
  edges: TdmEdge[];
  selectedEdge: TdmEdge | null;
  stageCounts: ReturnType<typeof getStageCounts>;
  stageCreation: StageCreation;
  canGenerateResult: boolean;
};

export function useCanvasGuidePresentationController({
  edges,
  selectedEdge,
  stageCounts,
  stageCreation,
  canGenerateResult
}: UseCanvasGuidePresentationControllerParams) {
  const [guideTransientMessage, setGuideTransientMessage] = useState<string | null>(null);
  const [connectingFromStage, setConnectingFromStage] = useState<TdmStage | null>(null);
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);

  const selectedConnectionKind = useMemo(() => {
    if (!selectedEdge) return undefined;
    return (
      selectedEdge.data?.connectionKind ??
      getConnectionKind(selectedEdge.sourceStage, selectedEdge.targetStage)
    );
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

  const toggleGuideExpanded = useCallback(() => {
    setIsGuideExpanded((current) => !current);
  }, []);

  return {
    guideContent,
    guideTransientMessage,
    connectingFromStage,
    isGuideExpanded,
    setGuideTransientMessage,
    setConnectingFromStage,
    setIsGuideExpanded,
    toggleGuideExpanded
  };
}

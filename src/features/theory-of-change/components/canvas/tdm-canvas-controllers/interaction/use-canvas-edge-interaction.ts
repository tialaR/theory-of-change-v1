import { useCallback, type MouseEvent as ReactMouseEvent } from 'react';

import type { TdmEdge, TdmNodeDraft } from '../../../../domain/tdm-types';
import type { CanvasInteractionStateSetters } from './types';

interface UseCanvasEdgeInteractionArgs
  extends Pick<
    CanvasInteractionStateSetters,
    | 'setSelectedEdgeId'
    | 'setSelectedNodeId'
    | 'setToolbarNodeId'
    | 'setEditingNodeId'
    | 'setCreationError'
    | 'setEditError'
    | 'setEditDraft'
    | 'setIsEditAccordionOpen'
    | 'setMarkerDraft'
    | 'setGuideTransientMessage'
  > {
  emptyDraft: TdmNodeDraft;
}

export function useCanvasEdgeInteraction({
  emptyDraft,
  setSelectedEdgeId,
  setSelectedNodeId,
  setToolbarNodeId,
  setEditingNodeId,
  setCreationError,
  setEditError,
  setEditDraft,
  setIsEditAccordionOpen,
  setMarkerDraft,
  setGuideTransientMessage
}: UseCanvasEdgeInteractionArgs) {
  const handleEdgeClick = useCallback(
    (_event: ReactMouseEvent, edge: TdmEdge) => {
      setSelectedEdgeId(edge.id);
      setSelectedNodeId(null);
      setToolbarNodeId(null);
      setEditingNodeId(null);
      setCreationError(undefined);
      setEditError(undefined);
      setEditDraft({ ...emptyDraft });
      setIsEditAccordionOpen(false);
      setMarkerDraft(edge.markerText ?? '');
      setGuideTransientMessage(null);
    },
    [
      emptyDraft,
      setCreationError,
      setEditDraft,
      setEditError,
      setEditingNodeId,
      setGuideTransientMessage,
      setIsEditAccordionOpen,
      setMarkerDraft,
      setSelectedEdgeId,
      setSelectedNodeId,
      setToolbarNodeId
    ]
  );

  return { handleEdgeClick };
}

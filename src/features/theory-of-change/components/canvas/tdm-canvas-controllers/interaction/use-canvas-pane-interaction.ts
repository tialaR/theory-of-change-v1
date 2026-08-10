import { useCallback, type Dispatch, type MouseEvent as ReactMouseEvent, type SetStateAction } from 'react';

interface UseCanvasPaneInteractionArgs {
  editingNodeId: string | null;
  closeToolbarSelection: () => void;
  setSelectedEdgeId: Dispatch<SetStateAction<string | null>>;
  setMarkerDraft: Dispatch<SetStateAction<string>>;
  setMarkerEditorEdgeId: Dispatch<SetStateAction<string | null>>;
  setGuideTransientMessage: Dispatch<SetStateAction<string | null>>;
  setCreationError: Dispatch<SetStateAction<string | undefined>>;
  setEditError: Dispatch<SetStateAction<string | undefined>>;
}

export function useCanvasPaneInteraction({
  editingNodeId,
  closeToolbarSelection,
  setSelectedEdgeId,
  setMarkerDraft,
  setMarkerEditorEdgeId,
  setGuideTransientMessage,
  setCreationError,
  setEditError
}: UseCanvasPaneInteractionArgs) {
  const handlePaneClick = useCallback(() => {
    if (editingNodeId) return;
    closeToolbarSelection();
    setSelectedEdgeId(null);
    setMarkerDraft('');
    setMarkerEditorEdgeId(null);
    setGuideTransientMessage(null);
    setCreationError(undefined);
    setEditError(undefined);
  }, [
    closeToolbarSelection,
    editingNodeId,
    setCreationError,
    setEditError,
    setGuideTransientMessage,
    setMarkerDraft,
    setMarkerEditorEdgeId,
    setSelectedEdgeId
  ]);

  const handleFlowBackgroundClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (editingNodeId) return;
      const target = event.target as HTMLElement;
      if (target.closest('.react-flow__node') || !target.closest('.react-flow')) return;
      closeToolbarSelection();
    },
    [closeToolbarSelection, editingNodeId]
  );

  return { handlePaneClick, handleFlowBackgroundClick };
}

import { useCallback, type Dispatch, type SetStateAction } from 'react';

interface UseCanvasToolbarInteractionArgs {
  editingNodeId: string | null;
  setSelectedNodeId: Dispatch<SetStateAction<string | null>>;
  setToolbarNodeId: Dispatch<SetStateAction<string | null>>;
}

export function useCanvasToolbarInteraction({
  editingNodeId,
  setSelectedNodeId,
  setToolbarNodeId
}: UseCanvasToolbarInteractionArgs) {
  const closeToolbarSelection = useCallback(() => {
    if (editingNodeId) return;
    setToolbarNodeId(null);
    setSelectedNodeId(null);
  }, [editingNodeId, setSelectedNodeId, setToolbarNodeId]);

  const handleCloseToolbar = useCallback(() => {
    setToolbarNodeId(null);
  }, [setToolbarNodeId]);

  return { closeToolbarSelection, handleCloseToolbar };
}

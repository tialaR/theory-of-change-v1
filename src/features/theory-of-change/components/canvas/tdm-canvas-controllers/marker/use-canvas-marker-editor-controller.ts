import { useCallback } from 'react';

import type { MarkerEditorOwnerParams } from './types';

export function useCanvasMarkerEditorController(params: MarkerEditorOwnerParams) {
  const {
    setSelectedEdgeId,
    setSelectedNodeId,
    setToolbarNodeId,
    setEditingNodeId,
    setMarkerEditorEdgeId
  } = params;

  const openMarkerEditor = useCallback((edgeId: string) => {
    setMarkerEditorEdgeId(edgeId);
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
    setToolbarNodeId(null);
    setEditingNodeId(null);
  }, [setEditingNodeId, setMarkerEditorEdgeId, setSelectedEdgeId, setSelectedNodeId, setToolbarNodeId]);

  const closeMarkerEditor = useCallback(
    () => setMarkerEditorEdgeId(null),
    [setMarkerEditorEdgeId]
  );

  return { openMarkerEditor, closeMarkerEditor };
}

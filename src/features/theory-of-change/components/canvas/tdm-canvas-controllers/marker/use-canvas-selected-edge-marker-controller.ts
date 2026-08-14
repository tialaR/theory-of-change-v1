import { useCallback } from 'react';

import type { TdmEdge, TdmMarkerType } from '../../../../domain/tdm-types';
import type { SelectedEdgeMarkerOwnerParams } from './types';

export function useCanvasSelectedEdgeMarkerController(params: SelectedEdgeMarkerOwnerParams) {
  const {
    selectedEdge,
    markerDraft,
    setEdges,
    setSelectedEdgeId,
    setMarkerDraft,
    deleteMarkerFromEdge,
    openMarkerEditor,
    saveMarkerOnEdge
  } = params;

  const deleteSelectedEdge = useCallback(() => {
    if (!selectedEdge) return;
    setEdges((current) => current.filter((edge) => edge.id !== selectedEdge.id));
    setSelectedEdgeId(null);
    setMarkerDraft('');
  }, [selectedEdge, setEdges, setMarkerDraft, setSelectedEdgeId]);

  const deleteMarkerFromSelectedEdge = useCallback(() => {
    if (!selectedEdge) return;
    deleteMarkerFromEdge(selectedEdge.id);
    setSelectedEdgeId(selectedEdge.id);
  }, [deleteMarkerFromEdge, selectedEdge, setSelectedEdgeId]);

  const addMarkerToSelectedEdge = useCallback((markerType: TdmMarkerType) => {
    if (!selectedEdge) return;
    setEdges((current) => current.map((edge) => edge.id !== selectedEdge.id ? edge : ({
      ...edge,
      markerType,
      markerText: edge.markerText,
      data: {
        ...edge.data,
        markerType,
        markerText: edge.markerText,
        validationStatus: edge.data?.validationStatus ?? 'valid',
        validationMessage: edge.data?.validationMessage
      }
    } satisfies TdmEdge)));
    setMarkerDraft(selectedEdge.markerText ?? '');
    openMarkerEditor(selectedEdge.id);
  }, [openMarkerEditor, selectedEdge, setEdges, setMarkerDraft]);

  const saveMarkerOnSelectedEdge = useCallback(() => {
    if (selectedEdge?.markerType) saveMarkerOnEdge(selectedEdge.id, selectedEdge.markerType, markerDraft);
  }, [markerDraft, saveMarkerOnEdge, selectedEdge]);

  return {
    deleteSelectedEdge,
    deleteMarkerFromSelectedEdge,
    addMarkerToSelectedEdge,
    saveMarkerOnSelectedEdge
  };
}

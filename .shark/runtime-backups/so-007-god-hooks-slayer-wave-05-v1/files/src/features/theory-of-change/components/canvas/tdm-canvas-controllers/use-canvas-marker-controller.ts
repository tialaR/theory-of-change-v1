import { useCallback, type Dispatch, type SetStateAction } from 'react';

import {
  GUIDE_HYPOTHESIS_DELETED,
  GUIDE_HYPOTHESIS_SAVED,
  GUIDE_RISK_DELETED,
  GUIDE_RISK_SAVED
} from '../../../domain/tdm-connection-rules';
import type { TdmEdge, TdmMarkerType } from '../../../domain/tdm-types';

type Params = {
  edges: TdmEdge[];
  selectedEdge: TdmEdge | null;
  markerDraft: string;
  setEdges: Dispatch<SetStateAction<TdmEdge[]>>;
  setSelectedEdgeId: Dispatch<SetStateAction<string | null>>;
  setSelectedNodeId: Dispatch<SetStateAction<string | null>>;
  setToolbarNodeId: Dispatch<SetStateAction<string | null>>;
  setEditingNodeId: Dispatch<SetStateAction<string | null>>;
  setMarkerDraft: Dispatch<SetStateAction<string>>;
  setMarkerEditorEdgeId: Dispatch<SetStateAction<string | null>>;
  setGuideTransientMessage: Dispatch<SetStateAction<string | null>>;
  markEdgeRecentlyUpdated: (edgeId: string) => void;
};

export function useCanvasMarkerController(params: Params) {
  const {
    edges, selectedEdge, markerDraft, setEdges, setSelectedEdgeId, setSelectedNodeId,
    setToolbarNodeId, setEditingNodeId, setMarkerDraft, setMarkerEditorEdgeId,
    setGuideTransientMessage, markEdgeRecentlyUpdated
  } = params;

  const deleteSelectedEdge = useCallback(() => {
    if (!selectedEdge) return;
    setEdges((current) => current.filter((edge) => edge.id !== selectedEdge.id));
    setSelectedEdgeId(null);
    setMarkerDraft('');
  }, [selectedEdge, setEdges, setMarkerDraft, setSelectedEdgeId]);

  const deleteMarkerFromEdge = useCallback((edgeId: string) => {
    const edge = edges.find((item) => item.id === edgeId);
    if (!edge) return;
    const wasRisk = edge.markerType === 'risk';
    setEdges((current) => current.map((item) => item.id !== edgeId ? item : ({
      ...item,
      markerType: undefined,
      markerText: undefined,
      data: {
        ...item.data,
        markerType: undefined,
        markerText: undefined,
        riskText: undefined,
        hypothesisText: undefined,
        validationStatus: item.data?.validationStatus ?? 'valid',
        validationMessage: item.data?.validationMessage
      }
    } satisfies TdmEdge)));
    setMarkerEditorEdgeId(null);
    setMarkerDraft('');
    setGuideTransientMessage(wasRisk ? GUIDE_RISK_DELETED : GUIDE_HYPOTHESIS_DELETED);
  }, [edges, setEdges, setGuideTransientMessage, setMarkerDraft, setMarkerEditorEdgeId]);

  const saveMarkerOnEdge = useCallback((edgeId: string, markerType: TdmMarkerType, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const timestamp = new Date().toISOString();
    setEdges((current) => current.map((edge) => edge.id !== edgeId ? edge : ({
      ...edge,
      markerType,
      markerText: trimmed,
      updatedAt: timestamp,
      data: {
        ...edge.data,
        markerType,
        markerText: trimmed,
        riskText: markerType === 'risk' ? trimmed : edge.data?.riskText,
        hypothesisText: markerType === 'hypothesis' ? trimmed : edge.data?.hypothesisText,
        riskCreatedAt: markerType === 'risk' ? edge.data?.riskCreatedAt ?? timestamp : edge.data?.riskCreatedAt,
        hypothesisCreatedAt: markerType === 'hypothesis' ? edge.data?.hypothesisCreatedAt ?? timestamp : edge.data?.hypothesisCreatedAt,
        validationStatus: edge.data?.validationStatus ?? 'valid',
        validationMessage: edge.data?.validationMessage
      }
    } satisfies TdmEdge)));
    setMarkerEditorEdgeId(null);
    setMarkerDraft(trimmed);
    setGuideTransientMessage(markerType === 'risk' ? GUIDE_RISK_SAVED : GUIDE_HYPOTHESIS_SAVED);
    markEdgeRecentlyUpdated(edgeId);
  }, [markEdgeRecentlyUpdated, setEdges, setGuideTransientMessage, setMarkerDraft, setMarkerEditorEdgeId]);

  const openMarkerEditor = useCallback((edgeId: string) => {
    setMarkerEditorEdgeId(edgeId);
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
    setToolbarNodeId(null);
    setEditingNodeId(null);
  }, [setEditingNodeId, setMarkerEditorEdgeId, setSelectedEdgeId, setSelectedNodeId, setToolbarNodeId]);

  const closeMarkerEditor = useCallback(() => setMarkerEditorEdgeId(null), [setMarkerEditorEdgeId]);

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
    deleteSelectedEdge, deleteMarkerFromEdge, saveMarkerOnEdge, openMarkerEditor,
    closeMarkerEditor, deleteMarkerFromSelectedEdge, addMarkerToSelectedEdge,
    saveMarkerOnSelectedEdge
  };
}

import { useCallback } from 'react';

import {
  GUIDE_HYPOTHESIS_DELETED,
  GUIDE_HYPOTHESIS_SAVED,
  GUIDE_RISK_DELETED,
  GUIDE_RISK_SAVED
} from '../../../../domain/tdm-connection-rules';
import type { TdmEdge, TdmMarkerType } from '../../../../domain/tdm-types';
import type { MarkerMutationOwnerParams } from './types';

export function useCanvasMarkerMutationController(params: MarkerMutationOwnerParams) {
  const {
    edges,
    setEdges,
    setMarkerDraft,
    setMarkerEditorEdgeId,
    setGuideTransientMessage,
    markEdgeRecentlyUpdated
  } = params;

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

  return { deleteMarkerFromEdge, saveMarkerOnEdge };
}

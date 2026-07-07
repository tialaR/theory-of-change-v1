import { MarkerType } from '@xyflow/react';
import {
  getAllowedMarkerTypesForConnection,
  getConnectionKind,
  getTdmConnectionMessage,
  isAllowedTdmConnection
} from '../domain/tdm-connection-rules';
import { getConnectionStrokeColor } from '../domain/tdm-connection-theme';
import type { TdmEdge } from '../domain/tdm-types';
import type { TdmStage } from '../domain/tdm-stages';

const fallbackId = () => `edge-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();

export function createEdge({
  source,
  target,
  sourceStage,
  targetStage,
  markerType,
  markerText
}: {
  source: string;
  target: string;
  sourceStage: TdmStage;
  targetStage: TdmStage;
  markerType?: TdmEdge['markerType'];
  markerText?: string;
}): TdmEdge {
  const createdAt = now();
  const validationStatus = isAllowedTdmConnection(sourceStage, targetStage) ? 'valid' : 'invalid';
  const validationMessage = validationStatus === 'invalid' ? getTdmConnectionMessage(sourceStage, targetStage) : undefined;
  const allowedMarkerTypes = getAllowedMarkerTypesForConnection(sourceStage, targetStage);
  const resolvedMarkerType =
    markerType && allowedMarkerTypes.includes(markerType) ? markerType : undefined;
  const connectionKind = getConnectionKind(sourceStage, targetStage);
  const edgeColor = getConnectionStrokeColor(connectionKind, '#8B7CFF');
  const edgeMarker =
    validationStatus === 'valid'
      ? { type: MarkerType.ArrowClosed, width: 18, height: 18, color: edgeColor }
      : undefined;

  return {
    id: globalThis.crypto?.randomUUID?.() ?? fallbackId(),
    type: 'tdm',
    source,
    target,
    sourceStage,
    targetStage,
    markerType: resolvedMarkerType,
    markerText,
    validationStatus,
    validationMessage,
    markerEnd: edgeMarker,
    createdAt,
    updatedAt: createdAt,
    data: {
      sourceStage,
      targetStage,
      connectionKind,
      markerType: resolvedMarkerType,
      markerText,
      riskText: resolvedMarkerType === 'risk' ? markerText : undefined,
      hypothesisText: resolvedMarkerType === 'hypothesis' ? markerText : undefined,
      validationStatus,
      validationMessage
    }
  };
}

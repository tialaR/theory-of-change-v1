import { getConnectionKind } from '../../../domain/tdm-connection-rules';
import type { TdmEdge, TdmMarkerType } from '../../../domain/tdm-types';

export type CanvasEdgeViewActions = {
  selectedEdgeId: string | null;
  markerEditorEdgeId: string | null;
  recentlyUpdatedEdgeIds: Set<string>;
  onOpenMarkerEditor: (edgeId: string) => void;
  onCloseMarkerEditor: () => void;
  onSaveMarker: (edgeId: string, markerType: TdmMarkerType, text: string) => void;
  onDeleteMarker: (edgeId: string) => void;
};

export function buildCanvasFlowEdges(edges: TdmEdge[], actions: CanvasEdgeViewActions): TdmEdge[] {
  return edges.map((edge) => ({
    ...edge,
    selected: actions.selectedEdgeId === edge.id,
    data: {
      ...edge.data,
      sourceStage: edge.sourceStage,
      targetStage: edge.targetStage,
      connectionKind: edge.data?.connectionKind ?? getConnectionKind(edge.sourceStage, edge.targetStage),
      markerType: edge.markerType,
      markerText: edge.markerText,
      riskText: edge.data?.riskText,
      hypothesisText: edge.data?.hypothesisText,
      recentlyUpdated: actions.recentlyUpdatedEdgeIds.has(edge.id),
      isEditorOpen: actions.markerEditorEdgeId === edge.id,
      validationStatus: edge.validationStatus,
      validationMessage: edge.validationMessage,
      onOpenMarkerEditor: () => actions.onOpenMarkerEditor(edge.id),
      onCloseMarkerEditor: actions.onCloseMarkerEditor,
      onSaveMarker: actions.onSaveMarker,
      onDeleteMarker: actions.onDeleteMarker
    }
  }));
}

import { useCanvasMarkerEditorController } from './marker/use-canvas-marker-editor-controller';
import { useCanvasMarkerMutationController } from './marker/use-canvas-marker-mutation-controller';
import { useCanvasSelectedEdgeMarkerController } from './marker/use-canvas-selected-edge-marker-controller';
import type { CanvasMarkerControllerParams } from './marker/types';

export function useCanvasMarkerController(params: CanvasMarkerControllerParams) {
  const markerMutation = useCanvasMarkerMutationController(params);
  const markerEditor = useCanvasMarkerEditorController(params);
  const selectedEdgeMarker = useCanvasSelectedEdgeMarkerController({
    ...params,
    ...markerMutation,
    openMarkerEditor: markerEditor.openMarkerEditor
  });

  return {
    deleteSelectedEdge: selectedEdgeMarker.deleteSelectedEdge,
    deleteMarkerFromEdge: markerMutation.deleteMarkerFromEdge,
    saveMarkerOnEdge: markerMutation.saveMarkerOnEdge,
    openMarkerEditor: markerEditor.openMarkerEditor,
    closeMarkerEditor: markerEditor.closeMarkerEditor,
    deleteMarkerFromSelectedEdge: selectedEdgeMarker.deleteMarkerFromSelectedEdge,
    addMarkerToSelectedEdge: selectedEdgeMarker.addMarkerToSelectedEdge,
    saveMarkerOnSelectedEdge: selectedEdgeMarker.saveMarkerOnSelectedEdge
  };
}

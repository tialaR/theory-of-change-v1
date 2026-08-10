import { useEffect } from 'react';

type UseCanvasKeyboardControllerParams = {
  viewMode: 'canvas' | 'example-preview' | 'result';
  markerEditorEdgeId: string | null;
  clearCanvasSelection: () => void;
  fitCanvasToVisibleArea: () => void;
  centerNodes: () => void;
  toggleGuideExpanded: () => void;
  zoomIn: (options: { duration: number }) => void;
  zoomOut: (options: { duration: number }) => void;
  closeMarkerEditor: () => void;
};

export function useCanvasKeyboardController({
  viewMode,
  markerEditorEdgeId,
  clearCanvasSelection,
  fitCanvasToVisibleArea,
  centerNodes,
  toggleGuideExpanded,
  zoomIn,
  zoomOut,
  closeMarkerEditor
}: UseCanvasKeyboardControllerParams) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (viewMode !== 'canvas') {
        return;
      }

      const target = event.target;
      const isEditableTarget =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT');

      if (isEditableTarget) {
        if (event.key === 'Escape' && markerEditorEdgeId) {
          event.preventDefault();
          closeMarkerEditor();
        }
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        clearCanvasSelection();
        return;
      }

      if (event.metaKey || event.ctrlKey) {
        if (event.key === '+' || event.key === '=') {
          event.preventDefault();
          zoomIn({ duration: 160 });
        }
        if (event.key === '-') {
          event.preventDefault();
          zoomOut({ duration: 160 });
        }
        return;
      }

      if (event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === 'f') {
        event.preventDefault();
        fitCanvasToVisibleArea();
        return;
      }
      if (key === 'a') {
        event.preventDefault();
        centerNodes();
        return;
      }
      if (key === 'g') {
        event.preventDefault();
        toggleGuideExpanded();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    centerNodes,
    clearCanvasSelection,
    closeMarkerEditor,
    fitCanvasToVisibleArea,
    markerEditorEdgeId,
    toggleGuideExpanded,
    viewMode,
    zoomIn,
    zoomOut
  ]);
}

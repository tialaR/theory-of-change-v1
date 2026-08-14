import { useCanvasExampleController } from './navigation/use-canvas-example-controller';
import { useCanvasTheoryRestoreController } from './navigation/use-canvas-theory-restore-controller';
import { useCanvasTheorySnapshotController } from './navigation/use-canvas-theory-snapshot-controller';
import { useCanvasViewNavigationController } from './navigation/use-canvas-view-navigation-controller';
import type { NavigationControllerParams } from './navigation/types';

export function useCanvasNavigationController(params: NavigationControllerParams) {
  const snapshot = useCanvasTheorySnapshotController(params);

  const example = useCanvasExampleController({
    ...params,
    saveCurrentTheorySnapshot: snapshot.saveCurrentTheorySnapshot
  });

  const restore = useCanvasTheoryRestoreController({
    ...params,
    previousTheorySnapshot: snapshot.previousTheorySnapshot,
    clearPreviousTheorySnapshot: snapshot.clearPreviousTheorySnapshot
  });

  const view = useCanvasViewNavigationController({
    setViewMode: params.setViewMode,
    restorePreviousTheory: restore.restorePreviousTheory
  });

  return {
    canRestoreTheory: params.canvasVariant === 'example' && snapshot.previousTheorySnapshot !== null,
    replaceCanvasWithExample: example.replaceCanvasWithExample,
    restorePreviousTheory: restore.restorePreviousTheory,
    openExamplePreview: example.openExamplePreview,
    closeExamplePreview: view.closeExamplePreview,
    openResultView: view.openResultView,
    closeResultView: view.closeResultView
  };
}

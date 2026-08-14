import { useCallback } from 'react';

import type { ViewMode } from './types';
import type { Dispatch, SetStateAction } from 'react';

type ViewNavigationControllerParams = {
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  restorePreviousTheory: () => void;
};

export function useCanvasViewNavigationController({
  setViewMode,
  restorePreviousTheory
}: ViewNavigationControllerParams) {
  const closeExamplePreview = useCallback(() => {
    restorePreviousTheory();
  }, [restorePreviousTheory]);

  const openResultView = useCallback(() => setViewMode('result'), [setViewMode]);
  const closeResultView = useCallback(() => setViewMode('canvas'), [setViewMode]);

  return { closeExamplePreview, openResultView, closeResultView };
}

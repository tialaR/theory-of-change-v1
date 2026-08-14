'use client';

import { useCallback } from 'react';
import type { CanvasTranslator } from '../canvas-copy';

type UseCanvasHistoryActionsOptions = {
  undoFlow: () => boolean;
  redoFlow: () => boolean;
  markDirty: () => void;
  notify: (message: string) => void;
  t: CanvasTranslator;
};

export function useCanvasHistoryActions({
  undoFlow,
  redoFlow,
  markDirty,
  notify,
  t
}: UseCanvasHistoryActionsOptions) {
  const undo = useCallback(() => {
    if (!undoFlow()) {
      return;
    }

    markDirty();
    notify(t('notices.undo'));
  }, [
    markDirty,
    notify,
    t,
    undoFlow
  ]);

  const redo = useCallback(() => {
    if (!redoFlow()) {
      return;
    }

    markDirty();
    notify(t('notices.redo'));
  }, [
    markDirty,
    notify,
    redoFlow,
    t
  ]);

  return {
    undo,
    redo
  };
}

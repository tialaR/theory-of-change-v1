'use client';

import { useCallback, useState } from 'react';
import { HISTORY_LIMIT } from '../domain/canvas-v2.constants';
import type { CanvasSnapshot } from '../domain/canvas-v2.types';

export function useCanvasHistory(current: CanvasSnapshot, restore: (snapshot: CanvasSnapshot) => void) {
  const [past, setPast] = useState<CanvasSnapshot[]>([]);
  const [future, setFuture] = useState<CanvasSnapshot[]>([]);

  const checkpoint = useCallback((snapshot: CanvasSnapshot) => {
    setPast((items) => [...items, snapshot].slice(-HISTORY_LIMIT));
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    const previous = past.at(-1);
    if (!previous) return;
    setFuture((items) => [current, ...items]);
    setPast((items) => items.slice(0, -1));
    restore(previous);
  }, [current, past, restore]);

  const redo = useCallback(() => {
    const next = future[0];
    if (!next) return;
    setPast((items) => [...items, current]);
    setFuture((items) => items.slice(1));
    restore(next);
  }, [current, future, restore]);

  return { checkpoint, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0, historyCount: past.length };
}

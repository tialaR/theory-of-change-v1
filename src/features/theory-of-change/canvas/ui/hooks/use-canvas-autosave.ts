'use client';

import { useCallback, useEffect, useRef } from 'react';

export type CanvasAutosaveInput = {
  enabled: boolean;
  changeRevision: number;
  delayMs: number;
  onSave: () => Promise<void>;
};

export function useCanvasAutosave(input: CanvasAutosaveInput) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef(input.onSave);
  const enabledRef = useRef(input.enabled);

  useEffect(() => {
    saveRef.current = input.onSave;
  }, [input.onSave]);

  useEffect(() => {
    enabledRef.current = input.enabled;
  }, [input.enabled]);

  const cancelPending = useCallback(() => {
    if (!timeoutRef.current) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  useEffect(() => {
    cancelPending();
    if (!input.enabled) return undefined;

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      void saveRef.current();
    }, input.delayMs);

    return cancelPending;
  }, [cancelPending, input.changeRevision, input.delayMs, input.enabled]);

  useEffect(() => () => {
    cancelPending();
    if (enabledRef.current) void saveRef.current();
  }, [cancelPending]);

  return { cancelPending };
}

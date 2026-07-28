'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { CanvasProject } from '../../domain/canvas-project';
import { CANVAS_DIMENSIONS } from '../../domain/canvas-ui.constants';
import type { CanvasCausalEdge, CanvasStageNode } from '../../react-flow/canvas-flow.types';
import type { CanvasTranslator } from '../canvas-copy';
import type { CanvasSaveState } from './use-canvas-ui-state';
import { useCanvasAutosave } from './use-canvas-autosave';
import { useCanvasProjectPersistence } from './use-canvas-project-persistence';

type CanvasSaveControllerInput = {
  initialProject: CanvasProject;
  title: string;
  nodes: CanvasStageNode[];
  edges: CanvasCausalEdge[];
  saveState: CanvasSaveState;
  changeRevision: number;
  setSaveState: (state: CanvasSaveState) => void;
  notify: (message: string, tone?: 'info' | 'warning') => void;
  t: CanvasTranslator;
};

type SaveFeedback = 'automatic' | 'manual' | 'silent';

export function useCanvasSaveController({
  initialProject,
  title,
  nodes,
  edges,
  saveState,
  changeRevision,
  setSaveState,
  notify,
  t
}: CanvasSaveControllerInput) {
  const router = useRouter();
  const revisionRef = useRef(changeRevision);

  useEffect(() => {
    revisionRef.current = changeRevision;
  }, [changeRevision]);

  const { saveProject } = useCanvasProjectPersistence({
    initialProject,
    title,
    nodes,
    edges
  });

  const executeSave = useCallback(async (feedback: SaveFeedback) => {
    const revisionAtStart = revisionRef.current;
    setSaveState('saving');
    if (feedback === 'manual') notify(t('notices.saving'));

    try {
      const result = await saveProject();
      const changedWhileSaving = revisionRef.current !== revisionAtStart;
      setSaveState(changedWhileSaving ? 'dirty' : 'saved');

      if (feedback === 'manual') notify(t('notices.saved'));
      if (feedback === 'automatic' && result.saved && !changedWhileSaving) {
        notify(t('notices.autoSaved'));
      }
      return { ok: true as const, clean: !changedWhileSaving };
    } catch {
      setSaveState('error');
      notify(t('notices.saveError'), 'warning');
      return { ok: false as const, clean: false };
    }
  }, [notify, saveProject, setSaveState, t]);

  const { cancelPending } = useCanvasAutosave({
    enabled: saveState === 'dirty',
    changeRevision,
    delayMs: CANVAS_DIMENSIONS.autoSaveDebounceMs,
    onSave: async () => {
      await executeSave('automatic');
    }
  });

  const save = useCallback(async () => {
    cancelPending();
    await executeSave('manual');
  }, [cancelPending, executeSave]);

  const navigateAfterSave = useCallback(async (href: string) => {
    cancelPending();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const result = await executeSave('silent');
      if (!result.ok) return false;
      if (result.clean) {
        router.push(href);
        return true;
      }
    }

    notify(t('notices.saveError'), 'warning');
    return false;
  }, [cancelPending, executeSave, notify, router, t]);

  const openResult = useCallback(async () => {
    notify(t('notices.preparingResult'));
    const opened = await navigateAfterSave('/canvas/resultado');
    if (!opened) notify(t('notices.resultError'), 'warning');
  }, [navigateAfterSave, notify, t]);

  useEffect(() => {
    const hasPendingChanges = saveState === 'dirty' || saveState === 'saving';
    if (!hasPendingChanges) return undefined;

    function protectPendingChanges(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('beforeunload', protectPendingChanges);
    return () => window.removeEventListener('beforeunload', protectPendingChanges);
  }, [saveState]);

  useEffect(() => {
    function saveWhenDocumentBecomesHidden() {
      if (document.visibilityState !== 'hidden') return;
      if (saveState !== 'dirty' && saveState !== 'error') return;
      cancelPending();
      void executeSave('silent');
    }

    document.addEventListener('visibilitychange', saveWhenDocumentBecomesHidden);
    return () => document.removeEventListener('visibilitychange', saveWhenDocumentBecomesHidden);
  }, [cancelPending, executeSave, saveState]);

  return {
    save,
    openResult,
    navigateAfterSave
  };
}

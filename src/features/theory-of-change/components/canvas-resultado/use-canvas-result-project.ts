'use client';

import { useEffect, useState } from 'react';
import {
  ACTIVE_CANVAS_PROJECT_ID,
  type CanvasProject
} from '@/features/theory-of-change/canvas';
import { createHttpCanvasProjectRepository } from '@/features/theory-of-change/canvas/infrastructure/http/http-canvas-project.repository';
import { ensureCanvasProjectWorkerStarted } from '@/features/theory-of-change/canvas/infrastructure/msw/ensure-canvas-project-worker';

type CanvasResultProjectState =
  | { status: 'loading'; project: null }
  | { status: 'ready'; project: CanvasProject }
  | { status: 'empty'; project: null }
  | { status: 'error'; project: null };

export function useCanvasResultProject(): CanvasResultProjectState {
  const [state, setState] = useState<CanvasResultProjectState>({ status: 'loading', project: null });

  useEffect(() => {
    let active = true;

    async function loadProject() {
      try {
        await ensureCanvasProjectWorkerStarted();
        const repository = createHttpCanvasProjectRepository({ baseUrl: '' });
        const project = await repository.findById(ACTIVE_CANVAS_PROJECT_ID);
        if (!active) return;
        setState(project ? { status: 'ready', project } : { status: 'empty', project: null });
      } catch {
        if (active) setState({ status: 'error', project: null });
      }
    }

    void loadProject();
    return () => {
      active = false;
    };
  }, []);

  return state;
}

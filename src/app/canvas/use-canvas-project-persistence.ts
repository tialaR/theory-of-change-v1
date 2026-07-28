'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ACTIVE_CANVAS_PROJECT_ID,
  createCanvasProject,
  saveCanvasProject,
  type CanvasProject
} from '@/features/theory-of-change/canvas-workspace';
import { createHttpCanvasProjectRepository } from '@/features/theory-of-change/canvas-workspace/infrastructure/http/http-canvas-project.repository';
import { ensureCanvasProjectWorkerStarted } from '@/features/theory-of-change/canvas-workspace/infrastructure/msw/ensure-canvas-project-worker';
import type { CanvasEdge, CanvasNode } from './canvas-workspace.model';
import { mapCanvasSnapshotToProject } from './canvas-project.mapper';

type CanvasPersistenceInput = {
  title: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
};

export function useCanvasProjectPersistence(input: CanvasPersistenceInput) {
  const router = useRouter();
  const projectRef = useRef<CanvasProject>(createCanvasProject({ id: ACTIVE_CANVAS_PROJECT_ID }));

  const saveProject = useCallback(async () => {
    await ensureCanvasProjectWorkerStarted();
    const repository = createHttpCanvasProjectRepository({ baseUrl: '' });
    const draft = mapCanvasSnapshotToProject(projectRef.current, input);
    const result = await saveCanvasProject(repository, draft);
    projectRef.current = result.project;
    return result.project;
  }, [input]);

  const saveAndOpenResult = useCallback(async () => {
    await saveProject();
    router.push('/canvas/resultado');
  }, [router, saveProject]);

  return { saveProject, saveAndOpenResult };
}

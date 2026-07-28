'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createCanvasProject } from '../../application/create-canvas-project';
import { saveCanvasProject } from '../../application/save-canvas-project';
import { ACTIVE_CANVAS_PROJECT_ID } from '../../domain/canvas-project.constants';
import type { CanvasProject } from '../../domain/canvas-project';
import { createHttpCanvasProjectRepository } from '../../infrastructure/http/http-canvas-project.repository';
import { ensureCanvasProjectWorkerStarted } from '../../infrastructure/msw/ensure-canvas-project-worker';
import { applyCanvasFlowGraph } from '../../react-flow/canvas-react-flow.adapter';
import type { CanvasCausalEdge, CanvasStageNode } from '../../react-flow/canvas-flow.types';

type CanvasPersistenceInput = {
  title: string;
  nodes: CanvasStageNode[];
  edges: CanvasCausalEdge[];
};

export function useCanvasProjectPersistence(input: CanvasPersistenceInput) {
  const router = useRouter();
  const projectRef = useRef<CanvasProject>(createCanvasProject({ id: ACTIVE_CANVAS_PROJECT_ID }));

  const saveProject = useCallback(async () => {
    await ensureCanvasProjectWorkerStarted();
    const repository = createHttpCanvasProjectRepository({ baseUrl: '' });
    const draft = applyCanvasFlowGraph(
      { ...projectRef.current, title: input.title },
      { nodes: input.nodes, edges: input.edges }
    );
    const result = await saveCanvasProject(repository, draft);
    projectRef.current = result.project;
    return result.project;
  }, [input.edges, input.nodes, input.title]);

  const saveAndOpenResult = useCallback(async () => {
    await saveProject();
    router.push('/canvas/resultado');
  }, [router, saveProject]);

  return { saveProject, saveAndOpenResult };
}

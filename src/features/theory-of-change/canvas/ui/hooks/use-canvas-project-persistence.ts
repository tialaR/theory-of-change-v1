'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { CanvasProject } from '../../domain/canvas-project';
import { applyCanvasFlowGraph } from '../../react-flow/canvas-react-flow.adapter';
import type { CanvasCausalEdge, CanvasStageNode } from '../../react-flow/canvas-flow.types';
import { saveCanvasProjectAction } from '../../server/save-canvas-project.action';

type CanvasPersistenceInput = {
  initialProject: CanvasProject;
  title: string;
  nodes: CanvasStageNode[];
  edges: CanvasCausalEdge[];
};

export function useCanvasProjectPersistence(input: CanvasPersistenceInput) {
  const router = useRouter();
  const projectRef = useRef<CanvasProject>(input.initialProject);

  const saveProject = useCallback(async () => {
    const draft = applyCanvasFlowGraph(
      { ...projectRef.current, title: input.title },
      { nodes: input.nodes, edges: input.edges }
    );
    const result = await saveCanvasProjectAction(draft);
    projectRef.current = result.project;
    return result.project;
  }, [input.edges, input.nodes, input.title]);

  const saveAndOpenResult = useCallback(async () => {
    await saveProject();
    router.push('/canvas/resultado');
  }, [router, saveProject]);

  return { saveProject, saveAndOpenResult };
}

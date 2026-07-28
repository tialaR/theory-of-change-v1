'use client';

import { useCallback, useState } from 'react';
import type { CanvasProject } from '../../domain/canvas-project';
import { applyCanvasFlowGraph } from '../../react-flow/canvas-react-flow.adapter';
import type { CanvasCausalEdge, CanvasStageNode } from '../../react-flow/canvas-flow.types';
import {
  createCanvasSaveQueue,
  type CanvasProjectSaveExecutor
} from '../../application/canvas-save-queue';
import { saveCanvasProjectAction } from '../../server/save-canvas-project.action';

type CanvasPersistenceInput = {
  initialProject: CanvasProject;
  title: string;
  nodes: CanvasStageNode[];
  edges: CanvasCausalEdge[];
  executeSave?: CanvasProjectSaveExecutor;
};

export function useCanvasProjectPersistence(input: CanvasPersistenceInput) {
  const [queue] = useState(() => createCanvasSaveQueue({
    initialProject: input.initialProject,
    executeSave: input.executeSave ?? saveCanvasProjectAction
  }));

  const saveProject = useCallback(() => {
    const draft = applyCanvasFlowGraph(
      { ...input.initialProject, title: input.title },
      { nodes: input.nodes, edges: input.edges }
    );

    return queue.saveLatest({
      title: draft.title,
      nodes: draft.nodes,
      connections: draft.connections
    });
  }, [input.edges, input.initialProject, input.nodes, input.title, queue]);

  return { saveProject };
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CanvasProject, CanvasViewport } from '../../domain/canvas-project';
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
  viewport: CanvasViewport;
  executeSave?: CanvasProjectSaveExecutor;
};

export function useCanvasProjectPersistence(input: CanvasPersistenceInput) {
  const [queue] = useState(() => createCanvasSaveQueue({
    initialProject: input.initialProject,
    executeSave: input.executeSave ?? saveCanvasProjectAction
  }));
  const latestInputRef = useRef(input);

  useEffect(() => {
    latestInputRef.current = input;
  }, [input]);

  const saveProject = useCallback(() => {
    const latest = latestInputRef.current;
    const draft = applyCanvasFlowGraph(
      { ...latest.initialProject, title: latest.title },
      { nodes: latest.nodes, edges: latest.edges }
    );

    return queue.saveLatest({
      title: draft.title,
      nodes: draft.nodes,
      connections: draft.connections,
      viewport: { ...latest.viewport }
    });
  }, [queue]);

  return { saveProject };
}

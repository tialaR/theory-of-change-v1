'use client';

import { useCallback, useReducer } from 'react';
import type { CanvasProject, CanvasProjectNode } from '../domain/canvas-project';
import { canvasProjectReducer } from './canvas-project.reducer';

export function useCanvasProjectController(initialProject: CanvasProject) {
  const [state, dispatch] = useReducer(canvasProjectReducer, {
    project: initialProject,
    dirty: false
  });

  const addNode = useCallback((node: CanvasProjectNode) => {
    dispatch({ type: 'node-added', node });
  }, []);

  const acceptSavedProject = useCallback((project: CanvasProject) => {
    dispatch({ type: 'saved', project });
  }, []);

  return {
    project: state.project,
    dirty: state.dirty,
    addNode,
    acceptSavedProject
  };
}

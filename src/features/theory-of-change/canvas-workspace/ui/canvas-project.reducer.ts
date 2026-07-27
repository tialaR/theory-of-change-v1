import type { CanvasProject, CanvasProjectNode } from '../domain/canvas-project';

export type CanvasProjectState = {
  project: CanvasProject;
  dirty: boolean;
};

export type CanvasProjectAction =
  | { type: 'node-added'; node: CanvasProjectNode }
  | { type: 'project-replaced'; project: CanvasProject }
  | { type: 'saved'; project: CanvasProject };

export function canvasProjectReducer(
  state: CanvasProjectState,
  action: CanvasProjectAction
): CanvasProjectState {
  if (action.type === 'node-added') {
    return {
      project: { ...state.project, nodes: [...state.project.nodes, action.node] },
      dirty: true
    };
  }

  return {
    project: action.project,
    dirty: action.type === 'project-replaced'
  };
}

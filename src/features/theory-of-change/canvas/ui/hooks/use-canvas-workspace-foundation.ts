'use client';

import type { CanvasProject } from '../../domain/canvas-project';
import { toCanvasFlowGraph } from '../../react-flow/canvas-react-flow.adapter';
import type { CanvasStageNode } from '../../react-flow/canvas-flow.types';
import { useCanvasFlowRuntime } from '../../react-flow/use-canvas-flow-state';
import type { CanvasStageCopy, CanvasTranslator } from '../canvas-copy';
import { useCanvasFlowController } from './use-canvas-flow-controller';
import { useCanvasSaveController } from './use-canvas-save-controller';
import { useCanvasSelection } from './use-canvas-selection';
import { useCanvasUiState } from './use-canvas-ui-state';
import { useCanvasViewportActions } from './use-canvas-viewport-actions';
import { useCanvasWorkspaceEffects } from './use-canvas-workspace-effects';

type CanvasWorkspaceFoundationOptions = {
  initialProject: CanvasProject;
  t: CanvasTranslator;
  stageCopy: (stage: CanvasStageNode['data']['stage']) => CanvasStageCopy;
  duplicateTitle: (title: string) => string;
};

export function useCanvasWorkspaceFoundation({
  initialProject,
  t,
  stageCopy,
  duplicateTitle
}: CanvasWorkspaceFoundationOptions) {
  const initialGraph = toCanvasFlowGraph(initialProject);
  const flow = useCanvasFlowController(initialGraph.nodes, initialGraph.edges, stageCopy, duplicateTitle);
  const ui = useCanvasUiState(t, initialProject.title, initialProject.nodes.length);
  const { stageDropRuntime, viewportRuntime } = useCanvasFlowRuntime();

  const selection = useCanvasSelection({
    nodes: flow.nodes,
    edges: flow.edges,
    selectedNodeId: ui.selectedNodeId,
    selectedEdgeId: ui.selectedEdgeId,
    getRelationKind: flow.getRelationKind
  });

  const viewportActions = useCanvasViewportActions({
    initialViewport: initialProject.viewport,
    nodes: flow.nodes,
    viewportRuntime,
    inspectorOpen: ui.inspectorOpen,
    fullCanvasMode: ui.fullCanvasMode,
    setInspectorOpen: ui.setInspectorOpen,
    setHistoryOpen: ui.setHistoryOpen,
    setFullCanvasMode: ui.setFullCanvasMode,
    markDirty: ui.markDirty,
    notify: ui.notify,
    t
  });

  const saveController = useCanvasSaveController({
    initialProject,
    title: ui.projectTitle,
    nodes: flow.nodes,
    edges: flow.edges,
    viewport: viewportActions.viewport,
    saveState: ui.saveState,
    changeRevision: ui.changeRevision,
    setSaveState: ui.setSaveState,
    notify: ui.notify,
    t
  });

  useCanvasWorkspaceEffects({
    activeToolbarNodeId: ui.activeToolbarNodeId,
    relationPopoverOpen: ui.relationPopoverOpen,
    selectedEdgeId: ui.selectedEdgeId,
    selectedNodeId: ui.selectedNodeId,
    setActiveToolbarNodeId: ui.setActiveToolbarNodeId,
    setInspectorAdvancedOpenKey: ui.setInspectorAdvancedOpenKey,
    setRelationPopoverOpen: ui.setRelationPopoverOpen
  });

  return {
    flow,
    ui,
    stageDropRuntime,
    selection,
    viewportActions,
    saveController
  };
}

export type CanvasWorkspaceFoundation = ReturnType<typeof useCanvasWorkspaceFoundation>;

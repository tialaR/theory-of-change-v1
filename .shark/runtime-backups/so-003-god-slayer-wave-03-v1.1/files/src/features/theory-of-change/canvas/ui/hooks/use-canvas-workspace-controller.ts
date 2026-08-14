'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useReactFlow } from '@xyflow/react';
import type { CanvasProject } from '../../domain/canvas-project';
import { toCanvasFlowGraph } from '../../react-flow/canvas-react-flow.adapter';
import type { CanvasCausalEdge, CanvasStageNode } from '../../react-flow/canvas-flow.types';
import { createCanvasStageCopy, type CanvasTranslator } from '../canvas-copy';
import { useCanvasFlowController } from './use-canvas-flow-controller';
import { useCanvasWorkspaceEffects } from './use-canvas-workspace-effects';
import { useCanvasStageDragAndDrop } from './use-canvas-stage-drag-and-drop';
import { useCanvasNodeActions } from './use-canvas-node-actions';
import { useCanvasRelationActions } from './use-canvas-relation-actions';
import { useCanvasHistoryActions } from './use-canvas-history-actions';
import { useCanvasUiState } from './use-canvas-ui-state';
import { useCanvasSaveController } from './use-canvas-save-controller';
import { useCanvasViewportActions } from './use-canvas-viewport-actions';
import { useCanvasWorkspaceFlowActions } from './use-canvas-workspace-flow-actions';
import { useCanvasSelection } from './use-canvas-selection';
import { useCanvasWorkspaceNavigation } from './use-canvas-workspace-navigation';

export function useCanvasWorkspaceController(initialProject: CanvasProject, userName: string) {
  const translate = useTranslations('Canvas');
  const t: CanvasTranslator = useCallback((key, values) => translate(key, values), [translate]);
  const stageCopy = useCallback((stage: CanvasStageNode['data']['stage']) => createCanvasStageCopy(t, stage), [t]);
  const duplicateTitle = useCallback((title: string) => t('node.duplicateTitle', { title }), [t]);
  const initialGraph = toCanvasFlowGraph(initialProject);
  const flow = useCanvasFlowController(initialGraph.nodes, initialGraph.edges, stageCopy, duplicateTitle);
  const ui = useCanvasUiState(t, initialProject.title, initialProject.nodes.length);
  const reactFlow = useReactFlow<CanvasStageNode, CanvasCausalEdge>();
  const {
    activeToolbarNodeId,
    relationPopoverOpen,
    selectedEdgeId,
    selectedNodeId,
    setActiveToolbarNodeId,
    setInspectorAdvancedOpenKey,
    setRelationPopoverOpen
  } = ui;

  const {
    selectedNode,
    selectedEdge,
    selectedEdgeSource,
    selectedEdgeTarget,
    selectedRelationKind
  } = useCanvasSelection({
    nodes: flow.nodes,
    edges: flow.edges,
    selectedNodeId: ui.selectedNodeId,
    selectedEdgeId: ui.selectedEdgeId,
    getRelationKind: flow.getRelationKind
  });


  const viewportActions = useCanvasViewportActions({
    initialViewport: initialProject.viewport,
    nodes: flow.nodes,
    reactFlow,
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
    activeToolbarNodeId,
    relationPopoverOpen,
    selectedEdgeId,
    selectedNodeId,
    setActiveToolbarNodeId,
    setInspectorAdvancedOpenKey,
    setRelationPopoverOpen
  });

  const markDirty = ui.markDirty;

  const {
    startStageDrag,
    allowStageDrop,
    dropStage
  } = useCanvasStageDragAndDrop({
    reactFlow,
    createNode: flow.createNode,
    selectNode: ui.selectNode,
    setCreatorOpen: ui.setCreatorOpen,
    notify: ui.notify,
    markDirty,
    t,
    stageCopy
  });

  const {
    updateSelectedNode,
    duplicateNode,
    deleteNode,
    saveNodeEditor
  } = useCanvasNodeActions({
    nodes: flow.nodes,
    selectedNodeId: ui.selectedNodeId,
    nodeDraft: ui.nodeDraft,
    updateNode: flow.updateNode,
    duplicateFlowNode: flow.duplicateNode,
    deleteFlowNode: flow.deleteNode,
    saveNodeDraft: flow.saveNodeDraft,
    selectNode: ui.selectNode,
    clearSelection: ui.clearSelection,
    setActiveToolbarNodeId: ui.setActiveToolbarNodeId,
    closeNodeEditor: ui.closeNodeEditor,
    notify: ui.notify,
    markDirty,
    t,
    stageCopy
  });

  const {
    selectEdge,
    openRelationForm,
    updateRelationDraft,
    cancelRelation,
    saveRelation,
    removeRelation,
    deleteConnection
  } = useCanvasRelationActions({
    selectedEdge,
    selectedEdgeSource,
    selectedEdgeTarget,
    selectedRelationKind,
    relationDraft: ui.relationDraft,
    getRelationKind: flow.getRelationKind,
    selectFlowEdge: ui.selectEdge,
    setRelationDraft: ui.setRelationDraft,
    setRelationPanelMode: ui.setRelationPanelMode,
    saveFlowRelation: flow.saveRelation,
    removeFlowRelation: flow.removeRelation,
    deleteFlowEdge: flow.deleteEdge,
    clearSelection: ui.clearSelection,
    notify: ui.notify,
    markDirty,
    t
  });

  const {
    undo,
    redo
  } = useCanvasHistoryActions({
    undoFlow: flow.undo,
    redoFlow: flow.redo,
    markDirty,
    notify: ui.notify,
    t
  });


  const navigation = useCanvasWorkspaceNavigation({
    navigateAfterSave: saveController.navigateAfterSave
  });

  const {
    onPaneClick,
    onNodeClick,
    onConnect,
    onNodeDragStart,
    onNodeDragStop,
    centralizeColumns,
    organizeFlow
  } = useCanvasWorkspaceFlowActions({
    flow,
    ui,
    viewportActions,
    markDirty,
    t
  });


  return {
    flow,
    ui,
    reactFlow,
    viewport: viewportActions.viewport,
    onViewportChange: viewportActions.onViewportChange,
    selectedNode,
    selectedEdge,
    selectedEdgeSource,
    selectedEdgeTarget,
    selectedRelationKind,
    onPaneClick,
    onNodeClick,
    onConnect,
    onNodeDragStart,
    onNodeDragStop,
    startStageDrag,
    allowStageDrop,
    dropStage,
    updateSelectedNode,
    duplicateNode,
    deleteNode,
    saveNodeEditor,
    selectEdge,
    openRelationForm,
    updateRelationDraft,
    cancelRelation,
    saveRelation,
    removeRelation,
    deleteConnection,
    undo,
    redo,
    centralizeColumns,
    organizeFlow,
    frameVisualization: viewportActions.frameVisualization,
    openInspector: viewportActions.openInspector,
    closeInspector: viewportActions.closeInspector,
    enterFullCanvas: viewportActions.enterFullCanvas,
    exitFullCanvas: viewportActions.exitFullCanvas,
    zoomIn: viewportActions.zoomIn,
    zoomOut: viewportActions.zoomOut,
    openHome: navigation.openHome,
    openGuide: navigation.openGuide,
    openExamples: navigation.openExamples,
    save: saveController.save,
    openResult: saveController.openResult,
    t,
    stageCopy,
    userName
  };
}

export type CanvasWorkspaceController = ReturnType<typeof useCanvasWorkspaceController>;

'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useReactFlow, type Connection, type NodeMouseHandler } from '@xyflow/react';
import type { CanvasProject } from '../../domain/canvas-project';
import { toCanvasFlowGraph } from '../../react-flow/canvas-react-flow.adapter';
import type { CanvasCausalEdge, CanvasStageNode } from '../../react-flow/canvas-flow.types';
import { createCanvasStageCopy, type CanvasTranslator } from '../canvas-copy';
import { useCanvasFlowController, type CanvasConnectFailureCode } from './use-canvas-flow-controller';
import { useCanvasWorkspaceEffects } from './use-canvas-workspace-effects';
import { useCanvasStageDragAndDrop } from './use-canvas-stage-drag-and-drop';
import { useCanvasNodeActions } from './use-canvas-node-actions';
import { useCanvasRelationActions } from './use-canvas-relation-actions';
import { useCanvasUiState } from './use-canvas-ui-state';
import { useCanvasSaveController } from './use-canvas-save-controller';

const CONNECT_NOTICE_KEYS: Record<CanvasConnectFailureCode, string> = {
  'invalid-target': 'notices.invalidTarget',
  'missing-cards': 'notices.missingCards',
  'duplicate-connection': 'notices.duplicateConnection',
  'same-stage': 'notices.sameStage',
  backward: 'notices.backward',
  'skip-stage': 'notices.skipStage',
  'outcome-source': 'notices.outcomeSource'
};

export function useCanvasWorkspaceController(initialProject: CanvasProject, userName: string) {
  const translate = useTranslations('Canvas');
  const t: CanvasTranslator = useCallback((key, values) => translate(key, values), [translate]);
  const stageCopy = useCallback((stage: CanvasStageNode['data']['stage']) => createCanvasStageCopy(t, stage), [t]);
  const duplicateTitle = useCallback((title: string) => t('node.duplicateTitle', { title }), [t]);
  const initialGraph = toCanvasFlowGraph(initialProject);
  const flow = useCanvasFlowController(initialGraph.nodes, initialGraph.edges, stageCopy, duplicateTitle);
  const ui = useCanvasUiState(t, initialProject.title);
  const reactFlow = useReactFlow<CanvasStageNode, CanvasCausalEdge>();
  const saveController = useCanvasSaveController({
    initialProject,
    title: ui.projectTitle,
    nodes: flow.nodes,
    edges: flow.edges,
    saveState: ui.saveState,
    changeRevision: ui.changeRevision,
    setSaveState: ui.setSaveState,
    notify: ui.notify,
    t
  });
  const {
    activeToolbarNodeId,
    relationPopoverOpen,
    selectedEdgeId,
    selectedNodeId,
    setActiveToolbarNodeId,
    setInspectorAdvancedOpenKey,
    setRelationPopoverOpen
  } = ui;

  const selectedNode = flow.nodes.find((node) => node.id === ui.selectedNodeId) ?? null;
  const selectedEdge = flow.edges.find((edge) => edge.id === ui.selectedEdgeId) ?? null;
  const selectedEdgeSource = selectedEdge
    ? flow.nodes.find((node) => node.id === selectedEdge.source) ?? null
    : null;
  const selectedEdgeTarget = selectedEdge
    ? flow.nodes.find((node) => node.id === selectedEdge.target) ?? null
    : null;
  const selectedRelationKind = selectedEdge ? flow.getRelationKind(selectedEdge) : null;

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

  const onPaneClick = useCallback(() => {
    ui.clearSelection();
    ui.setActiveToolbarNodeId(null);
  }, [ui]);

  const onNodeClick: NodeMouseHandler<CanvasStageNode> = useCallback((_event, node) => {
    ui.selectNode(node.id);
  }, [ui]);

  const onConnect = useCallback((connection: Connection) => {
    const result = flow.connectNodes(connection);
    if (!result.ok) {
      ui.notify(t(CONNECT_NOTICE_KEYS[result.code]), 'warning');
      return;
    }
    markDirty();
    ui.notify(t('notices.connectionCreated'));
  }, [flow, markDirty, t, ui]);

  const onNodeDragStart = useCallback(() => {
    flow.beginNodeDrag();
  }, [flow]);

  const onNodeDragStop = useCallback(() => {
    flow.finishNodeDrag();
    markDirty();
    ui.notify(t('notices.positionUpdated'));
  }, [flow, markDirty, t, ui]);

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
    saveRelation,
    removeRelation,
    deleteConnection
  } = useCanvasRelationActions({
    selectedEdge,
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

  const undo = useCallback(() => {
    if (!flow.undo()) return;
    markDirty();
    ui.notify(t('notices.undo'));
  }, [flow, markDirty, t, ui]);

  const redo = useCallback(() => {
    if (!flow.redo()) return;
    markDirty();
    ui.notify(t('notices.redo'));
  }, [flow, markDirty, t, ui]);

  const centralizeColumns = useCallback(() => {
    flow.centralizeColumns();
    markDirty();
    ui.notify(t('notices.columns'));
    requestAnimationFrame(() => reactFlow.fitView({ padding: 0.18, duration: 260 }));
  }, [flow, markDirty, reactFlow, t, ui]);

  const organizeFlow = useCallback(() => {
    flow.organizeFlow();
    markDirty();
    ui.notify(t('notices.organized'));
    requestAnimationFrame(() => reactFlow.fitView({ padding: 0.18, duration: 260 }));
  }, [flow, markDirty, reactFlow, t, ui]);

  const frameVisualization = useCallback(() => {
    if (!flow.nodes.length) {
      reactFlow.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 260 });
      ui.notify(t('notices.viewCentered'));
      return;
    }
    reactFlow.fitView({ padding: 0.18, duration: 260 });
    ui.notify(t('notices.viewFramed'));
  }, [flow.nodes.length, reactFlow, t, ui]);



  return {
    flow,
    ui,
    reactFlow,
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
    saveRelation,
    removeRelation,
    deleteConnection,
    undo,
    redo,
    centralizeColumns,
    organizeFlow,
    frameVisualization,
    zoomIn: () => reactFlow.zoomIn({ duration: 180 }),
    zoomOut: () => reactFlow.zoomOut({ duration: 180 }),
    openHome: () => saveController.navigateAfterSave('/'),
    openGuide: () => saveController.navigateAfterSave('/guia-de-aprendizado'),
    openExamples: () => saveController.navigateAfterSave('/exemplos'),
    save: saveController.save,
    openResult: saveController.openResult,
    t,
    stageCopy,
    userName
  };
}

export type CanvasWorkspaceController = ReturnType<typeof useCanvasWorkspaceController>;

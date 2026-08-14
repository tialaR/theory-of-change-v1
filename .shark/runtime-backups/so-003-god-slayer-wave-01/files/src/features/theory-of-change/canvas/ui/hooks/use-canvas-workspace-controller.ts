'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useReactFlow, type Connection, type NodeMouseHandler } from '@xyflow/react';
import type { CanvasProject, CanvasViewport } from '../../domain/canvas-project';
import { toCanvasFlowGraph } from '../../react-flow/canvas-react-flow.adapter';
import type { CanvasCausalEdge, CanvasStageNode } from '../../react-flow/canvas-flow.types';
import { createCanvasStageCopy, type CanvasTranslator } from '../canvas-copy';
import { useCanvasFlowController } from './use-canvas-flow-controller';
import { CANVAS_CONNECT_NOTICE_KEYS } from './canvas-connect-notices';
import { useCanvasWorkspaceEffects } from './use-canvas-workspace-effects';
import { useCanvasStageDragAndDrop } from './use-canvas-stage-drag-and-drop';
import { useCanvasNodeActions } from './use-canvas-node-actions';
import { useCanvasRelationActions } from './use-canvas-relation-actions';
import { useCanvasHistoryActions } from './use-canvas-history-actions';
import { useCanvasUiState } from './use-canvas-ui-state';
import { useCanvasSaveController } from './use-canvas-save-controller';

export function useCanvasWorkspaceController(initialProject: CanvasProject, userName: string) {
  const translate = useTranslations('Canvas');
  const t: CanvasTranslator = useCallback((key, values) => translate(key, values), [translate]);
  const stageCopy = useCallback((stage: CanvasStageNode['data']['stage']) => createCanvasStageCopy(t, stage), [t]);
  const duplicateTitle = useCallback((title: string) => t('node.duplicateTitle', { title }), [t]);
  const initialGraph = toCanvasFlowGraph(initialProject);
  const flow = useCanvasFlowController(initialGraph.nodes, initialGraph.edges, stageCopy, duplicateTitle);
  const ui = useCanvasUiState(t, initialProject.title, initialProject.nodes.length);
  const [viewport, setViewport] = useState<CanvasViewport>(initialProject.viewport ?? { x: 0, y: 0, zoom: 1 });
  const viewportBeforeInspectorRef = useRef<CanvasViewport | null>(null);
  const reactFlow = useReactFlow<CanvasStageNode, CanvasCausalEdge>();
  const saveController = useCanvasSaveController({
    initialProject,
    title: ui.projectTitle,
    nodes: flow.nodes,
    edges: flow.edges,
    viewport,
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

  type FramingContext = {
    inspectorOpen?: boolean;
    fullCanvasMode?: boolean;
  };

  const fitCurrentGraph = useCallback((duration = 520, context: FramingContext = {}) => {
    if (!flow.nodes.length) {
      return;
    }

    const surface = document.querySelector<HTMLElement>('[data-testid="canvas-react-flow-surface"]');
    if (!surface) {
      return;
    }

    const rect = surface.getBoundingClientRect();
    const bounds = reactFlow.getNodesBounds(flow.nodes);
    const safeLeft = 104;
    const inspectorOpen = context.inspectorOpen ?? ui.inspectorOpen;
    const fullCanvasMode = context.fullCanvasMode ?? ui.fullCanvasMode;
    const safeRight = inspectorOpen && !fullCanvasMode ? 392 : 104;
    const safeTop = fullCanvasMode ? 56 : 72;
    const safeBottom = 72;
    const availableWidth = Math.max(240, rect.width - safeLeft - safeRight);
    const availableHeight = Math.max(240, rect.height - safeTop - safeBottom);
    const widthZoom = availableWidth / Math.max(bounds.width, 1);
    const zoom = Math.min(1, Math.max(0.58, widthZoom * 0.9));
    const renderedWidth = bounds.width * zoom;
    const renderedHeight = bounds.height * zoom;
    const x = safeLeft + ((availableWidth - renderedWidth) / 2) - (bounds.x * zoom);
    const y = renderedHeight <= availableHeight
      ? safeTop + ((availableHeight - renderedHeight) / 2) - (bounds.y * zoom)
      : safeTop - (bounds.y * zoom);

    void reactFlow.setViewport({ x, y, zoom }, { duration });
  }, [flow.nodes, reactFlow, ui.fullCanvasMode, ui.inspectorOpen]);

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
    ui.setCreatorOpen(false);
  }, [ui]);

  const onNodeClick: NodeMouseHandler<CanvasStageNode> = useCallback((_event, node) => {
    ui.selectNode(node.id);
  }, [ui]);

  const onConnect = useCallback((connection: Connection) => {
    const sourceNode = connection.source
      ? flow.nodes.find((node) => node.id === connection.source) ?? null
      : null;
    const targetNode = connection.target
      ? flow.nodes.find((node) => node.id === connection.target) ?? null
      : null;
    const noticeValues = {
      source: sourceNode?.data.title ?? 'Bloco de origem',
      target: targetNode?.data.title ?? 'Bloco de destino'
    };

    const result = flow.connectNodes(connection);
    if (!result.ok) {
      ui.notify(t(CANVAS_CONNECT_NOTICE_KEYS[result.code], noticeValues), 'warning');
      return;
    }
    markDirty();
  }, [flow, markDirty, t, ui]);


  const onViewportChange = useCallback((nextViewport: CanvasViewport) => {
    setViewport((current) => {
      const unchanged = current.x === nextViewport.x
        && current.y === nextViewport.y
        && current.zoom === nextViewport.zoom;
      return unchanged ? current : nextViewport;
    });
    markDirty();
  }, [markDirty]);

  const onNodeDragStart = useCallback(() => {
    flow.beginNodeDrag();
  }, [flow]);

  const onNodeDragStop = useCallback(() => {
    flow.finishNodeDrag();
    markDirty();
  }, [flow, markDirty]);

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

  const centralizeColumns = useCallback(() => {
    flow.centralizeColumns();
    markDirty();
    ui.notify(t('notices.columns'));
    requestAnimationFrame(() => fitCurrentGraph());
  }, [fitCurrentGraph, flow, markDirty, t, ui]);

  const organizeFlow = useCallback(() => {
    flow.organizeFlow();
    markDirty();
    ui.notify(t('notices.organized'));
    requestAnimationFrame(() => fitCurrentGraph());
  }, [fitCurrentGraph, flow, markDirty, t, ui]);

  const frameVisualization = useCallback(() => {
    if (!flow.nodes.length) {
      reactFlow.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 260 });
      ui.notify(t('notices.viewCentered'));
      return;
    }
    fitCurrentGraph(560);
    ui.notify(t('notices.viewFramed'));
  }, [fitCurrentGraph, flow.nodes.length, reactFlow, t, ui]);


  const openInspector = useCallback(() => {
    if (!ui.inspectorOpen) {
      viewportBeforeInspectorRef.current = { ...reactFlow.getViewport() };
    }
    ui.setInspectorOpen(true);

    window.setTimeout(() => {
      fitCurrentGraph(520, { inspectorOpen: true, fullCanvasMode: false });
    }, 500);
  }, [fitCurrentGraph, reactFlow, ui]);

  const closeInspector = useCallback(() => {
    ui.setInspectorOpen(false);
    const previousViewport = viewportBeforeInspectorRef.current;
    viewportBeforeInspectorRef.current = null;

    if (previousViewport) {
      void reactFlow.setViewport(previousViewport, {
        duration: 460
      });
    }
  }, [reactFlow, ui]);

  const setFullCanvasMode = useCallback((nextFullCanvasMode: boolean) => {
    ui.setFullCanvasMode(nextFullCanvasMode);
    ui.setHistoryOpen(false);

    if (nextFullCanvasMode) {
      ui.setInspectorOpen(false);
    }

    window.setTimeout(() => {
      fitCurrentGraph(520, {
        inspectorOpen: false,
        fullCanvasMode: nextFullCanvasMode
      });
    }, 320);
  }, [fitCurrentGraph, ui]);

  return {
    flow,
    ui,
    reactFlow,
    viewport,
    onViewportChange,
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
    frameVisualization,
    openInspector,
    closeInspector,
    enterFullCanvas: () => setFullCanvasMode(true),
    exitFullCanvas: () => setFullCanvasMode(false),
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

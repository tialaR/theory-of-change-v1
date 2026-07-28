'use client';

import { useCallback, useEffect, type DragEvent as ReactDragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useReactFlow, type Connection, type NodeMouseHandler } from '@xyflow/react';
import { CANVAS_DRAG_STAGE_MIME, CANVAS_DIMENSIONS } from '../../domain/canvas-ui.constants';
import { isCanvasStageId } from '../../domain/canvas-stage.constants';
import type { CanvasProject, CanvasRelationKind } from '../../domain/canvas-project';
import { toCanvasFlowGraph } from '../../react-flow/canvas-react-flow.adapter';
import type { CanvasCausalEdge, CanvasStageNode } from '../../react-flow/canvas-flow.types';
import { createCanvasStageCopy, type CanvasTranslator } from '../canvas-copy';
import { useCanvasFlowController, type CanvasConnectFailureCode } from './use-canvas-flow-controller';
import { createRelationDraft, useCanvasUiState } from './use-canvas-ui-state';
import { useCanvasProjectPersistence } from './use-canvas-project-persistence';

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
  const router = useRouter();
  const persistence = useCanvasProjectPersistence({
    initialProject,
    title: ui.projectTitle,
    nodes: flow.nodes,
    edges: flow.edges
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

  useEffect(() => {
    setInspectorAdvancedOpenKey(null);
  }, [selectedEdgeId, selectedNodeId, setInspectorAdvancedOpenKey]);

  useEffect(() => {
    if (!relationPopoverOpen || !selectedEdgeId) return undefined;

    function closeRelationToolbarOnOutsidePointer(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const popover = target.closest('[data-edge-popover]');
      const edgeAction = target.closest(`[data-edge-action-id="${selectedEdgeId}"]`);
      if (!popover && !edgeAction) setRelationPopoverOpen(false);
    }

    document.addEventListener('pointerdown', closeRelationToolbarOnOutsidePointer, true);
    return () => document.removeEventListener('pointerdown', closeRelationToolbarOnOutsidePointer, true);
  }, [relationPopoverOpen, selectedEdgeId, setRelationPopoverOpen]);

  useEffect(() => {
    if (!activeToolbarNodeId) return undefined;

    function closeToolbarOnOutsidePointer(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const card = target.closest(`[data-node-card-id="${activeToolbarNodeId}"]`);
      const toolbar = target.closest(`[data-node-toolbar-id="${activeToolbarNodeId}"]`);
      if (!card && !toolbar) setActiveToolbarNodeId(null);
    }

    document.addEventListener('pointerdown', closeToolbarOnOutsidePointer, true);
    return () => document.removeEventListener('pointerdown', closeToolbarOnOutsidePointer, true);
  }, [activeToolbarNodeId, setActiveToolbarNodeId]);

  const markDirty = useCallback(() => ui.setSaveState('dirty'), [ui]);

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

  const startStageDrag = useCallback((event: ReactDragEvent<HTMLButtonElement>, stage: CanvasStageNode['data']['stage']) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData(CANVAS_DRAG_STAGE_MIME, stage);
    ui.notify(t('notices.dragStage', { stage: stageCopy(stage).singular.toLowerCase() }));
  }, [stageCopy, t, ui]);

  const allowStageDrop = useCallback((event: ReactDragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes(CANVAS_DRAG_STAGE_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const dropStage = useCallback((event: ReactDragEvent<HTMLDivElement>) => {
    const stageValue = event.dataTransfer.getData(CANVAS_DRAG_STAGE_MIME);
    if (!isCanvasStageId(stageValue)) return;
    event.preventDefault();
    const rawPosition = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const position = {
      x: Math.max(
        CANVAS_DIMENSIONS.nodeEdgeGap,
        Math.min(
          CANVAS_DIMENSIONS.width - CANVAS_DIMENSIONS.nodeWidth - CANVAS_DIMENSIONS.nodeEdgeGap,
          rawPosition.x - CANVAS_DIMENSIONS.nodeWidth / 2
        )
      ),
      y: Math.max(
        72,
        Math.min(
          CANVAS_DIMENSIONS.height - CANVAS_DIMENSIONS.nodeHeight - CANVAS_DIMENSIONS.nodeEdgeGap,
          rawPosition.y - 40
        )
      )
    };
    const node = flow.createNode(stageValue, position);
    ui.selectNode(node.id);
    ui.setCreatorOpen(false);
    markDirty();
    ui.notify(t('notices.stageAdded', { stage: stageCopy(stageValue).singular }));
  }, [flow, markDirty, reactFlow, stageCopy, t, ui]);

  const updateSelectedNode = useCallback((field: keyof CanvasStageNode['data'], value: string) => {
    if (!ui.selectedNodeId) return;
    flow.updateNode(ui.selectedNodeId, { [field]: value });
    markDirty();
  }, [flow, markDirty, ui.selectedNodeId]);

  const duplicateNode = useCallback((nodeId: string) => {
    const duplicate = flow.duplicateNode(nodeId);
    if (!duplicate) return;
    ui.selectNode(duplicate.id);
    ui.setActiveToolbarNodeId(duplicate.id);
    markDirty();
    ui.notify(t('notices.duplicated'));
  }, [flow, markDirty, t, ui]);

  const deleteNode = useCallback((nodeId: string) => {
    const node = flow.deleteNode(nodeId);
    if (!node) return;
    ui.clearSelection();
    ui.setActiveToolbarNodeId(null);
    ui.closeNodeEditor();
    markDirty();
    ui.notify(t('notices.deleted', { stage: stageCopy(node.data.stage).singular }));
  }, [flow, markDirty, stageCopy, t, ui]);

  const saveNodeEditor = useCallback((nodeId: string) => {
    if (!ui.nodeDraft) return;
    const node = flow.nodes.find((item) => item.id === nodeId);
    if (!node) return;
    flow.saveNodeDraft(nodeId, { ...node.data, ...ui.nodeDraft });
    ui.closeNodeEditor();
    markDirty();
    ui.notify(t('notices.nodeUpdated'));
  }, [flow, markDirty, t, ui]);

  const selectEdge = useCallback((edge: CanvasCausalEdge) => {
    const relationKind = flow.getRelationKind(edge);
    if (!relationKind) return;
    ui.selectEdge(edge, relationKind);
    ui.notify(t('notices.connectionSelected'));
  }, [flow, t, ui]);

  const openRelationForm = useCallback(() => {
    if (!selectedEdge || !selectedRelationKind) return;
    ui.setRelationDraft(createRelationDraft(selectedEdge, selectedRelationKind, t));
    ui.setRelationPanelMode('form');
  }, [selectedEdge, selectedRelationKind, t, ui]);

  const updateRelationDraft = useCallback((field: 'title' | 'description' | 'advancedDetails', value: string) => {
    ui.setRelationDraft((current) => current ? { ...current, [field]: value } : current);
  }, [ui]);

  const saveRelation = useCallback(() => {
    if (!selectedEdge || !selectedRelationKind || !ui.relationDraft) return;
    if (!ui.relationDraft.description.trim()) {
      ui.notify(
        selectedRelationKind === 'risk'
          ? t('notices.riskRequired')
          : t('notices.hypothesisRequired'),
        'warning'
      );
      return;
    }
    flow.saveRelation(selectedEdge.id, selectedRelationKind, ui.relationDraft);
    ui.setRelationPanelMode('menu');
    markDirty();
    ui.notify(selectedRelationKind === 'risk' ? t('notices.riskSaved') : t('notices.hypothesisSaved'));
  }, [flow, markDirty, selectedEdge, selectedRelationKind, t, ui]);

  const removeRelation = useCallback(() => {
    if (!selectedEdge || !selectedRelationKind || !selectedEdge.data?.relationKind) return;
    flow.removeRelation(selectedEdge.id);
    ui.setRelationDraft(createRelationDraft({ ...selectedEdge, data: {} }, selectedRelationKind, t));
    ui.setRelationPanelMode('menu');
    markDirty();
    ui.notify(t('notices.markerRemoved'));
  }, [flow, markDirty, selectedEdge, selectedRelationKind, t, ui]);

  const deleteConnection = useCallback(() => {
    if (!selectedEdge) return;
    flow.deleteEdge(selectedEdge.id);
    ui.clearSelection();
    markDirty();
    ui.notify(t('notices.connectionDeleted'));
  }, [flow, markDirty, selectedEdge, t, ui]);

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

  const save = useCallback(async () => {
    ui.setSaveState('saving');
    ui.notify(t('notices.saving'));
    try {
      await persistence.saveProject();
      ui.setSaveState('saved');
      ui.notify(t('notices.saved'));
    } catch {
      ui.setSaveState('dirty');
      ui.notify(t('notices.saveError'), 'warning');
    }
  }, [persistence, t, ui]);

  const openResult = useCallback(async () => {
    ui.setSaveState('saving');
    ui.notify(t('notices.preparingResult'));
    try {
      await persistence.saveAndOpenResult();
      ui.setSaveState('saved');
    } catch {
      ui.setSaveState('dirty');
      ui.notify(t('notices.resultError'), 'warning');
    }
  }, [persistence, t, ui]);

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
    openGuide: () => router.push('/guia-de-aprendizado'),
    openExamples: () => router.push('/exemplos'),
    save,
    openResult,
    t,
    stageCopy,
    userName
  };
}

export type CanvasWorkspaceController = ReturnType<typeof useCanvasWorkspaceController>;

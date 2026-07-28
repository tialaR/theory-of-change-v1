'use client';

import { useCallback, useEffect, type DragEvent as ReactDragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useReactFlow, type Connection, type NodeMouseHandler } from '@xyflow/react';
import { CANVAS_DRAG_STAGE_MIME, CANVAS_DIMENSIONS } from '../../domain/canvas-ui.constants';
import { getCanvasStageMeta, isCanvasStageId } from '../../domain/canvas-stage.constants';
import type { CanvasRelationKind } from '../../domain/canvas-project';
import type { CanvasCausalEdge, CanvasStageNode } from '../../react-flow/canvas-flow.types';
import { useCanvasFlowController } from './use-canvas-flow-controller';
import { createRelationDraft, useCanvasUiState } from './use-canvas-ui-state';
import { useCanvasProjectPersistence } from './use-canvas-project-persistence';

export function useCanvasWorkspaceController() {
  const flow = useCanvasFlowController();
  const ui = useCanvasUiState();
  const reactFlow = useReactFlow<CanvasStageNode, CanvasCausalEdge>();
  const router = useRouter();
  const persistence = useCanvasProjectPersistence({
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
      ui.notify(result.message, 'warning');
      return;
    }
    markDirty();
    ui.notify('Conexão criada. Clique na seta para qualificar ou excluir.');
  }, [flow, markDirty, ui]);

  const onNodeDragStart = useCallback(() => {
    flow.beginNodeDrag();
  }, [flow]);

  const onNodeDragStop = useCallback(() => {
    flow.finishNodeDrag();
    markDirty();
    ui.notify('Posição atualizada.');
  }, [flow, markDirty, ui]);

  const startStageDrag = useCallback((event: ReactDragEvent<HTMLButtonElement>, stage: CanvasStageNode['data']['stage']) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData(CANVAS_DRAG_STAGE_MIME, stage);
    ui.notify(`Arraste ${getCanvasStageMeta(stage).singular.toLowerCase()} para a posição desejada no canvas.`);
  }, [ui]);

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
    ui.notify(`${getCanvasStageMeta(stageValue).singular} adicionado. Você pode posicioná-lo livremente.`);
  }, [flow, markDirty, reactFlow, ui]);

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
    ui.notify('Card duplicado sem alterar o original.');
  }, [flow, markDirty, ui]);

  const deleteNode = useCallback((nodeId: string) => {
    const node = flow.deleteNode(nodeId);
    if (!node) return;
    ui.clearSelection();
    ui.setActiveToolbarNodeId(null);
    ui.closeNodeEditor();
    markDirty();
    ui.notify(`${getCanvasStageMeta(node.data.stage).singular} excluído.`);
  }, [flow, markDirty, ui]);

  const saveNodeEditor = useCallback((nodeId: string) => {
    if (!ui.nodeDraft) return;
    const node = flow.nodes.find((item) => item.id === nodeId);
    if (!node) return;
    flow.saveNodeDraft(nodeId, { ...node.data, ...ui.nodeDraft });
    ui.closeNodeEditor();
    markDirty();
    ui.notify('Card atualizado no próprio canvas.');
  }, [flow, markDirty, ui]);

  const selectEdge = useCallback((edge: CanvasCausalEdge) => {
    const relationKind = flow.getRelationKind(edge);
    if (!relationKind) return;
    ui.selectEdge(edge, relationKind);
    ui.notify('Conexão selecionada. As ações disponíveis respeitam a regra causal.');
  }, [flow, ui]);

  const openRelationForm = useCallback(() => {
    if (!selectedEdge || !selectedRelationKind) return;
    ui.setRelationDraft(createRelationDraft(selectedEdge, selectedRelationKind));
    ui.setRelationPanelMode('form');
  }, [selectedEdge, selectedRelationKind, ui]);

  const updateRelationDraft = useCallback((field: 'title' | 'description' | 'advancedDetails', value: string) => {
    ui.setRelationDraft((current) => current ? { ...current, [field]: value } : current);
  }, [ui]);

  const saveRelation = useCallback(() => {
    if (!selectedEdge || !selectedRelationKind || !ui.relationDraft) return;
    if (!ui.relationDraft.description.trim()) {
      ui.notify(
        selectedRelationKind === 'risk'
          ? 'Descreva o risco antes de salvar.'
          : 'Descreva a hipótese antes de salvar.',
        'warning'
      );
      return;
    }
    flow.saveRelation(selectedEdge.id, selectedRelationKind, ui.relationDraft);
    ui.setRelationPanelMode('menu');
    markDirty();
    ui.notify(selectedRelationKind === 'risk' ? 'Risco salvo na conexão.' : 'Hipótese salva na conexão.');
  }, [flow, markDirty, selectedEdge, selectedRelationKind, ui]);

  const removeRelation = useCallback(() => {
    if (!selectedEdge || !selectedRelationKind || !selectedEdge.data?.relationKind) return;
    flow.removeRelation(selectedEdge.id);
    ui.setRelationDraft(createRelationDraft({ ...selectedEdge, data: {} }, selectedRelationKind));
    ui.setRelationPanelMode('menu');
    markDirty();
    ui.notify('Marcador removido. A conexão causal foi preservada.');
  }, [flow, markDirty, selectedEdge, selectedRelationKind, ui]);

  const deleteConnection = useCallback(() => {
    if (!selectedEdge) return;
    flow.deleteEdge(selectedEdge.id);
    ui.clearSelection();
    markDirty();
    ui.notify('Conexão excluída sem alterar os blocos.');
  }, [flow, markDirty, selectedEdge, ui]);

  const undo = useCallback(() => {
    if (!flow.undo()) return;
    markDirty();
    ui.notify('Última alteração desfeita.');
  }, [flow, markDirty, ui]);

  const redo = useCallback(() => {
    if (!flow.redo()) return;
    markDirty();
    ui.notify('Alteração refeita.');
  }, [flow, markDirty, ui]);

  const centralizeColumns = useCallback(() => {
    flow.centralizeColumns();
    markDirty();
    ui.notify('As etapas foram centralizadas em colunas.');
    requestAnimationFrame(() => reactFlow.fitView({ padding: 0.18, duration: 260 }));
  }, [flow, markDirty, reactFlow, ui]);

  const organizeFlow = useCallback(() => {
    flow.organizeFlow();
    markDirty();
    ui.notify('O fluxo foi organizado para facilitar a leitura das conexões.');
    requestAnimationFrame(() => reactFlow.fitView({ padding: 0.18, duration: 260 }));
  }, [flow, markDirty, reactFlow, ui]);

  const frameVisualization = useCallback(() => {
    if (!flow.nodes.length) {
      reactFlow.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 260 });
      ui.notify('A visualização foi centralizada.');
      return;
    }
    reactFlow.fitView({ padding: 0.18, duration: 260 });
    ui.notify('A teoria foi enquadrada na área de trabalho.');
  }, [flow.nodes.length, reactFlow, ui]);

  const save = useCallback(async () => {
    ui.setSaveState('saving');
    ui.notify('Salvando teoria…');
    try {
      await persistence.saveProject();
      ui.setSaveState('saved');
      ui.notify('Tudo salvo.');
    } catch {
      ui.setSaveState('dirty');
      ui.notify('Não foi possível salvar agora. Tente novamente.', 'warning');
    }
  }, [persistence, ui]);

  const openResult = useCallback(async () => {
    ui.setSaveState('saving');
    ui.notify('Preparando resultado…');
    try {
      await persistence.saveAndOpenResult();
      ui.setSaveState('saved');
    } catch {
      ui.setSaveState('dirty');
      ui.notify('Não foi possível abrir o resultado agora. Tente novamente.', 'warning');
    }
  }, [persistence, ui]);


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
    openResult
  };
}

export type CanvasWorkspaceController = ReturnType<typeof useCanvasWorkspaceController>;

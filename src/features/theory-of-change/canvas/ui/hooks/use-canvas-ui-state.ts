'use client';

import { useCallback, useState } from 'react';
import type { CanvasRelationKind } from '../../domain/canvas-project';
import { CANVAS_PROJECT_DEFAULT_TITLE } from '../../domain/canvas-project.constants';
import type { CanvasCausalEdge, CanvasStageNode } from '../../react-flow/canvas-flow.types';

export type CanvasNoticeTone = 'info' | 'warning';
export type CanvasSaveState = 'saved' | 'dirty' | 'saving';
export type CanvasRelationPanelMode = 'menu' | 'form';
export type CanvasNodeDraft = Pick<CanvasStageNode['data'], 'title' | 'description' | 'advancedDetails'>;
export type CanvasRelationDraft = {
  title: string;
  description: string;
  advancedDetails: string;
};

function createNodeDraft(node: CanvasStageNode): CanvasNodeDraft {
  return {
    title: node.data.title,
    description: node.data.description,
    advancedDetails: node.data.advancedDetails
  };
}

export function createRelationDraft(
  edge: CanvasCausalEdge,
  kind: CanvasRelationKind
): CanvasRelationDraft {
  return {
    title: edge.data?.relationTitle ?? (kind === 'risk' ? 'Risco da conexão' : 'Hipótese da conexão'),
    description: edge.data?.relationText ?? '',
    advancedDetails: edge.data?.relationAdvancedDetails ?? ''
  };
}

export function useCanvasUiState() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeToolbarNodeId, setActiveToolbarNodeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeDraft, setNodeDraft] = useState<CanvasNodeDraft | null>(null);
  const [relationPanelMode, setRelationPanelMode] = useState<CanvasRelationPanelMode>('menu');
  const [relationPopoverOpen, setRelationPopoverOpen] = useState(false);
  const [relationDraft, setRelationDraft] = useState<CanvasRelationDraft | null>(null);
  const [cardAdvancedOpenId, setCardAdvancedOpenId] = useState<string | null>(null);
  const [inspectorAdvancedOpenKey, setInspectorAdvancedOpenKey] = useState<string | null>(null);
  const [notice, setNotice] = useState('Canvas vazio. Arraste qualquer etapa para começar.');
  const [noticeTone, setNoticeTone] = useState<CanvasNoticeTone>('info');
  const [saveState, setSaveState] = useState<CanvasSaveState>('saved');
  const [projectTitle, setProjectTitle] = useState(CANVAS_PROJECT_DEFAULT_TITLE);
  const [fullCanvasMode, setFullCanvasMode] = useState(false);

  const notify = useCallback((message: string, tone: CanvasNoticeTone = 'info') => {
    setNotice(message);
    setNoticeTone(tone);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setRelationDraft(null);
    setRelationPanelMode('menu');
    setRelationPopoverOpen(false);
  }, []);

  const selectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
    setRelationDraft(null);
    setRelationPopoverOpen(false);
    setInspectorOpen(true);
  }, []);

  const selectEdge = useCallback((edge: CanvasCausalEdge, relationKind: CanvasRelationKind) => {
    setSelectedNodeId(null);
    setSelectedEdgeId(edge.id);
    setRelationDraft(createRelationDraft(edge, relationKind));
    setRelationPanelMode('menu');
    setRelationPopoverOpen(true);
    setInspectorOpen(true);
  }, []);

  const openNodeEditor = useCallback((node: CanvasStageNode) => {
    selectNode(node.id);
    setEditingNodeId(node.id);
    setNodeDraft(createNodeDraft(node));
    setActiveToolbarNodeId(node.id);
    setCardAdvancedOpenId(null);
  }, [selectNode]);

  const closeNodeEditor = useCallback(() => {
    setEditingNodeId(null);
    setNodeDraft(null);
    setCardAdvancedOpenId(null);
  }, []);

  return {
    selectedNodeId,
    setSelectedNodeId,
    selectedEdgeId,
    setSelectedEdgeId,
    creatorOpen,
    setCreatorOpen,
    inspectorOpen,
    setInspectorOpen,
    historyOpen,
    setHistoryOpen,
    activeToolbarNodeId,
    setActiveToolbarNodeId,
    editingNodeId,
    nodeDraft,
    setNodeDraft,
    relationPanelMode,
    setRelationPanelMode,
    relationPopoverOpen,
    setRelationPopoverOpen,
    relationDraft,
    setRelationDraft,
    cardAdvancedOpenId,
    setCardAdvancedOpenId,
    inspectorAdvancedOpenKey,
    setInspectorAdvancedOpenKey,
    notice,
    noticeTone,
    notify,
    saveState,
    setSaveState,
    projectTitle,
    setProjectTitle,
    fullCanvasMode,
    setFullCanvasMode,
    clearSelection,
    selectNode,
    selectEdge,
    openNodeEditor,
    closeNodeEditor
  };
}

export type CanvasUiState = ReturnType<typeof useCanvasUiState>;

'use client';

import { useCallback, useState } from 'react';
import type { CanvasRelationKind } from '../../domain/canvas-project';
import type { CanvasCausalEdge, CanvasStageNode } from '../../react-flow/canvas-flow.types';
import type { CanvasTranslator } from '../canvas-copy';

export type CanvasNoticeTone = 'info' | 'warning';
export type CanvasSaveState = 'saved' | 'dirty' | 'saving' | 'error';
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
  kind: CanvasRelationKind,
  t: CanvasTranslator
): CanvasRelationDraft {
  return {
    title: edge.data?.relationTitle ?? (kind === 'risk' ? t('relations.riskConnectionTitle') : t('relations.hypothesisConnectionTitle')),
    description: edge.data?.relationText ?? '',
    advancedDetails: edge.data?.relationAdvancedDetails ?? ''
  };
}

export function useCanvasUiState(t: CanvasTranslator, initialProjectTitle: string, initialNodeCount: number) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeToolbarNodeId, setActiveToolbarNodeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeDraft, setNodeDraft] = useState<CanvasNodeDraft | null>(null);
  const [relationPanelMode, setRelationPanelMode] = useState<CanvasRelationPanelMode>('menu');
  const [relationPopoverOpen, setRelationPopoverOpen] = useState(false);
  const [relationDraft, setRelationDraft] = useState<CanvasRelationDraft | null>(null);
  const [cardAdvancedOpenId, setCardAdvancedOpenId] = useState<string | null>(null);
  const [inspectorAdvancedOpenKey, setInspectorAdvancedOpenKey] = useState<string | null>(null);
  const [notice, setNotice] = useState(initialNodeCount > 0 ? '' : t('notices.empty'));
  const [noticeTone, setNoticeTone] = useState<CanvasNoticeTone>('info');
  const [noticeRevision, setNoticeRevision] = useState(0);
  const [saveState, setSaveState] = useState<CanvasSaveState>('saved');
  const [changeRevision, setChangeRevision] = useState(0);
  const [projectTitle, setProjectTitle] = useState(initialProjectTitle);
  const [fullCanvasMode, setFullCanvasMode] = useState(false);

  const notify = useCallback((message: string, tone: CanvasNoticeTone = 'info') => {
    setNotice(message);
    setNoticeTone(tone);
    setNoticeRevision((revision) => revision + 1);
  }, []);


  const markDirty = useCallback(() => {
    setSaveState('dirty');
    setChangeRevision((revision) => revision + 1);
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
  }, []);

  const selectEdge = useCallback((edge: CanvasCausalEdge, relationKind: CanvasRelationKind) => {
    setSelectedNodeId(null);
    setSelectedEdgeId(edge.id);
    setRelationDraft(createRelationDraft(edge, relationKind, t));
    setRelationPanelMode('menu');
    setRelationPopoverOpen(true);
  }, [t]);

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
    noticeRevision,
    notify,
    saveState,
    setSaveState,
    changeRevision,
    markDirty,
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

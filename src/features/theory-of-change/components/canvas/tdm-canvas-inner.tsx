'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from 'react';
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type EdgeTypes,
  type FinalConnectionState,
  type IsValidConnection,
  type NodeTypes,
  type OnConnectEnd,
  type OnConnectStart
} from '@xyflow/react';

import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button/tdm-icon-button';
import { TdmTheoryEdge } from '../edge/tdm-theory-edge';
import { ResultView } from '../result-view/result-view';
import { TdmResultPreview } from '../result-preview/tdm-result-preview';
import { TdmCanvasNode, TdmNodeInteractionProvider } from './tdm-canvas-node/tdm-canvas-node';
import { SidebarToggleIcon, TdmSidebar, type TdmBlockForms, type TdmSidebarContext } from '../sidebar/tdm-sidebar';
import {
  stageAdvancedFlowTooltipEvent,
  stageAdvancedToast,
  theoryCompleteToast
} from '../toast/tdm-toast-messages';
import { TdmToastViewport } from '../toast/tdm-toast';
import { useContextualFlowTooltip } from '../toast/use-contextual-flow-tooltip';
import { TdmCanvasProcessDock } from './tdm-canvas-process-dock/tdm-canvas-process-dock';
import { TdmCanvasCommandDock } from './tdm-canvas-command-dock';
import {
  getConnectionKind,
  GUIDE_HYPOTHESIS_DELETED,
  GUIDE_HYPOTHESIS_SAVED,
  GUIDE_RISK_DELETED,
  GUIDE_RISK_SAVED,
  isAllowedTdmConnection
} from '../../domain/tdm-connection-rules';
import { getTheoryGuideContent, THEORY_GUIDE_INVALID_CONNECTION } from '../../domain/tdm-theory-guide';
import { type TdmStage } from '../../domain/tdm-stages';
import type { TdmEdge as TdmEdgeModel, TdmMarkerType, TdmNode as TdmNodeModel, TdmNodeDraft } from '../../domain/tdm-types';
import { exampleTheory } from '../../data/example-theory';
import { canViewTdmResult, getTdmResultAvailabilityMessage } from '../../utils/tdm-result';
import { createEdge } from '../../utils/create-edge';
import { createNode } from '../../utils/create-node';
import {
  getNextStageCreation,
  getStageCounts,
  getStageCreationActionLabel,
  getStageCreationAdvanceLabel,
  isReadyToConnect,
  type StageCreation
} from '../../utils/stage-creation';
import { layoutNodesByStage } from '../../utils/layout-nodes-by-stage';
import { layoutNodesByFlow } from '../../utils/layout-nodes-by-flow';
import { getCreateNodePosition, getDuplicateNodePosition } from '../../utils/node-placement';
import ctaScope from './canvas-cta-scope.module.sass';
import styles from './tdm-canvas.module.sass';

const EMPTY_DRAFT: TdmNodeDraft = {
  title: '',
  description: '',
  advancedDetails: '',
  shortNotes: ''
};

const QUICK_STAGE_DRAFTS: Record<TdmStage, TdmNodeDraft> = {
  input: {
    title: 'Novo insumo',
    description: 'Recurso necessário para a política acontecer.',
    advancedDetails: '',
    shortNotes: ''
  },
  activity: {
    title: 'Nova atividade',
    description: 'Ação realizada com os recursos disponíveis.',
    advancedDetails: '',
    shortNotes: ''
  },
  output: {
    title: 'Novo produto',
    description: 'Entrega concreta gerada pela atividade.',
    advancedDetails: '',
    shortNotes: ''
  },
  outcome: {
    title: 'Novo resultado',
    description: 'Mudança esperada depois das entregas.',
    advancedDetails: '',
    shortNotes: ''
  }
};

const defaultEdgeOptions = {
  type: 'tdm',
  markerEnd: {
    type: MarkerType.ArrowClosed
  }
} as const;

// React Flow's fitView tries to fill the available canvas. With only one or two
// nodes this can zoom the viewport aggressively and make the inline editor look
// giant, even when the component CSS is rem-based and compact. Keep automatic
// viewport fitting capped so node size remains proportional to the app viewport.
const CANVAS_FIT_PADDING = 0.16;
const CANVAS_MIN_ZOOM = 0.32;
const CANVAS_MAX_ZOOM = 1.2;
const CANVAS_MAX_AUTO_FIT_ZOOM = 1;
const CANVAS_SNAP_GRID: [number, number] = [20, 20];
const CANVAS_FIT_VIEW_OPTIONS = {
  padding: CANVAS_FIT_PADDING,
  maxZoom: CANVAS_MAX_AUTO_FIT_ZOOM
} as const;
const CANVAS_CONTROLS_STYLE = { left: 16, bottom: 16, top: 'auto', right: 'auto', width: 'auto' } as const;
const CANVAS_MINIMAP_STYLE = { width: 152, height: 96, pointerEvents: 'none' as const };

/** Local visual stage fills for minimap (DS V1 — not domain theme). */
const CANVAS_DS_MINIMAP: Record<TdmStage, { fill: string; stroke: string }> = {
  input: { fill: 'rgba(167, 139, 250, 0.16)', stroke: 'rgba(167, 139, 250, 0.55)' },
  activity: { fill: 'rgba(96, 165, 250, 0.14)', stroke: 'rgba(96, 165, 250, 0.5)' },
  output: { fill: 'rgba(246, 179, 93, 0.14)', stroke: 'rgba(246, 179, 93, 0.5)' },
  outcome: { fill: 'rgba(94, 224, 181, 0.14)', stroke: 'rgba(94, 224, 181, 0.5)' }
};

export const nodeTypes = {
  tdm: TdmCanvasNode
} satisfies NodeTypes;

export const edgeTypes = {
  tdm: TdmTheoryEdge
} satisfies EdgeTypes;

type ViewMode = 'canvas' | 'example-preview' | 'result';

type TheorySnapshot = {
  nodes: TdmNodeModel[];
  edges: TdmEdgeModel[];
  theoryTitle: string;
  stageCreation: StageCreation;
  creationDrafts: Record<TdmStage, TdmNodeDraft>;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
};

function createEmptyDraftMap(): Record<TdmStage, TdmNodeDraft> {
  return {
    input: { ...EMPTY_DRAFT },
    activity: { ...EMPTY_DRAFT },
    output: { ...EMPTY_DRAFT },
    outcome: { ...EMPTY_DRAFT }
  };
}

type TdmCanvasInnerProps = {
  initialVariant?: 'custom' | 'example';
};

export function TdmCanvasInner({ initialVariant = 'custom' }: TdmCanvasInnerProps) {
  const isExampleInitial = initialVariant === 'example';
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
  const [theoryTitle, setTheoryTitle] = useState(isExampleInitial ? exampleTheory.title : '');
  const [nodes, setNodes, onNodesChange] = useNodesState<TdmNodeModel>(isExampleInitial ? exampleTheory.nodes : []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<TdmEdgeModel>(isExampleInitial ? exampleTheory.edges : []);
  const [stageCreation, setStageCreation] = useState<StageCreation>(isExampleInitial ? 'ready-to-connect' : 'input');
  const { activeFlowTooltip, showFlowTooltip, closeFlowTooltip, clearFlowTooltipEvent } = useContextualFlowTooltip();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [toolbarNodeId, setToolbarNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [creationDrafts, setCreationDrafts] = useState<Record<TdmStage, TdmNodeDraft>>(() => createEmptyDraftMap());
  const [creationError, setCreationError] = useState<string | undefined>();
  const [editDraft, setEditDraft] = useState<TdmNodeDraft>({ ...EMPTY_DRAFT });
  const [editError, setEditError] = useState<string | undefined>();
  const [isCreateAccordionOpen, setIsCreateAccordionOpen] = useState(true);
  const [isEditAccordionOpen, setIsEditAccordionOpen] = useState(false);
  const [markerDraft, setMarkerDraft] = useState('');
  const [canvasVariant, setCanvasVariant] = useState<'custom' | 'example'>(initialVariant);
  const [previousTheorySnapshot, setPreviousTheorySnapshot] = useState<TheorySnapshot | null>(null);
  const [viewportResetToken, setViewportResetToken] = useState(0);
  const [guideTransientMessage, setGuideTransientMessage] = useState<string | null>(null);
  const [connectingFromStage, setConnectingFromStage] = useState<TdmStage | null>(null);
  const [markerEditorEdgeId, setMarkerEditorEdgeId] = useState<string | null>(null);
  const [recentlyUpdatedEdgeIds, setRecentlyUpdatedEdgeIds] = useState<Set<string>>(() => new Set());
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);

  const { fitView, zoomIn, zoomOut, screenToFlowPosition } = useReactFlow<TdmNodeModel, TdmEdgeModel>();

  const stageCounts = useMemo(() => getStageCounts(nodes), [nodes]);
  const readyToConnect = useMemo(() => isReadyToConnect(nodes), [nodes]);
  const canConnectNodes = readyToConnect;
  const currentStageCount = stageCreation === 'ready-to-connect' ? 0 : stageCounts[stageCreation];
  const canAdvance = stageCreation !== 'ready-to-connect' && currentStageCount > 0;
  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) ?? null, [nodes, selectedNodeId]);
  const selectedEdge = useMemo(() => edges.find((edge) => edge.id === selectedEdgeId) ?? null, [edges, selectedEdgeId]);
  const selectedConnectionKind = useMemo(() => {
    if (!selectedEdge) {
      return undefined;
    }

    return selectedEdge.data?.connectionKind ?? getConnectionKind(selectedEdge.sourceStage, selectedEdge.targetStage);
  }, [selectedEdge]);
  const canGenerateResult = canViewTdmResult(nodes, edges);
  const hasEdgeMarkers = useMemo(
    () => edges.some((edge) => Boolean(edge.markerType && edge.markerText?.trim())),
    [edges]
  );
  const guideContent = useMemo(
    () =>
      getTheoryGuideContent({
        stageCounts,
        stageCreation,
        selectedConnectionKind,
        connectingFromStage,
        transientMessage: guideTransientMessage,
        isTheoryComplete: canGenerateResult,
        hasEdgeMarkers
      }),
    [
      canGenerateResult,
      connectingFromStage,
      guideTransientMessage,
      hasEdgeMarkers,
      selectedConnectionKind,
      stageCounts,
      stageCreation
    ]
  );

  const resultAvailabilityMessage = getTdmResultAvailabilityMessage(nodes, edges);
  const canRestoreTheory = canvasVariant === 'example' && previousTheorySnapshot !== null;
  const hasInitializedFlowTooltipRef = useRef(false);
  const previousCanGenerateResultRef = useRef(canGenerateResult);

  useEffect(() => {
    if (!hasInitializedFlowTooltipRef.current) {
      hasInitializedFlowTooltipRef.current = true;
      previousCanGenerateResultRef.current = canGenerateResult;
      return;
    }

    if (canGenerateResult && !previousCanGenerateResultRef.current) {
      showFlowTooltip('theory-complete', theoryCompleteToast());
    }

    if (!canGenerateResult && previousCanGenerateResultRef.current) {
      clearFlowTooltipEvent('theory-complete');
    }

    previousCanGenerateResultRef.current = canGenerateResult;
  }, [canGenerateResult, clearFlowTooltipEvent, showFlowTooltip]);

  const fitCanvasToVisibleArea = useCallback(() => {
    if (viewMode !== 'canvas' || nodes.length === 0) {
      return;
    }

    window.requestAnimationFrame(() => {
      screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
      fitView({ padding: CANVAS_FIT_PADDING, duration: 250, maxZoom: CANVAS_MAX_AUTO_FIT_ZOOM });
    });
  }, [fitView, nodes.length, screenToFlowPosition, viewMode]);

  useEffect(() => {
    fitCanvasToVisibleArea();
  }, [fitCanvasToVisibleArea, viewportResetToken]);

  const bumpViewportReset = useCallback(() => {
    setViewportResetToken((currentValue) => currentValue + 1);
  }, []);

  const markEdgeRecentlyUpdated = useCallback((edgeId: string) => {
    setRecentlyUpdatedEdgeIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(edgeId);
      return nextIds;
    });

    window.setTimeout(() => {
      setRecentlyUpdatedEdgeIds((currentIds) => {
        if (!currentIds.has(edgeId)) {
          return currentIds;
        }

        const nextIds = new Set(currentIds);
        nextIds.delete(edgeId);
        return nextIds;
      });
    }, 1800);
  }, []);

  const clearEditFormState = useCallback(() => {
    setEditDraft({ ...EMPTY_DRAFT });
    setEditError(undefined);
    setIsEditAccordionOpen(false);
  }, []);

  const resetCanvasSelection = useCallback(() => {
    setSelectedNodeId(null);
    setToolbarNodeId(null);
    setSelectedEdgeId(null);
    setCreationError(undefined);
    setEditError(undefined);
    setMarkerDraft('');
    setEditDraft({ ...EMPTY_DRAFT });
    setIsEditAccordionOpen(false);
    setMarkerEditorEdgeId(null);
    setGuideTransientMessage(null);
    setNodes((currentNodes) => {
      const hasSelectedNodes = currentNodes.some((node) => node.selected);

      if (!hasSelectedNodes) {
        return currentNodes;
      }

      return currentNodes.map((node) => {
        if (!node.selected) {
          return node;
        }

        return {
          ...node,
          selected: false
        };
      });
    });
  }, [setNodes]);

  const replaceCanvasWithExample = useCallback(() => {
    if (canvasVariant === 'custom') {
      setPreviousTheorySnapshot({
        nodes,
        edges,
        theoryTitle,
        stageCreation,
        creationDrafts,
        selectedNodeId,
        selectedEdgeId
      });
    }

    setNodes(exampleTheory.nodes);
    setEdges(exampleTheory.edges);
    setTheoryTitle(exampleTheory.title);
    setStageCreation('ready-to-connect');
    setCreationDrafts(createEmptyDraftMap());
    resetCanvasSelection();
    setEditingNodeId(null);
    setCanvasVariant('example');
    setViewMode('canvas');
    bumpViewportReset();
  }, [
    canvasVariant,
    creationDrafts,
    edges,
    nodes,
    resetCanvasSelection,
    selectedEdgeId,
    selectedNodeId,
    setEdges,
    setNodes,
    stageCreation,
    theoryTitle,
    bumpViewportReset
  ]);

  const restorePreviousTheory = useCallback(() => {
    if (!previousTheorySnapshot) {
      return;
    }

    setNodes(previousTheorySnapshot.nodes);
    setEdges(previousTheorySnapshot.edges);
    setTheoryTitle(previousTheorySnapshot.theoryTitle);
    setStageCreation(previousTheorySnapshot.stageCreation);
    setCreationDrafts(previousTheorySnapshot.creationDrafts);
    setSelectedNodeId(previousTheorySnapshot.selectedNodeId);
    setToolbarNodeId(null);
    setSelectedEdgeId(previousTheorySnapshot.selectedEdgeId);
    const restoredNode = previousTheorySnapshot.selectedNodeId
      ? previousTheorySnapshot.nodes.find((node) => node.id === previousTheorySnapshot.selectedNodeId) ?? null
      : null;

    setEditDraft(
      restoredNode
        ? {
            title: restoredNode.title,
            description: restoredNode.description,
            advancedDetails: restoredNode.advancedDetails,
            shortNotes: restoredNode.shortNotes
          }
        : { ...EMPTY_DRAFT }
    );
    setCreationError(undefined);
    setEditError(undefined);
    setEditingNodeId(null);
    setCanvasVariant('custom');
    setPreviousTheorySnapshot(null);
    setViewMode('canvas');
    bumpViewportReset();
  }, [bumpViewportReset, previousTheorySnapshot, setEdges, setNodes]);

  const viewExampleCanvas = useCallback(() => {
    replaceCanvasWithExample();
  }, [replaceCanvasWithExample]);

  const viewExampleResult = useCallback(() => {
    if (canvasVariant === 'custom') {
      setPreviousTheorySnapshot({
        nodes,
        edges,
        theoryTitle,
        stageCreation,
        creationDrafts,
        selectedNodeId,
        selectedEdgeId
      });
    }

    setViewMode('example-preview');
  }, [canvasVariant, creationDrafts, edges, nodes, selectedEdgeId, selectedNodeId, stageCreation, theoryTitle]);

  const closeExamplePreview = useCallback(() => {
    restorePreviousTheory();
  }, [restorePreviousTheory]);

  const openResultView = useCallback(() => {
    setViewMode('result');
  }, []);

  const closeResultView = useCallback(() => {
    setViewMode('canvas');
  }, []);

  const centerNodes = useCallback(() => {
    setNodes((currentNodes) => layoutNodesByStage(currentNodes));
    setCanvasVariant('custom');
    window.requestAnimationFrame(() => {
      fitView({ padding: CANVAS_FIT_PADDING, duration: 250, maxZoom: CANVAS_MAX_AUTO_FIT_ZOOM });
    });
  }, [fitView, setNodes]);

  const organizeFlow = useCallback(() => {
    setNodes((currentNodes) => layoutNodesByFlow(currentNodes, edges));
    setCanvasVariant('custom');
    window.requestAnimationFrame(() => {
      fitView({ padding: CANVAS_FIT_PADDING, duration: 250, maxZoom: CANVAS_MAX_AUTO_FIT_ZOOM });
    });
  }, [edges, fitView, setNodes]);

  const clearCanvasSelection = useCallback(() => {
    if (editingNodeId) {
      return;
    }

    resetCanvasSelection();
  }, [editingNodeId, resetCanvasSelection]);

  const toggleGuideExpanded = useCallback(() => {
    setIsGuideExpanded((current) => !current);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (viewMode !== 'canvas') {
        return;
      }

      const target = event.target;
      const isEditableTarget =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT');

      if (isEditableTarget) {
        if (event.key === 'Escape') {
          if (markerEditorEdgeId) {
            event.preventDefault();
            setMarkerEditorEdgeId(null);
          }
        }

        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        clearCanvasSelection();
        return;
      }

      if (event.metaKey || event.ctrlKey) {
        if (event.key === '+' || event.key === '=') {
          event.preventDefault();
          zoomIn({ duration: 160 });
        }

        if (event.key === '-') {
          event.preventDefault();
          zoomOut({ duration: 160 });
        }

        return;
      }

      if (event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'f') {
        event.preventDefault();
        fitCanvasToVisibleArea();
        return;
      }

      if (key === 'a') {
        event.preventDefault();
        centerNodes();
        return;
      }

      if (key === 'g') {
        event.preventDefault();
        toggleGuideExpanded();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    centerNodes,
    clearCanvasSelection,
    fitCanvasToVisibleArea,
    markerEditorEdgeId,
    toggleGuideExpanded,
    viewMode,
    zoomIn,
    zoomOut
  ]);

  const syncEditDraftFromNode = useCallback((node: TdmNodeModel) => {
    setEditDraft({
      title: node.title,
      description: node.description,
      advancedDetails: node.advancedDetails,
      shortNotes: node.shortNotes
    });
  }, []);

  const openNodeEditor = useCallback(
    (nodeId: string) => {
      const node = nodes.find((currentNode) => currentNode.id === nodeId);
      if (!node) {
        return;
      }

      setSelectedNodeId(node.id);
      setToolbarNodeId(null);
      setSelectedEdgeId(null);
      setCreationError(undefined);
      setEditError(undefined);
      syncEditDraftFromNode(node);
      setEditingNodeId(node.id);
      setIsEditAccordionOpen(true);
      setIsCreateAccordionOpen(false);
    },
    [nodes, syncEditDraftFromNode]
  );

  const cancelNodeEditor = useCallback(() => {
    setEditingNodeId(null);
    setEditError(undefined);
    if (selectedNode) {
      syncEditDraftFromNode(selectedNode);
      setToolbarNodeId(selectedNode.id);
    }
  }, [selectedNode, syncEditDraftFromNode]);

  const updateNodeById = useCallback(
    (nodeId: string, nextDraft: TdmNodeDraft) => {
      const title = nextDraft.title.trim();

      if (!title) {
        return false;
      }

      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id !== nodeId) {
            return node;
          }

          const nextNodeData = {
            title,
            description: nextDraft.description.trim(),
            advancedDetails: nextDraft.advancedDetails.trim(),
            shortNotes: nextDraft.shortNotes.trim()
          };

          return {
            ...node,
            ...nextNodeData,
            updatedAt: new Date().toISOString(),
            data: {
              ...node.data,
              stage: node.stage,
              ...nextNodeData
            }
          };
        })
      );
      setEditingNodeId(null);
      setToolbarNodeId(nodeId);
      setEditError(undefined);

      if (selectedNodeId === nodeId) {
        setEditDraft(nextDraft);
      }

      return true;
    },
    [selectedNodeId, setNodes]
  );

  const deleteNodeById = useCallback(
    (nodeId: string) => {
      setEdges((currentEdges) => currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      setNodes((currentNodes) => currentNodes.filter((node) => node.id !== nodeId));
      setSelectedNodeId((currentSelectedId) => (currentSelectedId === nodeId ? null : currentSelectedId));
      setToolbarNodeId((currentToolbarId) => (currentToolbarId === nodeId ? null : currentToolbarId));
      setSelectedEdgeId(null);
      setEditingNodeId((currentEditingId) => (currentEditingId === nodeId ? null : currentEditingId));
      setMarkerDraft('');
      setEditDraft({ ...EMPTY_DRAFT });
      setEditError(undefined);
      setIsEditAccordionOpen(false);
      bumpViewportReset();
    },
    [bumpViewportReset, setEdges, setNodes]
  );

  const duplicateNodeById = useCallback(
    (nodeId: string) => {
      const sourceNode = nodes.find((node) => node.id === nodeId);

      if (!sourceNode) {
        return;
      }

      const position = getDuplicateNodePosition(sourceNode, nodes);
      const clonedNode = createNode({
        title: `${sourceNode.title} cópia`,
        stage: sourceNode.stage,
        description: sourceNode.description,
        advancedDetails: sourceNode.advancedDetails,
        shortNotes: sourceNode.shortNotes,
        x: position.x,
        y: position.y
      });

      setNodes((currentNodes) => [...currentNodes, clonedNode]);
      setSelectedNodeId(clonedNode.id);
      setToolbarNodeId(null);
      setSelectedEdgeId(null);
      setEditingNodeId(null);
      setEditDraft({
        title: clonedNode.title,
        description: clonedNode.description,
        advancedDetails: clonedNode.advancedDetails,
        shortNotes: clonedNode.shortNotes
      });
      setIsEditAccordionOpen(true);
      setIsCreateAccordionOpen(false);
      bumpViewportReset();
    },
    [bumpViewportReset, nodes, setNodes]
  );

  const duplicateSelectedNode = useCallback(() => {
    if (!selectedNode) {
      return;
    }

    duplicateNodeById(selectedNode.id);
  }, [duplicateNodeById, selectedNode]);

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode) {
      return;
    }

    deleteNodeById(selectedNode.id);
  }, [deleteNodeById, selectedNode]);

  const deleteSelectedEdge = useCallback(() => {
    if (!selectedEdge) {
      return;
    }

    setEdges((currentEdges) => currentEdges.filter((edge) => edge.id !== selectedEdge.id));
    setSelectedEdgeId(null);
    setMarkerDraft('');
  }, [selectedEdge, setEdges]);

  const deleteMarkerFromEdge = useCallback(
    (edgeId: string) => {
      const edge = edges.find((currentEdge) => currentEdge.id === edgeId);
      if (!edge) {
        return;
      }

      const wasRisk = edge.markerType === 'risk';

      setEdges((currentEdges) =>
        currentEdges.map((currentEdge) => {
          if (currentEdge.id !== edgeId) {
            return currentEdge;
          }

          return {
            ...currentEdge,
            markerType: undefined,
            markerText: undefined,
            data: {
              ...currentEdge.data,
              markerType: undefined,
              markerText: undefined,
              riskText: undefined,
              hypothesisText: undefined,
              validationStatus: currentEdge.data?.validationStatus ?? 'valid',
              validationMessage: currentEdge.data?.validationMessage
            }
          } satisfies TdmEdgeModel;
        })
      );
      setMarkerEditorEdgeId(null);
      setMarkerDraft('');
      setGuideTransientMessage(wasRisk ? GUIDE_RISK_DELETED : GUIDE_HYPOTHESIS_DELETED);
    },
    [edges, setEdges]
  );

  const saveMarkerOnEdge = useCallback(
    (edgeId: string, markerType: TdmMarkerType, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }

      const timestamp = new Date().toISOString();

      setEdges((currentEdges) =>
        currentEdges.map((edge) => {
          if (edge.id !== edgeId) {
            return edge;
          }

          return {
            ...edge,
            markerType,
            markerText: trimmed,
            updatedAt: timestamp,
            data: {
              ...edge.data,
              markerType,
              markerText: trimmed,
              riskText: markerType === 'risk' ? trimmed : edge.data?.riskText,
              hypothesisText: markerType === 'hypothesis' ? trimmed : edge.data?.hypothesisText,
              riskCreatedAt: markerType === 'risk' ? edge.data?.riskCreatedAt ?? timestamp : edge.data?.riskCreatedAt,
              hypothesisCreatedAt:
                markerType === 'hypothesis' ? edge.data?.hypothesisCreatedAt ?? timestamp : edge.data?.hypothesisCreatedAt,
              validationStatus: edge.data?.validationStatus ?? 'valid',
              validationMessage: edge.data?.validationMessage
            }
          } satisfies TdmEdgeModel;
        })
      );
      setMarkerEditorEdgeId(null);
      setMarkerDraft(trimmed);
      setGuideTransientMessage(markerType === 'risk' ? GUIDE_RISK_SAVED : GUIDE_HYPOTHESIS_SAVED);
      markEdgeRecentlyUpdated(edgeId);
    },
    [markEdgeRecentlyUpdated, setEdges]
  );

  const openMarkerEditor = useCallback((edgeId: string) => {
    setMarkerEditorEdgeId(edgeId);
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
    setToolbarNodeId(null);
    setEditingNodeId(null);
  }, []);

  const closeMarkerEditor = useCallback(() => {
    setMarkerEditorEdgeId(null);
  }, []);

  const deleteMarkerFromSelectedEdge = useCallback(() => {
    if (!selectedEdge) {
      return;
    }

    deleteMarkerFromEdge(selectedEdge.id);
    setSelectedEdgeId(selectedEdge.id);
  }, [deleteMarkerFromEdge, selectedEdge]);

  const addMarkerToSelectedEdge = useCallback(
    (markerType: 'risk' | 'hypothesis') => {
      if (!selectedEdge) {
        return;
      }

      setEdges((currentEdges) =>
        currentEdges.map((edge) => {
          if (edge.id !== selectedEdge.id) {
            return edge;
          }

          return {
            ...edge,
            markerType,
            markerText: edge.markerText,
            data: {
              ...edge.data,
              markerType,
              markerText: edge.markerText,
              validationStatus: edge.data?.validationStatus ?? 'valid',
              validationMessage: edge.data?.validationMessage
            }
          } satisfies TdmEdgeModel;
        })
      );
      setMarkerDraft(selectedEdge.markerText ?? '');
      openMarkerEditor(selectedEdge.id);
    },
    [openMarkerEditor, selectedEdge, setEdges]
  );

  const saveMarkerOnSelectedEdge = useCallback(() => {
    if (!selectedEdge?.markerType) {
      return;
    }

    saveMarkerOnEdge(selectedEdge.id, selectedEdge.markerType, markerDraft);
  }, [markerDraft, saveMarkerOnEdge, selectedEdge]);

  const advanceStage = useCallback(() => {
    if (stageCreation === 'ready-to-connect') {
      return;
    }

    if (currentStageCount === 0) {
      return;
    }

    const nextStage = getNextStageCreation(stageCreation);
    if (nextStage === stageCreation) {
      return;
    }

    setStageCreation(nextStage);
    setSelectedNodeId(null);
    setToolbarNodeId(null);
    setSelectedEdgeId(null);
    setEditingNodeId(null);
    setEditDraft({ ...EMPTY_DRAFT });
    setEditError(undefined);
    setCreationError(undefined);
    setMarkerDraft('');
    setIsCreateAccordionOpen(true);
    setIsEditAccordionOpen(false);

    const flowTooltipEvent = stageAdvancedFlowTooltipEvent(nextStage);
    const flowTooltip = stageAdvancedToast(nextStage);

    if (flowTooltipEvent && flowTooltip) {
      showFlowTooltip(flowTooltipEvent, flowTooltip);
    }
  }, [currentStageCount, showFlowTooltip, stageCreation]);

  const handleCreateDraftChange = useCallback(
    (nextDraft: TdmNodeDraft) => {
      if (stageCreation === 'ready-to-connect') {
        return;
      }

      setCreationDrafts((currentDrafts) => ({
        ...currentDrafts,
        [stageCreation]: nextDraft
      }));
      setCreationError(undefined);
    },
    [stageCreation]
  );


  const createNodeFromDraft = useCallback(
    ({ stage, x, y, useQuickDraft = false }: { stage: TdmStage; x?: number; y?: number; useQuickDraft?: boolean }) => {
      const baseDraft = creationDrafts[stage];
      const quickDraft = QUICK_STAGE_DRAFTS[stage];
      const draft = useQuickDraft ? quickDraft : baseDraft;
      const title = draft.title.trim();

      if (!title) {
        const message = 'Preencha o título do bloco antes de adicionar ao canvas.';
        setCreationError(message);
        return null;
      }

      const smartPosition = getCreateNodePosition(stage, nodes);
      const createdNode = createNode({
        title,
        stage,
        description: draft.description.trim(),
        advancedDetails: draft.advancedDetails.trim(),
        shortNotes: draft.shortNotes.trim(),
        x: x ?? smartPosition.x,
        y: y ?? smartPosition.y
      });

      setNodes((currentNodes) => [...currentNodes, createdNode]);
      setSelectedNodeId(null);
      setToolbarNodeId(null);
      setSelectedEdgeId(null);
      setEditingNodeId(null);
      clearEditFormState();
      if (!useQuickDraft || creationDrafts[stage].title.trim()) {
        setCreationDrafts((currentDrafts) => ({
          ...currentDrafts,
          [stage]: { ...EMPTY_DRAFT }
        }));
      }
      setCreationError(undefined);
      bumpViewportReset();
      return createdNode;
    },
    [bumpViewportReset, clearEditFormState, creationDrafts, nodes, setNodes]
  );

  const handleCreateNode = useCallback(() => {
    if (stageCreation === 'ready-to-connect') {
      return;
    }

    createNodeFromDraft({ stage: stageCreation });
  }, [createNodeFromDraft, stageCreation]);


  const handleEditDraftChange = useCallback((nextDraft: TdmNodeDraft) => {
    setEditDraft(nextDraft);
    setEditError(undefined);
  }, []);

  const handleSaveSelectedNode = useCallback(() => {
    if (!selectedNode) {
      return;
    }

    const title = editDraft.title.trim();

    if (!title) {
      const message = 'Dê um nome para este bloco antes de adicioná-lo ao canvas.';
      setEditError(message);
      return;
    }

    updateNodeById(selectedNode.id, editDraft);
  }, [editDraft, selectedNode, updateNodeById]);

  const handleCreateAccordionOpenChange = useCallback((open: boolean) => {
    setIsCreateAccordionOpen(open);
    if (open) {
      setIsEditAccordionOpen(false);
      setSelectedNodeId(null);
      setToolbarNodeId(null);
      setEditingNodeId(null);
      setEditDraft({ ...EMPTY_DRAFT });
      setEditError(undefined);
    }
  }, []);

  const handleEditAccordionOpenChange = useCallback((open: boolean) => {
    setIsEditAccordionOpen(open);
    if (open) {
      setIsCreateAccordionOpen(false);
    }
  }, []);

  const handleStageDragStart = useCallback((event: DragEvent<HTMLElement>, stage: TdmStage) => {
    event.dataTransfer.setData('application/x-tdm-stage', stage);
    event.dataTransfer.effectAllowed = 'copy';
    setSelectedNodeId(null);
    setToolbarNodeId(null);
    setEditingNodeId(null);
    setEditDraft({ ...EMPTY_DRAFT });
    setEditError(undefined);
    setIsEditAccordionOpen(false);
  }, []);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const stage = event.dataTransfer.getData('application/x-tdm-stage') as TdmStage;

      if (!stage || !['input', 'activity', 'output', 'outcome'].includes(stage)) {
        return;
      }

      if (stageCreation === 'ready-to-connect' || stage !== stageCreation) {
        return;
      }

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      createNodeFromDraft({ stage, x: position.x, y: position.y, useQuickDraft: true });
    },
    [createNodeFromDraft, screenToFlowPosition, stageCreation]
  );

  const isValidConnection: IsValidConnection<TdmEdgeModel> = useCallback(
    (connection) => {
      if (!connection.source || !connection.target) {
        return false;
      }

      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode) {
        return false;
      }

      return isAllowedTdmConnection(sourceNode.stage, targetNode.stage);
    },
    [nodes]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        return;
      }

      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode) {
        return;
      }

      if (!isAllowedTdmConnection(sourceNode.stage, targetNode.stage)) {
        return;
      }

      const nextEdge = createEdge({
        source: connection.source,
        target: connection.target,
        sourceStage: sourceNode.stage,
        targetStage: targetNode.stage
      });

      setEdges((currentEdges) => addEdge(nextEdge, currentEdges));
      setSelectedNodeId(null);
      setToolbarNodeId(null);
      setGuideTransientMessage(null);
    },
    [nodes, setEdges]
  );

  const handleConnectStart: OnConnectStart = useCallback(
    (_event, params) => {
      if (!params.nodeId) {
        return;
      }

      const sourceNode = nodes.find((node) => node.id === params.nodeId);
      if (!sourceNode) {
        return;
      }

      setConnectingFromStage(sourceNode.stage);
      setGuideTransientMessage(null);
    },
    [nodes]
  );

  const handleConnectEnd: OnConnectEnd = useCallback(
    (_event, connectionState: FinalConnectionState) => {
      setConnectingFromStage(null);

      const fromNodeId = connectionState.fromNode?.id;
      if (!fromNodeId) {
        return;
      }

      const sourceNode = nodes.find((node) => node.id === fromNodeId);
      if (!sourceNode) {
        return;
      }

      const toNodeId = connectionState.toNode?.id;
      if (!toNodeId) {
        setGuideTransientMessage(null);
        return;
      }

      const targetNode = nodes.find((node) => node.id === toNodeId);
      if (!targetNode) {
        return;
      }

      if (!isAllowedTdmConnection(sourceNode.stage, targetNode.stage)) {
        setGuideTransientMessage(THEORY_GUIDE_INVALID_CONNECTION);
      }
    },
    [nodes]
  );

  const handleCloseToolbar = useCallback(() => {
    setToolbarNodeId(null);
  }, []);

  const closeToolbarSelection = useCallback(() => {
    if (editingNodeId) {
      return;
    }

    setToolbarNodeId(null);
    setSelectedNodeId(null);
  }, [editingNodeId]);

  const handlePaneClick = useCallback(() => {
    if (editingNodeId) {
      return;
    }

    closeToolbarSelection();
    setSelectedEdgeId(null);
    setMarkerDraft('');
    setMarkerEditorEdgeId(null);
    setGuideTransientMessage(null);
    setCreationError(undefined);
    setEditError(undefined);
  }, [closeToolbarSelection, editingNodeId]);

  const handleFlowBackgroundClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (editingNodeId) {
        return;
      }

      const target = event.target as HTMLElement;
      if (target.closest('.react-flow__node')) {
        return;
      }

      if (!target.closest('.react-flow')) {
        return;
      }

      closeToolbarSelection();
    },
    [closeToolbarSelection, editingNodeId]
  );

  const focusNodeSelection = useCallback(
    (nodeId: string) => {
      const node = nodes.find((currentNode) => currentNode.id === nodeId);
      if (!node) {
        return;
      }

      setSelectedNodeId(nodeId);
      setToolbarNodeId(nodeId);
      setSelectedEdgeId(null);
      setCreationError(undefined);
      setEditError(undefined);
      syncEditDraftFromNode(node);
      setIsEditAccordionOpen(true);
      setIsCreateAccordionOpen(false);
    },
    [nodes, syncEditDraftFromNode]
  );

  const handleNodeDoubleClick = useCallback(
    (_event: ReactMouseEvent, node: TdmNodeModel) => {
      openNodeEditor(node.id);
    },
    [openNodeEditor]
  );

  const handleEdgeClick = useCallback((_event: ReactMouseEvent, edge: TdmEdgeModel) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
    setToolbarNodeId(null);
    setEditingNodeId(null);
    setCreationError(undefined);
    setEditError(undefined);
    setEditDraft({ ...EMPTY_DRAFT });
    setIsEditAccordionOpen(false);
    setMarkerDraft(edge.markerText ?? '');
    setGuideTransientMessage(null);
  }, []);

  const minimapNodeColor = useCallback((node: TdmNodeModel) => CANVAS_DS_MINIMAP[node.stage].fill, []);

  const minimapNodeStrokeColor = useCallback((node: TdmNodeModel) => CANVAS_DS_MINIMAP[node.stage].stroke, []);

  const handleNodeClick = useCallback(
    (event: ReactMouseEvent, node: TdmNodeModel) => {
      event.stopPropagation();

      if (editingNodeId && editingNodeId !== node.id) {
        return;
      }

      focusNodeSelection(node.id);
    },
    [editingNodeId, focusNodeSelection]
  );

  const flowNodes = useMemo(
    () =>
      nodes.map((node) => {
        const { width: _width, height: _height, style, ...nodeWithoutDimensions } = node;
        const { width: _styleWidth, height: _styleHeight, ...styleWithoutDimensions } = style ?? {};

        return {
          ...nodeWithoutDimensions,
          selected: selectedNodeId === node.id,
          ...(Object.keys(styleWithoutDimensions).length > 0 ? { style: styleWithoutDimensions } : {}),
          data: {
            ...node.data,
            nodeId: node.id,
            isToolbarVisible: toolbarNodeId === node.id && editingNodeId !== node.id,
            isSelected: selectedNodeId === node.id,
            isValidConnectionTarget:
              connectingFromStage !== null && isAllowedTdmConnection(connectingFromStage, node.stage),
            onSelectNode: focusNodeSelection,
            onCloseToolbar: handleCloseToolbar,
            onStartInlineEdit: openNodeEditor,
            onUpdateNode: updateNodeById,
            onDuplicateNode: duplicateNodeById,
            onDeleteNode: deleteNodeById
          }
        };
      }),
    [
      connectingFromStage,
      deleteNodeById,
      duplicateNodeById,
      editingNodeId,
      focusNodeSelection,
      handleCloseToolbar,
      nodes,
      openNodeEditor,
      selectedNodeId,
      toolbarNodeId,
      updateNodeById
    ]
  );

  const flowEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        selected: selectedEdgeId === edge.id,
        data: {
          ...edge.data,
          sourceStage: edge.sourceStage,
          targetStage: edge.targetStage,
          connectionKind: edge.data?.connectionKind ?? getConnectionKind(edge.sourceStage, edge.targetStage),
          markerType: edge.markerType,
          markerText: edge.markerText,
          riskText: edge.data?.riskText,
          hypothesisText: edge.data?.hypothesisText,
          recentlyUpdated: recentlyUpdatedEdgeIds.has(edge.id),
          isEditorOpen: markerEditorEdgeId === edge.id,
          validationStatus: edge.validationStatus,
          validationMessage: edge.validationMessage,
          onOpenMarkerEditor: () => openMarkerEditor(edge.id),
          onCloseMarkerEditor: closeMarkerEditor,
          onSaveMarker: saveMarkerOnEdge,
          onDeleteMarker: deleteMarkerFromEdge
        }
      })),
    [
      closeMarkerEditor,
      deleteMarkerFromEdge,
      edges,
      markerEditorEdgeId,
      openMarkerEditor,
      recentlyUpdatedEdgeIds,
      saveMarkerOnEdge,
      selectedEdgeId
    ]
  );

  const blockForms: TdmBlockForms | null =
    stageCreation === 'ready-to-connect'
      ? null
      : {
          stage: stageCreation,
          create: {
            draft: creationDrafts[stageCreation],
            errorMessage: creationError,
            isOpen: isCreateAccordionOpen,
            onOpenChange: handleCreateAccordionOpenChange,
            onDraftChange: handleCreateDraftChange,
            onSubmit: handleCreateNode
          },
          edit: {
            draft: editDraft,
            errorMessage: editError,
            isOpen: isEditAccordionOpen,
            selectedStage: selectedNode?.stage ?? null,
            onOpenChange: handleEditAccordionOpenChange,
            onDraftChange: handleEditDraftChange,
            onSubmit: handleSaveSelectedNode,
            onDuplicate: duplicateSelectedNode,
            onDelete: deleteSelectedNode
          }
        };

  const sidebarContext: TdmSidebarContext = selectedEdge?.markerType
      ? {
          kind: 'marker',
          marker: {
            sourceLabel: nodes.find((node) => node.id === selectedEdge.source)?.title ?? 'Origem',
            targetLabel: nodes.find((node) => node.id === selectedEdge.target)?.title ?? 'Destino',
            markerText: markerDraft,
            markerType: selectedEdge.markerType
          },
          onDraftChange: setMarkerDraft,
          onSubmit: saveMarkerOnSelectedEdge,
          onDelete: deleteMarkerFromSelectedEdge
        }
      : selectedEdge
      ? {
          kind: 'edge',
          edge: {
            sourceLabel: nodes.find((node) => node.id === selectedEdge.source)?.title ?? 'Origem',
            targetLabel: nodes.find((node) => node.id === selectedEdge.target)?.title ?? 'Destino',
            message: selectedEdge.validationMessage ?? 'Conexão válida. Agora você pode explicar o vínculo entre esses blocos.',
            markerType: selectedEdge.markerType,
            markerText: selectedEdge.markerText,
            canAddRisk:
              (selectedEdge.sourceStage === 'input' && selectedEdge.targetStage === 'activity') ||
              (selectedEdge.sourceStage === 'activity' && selectedEdge.targetStage === 'output'),
            canAddHypothesis: selectedEdge.sourceStage === 'output' && selectedEdge.targetStage === 'outcome'
          },
          onAddRisk: () => addMarkerToSelectedEdge('risk'),
          onAddHypothesis: () => addMarkerToSelectedEdge('hypothesis'),
          onDelete: deleteSelectedEdge
        }
      : { kind: 'none' };

  if (viewMode === 'example-preview') {
    return (
      <ResultView
        title={exampleTheory.title}
        nodes={exampleTheory.nodes}
        edges={exampleTheory.edges}
        backLabel="Voltar para minha teoria"
        onBack={closeExamplePreview}
      />
    );
  }

  const sidebarToggleLabel = isSidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar';

  return (
    <section className={[styles.shell, ctaScope.scope, isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed].join(' ')}>
      <div className={styles.shellChromeTopLeft} data-dock-expanded={isGuideExpanded ? 'true' : 'false'}>
        <TdmButton
          href="/"
          variant="tertiary"
          size="sm"
          className={styles.backLink}
          leadingIcon={
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.backLinkIcon}>
              <path d="M9.5 3.5 4.5 8l5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4.75 8h6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        >
          Voltar
        </TdmButton>
      </div>
      <div className={styles.sidebarToggleAnchor}>
        <TdmIconButton
          aria-label={sidebarToggleLabel}
          tooltip={sidebarToggleLabel}
          tooltipPosition="left"
          tooltipSkin="canvas"
          variant="ghost"
          size="md"
          className={styles.sidebarToggleButton}
          onClick={() => setIsSidebarOpen((current) => !current)}
        >
          <SidebarToggleIcon direction={isSidebarOpen ? 'right' : 'left'} className={styles.sidebarToggleSvg} />
        </TdmIconButton>
      </div>
      <div className={styles.canvasArea}>
        <TdmToastViewport toast={activeFlowTooltip} onClose={closeFlowTooltip} />
        <div className={styles.flowFrame} onClick={handleFlowBackgroundClick}>

          {nodes.length === 0 ? (
            <div className={styles.emptyState} aria-hidden="true">
              <span className={styles.emptyStateMark} />
              <p className={styles.emptyStateHint}>Arraste um insumo para começar</p>
            </div>
          ) : null}
          <TdmNodeInteractionProvider
            value={{
              editingNodeId,
              onBeginEditNode: openNodeEditor,
              onCancelNodeEdit: cancelNodeEditor,
              onUpdateNode: updateNodeById,
              onDeleteNode: deleteNodeById,
              onDuplicateNode: duplicateNodeById
            }}
          >
            <ReactFlow<TdmNodeModel, TdmEdgeModel>
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              isValidConnection={isValidConnection}
              onConnect={handleConnect}
              onConnectStart={handleConnectStart}
              onConnectEnd={handleConnectEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onNodeDoubleClick={handleNodeDoubleClick}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              onPaneClick={handlePaneClick}
              nodesDraggable
              nodesConnectable={canConnectNodes}
              elementsSelectable
              multiSelectionKeyCode={null}
              panOnDrag
              zoomOnScroll
              zoomOnPinch
              zoomOnDoubleClick={false}
              snapToGrid
              snapGrid={CANVAS_SNAP_GRID}
              minZoom={CANVAS_MIN_ZOOM}
              maxZoom={CANVAS_MAX_ZOOM}
              fitView
              fitViewOptions={CANVAS_FIT_VIEW_OPTIONS}
              colorMode="dark"
              attributionPosition="bottom-left"
            >
              <TdmCanvasProcessDock
                content={guideContent}
                stageCounts={stageCounts}
                isTheoryComplete={canGenerateResult}
                isExpanded={isGuideExpanded}
                onExpandedChange={setIsGuideExpanded}
                onViewResult={openResultView}
              />
              <TdmCanvasCommandDock
                isGuideExpanded={isGuideExpanded}
                isClearDisabled={Boolean(editingNodeId)}
                onFitView={fitCanvasToVisibleArea}
                onCenterColumns={centerNodes}
                onOrganizeFlow={organizeFlow}
                onToggleGuide={toggleGuideExpanded}
                onClearSelection={clearCanvasSelection}
              />
              <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
              <Controls
                showInteractive={false}
                position="bottom-left"
                className={styles.controls}
                style={CANVAS_CONTROLS_STYLE}
              />
              <MiniMap
                position="bottom-right"
                pannable={false}
                zoomable={false}
                className={styles.minimap}
                style={CANVAS_MINIMAP_STYLE}
                nodeColor={minimapNodeColor}
                nodeStrokeColor={minimapNodeStrokeColor}
                nodeBorderRadius={6}
                nodeStrokeWidth={1}
                bgColor="rgba(16, 17, 20, 0.86)"
                maskColor="rgba(8, 9, 12, 0.74)"
              />
            </ReactFlow>
          </TdmNodeInteractionProvider>
        </div>
      </div>
      <TdmSidebar
        isOpen={isSidebarOpen}
        theoryName={theoryTitle}
        onTheoryNameChange={setTheoryTitle}
        stageCreation={stageCreation}
        stageCounts={stageCounts}
        actionLabel={stageCreation === 'ready-to-connect' ? undefined : getStageCreationActionLabel(stageCreation)}
        onOrganize={centerNodes}
        advanceLabel={stageCreation === 'ready-to-connect' ? undefined : getStageCreationAdvanceLabel()}
        onAdvance={advanceStage}
        canAdvance={canAdvance}
        canViewTdmResult={canGenerateResult}
        resultAvailabilityMessage={resultAvailabilityMessage}
        canRestoreTheory={canRestoreTheory}
        onRestoreTheory={restorePreviousTheory}
        onViewResult={openResultView}
        context={sidebarContext}
        blockForms={blockForms}
        onStageDragStart={handleStageDragStart}
      />
      <TdmResultPreview
        open={viewMode === 'result'}
        title={theoryTitle}
        nodes={nodes}
        edges={edges}
        onClose={closeResultView}
      />
    </section>
  );
}

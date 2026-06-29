'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type MouseEvent } from 'react';
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
  type IsValidConnection,
  type NodeTypes
} from '@xyflow/react';
import { TdmEdge as TdmEdgeView } from '../edge/tdm-edge';
import { ResultView } from '../result-view/result-view';
import { TdmNode as TdmNodeView, TdmNodeInteractionProvider } from '../node/tdm-node';
import { SidebarToggleIcon, TdmSidebar, type TdmBlockForms, type TdmSidebarContext } from '../sidebar/tdm-sidebar';
import {
  stageAdvancedFlowTooltipEvent,
  stageAdvancedToast,
  theoryCompleteToast
} from '../toast/tdm-toast-messages';
import { TdmToastViewport } from '../toast/tdm-toast';
import { useContextualFlowTooltip } from '../toast/use-contextual-flow-tooltip';
import { isAllowedTdmConnection } from '../../domain/tdm-connection-rules';
import { type TdmStage } from '../../domain/tdm-stages';
import { getTdmStageTheme } from '../../domain/tdm-theme';
import type { TdmEdge as TdmEdgeModel, TdmNode as TdmNodeModel, TdmNodeDraft } from '../../domain/tdm-types';
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
import { getCreateNodePosition, getDuplicateNodePosition } from '../../utils/node-placement';
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

export const nodeTypes = {
  tdm: TdmNodeView
} satisfies NodeTypes;

export const edgeTypes = {
  tdm: TdmEdgeView
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

export function TdmCanvasInner() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
  const [theoryTitle, setTheoryTitle] = useState('Nova teoria da mudança');
  const [nodes, setNodes, onNodesChange] = useNodesState<TdmNodeModel>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<TdmEdgeModel>([]);
  const [stageCreation, setStageCreation] = useState<StageCreation>('input');
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
  const [canvasVariant, setCanvasVariant] = useState<'custom' | 'example'>('custom');
  const [previousTheorySnapshot, setPreviousTheorySnapshot] = useState<TheorySnapshot | null>(null);
  const [viewportResetToken, setViewportResetToken] = useState(0);

  const { fitView, zoomIn, zoomOut, screenToFlowPosition } = useReactFlow<TdmNodeModel, TdmEdgeModel>();

  const stageCounts = useMemo(() => getStageCounts(nodes), [nodes]);
  const readyToConnect = useMemo(() => isReadyToConnect(nodes), [nodes]);
  const canConnectNodes = readyToConnect;
  const currentStageCount = stageCreation === 'ready-to-connect' ? 0 : stageCounts[stageCreation];
  const canAdvance = stageCreation !== 'ready-to-connect' && currentStageCount > 0;
  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) ?? null, [nodes, selectedNodeId]);
  const selectedEdge = useMemo(() => edges.find((edge) => edge.id === selectedEdgeId) ?? null, [edges, selectedEdgeId]);

  const canGenerateResult = canViewTdmResult(nodes, edges);
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (viewMode !== 'canvas') {
        return;
      }

      if (!(event.metaKey || event.ctrlKey)) {
        return;
      }

      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        zoomIn({ duration: 160 });
      }

      if (event.key === '-') {
        event.preventDefault();
        zoomOut({ duration: 160 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, zoomIn, zoomOut]);

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
  }, []);

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
    if (!canGenerateResult) {
      return;
    }

    setViewMode('result');
  }, [canGenerateResult]);

  const exportStub = useCallback((_format: 'pdf' | 'png' | 'jpeg' | 'svg') => {}, []);

  const centerNodes = useCallback(() => {
    setNodes((currentNodes) => layoutNodesByStage(currentNodes));
    setCanvasVariant('custom');
    window.requestAnimationFrame(() => {
      fitView({ padding: CANVAS_FIT_PADDING, duration: 250, maxZoom: CANVAS_MAX_AUTO_FIT_ZOOM });
    });
  }, [fitView, setNodes]);

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
            markerText: markerType === 'risk' ? 'Risco' : 'Hipótese',
            data: {
              ...edge.data,
              markerType,
              markerText: markerType === 'risk' ? 'Risco' : 'Hipótese',
              validationStatus: edge.data?.validationStatus ?? 'valid',
              validationMessage: edge.data?.validationMessage
            }
          } satisfies TdmEdgeModel;
        })
      );
      setMarkerDraft(markerType === 'risk' ? 'Risco' : 'Hipótese');
    },
    [selectedEdge, setEdges]
  );

  const saveMarkerOnSelectedEdge = useCallback(() => {
    if (!selectedEdge) {
      return;
    }

    const nextMarkerText = markerDraft.trim() || (selectedEdge.markerType === 'risk' ? 'Risco' : 'Hipótese');

    setEdges((currentEdges) =>
      currentEdges.map((edge) => {
        if (edge.id !== selectedEdge.id) {
          return edge;
        }

        return {
          ...edge,
          markerText: nextMarkerText,
          data: {
            ...edge.data,
            markerType: selectedEdge.markerType,
            markerText: nextMarkerText,
            validationStatus: edge.data?.validationStatus ?? 'valid',
            validationMessage: edge.data?.validationMessage
          }
        } satisfies TdmEdgeModel;
      })
    );
  }, [markerDraft, selectedEdge, setEdges]);

  const deleteMarkerFromSelectedEdge = useCallback(() => {
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
          markerType: undefined,
          markerText: undefined,
          data: {
            ...edge.data,
            markerType: undefined,
            markerText: undefined,
            validationStatus: edge.data?.validationStatus ?? 'valid',
            validationMessage: edge.data?.validationMessage
          }
        } satisfies TdmEdgeModel;
      })
    );
    setSelectedEdgeId(selectedEdge.id);
    setMarkerDraft('');
  }, [selectedEdge, setEdges]);

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
      setSelectedEdgeId(nextEdge.id);
    },
    [nodes, setEdges]
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
    setCreationError(undefined);
    setEditError(undefined);
  }, [closeToolbarSelection, editingNodeId]);

  const handleFlowBackgroundClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
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

  const handleNodeClick = useCallback(
    (event: MouseEvent, node: TdmNodeModel) => {
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
          ...(Object.keys(styleWithoutDimensions).length > 0 ? { style: styleWithoutDimensions } : {}),
          data: {
            ...node.data,
            nodeId: node.id,
            isToolbarVisible: toolbarNodeId === node.id && editingNodeId !== node.id,
            isSelected: selectedNodeId === node.id,
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
            markerText: markerDraft
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

  if (viewMode === 'result') {
    return (
      <ResultView
        title={theoryTitle}
        nodes={nodes}
        edges={edges}
        backLabel="Voltar ao canvas"
        showExportActions
        onExport={exportStub}
        onBack={() => setViewMode('canvas')}
      />
    );
  }

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

  return (
    <section className={[styles.shell, isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed].join(' ')}>
      <button
        type="button"
        className={styles.sidebarToggleButton}
        aria-label={isSidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
        title={isSidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
        onClick={() => setIsSidebarOpen((current) => !current)}
      >
        <SidebarToggleIcon direction={isSidebarOpen ? 'right' : 'left'} className={styles.sidebarToggleSvg} />
      </button>
      <div className={styles.canvasArea}>
        <TdmToastViewport toast={activeFlowTooltip} onClose={closeFlowTooltip} />
        <div className={styles.flowFrame} onClick={handleFlowBackgroundClick}>
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
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              isValidConnection={isValidConnection}
              onConnect={handleConnect}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onNodeDoubleClick={(_, node) => openNodeEditor(node.id)}
              onNodeClick={handleNodeClick}
              onEdgeClick={(_, edge) => {
                setSelectedEdgeId(edge.id);
                setSelectedNodeId(null);
                setToolbarNodeId(null);
                setEditingNodeId(null);
                setCreationError(undefined);
                setEditError(undefined);
                setEditDraft({ ...EMPTY_DRAFT });
                setIsEditAccordionOpen(false);
                setMarkerDraft(edge.markerText ?? (edge.markerType === 'risk' ? 'Risco' : 'Hipótese'));
              }}
              onPaneClick={handlePaneClick}
              nodesDraggable
              nodesConnectable={canConnectNodes}
              elementsSelectable
              panOnDrag
              zoomOnScroll
              zoomOnPinch
              zoomOnDoubleClick={false}
              snapToGrid
              snapGrid={[20, 20]}
              minZoom={CANVAS_MIN_ZOOM}
              maxZoom={CANVAS_MAX_ZOOM}
              fitView
              fitViewOptions={{ padding: CANVAS_FIT_PADDING, maxZoom: CANVAS_MAX_AUTO_FIT_ZOOM }}
              colorMode="dark"
              attributionPosition="bottom-left"
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(167, 139, 250, 0.12)" />
              <Controls
                showInteractive={false}
                position="bottom-left"
                className={styles.controls}
                style={{ left: 16, bottom: 16, top: 'auto', right: 'auto', width: 'auto' }}
              />
              <MiniMap
                position="bottom-right"
                pannable={false}
                zoomable={false}
                className={styles.minimap}
                style={{ width: 152, height: 96, pointerEvents: 'none' }}
                nodeColor={(node) => getTdmStageTheme((node as TdmNodeModel).stage).surface}
                nodeStrokeColor={(node) => getTdmStageTheme((node as TdmNodeModel).stage).accent}
                nodeBorderRadius={6}
                nodeStrokeWidth={1}
                bgColor="rgba(7, 9, 15, 0.8)"
                maskColor="rgba(7, 9, 15, 0.72)"
              />
            </ReactFlow>
          </TdmNodeInteractionProvider>
        </div>
      </div>
      <TdmSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((current) => !current)}
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
        onViewExampleCanvas={viewExampleCanvas}
        onViewExampleResult={viewExampleResult}
        canRestoreTheory={canRestoreTheory}
        onRestoreTheory={restorePreviousTheory}
        onViewResult={openResultView}
        context={sidebarContext}
        blockForms={blockForms}
        onStageDragStart={handleStageDragStart}
      />
    </section>
  );
}

import { useCanvasEditFormController } from '../tdm-canvas-controllers/use-canvas-edit-form-controller';
import { useCanvasNavigationController } from '../tdm-canvas-controllers/use-canvas-navigation-controller';
import { useCanvasSelectionController } from '../tdm-canvas-controllers/use-canvas-selection-controller';
import { useCanvasStageGuideController } from '../tdm-canvas-controllers/use-canvas-stage-guide-controller';
import { useCanvasViewportController } from '../tdm-canvas-controllers/use-canvas-viewport-controller';
import { useCanvasWorkspaceState } from '../tdm-canvas-controllers/use-canvas-workspace-state';
import {
  EMPTY_DRAFT,
  createEmptyDraftMap
} from '../tdm-canvas-config/tdm-canvas-runtime';
import type { TdmCanvasInnerProps } from '../tdm-canvas-workspace-composition';

export function useCanvasWorkspaceFoundation({ initialVariant = 'custom' }: TdmCanvasInnerProps) {
  const state = useCanvasWorkspaceState({ initialVariant });
  const {
    viewMode,
    nodes,
    edges,
    fitView,
    screenToFlowPosition,
    editingNodeId,
    canvasVariant,
    theoryTitle,
    stageCreation,
    creationDrafts,
    selectedNodeId,
    selectedEdgeId,
    selectedEdge,
    showFlowTooltip,
    clearFlowTooltipEvent,
    setNodes,
    setEdges,
    setTheoryTitle,
    setStageCreation,
    setCreationDrafts,
    setSelectedNodeId,
    setToolbarNodeId,
    setSelectedEdgeId,
    setEditingNodeId,
    setCreationError,
    setEditDraft,
    setEditError,
    setIsCreateAccordionOpen,
    setIsEditAccordionOpen,
    setMarkerDraft,
    setMarkerEditorEdgeId,
    setCanvasVariant,
    setViewMode
  } = state;

  const editForm = useCanvasEditFormController({
    emptyDraft: EMPTY_DRAFT,
    setEditDraft,
    setEditError,
    setIsEditAccordionOpen
  });

  const guide = useCanvasStageGuideController({
    nodes,
    edges,
    stageCreation,
    selectedEdge,
    emptyDraft: EMPTY_DRAFT,
    showFlowTooltip,
    clearFlowTooltipEvent,
    setStageCreation,
    setSelectedNodeId,
    setToolbarNodeId,
    setSelectedEdgeId,
    setEditingNodeId,
    setEditDraft,
    setEditError,
    setCreationError,
    setMarkerDraft,
    setIsCreateAccordionOpen,
    setIsEditAccordionOpen
  });

  const viewport = useCanvasViewportController({
    viewMode,
    nodesLength: nodes.length,
    edges,
    fitView,
    screenToFlowPosition,
    setNodes,
    setCanvasVariant
  });

  const selection = useCanvasSelectionController({
    editingNodeId,
    emptyDraft: EMPTY_DRAFT,
    setNodes,
    setSelectedNodeId,
    setToolbarNodeId,
    setSelectedEdgeId,
    setCreationError,
    setEditError,
    setMarkerDraft,
    setEditDraft,
    setIsEditAccordionOpen,
    setMarkerEditorEdgeId,
    setGuideTransientMessage: guide.setGuideTransientMessage
  });

  const navigation = useCanvasNavigationController({
    canvasVariant,
    nodes,
    edges,
    theoryTitle,
    stageCreation,
    creationDrafts,
    selectedNodeId,
    selectedEdgeId,
    emptyDraft: EMPTY_DRAFT,
    createEmptyDraftMap,
    setNodes,
    setEdges,
    setTheoryTitle,
    setStageCreation,
    setCreationDrafts,
    setSelectedNodeId,
    setToolbarNodeId,
    setSelectedEdgeId,
    setEditDraft,
    setCreationError,
    setEditError,
    setEditingNodeId,
    setCanvasVariant,
    setViewMode,
    resetCanvasSelection: selection.resetCanvasSelection,
    bumpViewportReset: viewport.bumpViewportReset
  });

  return { state, editForm, guide, viewport, selection, navigation };
}

export type CanvasWorkspaceFoundation = ReturnType<typeof useCanvasWorkspaceFoundation>;

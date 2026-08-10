import { useCanvasConnectionController } from '../tdm-canvas-controllers/use-canvas-connection-controller';
import { useCanvasDragController } from '../tdm-canvas-controllers/use-canvas-drag-controller';
import { useCanvasEdgeFeedbackController } from '../tdm-canvas-controllers/use-canvas-edge-feedback-controller';
import { useCanvasInteractionController } from '../tdm-canvas-controllers/use-canvas-interaction-controller';
import { useCanvasMarkerController } from '../tdm-canvas-controllers/use-canvas-marker-controller';
import { useCanvasNodeCrudController } from '../tdm-canvas-controllers/use-canvas-node-crud-controller';
import {
  EMPTY_DRAFT,
  QUICK_STAGE_DRAFTS
} from '../tdm-canvas-config/tdm-canvas-runtime';
import type { CanvasWorkspaceFoundation } from './use-canvas-workspace-foundation';

export function useCanvasWorkspaceActions(foundation: CanvasWorkspaceFoundation) {
  const { state, editForm, guide, viewport } = foundation;
  const {
    nodes,
    edges,
    selectedNode,
    selectedNodeId,
    selectedEdge,
    stageCreation,
    creationDrafts,
    editDraft,
    markerDraft,
    editingNodeId,
    screenToFlowPosition,
    setNodes,
    setEdges,
    setSelectedNodeId,
    setToolbarNodeId,
    setSelectedEdgeId,
    setEditingNodeId,
    setCreationDrafts,
    setCreationError,
    setEditDraft,
    setEditError,
    setIsCreateAccordionOpen,
    setIsEditAccordionOpen,
    setMarkerDraft,
    setMarkerEditorEdgeId
  } = state;

  const edgeFeedback = useCanvasEdgeFeedbackController();

  const nodeCrud = useCanvasNodeCrudController({
    nodes,
    selectedNode,
    selectedNodeId,
    stageCreation,
    creationDrafts,
    editDraft,
    emptyDraft: EMPTY_DRAFT,
    quickStageDrafts: QUICK_STAGE_DRAFTS,
    setNodes,
    setEdges,
    setSelectedNodeId,
    setToolbarNodeId,
    setSelectedEdgeId,
    setEditingNodeId,
    setCreationDrafts,
    setCreationError,
    setEditDraft,
    setEditError,
    setIsCreateAccordionOpen,
    setIsEditAccordionOpen,
    setMarkerDraft,
    bumpViewportReset: viewport.bumpViewportReset,
    clearEditFormState: editForm.clearEditFormState
  });

  const marker = useCanvasMarkerController({
    edges,
    selectedEdge,
    markerDraft,
    setEdges,
    setSelectedEdgeId,
    setSelectedNodeId,
    setToolbarNodeId,
    setEditingNodeId,
    setMarkerDraft,
    setMarkerEditorEdgeId,
    setGuideTransientMessage: guide.setGuideTransientMessage,
    markEdgeRecentlyUpdated: edgeFeedback.markEdgeRecentlyUpdated
  });

  const drag = useCanvasDragController({
    stageCreation,
    emptyDraft: EMPTY_DRAFT,
    screenToFlowPosition,
    createNodeFromDraft: nodeCrud.createNodeFromDraft,
    setSelectedNodeId,
    setToolbarNodeId,
    setEditingNodeId,
    setEditDraft,
    setEditError,
    setIsEditAccordionOpen
  });

  const connection = useCanvasConnectionController({
    canConnectNodes: guide.canConnectNodes,
    nodes,
    setEdges,
    setSelectedNodeId,
    setToolbarNodeId,
    setConnectingFromStage: guide.setConnectingFromStage,
    setGuideTransientMessage: guide.setGuideTransientMessage
  });

  const interaction = useCanvasInteractionController({
    nodes,
    editingNodeId,
    emptyDraft: EMPTY_DRAFT,
    syncEditDraftFromNode: nodeCrud.syncEditDraftFromNode,
    openNodeEditor: nodeCrud.openNodeEditor,
    setSelectedNodeId,
    setToolbarNodeId,
    setSelectedEdgeId,
    setEditingNodeId,
    setCreationError,
    setEditError,
    setEditDraft,
    setIsCreateAccordionOpen,
    setIsEditAccordionOpen,
    setMarkerDraft,
    setMarkerEditorEdgeId,
    setGuideTransientMessage: guide.setGuideTransientMessage
  });

  return { edgeFeedback, nodeCrud, marker, drag, connection, interaction };
}

export type CanvasWorkspaceActions = ReturnType<typeof useCanvasWorkspaceActions>;

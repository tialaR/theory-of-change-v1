import { useCanvasPresentationModel } from '../tdm-canvas-controllers/use-canvas-presentation-model';
import type { CanvasWorkspaceActions } from './use-canvas-workspace-actions';
import type { CanvasWorkspaceFoundation } from './use-canvas-workspace-foundation';

export function useCanvasWorkspacePresentation(
  foundation: CanvasWorkspaceFoundation,
  actions: CanvasWorkspaceActions
) {
  const { state, guide } = foundation;
  const { edgeFeedback, nodeCrud, marker, interaction } = actions;

  return useCanvasPresentationModel({
    nodes: state.nodes,
    edges: state.edges,
    nodeActions: {
      selectedNodeId: state.selectedNodeId,
      toolbarNodeId: state.toolbarNodeId,
      editingNodeId: state.editingNodeId,
      connectingFromStage: guide.connectingFromStage,
      onSelectNode: interaction.focusNodeSelection,
      onCloseToolbar: interaction.handleCloseToolbar,
      onStartInlineEdit: nodeCrud.openNodeEditor,
      onUpdateNode: nodeCrud.updateNodeById,
      onDuplicateNode: nodeCrud.duplicateNodeById,
      onDeleteNode: nodeCrud.deleteNodeById
    },
    edgeActions: {
      selectedEdgeId: state.selectedEdgeId,
      markerEditorEdgeId: state.markerEditorEdgeId,
      recentlyUpdatedEdgeIds: edgeFeedback.recentlyUpdatedEdgeIds,
      onOpenMarkerEditor: marker.openMarkerEditor,
      onCloseMarkerEditor: marker.closeMarkerEditor,
      onSaveMarker: marker.saveMarkerOnEdge,
      onDeleteMarker: marker.deleteMarkerFromEdge
    },
    blockFormsInput: {
      stageCreation: state.stageCreation,
      creationDrafts: state.creationDrafts,
      creationError: state.creationError,
      isCreateAccordionOpen: state.isCreateAccordionOpen,
      editDraft: state.editDraft,
      editError: state.editError,
      isEditAccordionOpen: state.isEditAccordionOpen,
      selectedNode: state.selectedNode,
      onCreateOpenChange: nodeCrud.handleCreateAccordionOpenChange,
      onCreateDraftChange: nodeCrud.handleCreateDraftChange,
      onCreate: nodeCrud.handleCreateNode,
      onEditOpenChange: nodeCrud.handleEditAccordionOpenChange,
      onEditDraftChange: nodeCrud.handleEditDraftChange,
      onSaveEdit: nodeCrud.handleSaveSelectedNode,
      onDuplicate: nodeCrud.duplicateSelectedNode,
      onDelete: nodeCrud.deleteSelectedNode
    },
    sidebarContextInput: {
      selectedEdge: state.selectedEdge,
      nodes: state.nodes,
      markerDraft: state.markerDraft,
      onDraftChange: state.setMarkerDraft,
      onSaveMarker: marker.saveMarkerOnSelectedEdge,
      onDeleteMarker: marker.deleteMarkerFromSelectedEdge,
      onAddMarker: marker.addMarkerToSelectedEdge,
      onDeleteEdge: marker.deleteSelectedEdge
    }
  });
}

export type CanvasWorkspacePresentation = ReturnType<typeof useCanvasWorkspacePresentation>;

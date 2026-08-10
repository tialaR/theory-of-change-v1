import { ResultView } from '../result-view/result-view';
import { exampleTheory } from '../../data/example-theory';
import {
  getStageCreationActionLabel,
  getStageCreationAdvanceLabel
} from '../../utils/stage-creation';
import { TdmCanvasWorkspaceView } from './tdm-canvas-workspace-view';
import { useCanvasDragController } from './tdm-canvas-controllers/use-canvas-drag-controller';
import { useCanvasEdgeFeedbackController } from './tdm-canvas-controllers/use-canvas-edge-feedback-controller';
import { useCanvasEditFormController } from './tdm-canvas-controllers/use-canvas-edit-form-controller';
import { useCanvasConnectionController } from './tdm-canvas-controllers/use-canvas-connection-controller';
import { useCanvasMarkerController } from './tdm-canvas-controllers/use-canvas-marker-controller';
import { useCanvasNodeCrudController } from './tdm-canvas-controllers/use-canvas-node-crud-controller';
import { useCanvasNavigationController } from './tdm-canvas-controllers/use-canvas-navigation-controller';
import { useCanvasSelectionController } from './tdm-canvas-controllers/use-canvas-selection-controller';
import { useCanvasViewportController } from './tdm-canvas-controllers/use-canvas-viewport-controller';
import { useCanvasStageGuideController } from './tdm-canvas-controllers/use-canvas-stage-guide-controller';
import { useCanvasInteractionController } from './tdm-canvas-controllers/use-canvas-interaction-controller';
import { useCanvasPresentationModel } from './tdm-canvas-controllers/use-canvas-presentation-model';
import { useCanvasWorkspaceState } from './tdm-canvas-controllers/use-canvas-workspace-state';
import {
  CANVAS_FIT_VIEW_OPTIONS,
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
  CANVAS_SNAP_GRID,
  EMPTY_DRAFT,
  QUICK_STAGE_DRAFTS,
  createEmptyDraftMap,
  defaultEdgeOptions,
  edgeTypes,
  nodeTypes
} from './tdm-canvas-config/tdm-canvas-runtime';

export type TdmCanvasInnerProps = {
  initialVariant?: 'custom' | 'example';
};

export function useCanvasWorkspaceComposition({ initialVariant = 'custom' }: TdmCanvasInnerProps) {
  const {
    isSidebarOpen, setIsSidebarOpen, viewMode, setViewMode, theoryTitle, setTheoryTitle,
    nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange, stageCreation, setStageCreation,
    activeFlowTooltip, showFlowTooltip, closeFlowTooltip, clearFlowTooltipEvent,
    selectedNodeId, setSelectedNodeId, toolbarNodeId, setToolbarNodeId, selectedEdgeId, setSelectedEdgeId,
    editingNodeId, setEditingNodeId, creationDrafts, setCreationDrafts, creationError, setCreationError,
    editDraft, setEditDraft, editError, setEditError, isCreateAccordionOpen, setIsCreateAccordionOpen,
    isEditAccordionOpen, setIsEditAccordionOpen, markerDraft, setMarkerDraft, canvasVariant, setCanvasVariant,
    markerEditorEdgeId, setMarkerEditorEdgeId, selectedNode, selectedEdge, fitView, screenToFlowPosition
  } = useCanvasWorkspaceState({ initialVariant });

  const { recentlyUpdatedEdgeIds, markEdgeRecentlyUpdated } = useCanvasEdgeFeedbackController();
  const { clearEditFormState } = useCanvasEditFormController({
    emptyDraft: EMPTY_DRAFT,
    setEditDraft,
    setEditError,
    setIsEditAccordionOpen
  });

  const {
    stageCounts,
    canConnectNodes,
    canAdvance,
    canGenerateResult,
    resultAvailabilityMessage,
    guideContent,
    guideTransientMessage,
    connectingFromStage,
    isGuideExpanded,
    setGuideTransientMessage,
    setConnectingFromStage,
    setIsGuideExpanded,
    toggleGuideExpanded,
    advanceStage
  } = useCanvasStageGuideController({
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

  const { fitCanvasToVisibleArea, bumpViewportReset, centerNodes, organizeFlow } = useCanvasViewportController({
    viewMode,
    nodesLength: nodes.length,
    edges,
    fitView,
    screenToFlowPosition,
    setNodes,
    setCanvasVariant
  });

  const { resetCanvasSelection, clearCanvasSelection } = useCanvasSelectionController({
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
    setGuideTransientMessage
  });

  const {
    canRestoreTheory,
    replaceCanvasWithExample,
    restorePreviousTheory,
    closeExamplePreview,
    openResultView,
    closeResultView
  } = useCanvasNavigationController({
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
    resetCanvasSelection,
    bumpViewportReset
  });


  const {
    syncEditDraftFromNode,
    openNodeEditor,
    cancelNodeEditor,
    updateNodeById,
    deleteNodeById,
    duplicateNodeById,
    duplicateSelectedNode,
    deleteSelectedNode,
    handleCreateDraftChange,
    createNodeFromDraft,
    handleCreateNode,
    handleEditDraftChange,
    handleSaveSelectedNode,
    handleCreateAccordionOpenChange,
    handleEditAccordionOpenChange
  } = useCanvasNodeCrudController({
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
    bumpViewportReset,
    clearEditFormState
  });

  const {
    deleteSelectedEdge,
    deleteMarkerFromEdge,
    saveMarkerOnEdge,
    openMarkerEditor,
    closeMarkerEditor,
    deleteMarkerFromSelectedEdge,
    addMarkerToSelectedEdge,
    saveMarkerOnSelectedEdge
  } = useCanvasMarkerController({
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
    setGuideTransientMessage,
    markEdgeRecentlyUpdated
  });

  const { handleStageDragStart, handleDragOver, handleDrop } = useCanvasDragController({
    stageCreation,
    emptyDraft: EMPTY_DRAFT,
    screenToFlowPosition,
    createNodeFromDraft,
    setSelectedNodeId,
    setToolbarNodeId,
    setEditingNodeId,
    setEditDraft,
    setEditError,
    setIsEditAccordionOpen
  });

  const {
    isValidConnection,
    handleConnect,
    handleConnectStart,
    handleConnectEnd
  } = useCanvasConnectionController({
    canConnectNodes,
    nodes,
    setEdges,
    setSelectedNodeId,
    setToolbarNodeId,
    setConnectingFromStage,
    setGuideTransientMessage
  });

  const {
    handleCloseToolbar,
    handlePaneClick,
    handleFlowBackgroundClick,
    focusNodeSelection,
    handleNodeDoubleClick,
    handleNodeClick,
    handleEdgeClick
  } = useCanvasInteractionController({
    nodes,
    editingNodeId,
    emptyDraft: EMPTY_DRAFT,
    syncEditDraftFromNode,
    openNodeEditor,
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
    setGuideTransientMessage
  });

  const { flowNodes, flowEdges, blockForms, sidebarContext, minimapNodeColor, minimapNodeStrokeColor } =
    useCanvasPresentationModel({
      nodes,
      edges,
      nodeActions: {
        selectedNodeId, toolbarNodeId, editingNodeId, connectingFromStage,
        onSelectNode: focusNodeSelection, onCloseToolbar: handleCloseToolbar,
        onStartInlineEdit: openNodeEditor, onUpdateNode: updateNodeById,
        onDuplicateNode: duplicateNodeById, onDeleteNode: deleteNodeById
      },
      edgeActions: {
        selectedEdgeId, markerEditorEdgeId, recentlyUpdatedEdgeIds,
        onOpenMarkerEditor: openMarkerEditor, onCloseMarkerEditor: closeMarkerEditor,
        onSaveMarker: saveMarkerOnEdge, onDeleteMarker: deleteMarkerFromEdge
      },
      blockFormsInput: {
        stageCreation, creationDrafts, creationError, isCreateAccordionOpen,
        editDraft, editError, isEditAccordionOpen, selectedNode,
        onCreateOpenChange: handleCreateAccordionOpenChange,
        onCreateDraftChange: handleCreateDraftChange, onCreate: handleCreateNode,
        onEditOpenChange: handleEditAccordionOpenChange,
        onEditDraftChange: handleEditDraftChange, onSaveEdit: handleSaveSelectedNode,
        onDuplicate: duplicateSelectedNode, onDelete: deleteSelectedNode
      },
      sidebarContextInput: {
        selectedEdge, nodes, markerDraft, onDraftChange: setMarkerDraft,
        onSaveMarker: saveMarkerOnSelectedEdge, onDeleteMarker: deleteMarkerFromSelectedEdge,
        onAddMarker: addMarkerToSelectedEdge, onDeleteEdge: deleteSelectedEdge
      }
    });

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
    <TdmCanvasWorkspaceView
      isSidebarOpen={isSidebarOpen}
      isGuideExpanded={isGuideExpanded}
      sidebarToggleLabel={sidebarToggleLabel}
      onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
      activeFlowTooltip={activeFlowTooltip}
      onCloseFlowTooltip={closeFlowTooltip}
      onFlowBackgroundClick={handleFlowBackgroundClick}
      isEmpty={nodes.length === 0}
      nodeInteractionValue={{
        editingNodeId,
        onBeginEditNode: openNodeEditor,
        onCancelNodeEdit: cancelNodeEditor,
        onUpdateNode: updateNodeById,
        onDeleteNode: deleteNodeById,
        onDuplicateNode: duplicateNodeById
      }}
      reactFlowProps={{
        nodes: flowNodes,
        edges: flowEdges,
        nodeTypes,
        edgeTypes,
        defaultEdgeOptions,
        onNodesChange,
        onEdgesChange,
        isValidConnection,
        onConnect: handleConnect,
        onConnectStart: handleConnectStart,
        onConnectEnd: handleConnectEnd,
        onDragOver: handleDragOver,
        onDrop: handleDrop,
        onNodeDoubleClick: handleNodeDoubleClick,
        onNodeClick: handleNodeClick,
        onEdgeClick: handleEdgeClick,
        onPaneClick: handlePaneClick,
        nodesDraggable: true,
        nodesConnectable: canConnectNodes,
        elementsSelectable: true,
        multiSelectionKeyCode: null,
        panOnDrag: true,
        zoomOnScroll: true,
        zoomOnPinch: true,
        zoomOnDoubleClick: false,
        snapToGrid: true,
        snapGrid: CANVAS_SNAP_GRID,
        minZoom: CANVAS_MIN_ZOOM,
        maxZoom: CANVAS_MAX_ZOOM,
        fitView: true,
        fitViewOptions: CANVAS_FIT_VIEW_OPTIONS,
        colorMode: 'dark',
        attributionPosition: 'bottom-left'
      }}
      processDockProps={{
        content: guideContent,
        stageCounts,
        isTheoryComplete: canGenerateResult,
        isExpanded: isGuideExpanded,
        onExpandedChange: setIsGuideExpanded,
        onViewResult: openResultView
      }}
      commandDockProps={{
        isGuideExpanded,
        isClearDisabled: Boolean(editingNodeId),
        onFitView: fitCanvasToVisibleArea,
        onCenterColumns: centerNodes,
        onOrganizeFlow: organizeFlow,
        onToggleGuide: toggleGuideExpanded,
        onClearSelection: clearCanvasSelection
      }}
      minimapNodeColor={minimapNodeColor}
      minimapNodeStrokeColor={minimapNodeStrokeColor}
      sidebarProps={{
        isOpen: isSidebarOpen,
        theoryName: theoryTitle,
        onTheoryNameChange: setTheoryTitle,
        stageCreation,
        stageCounts,
        actionLabel: stageCreation === 'ready-to-connect' ? undefined : getStageCreationActionLabel(stageCreation),
        onOrganize: centerNodes,
        advanceLabel: stageCreation === 'ready-to-connect' ? undefined : getStageCreationAdvanceLabel(),
        onAdvance: advanceStage,
        canAdvance,
        canViewTdmResult: canGenerateResult,
        resultAvailabilityMessage,
        canRestoreTheory,
        onRestoreTheory: restorePreviousTheory,
        onViewResult: openResultView,
        context: sidebarContext,
        blockForms,
        onStageDragStart: handleStageDragStart
      }}
      resultPreviewProps={{
        open: viewMode === 'result',
        title: theoryTitle,
        nodes,
        edges,
        onClose: closeResultView
      }}
    />
  );
}

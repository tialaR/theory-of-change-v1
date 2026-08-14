import { ResultView } from '../../result-view/result-view';
import { exampleTheory } from '../../../data/example-theory';
import {
  getStageCreationActionLabel,
  getStageCreationAdvanceLabel
} from '../../../utils/stage-creation';
import { TdmCanvasWorkspaceView } from '../tdm-canvas-workspace-view';
import {
  CANVAS_FIT_VIEW_OPTIONS,
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
  CANVAS_SNAP_GRID,
  defaultEdgeOptions,
  edgeTypes,
  nodeTypes
} from '../tdm-canvas-config/tdm-canvas-runtime';
import type { CanvasWorkspaceActions } from './use-canvas-workspace-actions';
import type { CanvasWorkspaceFoundation } from './use-canvas-workspace-foundation';
import type { CanvasWorkspacePresentation } from './use-canvas-workspace-presentation';

type TdmCanvasWorkspaceRendererProps = {
  foundation: CanvasWorkspaceFoundation;
  actions: CanvasWorkspaceActions;
  presentation: CanvasWorkspacePresentation;
};

export function TdmCanvasWorkspaceRenderer({
  foundation,
  actions,
  presentation
}: TdmCanvasWorkspaceRendererProps) {
  const { state, guide, viewport, selection, navigation } = foundation;
  const { nodeCrud, drag, connection, interaction } = actions;

  if (state.viewMode === 'example-preview') {
    return (
      <ResultView
        title={exampleTheory.title}
        nodes={exampleTheory.nodes}
        edges={exampleTheory.edges}
        backLabel="Voltar para minha teoria"
        onBack={navigation.closeExamplePreview}
      />
    );
  }

  const sidebarToggleLabel = state.isSidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar';

  return (
    <TdmCanvasWorkspaceView
      isSidebarOpen={state.isSidebarOpen}
      isGuideExpanded={guide.isGuideExpanded}
      sidebarToggleLabel={sidebarToggleLabel}
      onToggleSidebar={() => state.setIsSidebarOpen((current) => !current)}
      activeFlowTooltip={state.activeFlowTooltip}
      onCloseFlowTooltip={state.closeFlowTooltip}
      onFlowBackgroundClick={interaction.handleFlowBackgroundClick}
      isEmpty={state.nodes.length === 0}
      nodeInteractionValue={{
        editingNodeId: state.editingNodeId,
        onBeginEditNode: nodeCrud.openNodeEditor,
        onCancelNodeEdit: nodeCrud.cancelNodeEditor,
        onUpdateNode: nodeCrud.updateNodeById,
        onDeleteNode: nodeCrud.deleteNodeById,
        onDuplicateNode: nodeCrud.duplicateNodeById
      }}
      reactFlowProps={{
        nodes: presentation.flowNodes,
        edges: presentation.flowEdges,
        nodeTypes,
        edgeTypes,
        defaultEdgeOptions,
        onNodesChange: state.onNodesChange,
        onEdgesChange: state.onEdgesChange,
        isValidConnection: connection.isValidConnection,
        onConnect: connection.handleConnect,
        onConnectStart: connection.handleConnectStart,
        onConnectEnd: connection.handleConnectEnd,
        onDragOver: drag.handleDragOver,
        onDrop: drag.handleDrop,
        onNodeDoubleClick: interaction.handleNodeDoubleClick,
        onNodeClick: interaction.handleNodeClick,
        onEdgeClick: interaction.handleEdgeClick,
        onPaneClick: interaction.handlePaneClick,
        nodesDraggable: true,
        nodesConnectable: guide.canConnectNodes,
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
        content: guide.guideContent,
        stageCounts: guide.stageCounts,
        isTheoryComplete: guide.canGenerateResult,
        isExpanded: guide.isGuideExpanded,
        onExpandedChange: guide.setIsGuideExpanded,
        onViewResult: navigation.openResultView
      }}
      commandDockProps={{
        isGuideExpanded: guide.isGuideExpanded,
        isClearDisabled: Boolean(state.editingNodeId),
        onFitView: viewport.fitCanvasToVisibleArea,
        onCenterColumns: viewport.centerNodes,
        onOrganizeFlow: viewport.organizeFlow,
        onToggleGuide: guide.toggleGuideExpanded,
        onClearSelection: selection.clearCanvasSelection
      }}
      minimapNodeColor={presentation.minimapNodeColor}
      minimapNodeStrokeColor={presentation.minimapNodeStrokeColor}
      sidebarProps={{
        isOpen: state.isSidebarOpen,
        theoryName: state.theoryTitle,
        onTheoryNameChange: state.setTheoryTitle,
        stageCreation: state.stageCreation,
        stageCounts: guide.stageCounts,
        actionLabel:
          state.stageCreation === 'ready-to-connect'
            ? undefined
            : getStageCreationActionLabel(state.stageCreation),
        onOrganize: viewport.centerNodes,
        advanceLabel:
          state.stageCreation === 'ready-to-connect'
            ? undefined
            : getStageCreationAdvanceLabel(),
        onAdvance: guide.advanceStage,
        canAdvance: guide.canAdvance,
        canViewTdmResult: guide.canGenerateResult,
        resultAvailabilityMessage: guide.resultAvailabilityMessage,
        canRestoreTheory: navigation.canRestoreTheory,
        onRestoreTheory: navigation.restorePreviousTheory,
        onViewResult: navigation.openResultView,
        context: presentation.sidebarContext,
        blockForms: presentation.blockForms,
        onStageDragStart: drag.handleStageDragStart
      }}
      resultPreviewProps={{
        open: state.viewMode === 'result',
        title: state.theoryTitle,
        nodes: state.nodes,
        edges: state.edges,
        onClose: navigation.closeResultView
      }}
    />
  );
}

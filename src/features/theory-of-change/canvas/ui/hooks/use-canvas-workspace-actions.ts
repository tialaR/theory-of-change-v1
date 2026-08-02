'use client';

import type { CanvasStageNode } from '../../react-flow/canvas-flow.types';
import type { CanvasStageCopy, CanvasTranslator } from '../canvas-copy';
import type { CanvasWorkspaceFoundation } from './use-canvas-workspace-foundation';
import { useCanvasHistoryActions } from './use-canvas-history-actions';
import { useCanvasNodeActions } from './use-canvas-node-actions';
import { useCanvasRelationActions } from './use-canvas-relation-actions';
import { useCanvasStageDragAndDrop } from './use-canvas-stage-drag-and-drop';
import { useCanvasWorkspaceFlowActions } from './use-canvas-workspace-flow-actions';
import { useCanvasWorkspaceNavigation } from './use-canvas-workspace-navigation';

type CanvasWorkspaceActionsOptions = CanvasWorkspaceFoundation & {
  t: CanvasTranslator;
  stageCopy: (stage: CanvasStageNode['data']['stage']) => CanvasStageCopy;
};

export function useCanvasWorkspaceActions({
  flow,
  ui,
  reactFlow,
  selection,
  viewportActions,
  saveController,
  t,
  stageCopy
}: CanvasWorkspaceActionsOptions) {
  const stageDragAndDrop = useCanvasStageDragAndDrop({
    reactFlow,
    createNode: flow.createNode,
    selectNode: ui.selectNode,
    setCreatorOpen: ui.setCreatorOpen,
    notify: ui.notify,
    markDirty: ui.markDirty,
    t,
    stageCopy
  });

  const nodeActions = useCanvasNodeActions({
    nodes: flow.nodes,
    selectedNodeId: ui.selectedNodeId,
    nodeDraft: ui.nodeDraft,
    updateNode: flow.updateNode,
    duplicateFlowNode: flow.duplicateNode,
    deleteFlowNode: flow.deleteNode,
    saveNodeDraft: flow.saveNodeDraft,
    selectNode: ui.selectNode,
    clearSelection: ui.clearSelection,
    setActiveToolbarNodeId: ui.setActiveToolbarNodeId,
    closeNodeEditor: ui.closeNodeEditor,
    notify: ui.notify,
    markDirty: ui.markDirty,
    t,
    stageCopy
  });

  const relationActions = useCanvasRelationActions({
    selectedEdge: selection.selectedEdge,
    selectedEdgeSource: selection.selectedEdgeSource,
    selectedEdgeTarget: selection.selectedEdgeTarget,
    selectedRelationKind: selection.selectedRelationKind,
    relationDraft: ui.relationDraft,
    getRelationKind: flow.getRelationKind,
    selectFlowEdge: ui.selectEdge,
    setRelationDraft: ui.setRelationDraft,
    setRelationPanelMode: ui.setRelationPanelMode,
    saveFlowRelation: flow.saveRelation,
    removeFlowRelation: flow.removeRelation,
    deleteFlowEdge: flow.deleteEdge,
    clearSelection: ui.clearSelection,
    notify: ui.notify,
    markDirty: ui.markDirty,
    t
  });

  const historyActions = useCanvasHistoryActions({
    undoFlow: flow.undo,
    redoFlow: flow.redo,
    markDirty: ui.markDirty,
    notify: ui.notify,
    t
  });

  const navigation = useCanvasWorkspaceNavigation({
    navigateAfterSave: saveController.navigateAfterSave
  });

  const flowActions = useCanvasWorkspaceFlowActions({
    flow,
    ui,
    viewportActions,
    markDirty: ui.markDirty,
    t
  });

  return {
    ...stageDragAndDrop,
    ...nodeActions,
    ...relationActions,
    ...historyActions,
    ...navigation,
    ...flowActions
  };
}

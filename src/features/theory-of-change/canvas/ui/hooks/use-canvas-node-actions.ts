'use client';

import { useCallback } from 'react';
import type { CanvasStageId } from '../../domain/canvas-project';
import type { CanvasStageNode } from '../../react-flow/canvas-flow.types';
import type {
  CanvasStageCopy,
  CanvasTranslator
} from '../canvas-copy';

type CanvasNodeData = CanvasStageNode['data'];
type CanvasNodeDraft = Partial<CanvasNodeData> | null;

type UseCanvasNodeActionsOptions = {
  nodes: CanvasStageNode[];
  selectedNodeId: string | null;
  nodeDraft: CanvasNodeDraft;
  updateNode: (
    nodeId: string,
    patch: Partial<CanvasNodeData>
  ) => void;
  duplicateFlowNode: (
    nodeId: string
  ) => CanvasStageNode | null;
  deleteFlowNode: (
    nodeId: string
  ) => CanvasStageNode | null;
  saveNodeDraft: (
    nodeId: string,
    patch: CanvasNodeData
  ) => void;
  selectNode: (nodeId: string) => void;
  clearSelection: () => void;
  setActiveToolbarNodeId: (
    nodeId: string | null
  ) => void;
  closeNodeEditor: () => void;
  notify: (message: string) => void;
  markDirty: () => void;
  t: CanvasTranslator;
  stageCopy: (
    stage: CanvasStageId
  ) => CanvasStageCopy;
};

export function useCanvasNodeActions({
  nodes,
  selectedNodeId,
  nodeDraft,
  updateNode,
  duplicateFlowNode,
  deleteFlowNode,
  saveNodeDraft,
  selectNode,
  clearSelection,
  setActiveToolbarNodeId,
  closeNodeEditor,
  notify,
  markDirty,
  t,
  stageCopy
}: UseCanvasNodeActionsOptions) {
  const updateSelectedNode = useCallback((
    field: keyof CanvasNodeData,
    value: string
  ) => {
    if (!selectedNodeId) {
      return;
    }

    updateNode(selectedNodeId, {
      [field]: value
    });

    markDirty();
  }, [markDirty, selectedNodeId, updateNode]);

  const duplicateNode = useCallback((nodeId: string) => {
    const duplicate = duplicateFlowNode(nodeId);

    if (!duplicate) {
      return;
    }

    selectNode(duplicate.id);
    setActiveToolbarNodeId(duplicate.id);
    markDirty();
    notify(t('notices.duplicated'));
  }, [
    duplicateFlowNode,
    markDirty,
    notify,
    selectNode,
    setActiveToolbarNodeId,
    t
  ]);

  const deleteNode = useCallback((nodeId: string) => {
    const node = deleteFlowNode(nodeId);

    if (!node) {
      return;
    }

    clearSelection();
    setActiveToolbarNodeId(null);
    closeNodeEditor();
    markDirty();

    notify(
      t('notices.deleted', {
        stage: stageCopy(node.data.stage).singular
      })
    );
  }, [
    clearSelection,
    closeNodeEditor,
    deleteFlowNode,
    markDirty,
    notify,
    setActiveToolbarNodeId,
    stageCopy,
    t
  ]);

  const saveNodeEditor = useCallback((nodeId: string) => {
    if (!nodeDraft) {
      return;
    }

    const node = nodes.find((item) => item.id === nodeId);

    if (!node) {
      return;
    }

    saveNodeDraft(nodeId, {
      ...node.data,
      ...nodeDraft
    });

    closeNodeEditor();
    markDirty();
    notify(t('notices.nodeUpdated'));
  }, [
    closeNodeEditor,
    markDirty,
    nodeDraft,
    nodes,
    notify,
    saveNodeDraft,
    t
  ]);

  return {
    updateSelectedNode,
    duplicateNode,
    deleteNode,
    saveNodeEditor
  };
}

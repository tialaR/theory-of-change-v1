import { useCallback } from 'react';

import type { TdmNode, TdmNodeDraft } from '../../../domain/tdm-types';

type SetNodes = (updater: (nodes: TdmNode[]) => TdmNode[]) => void;

type UseCanvasSelectionControllerParams = {
  editingNodeId: string | null;
  emptyDraft: TdmNodeDraft;
  setNodes: SetNodes;
  setSelectedNodeId: (value: string | null) => void;
  setToolbarNodeId: (value: string | null) => void;
  setSelectedEdgeId: (value: string | null) => void;
  setCreationError: (value: string | undefined) => void;
  setEditError: (value: string | undefined) => void;
  setMarkerDraft: (value: string) => void;
  setEditDraft: (value: TdmNodeDraft) => void;
  setIsEditAccordionOpen: (value: boolean) => void;
  setMarkerEditorEdgeId: (value: string | null) => void;
  setGuideTransientMessage: (value: string | null) => void;
};

export function useCanvasSelectionController({
  editingNodeId,
  emptyDraft,
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
}: UseCanvasSelectionControllerParams) {
  const resetCanvasSelection = useCallback(() => {
    setSelectedNodeId(null);
    setToolbarNodeId(null);
    setSelectedEdgeId(null);
    setCreationError(undefined);
    setEditError(undefined);
    setMarkerDraft('');
    setEditDraft({ ...emptyDraft });
    setIsEditAccordionOpen(false);
    setMarkerEditorEdgeId(null);
    setGuideTransientMessage(null);
    setNodes((currentNodes) => {
      if (!currentNodes.some((node) => node.selected)) {
        return currentNodes;
      }

      return currentNodes.map((node) => (node.selected ? { ...node, selected: false } : node));
    });
  }, [
    emptyDraft,
    setCreationError,
    setEditDraft,
    setEditError,
    setGuideTransientMessage,
    setIsEditAccordionOpen,
    setMarkerDraft,
    setMarkerEditorEdgeId,
    setNodes,
    setSelectedEdgeId,
    setSelectedNodeId,
    setToolbarNodeId
  ]);

  const clearCanvasSelection = useCallback(() => {
    if (editingNodeId) {
      return;
    }

    resetCanvasSelection();
  }, [editingNodeId, resetCanvasSelection]);

  return { resetCanvasSelection, clearCanvasSelection };
}

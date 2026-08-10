import { useCallback } from 'react';

import type { TdmNodeDraft } from '../../../../domain/tdm-types';
import type { NavigationControllerParams, TheorySnapshot } from './types';

type TheoryRestoreControllerParams = Pick<
  NavigationControllerParams,
  | 'emptyDraft'
  | 'setNodes'
  | 'setEdges'
  | 'setTheoryTitle'
  | 'setStageCreation'
  | 'setCreationDrafts'
  | 'setSelectedNodeId'
  | 'setToolbarNodeId'
  | 'setSelectedEdgeId'
  | 'setEditDraft'
  | 'setCreationError'
  | 'setEditError'
  | 'setEditingNodeId'
  | 'setCanvasVariant'
  | 'setViewMode'
  | 'bumpViewportReset'
> & {
  previousTheorySnapshot: TheorySnapshot | null;
  clearPreviousTheorySnapshot: () => void;
};

function toEditDraft(snapshot: TheorySnapshot, emptyDraft: TdmNodeDraft): TdmNodeDraft {
  const restoredNode = snapshot.selectedNodeId
    ? snapshot.nodes.find((node) => node.id === snapshot.selectedNodeId) ?? null
    : null;

  return restoredNode
    ? {
        title: restoredNode.title,
        description: restoredNode.description,
        advancedDetails: restoredNode.advancedDetails,
        shortNotes: restoredNode.shortNotes
      }
    : { ...emptyDraft };
}

export function useCanvasTheoryRestoreController({
  previousTheorySnapshot,
  clearPreviousTheorySnapshot,
  emptyDraft,
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
  bumpViewportReset
}: TheoryRestoreControllerParams) {
  const restorePreviousTheory = useCallback(() => {
    if (!previousTheorySnapshot) return;

    setNodes(previousTheorySnapshot.nodes);
    setEdges(previousTheorySnapshot.edges);
    setTheoryTitle(previousTheorySnapshot.theoryTitle);
    setStageCreation(previousTheorySnapshot.stageCreation);
    setCreationDrafts(previousTheorySnapshot.creationDrafts);
    setSelectedNodeId(previousTheorySnapshot.selectedNodeId);
    setToolbarNodeId(null);
    setSelectedEdgeId(previousTheorySnapshot.selectedEdgeId);
    setEditDraft(toEditDraft(previousTheorySnapshot, emptyDraft));
    setCreationError(undefined);
    setEditError(undefined);
    setEditingNodeId(null);
    setCanvasVariant('custom');
    clearPreviousTheorySnapshot();
    setViewMode('canvas');
    bumpViewportReset();
  }, [
    bumpViewportReset,
    clearPreviousTheorySnapshot,
    emptyDraft,
    previousTheorySnapshot,
    setCanvasVariant,
    setCreationDrafts,
    setCreationError,
    setEditDraft,
    setEditError,
    setEdges,
    setEditingNodeId,
    setNodes,
    setSelectedEdgeId,
    setSelectedNodeId,
    setStageCreation,
    setTheoryTitle,
    setToolbarNodeId,
    setViewMode
  ]);

  return { restorePreviousTheory };
}

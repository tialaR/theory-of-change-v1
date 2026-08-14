import { useCallback, useState } from 'react';

import type { NavigationState, TheorySnapshot } from './types';

type TheorySnapshotControllerParams = NavigationState;

export function useCanvasTheorySnapshotController({
  canvasVariant,
  nodes,
  edges,
  theoryTitle,
  stageCreation,
  creationDrafts,
  selectedNodeId,
  selectedEdgeId
}: TheorySnapshotControllerParams) {
  const [previousTheorySnapshot, setPreviousTheorySnapshot] = useState<TheorySnapshot | null>(null);

  const saveCurrentTheorySnapshot = useCallback(() => {
    if (canvasVariant !== 'custom') return;

    setPreviousTheorySnapshot({
      nodes,
      edges,
      theoryTitle,
      stageCreation,
      creationDrafts,
      selectedNodeId,
      selectedEdgeId
    });
  }, [canvasVariant, creationDrafts, edges, nodes, selectedEdgeId, selectedNodeId, stageCreation, theoryTitle]);

  const clearPreviousTheorySnapshot = useCallback(() => {
    setPreviousTheorySnapshot(null);
  }, []);

  return {
    previousTheorySnapshot,
    saveCurrentTheorySnapshot,
    clearPreviousTheorySnapshot
  };
}

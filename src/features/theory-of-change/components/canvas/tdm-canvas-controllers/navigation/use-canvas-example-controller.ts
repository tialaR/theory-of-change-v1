import { useCallback } from 'react';

import { exampleTheory } from '../../../../data/example-theory';
import type { NavigationControllerParams } from './types';

type ExampleControllerParams = Pick<
  NavigationControllerParams,
  | 'createEmptyDraftMap'
  | 'setNodes'
  | 'setEdges'
  | 'setTheoryTitle'
  | 'setStageCreation'
  | 'setCreationDrafts'
  | 'setEditingNodeId'
  | 'setCanvasVariant'
  | 'setViewMode'
  | 'resetCanvasSelection'
  | 'bumpViewportReset'
> & {
  saveCurrentTheorySnapshot: () => void;
};

export function useCanvasExampleController({
  createEmptyDraftMap,
  setNodes,
  setEdges,
  setTheoryTitle,
  setStageCreation,
  setCreationDrafts,
  setEditingNodeId,
  setCanvasVariant,
  setViewMode,
  resetCanvasSelection,
  bumpViewportReset,
  saveCurrentTheorySnapshot
}: ExampleControllerParams) {
  const replaceCanvasWithExample = useCallback(() => {
    saveCurrentTheorySnapshot();
    setNodes(exampleTheory.nodes);
    setEdges(exampleTheory.edges);
    setTheoryTitle(exampleTheory.title);
    setStageCreation('ready-to-connect');
    setCreationDrafts(createEmptyDraftMap());
    resetCanvasSelection();
    setEditingNodeId(null);
    setCanvasVariant('example');
    setViewMode('canvas');
    bumpViewportReset();
  }, [
    bumpViewportReset,
    createEmptyDraftMap,
    resetCanvasSelection,
    saveCurrentTheorySnapshot,
    setCanvasVariant,
    setCreationDrafts,
    setEdges,
    setEditingNodeId,
    setNodes,
    setStageCreation,
    setTheoryTitle,
    setViewMode
  ]);

  const openExamplePreview = useCallback(() => {
    saveCurrentTheorySnapshot();
    setViewMode('example-preview');
  }, [saveCurrentTheorySnapshot, setViewMode]);

  return { replaceCanvasWithExample, openExamplePreview };
}

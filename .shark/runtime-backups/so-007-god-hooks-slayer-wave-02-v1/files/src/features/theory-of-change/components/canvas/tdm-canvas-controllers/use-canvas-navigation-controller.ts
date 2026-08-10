import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';

import type { TdmStage } from '../../../domain/tdm-stages';
import type { TdmEdge, TdmNode, TdmNodeDraft } from '../../../domain/tdm-types';
import { exampleTheory } from '../../../data/example-theory';
import type { StageCreation } from '../../../utils/stage-creation';

type ViewMode = 'canvas' | 'example-preview' | 'result';

type TheorySnapshot = {
  nodes: TdmNode[];
  edges: TdmEdge[];
  theoryTitle: string;
  stageCreation: StageCreation;
  creationDrafts: Record<TdmStage, TdmNodeDraft>;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
};

type NavigationControllerParams = {
  canvasVariant: 'custom' | 'example';
  nodes: TdmNode[];
  edges: TdmEdge[];
  theoryTitle: string;
  stageCreation: StageCreation;
  creationDrafts: Record<TdmStage, TdmNodeDraft>;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  emptyDraft: TdmNodeDraft;
  createEmptyDraftMap: () => Record<TdmStage, TdmNodeDraft>;
  setNodes: Dispatch<SetStateAction<TdmNode[]>>;
  setEdges: Dispatch<SetStateAction<TdmEdge[]>>;
  setTheoryTitle: Dispatch<SetStateAction<string>>;
  setStageCreation: Dispatch<SetStateAction<StageCreation>>;
  setCreationDrafts: Dispatch<SetStateAction<Record<TdmStage, TdmNodeDraft>>>;
  setSelectedNodeId: Dispatch<SetStateAction<string | null>>;
  setToolbarNodeId: Dispatch<SetStateAction<string | null>>;
  setSelectedEdgeId: Dispatch<SetStateAction<string | null>>;
  setEditDraft: Dispatch<SetStateAction<TdmNodeDraft>>;
  setCreationError: Dispatch<SetStateAction<string | undefined>>;
  setEditError: Dispatch<SetStateAction<string | undefined>>;
  setEditingNodeId: Dispatch<SetStateAction<string | null>>;
  setCanvasVariant: Dispatch<SetStateAction<'custom' | 'example'>>;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  resetCanvasSelection: () => void;
  bumpViewportReset: () => void;
};

export function useCanvasNavigationController({
  canvasVariant,
  nodes,
  edges,
  theoryTitle,
  stageCreation,
  creationDrafts,
  selectedNodeId,
  selectedEdgeId,
  emptyDraft,
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
}: NavigationControllerParams) {
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
    setTheoryTitle
  ]);

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

    const restoredNode = previousTheorySnapshot.selectedNodeId
      ? previousTheorySnapshot.nodes.find((node) => node.id === previousTheorySnapshot.selectedNodeId) ?? null
      : null;

    setEditDraft(
      restoredNode
        ? {
            title: restoredNode.title,
            description: restoredNode.description,
            advancedDetails: restoredNode.advancedDetails,
            shortNotes: restoredNode.shortNotes
          }
        : { ...emptyDraft }
    );
    setCreationError(undefined);
    setEditError(undefined);
    setEditingNodeId(null);
    setCanvasVariant('custom');
    setPreviousTheorySnapshot(null);
    setViewMode('canvas');
    bumpViewportReset();
  }, [
    bumpViewportReset,
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
    setToolbarNodeId
  ]);

  const openExamplePreview = useCallback(() => {
    saveCurrentTheorySnapshot();
    setViewMode('example-preview');
  }, [saveCurrentTheorySnapshot]);

  const closeExamplePreview = useCallback(() => {
    restorePreviousTheory();
  }, [restorePreviousTheory]);

  const openResultView = useCallback(() => setViewMode('result'), []);
  const closeResultView = useCallback(() => setViewMode('canvas'), []);

  return {
    canRestoreTheory: canvasVariant === 'example' && previousTheorySnapshot !== null,
    replaceCanvasWithExample,
    restorePreviousTheory,
    openExamplePreview,
    closeExamplePreview,
    openResultView,
    closeResultView
  };
}

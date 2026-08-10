import { useCallback } from 'react';

import type { TdmStage } from '../../../../domain/tdm-stages';
import type { TdmNode as TdmNodeModel, TdmNodeDraft } from '../../../../domain/tdm-types';
import { createNode } from '../../../../utils/create-node';
import { getCreateNodePosition } from '../../../../utils/node-placement';
import type { StageCreation } from '../../../../utils/stage-creation';
import type { Setter } from './types';

type Params = {
  nodes: TdmNodeModel[];
  stageCreation: StageCreation;
  creationDrafts: Record<TdmStage, TdmNodeDraft>;
  emptyDraft: TdmNodeDraft;
  quickStageDrafts: Record<TdmStage, TdmNodeDraft>;
  setNodes: Setter<TdmNodeModel[]>;
  setSelectedNodeId: Setter<string | null>;
  setToolbarNodeId: Setter<string | null>;
  setSelectedEdgeId: Setter<string | null>;
  setEditingNodeId: Setter<string | null>;
  setCreationDrafts: Setter<Record<TdmStage, TdmNodeDraft>>;
  setCreationError: Setter<string | undefined>;
  bumpViewportReset: () => void;
  clearEditFormState: () => void;
};

export function useCanvasNodeCreationController(params: Params) {
  const { nodes, stageCreation, creationDrafts, emptyDraft, quickStageDrafts, setNodes, setSelectedNodeId, setToolbarNodeId, setSelectedEdgeId, setEditingNodeId, setCreationDrafts, setCreationError, bumpViewportReset, clearEditFormState } = params;

  const handleCreateDraftChange = useCallback((nextDraft: TdmNodeDraft) => {
    if (stageCreation === 'ready-to-connect') return;
    setCreationDrafts((currentDrafts) => ({ ...currentDrafts, [stageCreation]: nextDraft }));
    setCreationError(undefined);
  }, [setCreationDrafts, setCreationError, stageCreation]);

  const createNodeFromDraft = useCallback(({ stage, x, y, useQuickDraft = false }: { stage: TdmStage; x?: number; y?: number; useQuickDraft?: boolean }) => {
    const draft = useQuickDraft ? quickStageDrafts[stage] : creationDrafts[stage];
    const title = draft.title.trim();
    if (!title) {
      setCreationError('Preencha o título do bloco antes de adicionar ao canvas.');
      return null;
    }

    const smartPosition = getCreateNodePosition(stage, nodes);
    const createdNode = createNode({
      title,
      stage,
      description: draft.description.trim(),
      advancedDetails: draft.advancedDetails.trim(),
      shortNotes: draft.shortNotes.trim(),
      x: x ?? smartPosition.x,
      y: y ?? smartPosition.y
    });

    setNodes((currentNodes) => [...currentNodes, createdNode]);
    setSelectedNodeId(null);
    setToolbarNodeId(null);
    setSelectedEdgeId(null);
    setEditingNodeId(null);
    clearEditFormState();
    if (!useQuickDraft || creationDrafts[stage].title.trim()) {
      setCreationDrafts((currentDrafts) => ({ ...currentDrafts, [stage]: { ...emptyDraft } }));
    }
    setCreationError(undefined);
    bumpViewportReset();
    return createdNode;
  }, [bumpViewportReset, clearEditFormState, creationDrafts, emptyDraft, nodes, quickStageDrafts, setCreationDrafts, setCreationError, setEditingNodeId, setNodes, setSelectedEdgeId, setSelectedNodeId, setToolbarNodeId]);

  const handleCreateNode = useCallback(() => {
    if (stageCreation !== 'ready-to-connect') createNodeFromDraft({ stage: stageCreation });
  }, [createNodeFromDraft, stageCreation]);

  return { handleCreateDraftChange, createNodeFromDraft, handleCreateNode };
}

import { useCallback, type DragEvent } from 'react';

import type { TdmStage } from '../../../domain/tdm-stages';
import type { TdmNodeDraft } from '../../../domain/tdm-types';

type UseCanvasDragControllerParams = {
  stageCreation: TdmStage | 'ready-to-connect';
  emptyDraft: TdmNodeDraft;
  screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number };
  createNodeFromDraft: (input: { stage: TdmStage; x: number; y: number; useQuickDraft: boolean }) => void;
  setSelectedNodeId: (value: string | null) => void;
  setToolbarNodeId: (value: string | null) => void;
  setEditingNodeId: (value: string | null) => void;
  setEditDraft: (value: TdmNodeDraft) => void;
  setEditError: (value: string | undefined) => void;
  setIsEditAccordionOpen: (value: boolean) => void;
};

const TDM_STAGES: TdmStage[] = ['input', 'activity', 'output', 'outcome'];

export function useCanvasDragController({
  stageCreation,
  emptyDraft,
  screenToFlowPosition,
  createNodeFromDraft,
  setSelectedNodeId,
  setToolbarNodeId,
  setEditingNodeId,
  setEditDraft,
  setEditError,
  setIsEditAccordionOpen
}: UseCanvasDragControllerParams) {
  const handleStageDragStart = useCallback((event: DragEvent<HTMLElement>, stage: TdmStage) => {
    event.dataTransfer.setData('application/x-tdm-stage', stage);
    event.dataTransfer.effectAllowed = 'copy';
    setSelectedNodeId(null);
    setToolbarNodeId(null);
    setEditingNodeId(null);
    setEditDraft({ ...emptyDraft });
    setEditError(undefined);
    setIsEditAccordionOpen(false);
  }, [emptyDraft, setEditDraft, setEditError, setEditingNodeId, setIsEditAccordionOpen, setSelectedNodeId, setToolbarNodeId]);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const stage = event.dataTransfer.getData('application/x-tdm-stage') as TdmStage;
    if (!TDM_STAGES.includes(stage) || stageCreation === 'ready-to-connect' || stage !== stageCreation) {
      return;
    }

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    createNodeFromDraft({ stage, x: position.x, y: position.y, useQuickDraft: true });
  }, [createNodeFromDraft, screenToFlowPosition, stageCreation]);

  return { handleStageDragStart, handleDragOver, handleDrop };
}

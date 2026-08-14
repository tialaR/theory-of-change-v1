'use client';

import { useCallback, type DragEvent as ReactDragEvent } from 'react';
import { isCanvasStageId } from '../../domain/canvas-stage.constants';
import type { CanvasStageId } from '../../domain/canvas-project';
import {
  CANVAS_DIMENSIONS,
  CANVAS_DRAG_STAGE_MIME
} from '../../domain/canvas-ui.constants';
import { constrainCanvasEngineDropPosition } from '../../engine/canvas-engine';
import type { CanvasStageNode } from '../../react-flow/canvas-flow.types';
import type {
  CanvasFlowPosition,
  CanvasStageDropRuntime
} from '../../react-flow/canvas-flow.contracts';
import type {
  CanvasStageCopy,
  CanvasTranslator
} from '../canvas-copy';

type UseCanvasStageDragAndDropOptions = {
  stageDropRuntime: CanvasStageDropRuntime;
  createNode: (
    stage: CanvasStageId,
    position: CanvasFlowPosition
  ) => CanvasStageNode;
  selectNode: (nodeId: string) => void;
  setCreatorOpen: (open: boolean) => void;
  notify: (message: string) => void;
  markDirty: () => void;
  t: CanvasTranslator;
  stageCopy: (stage: CanvasStageId) => CanvasStageCopy;
};

export function useCanvasStageDragAndDrop({
  stageDropRuntime,
  createNode,
  selectNode,
  setCreatorOpen,
  notify,
  markDirty,
  t,
  stageCopy
}: UseCanvasStageDragAndDropOptions) {
  const startStageDrag = useCallback((
    event: ReactDragEvent<HTMLButtonElement>,
    stage: CanvasStageId
  ) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData(CANVAS_DRAG_STAGE_MIME, stage);

    notify(
      t('notices.dragStage', {
        stage: stageCopy(stage).singular.toLowerCase()
      })
    );
  }, [notify, stageCopy, t]);

  const allowStageDrop = useCallback((
    event: ReactDragEvent<HTMLDivElement>
  ) => {
    if (!event.dataTransfer.types.includes(CANVAS_DRAG_STAGE_MIME)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const dropStage = useCallback((
    event: ReactDragEvent<HTMLDivElement>
  ) => {
    const stageValue = event.dataTransfer.getData(
      CANVAS_DRAG_STAGE_MIME
    );

    if (!isCanvasStageId(stageValue)) {
      return;
    }

    event.preventDefault();

    const rawPosition = stageDropRuntime.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    });

    const node = createNode(
      stageValue,
      constrainCanvasEngineDropPosition(rawPosition, {
        width: CANVAS_DIMENSIONS.width,
        height: CANVAS_DIMENSIONS.height,
        nodeWidth: CANVAS_DIMENSIONS.nodeWidth,
        nodeHeight: CANVAS_DIMENSIONS.nodeHeight,
        edgeGap: CANVAS_DIMENSIONS.nodeEdgeGap,
        topGap: 72,
        anchorOffsetX: CANVAS_DIMENSIONS.nodeWidth / 2,
        anchorOffsetY: 40
      })
    );

    selectNode(node.id);
    setCreatorOpen(false);
    markDirty();

    notify(
      t('notices.stageAdded', {
        stage: stageCopy(stageValue).singular
      })
    );
  }, [
    createNode,
    markDirty,
    notify,
    stageDropRuntime,
    selectNode,
    setCreatorOpen,
    stageCopy,
    t
  ]);

  return {
    startStageDrag,
    allowStageDrop,
    dropStage
  };
}

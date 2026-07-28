'use client';

import { useCallback, type DragEvent as ReactDragEvent } from 'react';
import type { ReactFlowInstance, XYPosition } from '@xyflow/react';
import { isCanvasStageId } from '../../domain/canvas-stage.constants';
import type { CanvasStageId } from '../../domain/canvas-project';
import {
  CANVAS_DIMENSIONS,
  CANVAS_DRAG_STAGE_MIME
} from '../../domain/canvas-ui.constants';
import type {
  CanvasCausalEdge,
  CanvasStageNode
} from '../../react-flow/canvas-flow.types';
import type {
  CanvasStageCopy,
  CanvasTranslator
} from '../canvas-copy';

type UseCanvasStageDragAndDropOptions = {
  reactFlow: ReactFlowInstance<CanvasStageNode, CanvasCausalEdge>;
  createNode: (
    stage: CanvasStageId,
    position: XYPosition
  ) => CanvasStageNode;
  selectNode: (nodeId: string) => void;
  setCreatorOpen: (open: boolean) => void;
  notify: (message: string) => void;
  markDirty: () => void;
  t: CanvasTranslator;
  stageCopy: (stage: CanvasStageId) => CanvasStageCopy;
};

function constrainStagePosition(position: XYPosition): XYPosition {
  return {
    x: Math.max(
      CANVAS_DIMENSIONS.nodeEdgeGap,
      Math.min(
        CANVAS_DIMENSIONS.width
          - CANVAS_DIMENSIONS.nodeWidth
          - CANVAS_DIMENSIONS.nodeEdgeGap,
        position.x - CANVAS_DIMENSIONS.nodeWidth / 2
      )
    ),
    y: Math.max(
      72,
      Math.min(
        CANVAS_DIMENSIONS.height
          - CANVAS_DIMENSIONS.nodeHeight
          - CANVAS_DIMENSIONS.nodeEdgeGap,
        position.y - 40
      )
    )
  };
}

export function useCanvasStageDragAndDrop({
  reactFlow,
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

    const rawPosition = reactFlow.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    });

    const node = createNode(
      stageValue,
      constrainStagePosition(rawPosition)
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
    reactFlow,
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

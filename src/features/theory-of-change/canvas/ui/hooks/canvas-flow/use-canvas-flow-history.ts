'use client';

import { useCallback, useRef, useState } from 'react';
import { CANVAS_DIMENSIONS } from '../../../domain/canvas-ui.constants';
import {
  captureCanvasEngineHistory,
  redoCanvasEngineHistory,
  undoCanvasEngineHistory
} from '../../../engine/canvas-engine';
import type { CanvasCausalEdge, CanvasFlowSnapshot, CanvasStageNode } from '../../../react-flow/canvas-flow.types';
import type { SetCanvasEdges, SetCanvasNodes } from './types';

type Options = {
  nodes: CanvasStageNode[];
  edges: CanvasCausalEdge[];
  setNodes: SetCanvasNodes;
  setEdges: SetCanvasEdges;
};

export function useCanvasFlowHistory({ nodes, edges, setNodes, setEdges }: Options) {
  const [history, setHistory] = useState<CanvasFlowSnapshot[]>([]);
  const [future, setFuture] = useState<CanvasFlowSnapshot[]>([]);
  const dragSnapshotCapturedRef = useRef(false);

  const capture = useCallback(() => {
    const timeline = captureCanvasEngineHistory(
      { history, future },
      { nodes, edges },
      CANVAS_DIMENSIONS.historyLimit
    );
    setHistory(timeline.history);
    setFuture(timeline.future);
  }, [edges, future, history, nodes]);

  const undo = useCallback(() => {
    const transition = undoCanvasEngineHistory({ history, future }, { nodes, edges });
    if (!transition.changed || !transition.state) return false;
    setHistory(transition.timeline.history);
    setFuture(transition.timeline.future);
    setNodes(transition.state.nodes);
    setEdges(transition.state.edges);
    return true;
  }, [edges, future, history, nodes, setEdges, setNodes]);

  const redo = useCallback(() => {
    const transition = redoCanvasEngineHistory(
      { history, future },
      { nodes, edges },
      CANVAS_DIMENSIONS.historyLimit
    );
    if (!transition.changed || !transition.state) return false;
    setHistory(transition.timeline.history);
    setFuture(transition.timeline.future);
    setNodes(transition.state.nodes);
    setEdges(transition.state.edges);
    return true;
  }, [edges, future, history, nodes, setEdges, setNodes]);

  const beginNodeDrag = useCallback(() => {
    if (dragSnapshotCapturedRef.current) return;
    capture();
    dragSnapshotCapturedRef.current = true;
  }, [capture]);

  const finishNodeDrag = useCallback(() => {
    dragSnapshotCapturedRef.current = false;
  }, []);

  return {
    history,
    future,
    canUndo: history.length > 0,
    canRedo: future.length > 0,
    capture,
    undo,
    redo,
    beginNodeDrag,
    finishNodeDrag
  };
}

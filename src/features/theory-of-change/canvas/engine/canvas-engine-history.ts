import {
  appendCanvasEngineHistory,
  cloneCanvasEngineState,
  type CanvasEngineState
} from './canvas-engine-state';

export type CanvasEngineTimeline<TNode, TEdge> = {
  history: CanvasEngineState<TNode, TEdge>[];
  future: CanvasEngineState<TNode, TEdge>[];
};

export type CanvasEngineHistoryTransition<TNode, TEdge> = {
  timeline: CanvasEngineTimeline<TNode, TEdge>;
  state: CanvasEngineState<TNode, TEdge> | null;
  changed: boolean;
};

export function captureCanvasEngineHistory<TNode, TEdge>(
  timeline: CanvasEngineTimeline<TNode, TEdge>,
  current: CanvasEngineState<TNode, TEdge>,
  limit: number
): CanvasEngineTimeline<TNode, TEdge> {
  return {
    history: appendCanvasEngineHistory(timeline.history, current, limit),
    future: []
  };
}

export function undoCanvasEngineHistory<TNode, TEdge>(
  timeline: CanvasEngineTimeline<TNode, TEdge>,
  current: CanvasEngineState<TNode, TEdge>
): CanvasEngineHistoryTransition<TNode, TEdge> {
  const previous = timeline.history.at(-1);
  if (!previous) {
    return { timeline, state: null, changed: false };
  }

  return {
    timeline: {
      history: timeline.history.slice(0, -1),
      future: [cloneCanvasEngineState(current), ...timeline.future]
    },
    state: cloneCanvasEngineState(previous),
    changed: true
  };
}

export function redoCanvasEngineHistory<TNode, TEdge>(
  timeline: CanvasEngineTimeline<TNode, TEdge>,
  current: CanvasEngineState<TNode, TEdge>,
  limit: number
): CanvasEngineHistoryTransition<TNode, TEdge> {
  const next = timeline.future[0];
  if (!next) {
    return { timeline, state: null, changed: false };
  }

  return {
    timeline: {
      history: appendCanvasEngineHistory(timeline.history, current, limit),
      future: timeline.future.slice(1)
    },
    state: cloneCanvasEngineState(next),
    changed: true
  };
}

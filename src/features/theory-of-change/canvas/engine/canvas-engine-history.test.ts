import { describe, expect, it } from 'vitest';
import {
  captureCanvasEngineHistory,
  redoCanvasEngineHistory,
  undoCanvasEngineHistory,
  type CanvasEngineTimeline
} from './canvas-engine-history';
import type { CanvasEngineState } from './canvas-engine-state';

type Node = { id: string; data: { title: string } };
type Edge = { id: string; source: string; target: string };

const emptyTimeline = (): CanvasEngineTimeline<Node, Edge> => ({ history: [], future: [] });
const state = (title: string): CanvasEngineState<Node, Edge> => ({
  nodes: [{ id: title.toLowerCase(), data: { title } }],
  edges: []
});

describe('canvas engine history orchestration', () => {
  it('captures the current state and clears the redo future', () => {
    const current = state('Current');
    const timeline = captureCanvasEngineHistory(
      { history: [state('Older')], future: [state('Future')] },
      current,
      5
    );

    expect(timeline.history.map((snapshot) => snapshot.nodes[0]?.data.title)).toEqual(['Older', 'Current']);
    expect(timeline.future).toEqual([]);

    current.nodes[0]!.data.title = 'Mutated';
    expect(timeline.history[1]?.nodes[0]?.data.title).toBe('Current');
  });

  it('undoes by restoring the latest history state and preserving current state for redo', () => {
    const current = state('Current');
    const result = undoCanvasEngineHistory(
      { history: [state('Older'), state('Previous')], future: [state('Later')] },
      current
    );

    expect(result.changed).toBe(true);
    expect(result.state?.nodes[0]?.data.title).toBe('Previous');
    expect(result.timeline.history.map((snapshot) => snapshot.nodes[0]?.data.title)).toEqual(['Older']);
    expect(result.timeline.future.map((snapshot) => snapshot.nodes[0]?.data.title)).toEqual(['Current', 'Later']);
  });

  it('redoes by restoring the first future state and appending current state to bounded history', () => {
    const result = redoCanvasEngineHistory(
      { history: [state('Oldest'), state('Previous')], future: [state('Next'), state('Later')] },
      state('Current'),
      2
    );

    expect(result.changed).toBe(true);
    expect(result.state?.nodes[0]?.data.title).toBe('Next');
    expect(result.timeline.history.map((snapshot) => snapshot.nodes[0]?.data.title)).toEqual(['Previous', 'Current']);
    expect(result.timeline.future.map((snapshot) => snapshot.nodes[0]?.data.title)).toEqual(['Later']);
  });

  it('keeps the timeline untouched when undo or redo has no available state', () => {
    const timeline = emptyTimeline();
    const undoResult = undoCanvasEngineHistory(timeline, state('Current'));
    const redoResult = redoCanvasEngineHistory(timeline, state('Current'), 5);

    expect(undoResult).toEqual({ timeline, state: null, changed: false });
    expect(redoResult).toEqual({ timeline, state: null, changed: false });
  });
});

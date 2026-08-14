import { describe, expect, it } from 'vitest';
import { appendCanvasEngineHistory, cloneCanvasEngineState, createCanvasEngineState } from './canvas-engine-state';

describe('canvas engine state kernel', () => {
  it('creates an isolated state from renderer-owned collections', () => {
    const nodes = [{ id: 'node-1', data: { title: 'Original' } }];
    const state = createCanvasEngineState(nodes, [{ id: 'edge-1' }]);

    nodes[0].data.title = 'Mutated outside';

    expect(state.nodes[0].data.title).toBe('Original');
  });

  it('clones snapshots without sharing nested references', () => {
    const state = createCanvasEngineState([{ id: 'node-1', data: { title: 'Original' } }], []);
    const clone = cloneCanvasEngineState(state);

    clone.nodes[0].data.title = 'Changed';

    expect(state.nodes[0].data.title).toBe('Original');
  });

  it('keeps only the configured history window', () => {
    const first = createCanvasEngineState([{ id: 'node-1' }], []);
    const second = createCanvasEngineState([{ id: 'node-2' }], []);
    const third = createCanvasEngineState([{ id: 'node-3' }], []);

    const history = [first, second].reduce(
      (items, state) => appendCanvasEngineHistory(items, state, 2),
      [] as typeof first[]
    );

    expect(appendCanvasEngineHistory(history, third, 2).map((state) => state.nodes[0].id)).toEqual(['node-2', 'node-3']);
  });

  it('rejects invalid history limits', () => {
    expect(() => appendCanvasEngineHistory([], createCanvasEngineState([], []), 0)).toThrow(RangeError);
  });
});

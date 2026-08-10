import { describe, expect, it } from 'vitest';

import {
  appendCanvasEngineNode,
  constrainCanvasEngineDropPosition,
  createCanvasEngineState,
  resolveCanvasEngineSelection,
} from './canvas-engine';

describe('canvas engine public facade', () => {
  it('exposes state and command kernels through one public entrypoint', () => {
    const state = createCanvasEngineState<{ id: string }, { id: string }>();
    const result = appendCanvasEngineNode(state, { id: 'node-1' });
    expect(result.state.nodes).toEqual([{ id: 'node-1' }]);
  });

  it('exposes interaction and selection kernels with their public contracts', () => {
    expect(
      constrainCanvasEngineDropPosition(
        { x: -4, y: 12 },
        {
          width: 800,
          height: 600,
          nodeWidth: 220,
          nodeHeight: 120,
          edgeGap: 16,
          topGap: 24,
          anchorOffsetX: 0,
          anchorOffsetY: 0,
        }
      )
    ).toEqual({ x: 16, y: 24 });

    expect(
      resolveCanvasEngineSelection({
        nodes: [],
        edges: [],
        selectedNodeId: null,
        selectedEdgeId: null,
        resolveEdgeMetadata: () => null,
      }).selectedNode
    ).toBeNull();
  });
});

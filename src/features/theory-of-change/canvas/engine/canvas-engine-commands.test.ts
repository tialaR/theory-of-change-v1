import { describe, expect, it } from 'vitest';
import {
  appendCanvasEngineEdge,
  appendCanvasEngineNode,
  removeCanvasEngineEdge,
  removeCanvasEngineNode,
  updateCanvasEngineEdge,
  updateCanvasEngineNode
} from './canvas-engine-commands';

const base = () => ({
  nodes: [{ id: 'node-1', title: 'Original' }, { id: 'node-2', title: 'Target' }],
  edges: [{ id: 'edge-1', source: 'node-1', target: 'node-2', label: 'Original' }]
});

describe('canvas engine command kernel', () => {
  it('appends and updates nodes without mutating the source state', () => {
    const source = base();
    const appended = appendCanvasEngineNode(source, { id: 'node-3', title: 'New' }).state;
    const updated = updateCanvasEngineNode(appended, 'node-1', (node) => ({ ...node, title: 'Changed' })).state;
    expect(source.nodes).toHaveLength(2);
    expect(updated.nodes.map((node) => node.title)).toEqual(['Changed', 'Target', 'New']);
  });

  it('removes a node and every incident edge atomically', () => {
    const result = removeCanvasEngineNode(base(), 'node-1');
    expect(result.entity?.id).toBe('node-1');
    expect(result.state.nodes.map((node) => node.id)).toEqual(['node-2']);
    expect(result.state.edges).toEqual([]);
  });

  it('appends, updates and removes edges without mutating nodes', () => {
    const source = base();
    const appended = appendCanvasEngineEdge(source, { id: 'edge-2', source: 'node-2', target: 'node-1', label: 'New' }).state;
    const updated = updateCanvasEngineEdge(appended, 'edge-1', (edge) => ({ ...edge, label: 'Changed' })).state;
    const removed = removeCanvasEngineEdge(updated, 'edge-2').state;
    expect(removed.nodes).toBe(source.nodes);
    expect(removed.edges).toEqual([{ id: 'edge-1', source: 'node-1', target: 'node-2', label: 'Changed' }]);
  });

  it('returns the original state when the target does not exist', () => {
    const source = base();
    expect(updateCanvasEngineNode(source, 'missing', (node) => node).state).toBe(source);
    expect(removeCanvasEngineEdge(source, 'missing').state).toBe(source);
  });
});

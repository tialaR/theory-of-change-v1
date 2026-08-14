import { describe, expect, it, vi } from 'vitest';
import { resolveCanvasEngineSelection } from './canvas-engine-selection';

const nodes = [
  { id: 'node-a', label: 'A' },
  { id: 'node-b', label: 'B' }
];
const edges = [
  { id: 'edge-a-b', source: 'node-a', target: 'node-b', kind: 'risk' as const }
];

describe('canvas engine selection', () => {
  it('resolves the selected node independently from an edge selection', () => {
    const selection = resolveCanvasEngineSelection({
      nodes,
      edges,
      selectedNodeId: 'node-a',
      selectedEdgeId: null,
      resolveEdgeMetadata: (edge) => edge.kind
    });

    expect(selection.selectedNode).toBe(nodes[0]);
    expect(selection.selectedEdge).toBeNull();
    expect(selection.selectedEdgeMetadata).toBeNull();
  });

  it('resolves the selected edge with its source, target and metadata', () => {
    const selection = resolveCanvasEngineSelection({
      nodes,
      edges,
      selectedNodeId: null,
      selectedEdgeId: 'edge-a-b',
      resolveEdgeMetadata: (edge) => edge.kind
    });

    expect(selection).toEqual({
      selectedNode: null,
      selectedEdge: edges[0],
      selectedEdgeSource: nodes[0],
      selectedEdgeTarget: nodes[1],
      selectedEdgeMetadata: 'risk'
    });
  });

  it('returns null endpoints when persisted edge references are missing', () => {
    const orphanEdge = { id: 'orphan', source: 'missing-a', target: 'missing-b', kind: 'hypothesis' as const };
    const selection = resolveCanvasEngineSelection({
      nodes,
      edges: [orphanEdge],
      selectedNodeId: null,
      selectedEdgeId: 'orphan',
      resolveEdgeMetadata: (edge) => edge.kind
    });

    expect(selection.selectedEdge).toBe(orphanEdge);
    expect(selection.selectedEdgeSource).toBeNull();
    expect(selection.selectedEdgeTarget).toBeNull();
    expect(selection.selectedEdgeMetadata).toBe('hypothesis');
  });

  it('does not resolve edge metadata when the selected edge does not exist', () => {
    const resolveEdgeMetadata = vi.fn((edge: (typeof edges)[number]) => edge.kind);
    const selection = resolveCanvasEngineSelection({
      nodes,
      edges,
      selectedNodeId: 'missing-node',
      selectedEdgeId: 'missing-edge',
      resolveEdgeMetadata
    });

    expect(selection.selectedNode).toBeNull();
    expect(selection.selectedEdge).toBeNull();
    expect(resolveEdgeMetadata).not.toHaveBeenCalled();
  });
});

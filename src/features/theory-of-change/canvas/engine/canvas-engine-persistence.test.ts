import { describe, expect, it } from 'vitest';
import {
  createCanvasEnginePersistenceSignature,
  createCanvasEnginePersistenceSnapshot
} from './canvas-engine-persistence';

describe('canvas engine persistence kernel', () => {
  const content = {
    title: 'Theory',
    nodes: [{ id: 'node-1', data: { label: 'Input' } }],
    connections: [{ id: 'edge-1', sourceId: 'node-1', targetId: 'node-2' }],
    viewport: { x: 12, y: -8, zoom: 0.9 }
  };

  it('creates an isolated persistence snapshot', () => {
    const snapshot = createCanvasEnginePersistenceSnapshot(content);

    expect(snapshot).toEqual(content);
    expect(snapshot.nodes).not.toBe(content.nodes);
    expect(snapshot.nodes[0]).not.toBe(content.nodes[0]);
    expect(snapshot.connections).not.toBe(content.connections);
    expect(snapshot.viewport).not.toBe(content.viewport);
  });

  it('keeps optional viewport absent', () => {
    const snapshot = createCanvasEnginePersistenceSnapshot({
      title: 'Theory',
      nodes: [],
      connections: []
    });

    expect(snapshot.viewport).toBeUndefined();
  });

  it('creates equal signatures for equivalent content', () => {
    expect(createCanvasEnginePersistenceSignature(content)).toBe(
      createCanvasEnginePersistenceSignature(structuredClone(content))
    );
  });

  it('changes the signature when persistable content changes', () => {
    const changed = { ...content, title: 'Changed theory' };

    expect(createCanvasEnginePersistenceSignature(changed)).not.toBe(
      createCanvasEnginePersistenceSignature(content)
    );
  });
});

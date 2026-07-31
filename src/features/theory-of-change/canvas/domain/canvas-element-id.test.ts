import { describe, expect, it } from 'vitest';
import { createCanvasEdgeId, createCanvasNodeId } from './canvas-element-id';

describe('canvas element ids', () => {
  it('ignora colisões vindas de um projeto hidratado', () => {
    const tokens = ['existing', 'fresh'];
    const createToken = () => tokens.shift() ?? 'fallback';
    const occupied = new Set(['node-input-existing']);

    expect(createCanvasNodeId('input', occupied, createToken)).toBe('node-input-fresh');
  });

  it('mantém namespaces independentes para nodes e edges', () => {
    const occupied = new Set<string>();
    const createToken = () => 'shared-token';

    expect(createCanvasNodeId('product', occupied, createToken)).toBe('node-product-shared-token');
    expect(createCanvasEdgeId(occupied, createToken)).toBe('edge-shared-token');
  });
});

import { describe, expect, it } from 'vitest';
import {
  compareCanvasNodeOrder,
  createCanvasNodeOrder,
  isCanvasNodeOrder
} from './canvas-node-order';

describe('canvas node order', () => {
  it.each([0, 1, 42])('aceita inteiro não negativo: %s', (value) => {
    expect(createCanvasNodeOrder(value)).toBe(value);
    expect(isCanvasNodeOrder(value)).toBe(true);
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejeita valor inválido: %s',
    (value) => {
      expect(() => createCanvasNodeOrder(value)).toThrow(RangeError);
      expect(isCanvasNodeOrder(value)).toBe(false);
    }
  );

  it('compara ordens sem depender de posição visual', () => {
    const first = createCanvasNodeOrder(1);
    const second = createCanvasNodeOrder(3);

    expect(compareCanvasNodeOrder(first, second)).toBeLessThan(0);
    expect(compareCanvasNodeOrder(second, first)).toBeGreaterThan(0);
    expect(compareCanvasNodeOrder(first, first)).toBe(0);
  });
});

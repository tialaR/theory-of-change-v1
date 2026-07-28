import { describe, expect, it } from 'vitest';
import { createCanvasNodeOrder } from './canvas-node-order';
import {
  appendCanvasStageItem,
  insertCanvasStageItemAfter,
  moveCanvasStageItem,
  normalizeCanvasStageOrdering,
  removeCanvasStageItem,
  validateCanvasStageOrdering,
  type CanvasStageOrderedItem
} from './canvas-stage-ordering';

type TestItem = CanvasStageOrderedItem & {
  title: string;
};

function item(
  id: string,
  stage: TestItem['stage'],
  order: number
): TestItem {
  return {
    id,
    stage,
    order: createCanvasNodeOrder(order),
    title: id
  };
}

function stageSnapshot(items: readonly TestItem[], stage: TestItem['stage']) {
  return items
    .filter((candidate) => candidate.stage === stage)
    .sort((first, second) => first.order - second.order)
    .map((candidate) => `${candidate.id}:${candidate.order}`);
}

describe('canvas stage ordering', () => {
  it('valida sequência canônica sem gaps ou empates', () => {
    const items = [
      item('input-a', 'input', 0),
      item('input-b', 'input', 1)
    ];

    expect(validateCanvasStageOrdering(items, 'input')).toEqual([]);
  });

  it('detecta empate e gap dentro da etapa', () => {
    const items = [
      item('input-a', 'input', 0),
      item('input-b', 'input', 2),
      item('input-c', 'input', 2)
    ];

    expect(validateCanvasStageOrdering(items, 'input')).toEqual([
      { code: 'gap', expected: 1, received: 2 },
      { code: 'duplicate-order', order: 2 }
    ]);
  });

  it('normaliza uma etapa sem alterar as demais', () => {
    const items = [
      item('input-b', 'input', 7),
      item('activity-a', 'activity', 4),
      item('input-a', 'input', 2)
    ];

    const result = normalizeCanvasStageOrdering(items, 'input');

    expect(stageSnapshot(result, 'input')).toEqual([
      'input-a:0',
      'input-b:1'
    ]);
    expect(result.find((candidate) => candidate.id === 'activity-a')?.order).toBe(4);
  });

  it('adiciona novo item no fim da etapa', () => {
    const result = appendCanvasStageItem<TestItem>(
      [item('input-a', 'input', 0)],
      { id: 'input-b', stage: 'input', title: 'input-b' }
    );

    expect(stageSnapshot(result, 'input')).toEqual([
      'input-a:0',
      'input-b:1'
    ]);
  });

  it('insere duplicação imediatamente após a origem', () => {
    const result = insertCanvasStageItemAfter<TestItem>(
      [
        item('input-a', 'input', 0),
        item('input-b', 'input', 1)
      ],
      'input-a',
      { id: 'input-a-copy', stage: 'input', title: 'input-a-copy' }
    );

    expect(stageSnapshot(result, 'input')).toEqual([
      'input-a:0',
      'input-a-copy:1',
      'input-b:2'
    ]);
  });

  it('move dentro da mesma etapa e compacta os vizinhos', () => {
    const result = moveCanvasStageItem(
      [
        item('input-a', 'input', 0),
        item('input-b', 'input', 1),
        item('input-c', 'input', 2)
      ],
      'input-c',
      'input',
      0
    );

    expect(stageSnapshot(result, 'input')).toEqual([
      'input-c:0',
      'input-a:1',
      'input-b:2'
    ]);
  });

  it('move entre etapas compactando origem e destino', () => {
    const result = moveCanvasStageItem(
      [
        item('input-a', 'input', 0),
        item('input-b', 'input', 1),
        item('activity-a', 'activity', 0)
      ],
      'input-a',
      'activity'
    );

    expect(stageSnapshot(result, 'input')).toEqual(['input-b:0']);
    expect(stageSnapshot(result, 'activity')).toEqual([
      'activity-a:0',
      'input-a:1'
    ]);
  });

  it('remove item e elimina o gap restante', () => {
    const result = removeCanvasStageItem(
      [
        item('product-a', 'product', 0),
        item('product-b', 'product', 1),
        item('product-c', 'product', 2)
      ],
      'product-b'
    );

    expect(stageSnapshot(result, 'product')).toEqual([
      'product-a:0',
      'product-c:1'
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import { createCanvasNodeOrder, type CanvasNodeOrder } from './canvas-node-order';
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

function corruptedItem(
  id: string,
  stage: TestItem['stage'],
  order: number
): TestItem {
  return {
    id,
    stage,
    order: order as CanvasNodeOrder,
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

  it('detecta ids duplicados sem ocultar outras violações', () => {
    const items = [
      item('input-a', 'input', 0),
      item('input-a', 'input', 1)
    ];

    expect(validateCanvasStageOrdering(items, 'input')).toEqual([
      { code: 'duplicate-id', id: 'input-a' }
    ]);
  });

  it('detecta ordem inválida em estado hidratado corrompido', () => {
    const items = [
      item('input-a', 'input', 0),
      corruptedItem('input-b', 'input', -1)
    ];

    expect(validateCanvasStageOrdering(items, 'input')).toEqual([
      { code: 'invalid-order', id: 'input-b', order: -1 }
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

  it('normaliza deterministicamente empates usando o id', () => {
    const items = [
      item('input-b', 'input', 2),
      item('input-a', 'input', 2)
    ];

    const first = normalizeCanvasStageOrdering(items, 'input');
    const second = normalizeCanvasStageOrdering(items, 'input');

    expect(stageSnapshot(first, 'input')).toEqual([
      'input-a:0',
      'input-b:1'
    ]);
    expect(second).toEqual(first);
  });

  it('normaliza ordens inválidas depois das ordens válidas', () => {
    const items = [
      corruptedItem('input-z', 'input', Number.NaN),
      item('input-a', 'input', 4),
      corruptedItem('input-y', 'input', -1)
    ];

    const result = normalizeCanvasStageOrdering(items, 'input');

    expect(stageSnapshot(result, 'input')).toEqual([
      'input-a:0',
      'input-y:1',
      'input-z:2'
    ]);
  });

  it('não modifica o array nem os objetos recebidos', () => {
    const source = [
      item('input-b', 'input', 4),
      item('input-a', 'input', 2)
    ];
    const snapshot = structuredClone(source);

    normalizeCanvasStageOrdering(source, 'input');

    expect(source).toEqual(snapshot);
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

  it('normaliza uma etapa corrompida antes de adicionar no fim', () => {
    const result = appendCanvasStageItem<TestItem>(
      [item('input-a', 'input', 3)],
      { id: 'input-b', stage: 'input', title: 'input-b' }
    );

    expect(stageSnapshot(result, 'input')).toEqual([
      'input-a:0',
      'input-b:1'
    ]);
  });

  it('rejeita novo item com id já existente', () => {
    expect(() => appendCanvasStageItem<TestItem>(
      [item('input-a', 'input', 0)],
      { id: 'input-a', stage: 'input', title: 'copy' }
    )).toThrow('Canvas stage item id already exists: input-a');
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

  it('rejeita inserção quando a origem não existe', () => {
    expect(() => insertCanvasStageItemAfter<TestItem>(
      [],
      'missing',
      { id: 'input-a', stage: 'input', title: 'input-a' }
    )).toThrow('Canvas stage source item not found: missing');
  });

  it('rejeita inserção entre etapas diferentes', () => {
    expect(() => insertCanvasStageItemAfter<TestItem>(
      [item('input-a', 'input', 0)],
      'input-a',
      { id: 'activity-a', stage: 'activity', title: 'activity-a' }
    )).toThrow('Canvas stage insertion requires source and item in the same stage.');
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

  it('limita índice negativo ao início da etapa', () => {
    const result = moveCanvasStageItem(
      [
        item('input-a', 'input', 0),
        item('input-b', 'input', 1)
      ],
      'input-b',
      'input',
      -10
    );

    expect(stageSnapshot(result, 'input')).toEqual([
      'input-b:0',
      'input-a:1'
    ]);
  });

  it('limita índice superior ao fim da etapa', () => {
    const result = moveCanvasStageItem(
      [
        item('input-a', 'input', 0),
        item('input-b', 'input', 1)
      ],
      'input-a',
      'input',
      99
    );

    expect(stageSnapshot(result, 'input')).toEqual([
      'input-b:0',
      'input-a:1'
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

  it('rejeita movimento quando o item não existe', () => {
    expect(() => moveCanvasStageItem([], 'missing', 'input')).toThrow(
      'Canvas stage item not found: missing'
    );
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

  it('retorna cópia quando a remoção não encontra o item', () => {
    const items = [item('product-a', 'product', 0)];
    const result = removeCanvasStageItem(items, 'missing');

    expect(result).toEqual(items);
    expect(result).not.toBe(items);
  });

  it.each([
    ['normalize', () => normalizeCanvasStageOrdering([
      item('duplicate', 'input', 0),
      item('duplicate', 'activity', 0)
    ], 'input')],
    ['append', () => appendCanvasStageItem<TestItem>([
      item('duplicate', 'input', 0),
      item('duplicate', 'activity', 0)
    ], { id: 'fresh', stage: 'input', title: 'fresh' })],
    ['move', () => moveCanvasStageItem([
      item('duplicate', 'input', 0),
      item('duplicate', 'activity', 0)
    ], 'duplicate', 'product')],
    ['remove', () => removeCanvasStageItem([
      item('duplicate', 'input', 0),
      item('duplicate', 'activity', 0)
    ], 'duplicate')]
  ])('rejeita ids duplicados antes de executar %s', (_operation, execute) => {
    expect(execute).toThrow('Canvas stage ordering requires unique item ids: duplicate');
  });
});

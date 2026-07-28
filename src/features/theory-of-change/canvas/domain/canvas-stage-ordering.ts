import type { CanvasStageId } from './canvas-project';
import {
  compareCanvasNodeOrder,
  createCanvasNodeOrder,
  type CanvasNodeOrder
} from './canvas-node-order';

export type CanvasStageOrderedItem = {
  id: string;
  stage: CanvasStageId;
  order: CanvasNodeOrder;
};

export type CanvasStageOrderingIssue =
  | { code: 'duplicate-order'; order: number }
  | { code: 'gap'; expected: number; received: number }
  | { code: 'invalid-order'; id: string; order: number };

function compareOrderedItems(
  first: CanvasStageOrderedItem,
  second: CanvasStageOrderedItem
): number {
  return compareCanvasNodeOrder(first.order, second.order)
    || first.id.localeCompare(second.id);
}

function getStageItems<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  stage: CanvasStageId
): T[] {
  return items
    .filter((item) => item.stage === stage)
    .sort(compareOrderedItems);
}

function replaceStageItems<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  stage: CanvasStageId,
  orderedStageItems: readonly T[]
): T[] {
  const replacements = new Map(
    orderedStageItems.map((item) => [item.id, item])
  );

  return items.map((item) => {
    if (item.stage !== stage) {
      return item;
    }

    return replacements.get(item.id) ?? item;
  });
}

function assignCanonicalOrders<T extends CanvasStageOrderedItem>(
  items: readonly T[]
): T[] {
  return items.map((item, index) => ({
    ...item,
    order: createCanvasNodeOrder(index)
  }));
}

export function validateCanvasStageOrdering<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  stage: CanvasStageId
): CanvasStageOrderingIssue[] {
  const stageItems = getStageItems(items, stage);
  const issues: CanvasStageOrderingIssue[] = [];
  const seenOrders = new Set<number>();

  stageItems.forEach((item, index) => {
    if (!Number.isInteger(item.order) || item.order < 0) {
      issues.push({
        code: 'invalid-order',
        id: item.id,
        order: item.order
      });
      return;
    }

    if (seenOrders.has(item.order)) {
      issues.push({ code: 'duplicate-order', order: item.order });
    }

    seenOrders.add(item.order);

    if (item.order !== index) {
      issues.push({
        code: 'gap',
        expected: index,
        received: item.order
      });
    }
  });

  return issues;
}

export function normalizeCanvasStageOrdering<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  stage: CanvasStageId
): T[] {
  const normalizedStageItems = assignCanonicalOrders(
    getStageItems(items, stage)
  );

  return replaceStageItems(items, stage, normalizedStageItems);
}

export function appendCanvasStageItem<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  item: Omit<T, 'order'>
): T[] {
  const targetStageItems = getStageItems(items, item.stage);
  const appendedItem = {
    ...item,
    order: createCanvasNodeOrder(targetStageItems.length)
  } as T;

  return [...items, appendedItem];
}

export function insertCanvasStageItemAfter<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  sourceId: string,
  item: Omit<T, 'order'>
): T[] {
  const source = items.find((candidate) => candidate.id === sourceId);

  if (!source) {
    throw new Error(`Canvas stage source item not found: ${sourceId}`);
  }

  if (source.stage !== item.stage) {
    throw new Error('Canvas stage insertion requires source and item in the same stage.');
  }

  const stageItems = getStageItems(items, source.stage);
  const sourceIndex = stageItems.findIndex((candidate) => candidate.id === sourceId);
  const insertedItem = {
    ...item,
    order: createCanvasNodeOrder(sourceIndex + 1)
  } as T;

  const nextStageItems = [
    ...stageItems.slice(0, sourceIndex + 1),
    insertedItem,
    ...stageItems.slice(sourceIndex + 1)
  ];

  const normalized = assignCanonicalOrders(nextStageItems);
  return [...replaceStageItems(items, source.stage, normalized), insertedItem]
    .filter((candidate, index, collection) => (
      collection.findIndex((itemInCollection) => itemInCollection.id === candidate.id) === index
    ));
}

export function moveCanvasStageItem<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  itemId: string,
  targetStage: CanvasStageId,
  targetIndex?: number
): T[] {
  const source = items.find((item) => item.id === itemId);

  if (!source) {
    throw new Error(`Canvas stage item not found: ${itemId}`);
  }

  const withoutSource = items.filter((item) => item.id !== itemId);
  const normalizedSource = normalizeCanvasStageOrdering(withoutSource, source.stage);
  const targetItems = getStageItems(normalizedSource, targetStage);
  const boundedIndex = targetIndex === undefined
    ? targetItems.length
    : Math.max(0, Math.min(targetIndex, targetItems.length));
  const movedItem = {
    ...source,
    stage: targetStage,
    order: createCanvasNodeOrder(boundedIndex)
  } as T;
  const nextTargetItems = [
    ...targetItems.slice(0, boundedIndex),
    movedItem,
    ...targetItems.slice(boundedIndex)
  ];
  const normalizedTargetItems = assignCanonicalOrders(nextTargetItems);

  return [...normalizedSource, movedItem]
    .map((item) => normalizedTargetItems.find((candidate) => candidate.id === item.id) ?? item)
    .filter((candidate, index, collection) => (
      collection.findIndex((itemInCollection) => itemInCollection.id === candidate.id) === index
    ));
}

export function removeCanvasStageItem<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  itemId: string
): T[] {
  const source = items.find((item) => item.id === itemId);

  if (!source) {
    return [...items];
  }

  return normalizeCanvasStageOrdering(
    items.filter((item) => item.id !== itemId),
    source.stage
  );
}

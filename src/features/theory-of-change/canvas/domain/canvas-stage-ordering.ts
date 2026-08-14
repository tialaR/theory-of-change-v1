import type { CanvasStageId } from './canvas-project';
import { createCanvasNodeOrder, isCanvasNodeOrder, type CanvasNodeOrder } from './canvas-node-order';
import {
  assertAvailableId,
  assertUniqueIds,
  assignCanonicalOrders,
  getStageItems,
  normalizeStageItems,
  replaceStageItems
} from './canvas-stage-ordering.internal';

export type CanvasStageOrderedItem = {
  id: string;
  stage: CanvasStageId;
  order: CanvasNodeOrder;
};

export type CanvasStageOrderingIssue =
  | { code: 'duplicate-id'; id: string }
  | { code: 'duplicate-order'; order: number }
  | { code: 'gap'; expected: number; received: number }
  | { code: 'invalid-order'; id: string; order: number };

export function validateCanvasStageOrdering<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  stage: CanvasStageId
): CanvasStageOrderingIssue[] {
  const stageItems = getStageItems(items, stage);
  const issues: CanvasStageOrderingIssue[] = [];
  const seenIds = new Set<string>();
  const seenOrders = new Set<number>();
  let expectedOrder = 0;

  for (const item of stageItems) {
    if (seenIds.has(item.id)) {
      issues.push({ code: 'duplicate-id', id: item.id });
    }
    seenIds.add(item.id);

    if (!isCanvasNodeOrder(item.order)) {
      issues.push({ code: 'invalid-order', id: item.id, order: item.order });
      continue;
    }

    if (seenOrders.has(item.order)) {
      issues.push({ code: 'duplicate-order', order: item.order });
    }
    seenOrders.add(item.order);

    if (item.order !== expectedOrder) {
      issues.push({ code: 'gap', expected: expectedOrder, received: item.order });
    }

    expectedOrder += 1;
  }

  return issues;
}

export function normalizeCanvasStageOrdering<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  stage: CanvasStageId
): T[] {
  assertUniqueIds(items);
  return replaceStageItems(items, stage, normalizeStageItems(items, stage));
}

export function appendCanvasStageItem<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  item: Omit<T, 'order'>
): T[] {
  assertUniqueIds(items);
  assertAvailableId(items, item.id);

  const normalizedItems = normalizeCanvasStageOrdering(items, item.stage);
  const targetStageItems = getStageItems(normalizedItems, item.stage);
  const appendedItem = {
    ...item,
    order: createCanvasNodeOrder(targetStageItems.length)
  } as T;

  return [...normalizedItems, appendedItem];
}

export function insertCanvasStageItemAfter<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  sourceId: string,
  item: Omit<T, 'order'>
): T[] {
  assertUniqueIds(items);
  assertAvailableId(items, item.id);

  const source = items.find((candidate) => candidate.id === sourceId);
  if (!source) {
    throw new Error(`Canvas stage source item not found: ${sourceId}`);
  }
  if (source.stage !== item.stage) {
    throw new Error('Canvas stage insertion requires source and item in the same stage.');
  }

  const normalizedItems = normalizeCanvasStageOrdering(items, source.stage);
  const stageItems = getStageItems(normalizedItems, source.stage);
  const sourceIndex = stageItems.findIndex((candidate) => candidate.id === sourceId);
  const insertedItem = {
    ...item,
    order: createCanvasNodeOrder(sourceIndex + 1)
  } as T;
  const nextStageItems = assignCanonicalOrders([
    ...stageItems.slice(0, sourceIndex + 1),
    insertedItem,
    ...stageItems.slice(sourceIndex + 1)
  ]);

  return replaceStageItems(normalizedItems, source.stage, nextStageItems);
}

export function moveCanvasStageItem<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  itemId: string,
  targetStage: CanvasStageId,
  targetIndex?: number
): T[] {
  assertUniqueIds(items);

  const source = items.find((item) => item.id === itemId);
  if (!source) {
    throw new Error(`Canvas stage item not found: ${itemId}`);
  }

  const withoutSource = items.filter((item) => item.id !== itemId);
  const normalizedSource = normalizeCanvasStageOrdering(withoutSource, source.stage);
  const normalizedTarget = source.stage === targetStage
    ? normalizedSource
    : normalizeCanvasStageOrdering(normalizedSource, targetStage);
  const targetItems = getStageItems(normalizedTarget, targetStage);
  const boundedIndex = targetIndex === undefined
    ? targetItems.length
    : Math.max(0, Math.min(targetIndex, targetItems.length));
  const movedItem = {
    ...source,
    stage: targetStage,
    order: createCanvasNodeOrder(boundedIndex)
  } as T;
  const nextTargetItems = assignCanonicalOrders([
    ...targetItems.slice(0, boundedIndex),
    movedItem,
    ...targetItems.slice(boundedIndex)
  ]);

  return replaceStageItems(
    [...normalizedTarget, movedItem],
    targetStage,
    nextTargetItems
  ).filter((item, index, collection) => (
    collection.findIndex((candidate) => candidate.id === item.id) === index
  ));
}

export function removeCanvasStageItem<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  itemId: string
): T[] {
  assertUniqueIds(items);

  const source = items.find((item) => item.id === itemId);
  if (!source) return [...items];

  return normalizeCanvasStageOrdering(
    items.filter((item) => item.id !== itemId),
    source.stage
  );
}

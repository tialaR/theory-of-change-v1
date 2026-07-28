import type { CanvasStageId } from './canvas-project';
import {
  compareCanvasNodeOrder,
  createCanvasNodeOrder,
  isCanvasNodeOrder
} from './canvas-node-order';
import type { CanvasStageOrderedItem } from './canvas-stage-ordering';

export function compareOrderedItems(
  first: CanvasStageOrderedItem,
  second: CanvasStageOrderedItem
): number {
  const firstIsValid = isCanvasNodeOrder(first.order);
  const secondIsValid = isCanvasNodeOrder(second.order);

  if (firstIsValid && secondIsValid) {
    return compareCanvasNodeOrder(first.order, second.order)
      || first.id.localeCompare(second.id);
  }

  if (firstIsValid) return -1;
  if (secondIsValid) return 1;
  return first.id.localeCompare(second.id);
}

export function getStageItems<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  stage: CanvasStageId
): T[] {
  return items
    .filter((item) => item.stage === stage)
    .sort(compareOrderedItems);
}

export function assertUniqueIds<T extends CanvasStageOrderedItem>(
  items: readonly T[]
): void {
  const seenIds = new Set<string>();

  for (const item of items) {
    if (seenIds.has(item.id)) {
      throw new Error(`Canvas stage ordering requires unique item ids: ${item.id}`);
    }

    seenIds.add(item.id);
  }
}

export function assertAvailableId<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  id: string
): void {
  if (items.some((item) => item.id === id)) {
    throw new Error(`Canvas stage item id already exists: ${id}`);
  }
}

export function replaceStageItems<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  stage: CanvasStageId,
  orderedStageItems: readonly T[]
): T[] {
  const replacements = new Map(
    orderedStageItems.map((item) => [item.id, item])
  );
  const existingIds = new Set(items.map((item) => item.id));
  const replaced = items.map((item) => {
    if (item.stage !== stage) return item;
    return replacements.get(item.id) ?? item;
  });
  const additions = orderedStageItems.filter((item) => !existingIds.has(item.id));

  return [...replaced, ...additions];
}

export function assignCanonicalOrders<T extends CanvasStageOrderedItem>(
  items: readonly T[]
): T[] {
  return items.map((item, index) => ({
    ...item,
    order: createCanvasNodeOrder(index)
  }));
}

export function normalizeStageItems<T extends CanvasStageOrderedItem>(
  items: readonly T[],
  stage: CanvasStageId
): T[] {
  return assignCanonicalOrders(getStageItems(items, stage));
}

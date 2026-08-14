const CANVAS_NODE_ORDER_BRAND = Symbol('CanvasNodeOrder');

export type CanvasNodeOrder = number & {
  readonly [CANVAS_NODE_ORDER_BRAND]: true;
};

export function isCanvasNodeOrder(value: number): value is CanvasNodeOrder {
  return Number.isInteger(value) && value >= 0;
}

export function createCanvasNodeOrder(value: number): CanvasNodeOrder {
  if (!isCanvasNodeOrder(value)) {
    throw new RangeError('Canvas node order must be a non-negative integer.');
  }

  return value;
}

export function compareCanvasNodeOrder(
  first: CanvasNodeOrder,
  second: CanvasNodeOrder
): number {
  return first - second;
}

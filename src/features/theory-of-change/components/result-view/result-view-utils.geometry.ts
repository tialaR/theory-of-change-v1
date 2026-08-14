import type { TdmEdge, TdmNode } from '../../domain/tdm-types';
import { RESULT_EDGE_GAP } from './result-view.constants';
import type { CardRect } from './result-view.types';
import type { CardAnchorPoint, FlowPathDescriptor } from './result-view-utils.types';
import { getEdgeConnectionKind } from './result-view-utils.insights';
import { getEdgeMarkerText, getEdgeMarkerType } from './result-view-utils.network';

export function getElementLayoutRect(element: HTMLElement, container: HTMLElement): DOMRect {
  let left = 0;
  let top = 0;
  let current: HTMLElement | null = element;

  while (current && current !== container) {
    left += current.offsetLeft;
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  return new DOMRect(left, top, element.offsetWidth, element.offsetHeight);
}

export function buildCardConnectionPath(
  sourceRect: DOMRect,
  targetRect: DOMRect
): { d: string; midpoint: CardAnchorPoint } {
  const sourceCenterY = sourceRect.top + sourceRect.height / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;
  const sourceIsLeft = sourceRect.left <= targetRect.left;

  const startX = sourceIsLeft ? sourceRect.right : sourceRect.left;
  const endX = sourceIsLeft ? targetRect.left : targetRect.right;
  const startY = sourceCenterY;
  const endY = targetCenterY;
  const deltaX = Math.abs(endX - startX);
  const controlOffset = Math.max(deltaX * 0.42, 28);

  const c1x = sourceIsLeft ? startX + controlOffset : startX - controlOffset;
  const c2x = sourceIsLeft ? endX - controlOffset : endX + controlOffset;

  const d = `M ${startX} ${startY} C ${c1x} ${startY}, ${c2x} ${endY}, ${endX} ${endY}`;

  return {
    d,
    midpoint: {
      x: (startX + endX) / 2,
      y: (startY + endY) / 2
    }
  };
}

export function buildFlowPathDescriptors(
  relatedEdgeIds: Set<string>,
  edges: TdmEdge[],
  cardElements: Map<string, HTMLElement>,
  containerElement: HTMLElement
): FlowPathDescriptor[] {
  const descriptors: FlowPathDescriptor[] = [];
  let delayIndex = 0;

  relatedEdgeIds.forEach((edgeId) => {
    const edge = edges.find((candidate) => candidate.id === edgeId);

    if (!edge) {
      return;
    }

    const connectionKind = getEdgeConnectionKind(edge);

    if (!connectionKind) {
      return;
    }

    const sourceElement = cardElements.get(edge.source);
    const targetElement = cardElements.get(edge.target);

    if (!sourceElement || !targetElement) {
      return;
    }

    const sourceRect = getElementLayoutRect(sourceElement, containerElement);
    const targetRect = getElementLayoutRect(targetElement, containerElement);
    const { d, midpoint } = buildCardConnectionPath(sourceRect, targetRect);
    const markerType = getEdgeMarkerType(edge);
    const markerText = markerType ? getEdgeMarkerText(edge, markerType)?.trim() : undefined;

    descriptors.push({
      edgeId,
      d,
      connectionKind,
      markerType: markerText ? markerType : undefined,
      markerText,
      markerPoint: midpoint,
      drawDelay: delayIndex * 0.07
    });

    delayIndex += 1;
  });

  return descriptors;
}

export function getCausalPathLabels(nodeId: string, nodes: TdmNode[], edges: TdmEdge[]): string[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const focusedNode = nodeMap.get(nodeId);

  if (!focusedNode) {
    return [];
  }

  const upstream = edges
    .filter((edge) => edge.target === nodeId)
    .map((edge) => nodeMap.get(edge.source))
    .filter(Boolean) as TdmNode[];

  const downstream = edges
    .filter((edge) => edge.source === nodeId)
    .map((edge) => nodeMap.get(edge.target))
    .filter(Boolean) as TdmNode[];

  const segments: string[] = [];

  upstream.forEach((node) => {
    segments.push(`${node.title} → ${focusedNode.title}`);
  });

  downstream.forEach((node) => {
    segments.push(`${focusedNode.title} → ${node.title}`);
  });

  return segments;
}



type MeasuredPoint = { x: number; y: number };

function cubicBezierPoint(
  t: number,
  p0: MeasuredPoint,
  p1: MeasuredPoint,
  p2: MeasuredPoint,
  p3: MeasuredPoint
): MeasuredPoint {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  return {
    x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
    y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y
  };
}

export function isValidCardRect(rect: CardRect | null | undefined): rect is CardRect {
  if (!rect) {
    return false;
  }

  return (
    Number.isFinite(rect.x) &&
    Number.isFinite(rect.y) &&
    Number.isFinite(rect.width) &&
    Number.isFinite(rect.height) &&
    rect.width >= 1 &&
    rect.height >= 1
  );
}

export function isValidMarkerPoint(x: number, y: number): boolean {
  return Number.isFinite(x) && Number.isFinite(y) && !(x === 0 && y === 0);
}

export function buildMeasuredEdgePath(source: CardRect, target: CardRect) {
  if (!isValidCardRect(source) || !isValidCardRect(target)) {
    return null;
  }

  const startX = source.x + source.width / 2 + RESULT_EDGE_GAP;
  const startY = source.y;
  const endX = target.x - target.width / 2 - RESULT_EDGE_GAP;
  const endY = target.y;

  if (
    !Number.isFinite(startX) ||
    !Number.isFinite(startY) ||
    !Number.isFinite(endX) ||
    !Number.isFinite(endY)
  ) {
    return null;
  }

  const span = Math.max(endX - startX, 28);
  const control = Math.max(span * 0.44, 28);
  const p0 = { x: startX, y: startY };
  const p1 = { x: startX + control, y: startY };
  const p2 = { x: endX - control, y: endY };
  const p3 = { x: endX, y: endY };
  const midpoint = cubicBezierPoint(0.5, p0, p1, p2, p3);

  if (!Number.isFinite(midpoint.x) || !Number.isFinite(midpoint.y)) {
    return null;
  }

  return {
    path: `M ${startX} ${startY} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${endX} ${endY}`,
    midX: midpoint.x,
    midY: midpoint.y,
    pointAt: (t: number) => cubicBezierPoint(Math.min(1, Math.max(0, t)), p0, p1, p2, p3)
  };
}

export function areCardRectsEqual(previous: Map<string, CardRect>, next: Map<string, CardRect>) {
  if (previous.size !== next.size) {
    return false;
  }

  for (const [id, rect] of next) {
    const current = previous.get(id);
    if (
      !current ||
      current.x !== rect.x ||
      current.y !== rect.y ||
      current.width !== rect.width ||
      current.height !== rect.height
    ) {
      return false;
    }
  }

  return true;
}

export function roundZoom(value: number) {
  return Number(value.toFixed(2));
}

/**
 * Layout geometry relative to an ancestor, ignoring CSS transform scale on
 * ancestors (offset* / offsetParent are layout space, not visual space).
 */
export function getLayoutRectRelativeTo(element: HTMLElement, ancestor: HTMLElement): CardRect {
  const width = Math.max(1, Math.round(element.offsetWidth));
  const height = Math.max(1, Math.round(element.offsetHeight));
  let left = 0;
  let top = 0;
  let current: HTMLElement | null = element;

  while (current && current !== ancestor) {
    left += current.offsetLeft;
    top += current.offsetTop;

    const offsetParent = current.offsetParent as HTMLElement | null;
    if (!offsetParent || offsetParent === ancestor) {
      break;
    }

    if (!ancestor.contains(offsetParent)) {
      let walker: HTMLElement | null = current.parentElement;
      while (walker && walker !== ancestor) {
        left += walker.clientLeft;
        top += walker.clientTop;
        walker = walker.parentElement;
      }
      break;
    }

    left += offsetParent.clientLeft;
    top += offsetParent.clientTop;
    current = offsetParent;
  }

  return {
    x: Math.round(left + width / 2),
    y: Math.round(top + height / 2),
    width,
    height
  };
}

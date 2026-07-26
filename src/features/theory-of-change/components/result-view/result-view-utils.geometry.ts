import type { TdmEdge, TdmNode } from '../../domain/tdm-types';
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


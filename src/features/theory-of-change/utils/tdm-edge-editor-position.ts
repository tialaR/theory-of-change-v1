type FlowPoint = {
  x: number;
  y: number;
};

type EdgeEditorPositionInput = {
  labelX: number;
  labelY: number;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  viewportWidth: number;
  viewportHeight: number;
  transform: readonly [number, number, number];
  editorWidth: number;
  editorHeight: number;
  padding?: number;
};

const DEFAULT_EDITOR_WIDTH = 288;
const DEFAULT_EDITOR_HEIGHT = 176;
const NODE_CLEARANCE_FLOW = 96;

function flowToScreen(point: FlowPoint, transform: readonly [number, number, number]): FlowPoint {
  const [viewportX, viewportY, zoom] = transform;
  return {
    x: point.x * zoom + viewportX,
    y: point.y * zoom + viewportY
  };
}

function screenToFlow(point: FlowPoint, transform: readonly [number, number, number]): FlowPoint {
  const [viewportX, viewportY, zoom] = transform;
  return {
    x: (point.x - viewportX) / zoom,
    y: (point.y - viewportY) / zoom
  };
}

function clampScreenPoint(
  point: FlowPoint,
  viewportWidth: number,
  viewportHeight: number,
  editorWidth: number,
  editorHeight: number,
  padding: number
): FlowPoint {
  const halfWidth = editorWidth / 2;
  const halfHeight = editorHeight / 2;

  return {
    x: Math.max(padding + halfWidth, Math.min(viewportWidth - padding - halfWidth, point.x)),
    y: Math.max(padding + halfHeight, Math.min(viewportHeight - padding - halfHeight, point.y))
  };
}

function minDistanceToEndpoints(point: FlowPoint, source: FlowPoint, target: FlowPoint): number {
  return Math.min(
    Math.hypot(point.x - source.x, point.y - source.y),
    Math.hypot(point.x - target.x, point.y - target.y)
  );
}

export function computeEdgeEditorPosition({
  labelX,
  labelY,
  sourceX,
  sourceY,
  targetX,
  targetY,
  viewportWidth,
  viewportHeight,
  transform,
  editorWidth = DEFAULT_EDITOR_WIDTH,
  editorHeight = DEFAULT_EDITOR_HEIGHT,
  padding = 20
}: EdgeEditorPositionInput): FlowPoint {
  const midpoint = { x: labelX, y: labelY };
  const source = { x: sourceX, y: sourceY };
  const target = { x: targetX, y: targetY };
  const [, , zoom] = transform;
  const offsetFlow = 52 / Math.max(zoom, 0.35);

  const deltaX = target.x - source.x;
  const deltaY = target.y - source.y;
  const length = Math.hypot(deltaX, deltaY) || 1;
  const perpX = -deltaY / length;
  const perpY = deltaX / length;

  const candidates: FlowPoint[] = [
    { x: midpoint.x + perpX * offsetFlow, y: midpoint.y + perpY * offsetFlow },
    { x: midpoint.x - perpX * offsetFlow, y: midpoint.y - perpY * offsetFlow },
    { x: midpoint.x, y: midpoint.y - offsetFlow * 0.85 },
    { x: midpoint.x, y: midpoint.y + offsetFlow * 0.85 }
  ];

  const rankedCandidates = candidates
    .map((candidate) => ({
      candidate,
      endpointDistance: minDistanceToEndpoints(candidate, source, target)
    }))
    .sort((left, right) => right.endpointDistance - left.endpointDistance);

  const preferred =
    rankedCandidates.find((entry) => entry.endpointDistance >= NODE_CLEARANCE_FLOW)?.candidate ??
    rankedCandidates[0]?.candidate ??
    midpoint;

  const clampedScreen = clampScreenPoint(
    flowToScreen(preferred, transform),
    viewportWidth,
    viewportHeight,
    editorWidth,
    editorHeight,
    padding
  );

  return screenToFlow(clampedScreen, transform);
}

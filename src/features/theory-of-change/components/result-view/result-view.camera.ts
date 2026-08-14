import { RESULT_ZOOM } from './result-view.constants';
import { roundZoom } from './result-view-utils';

/** Translator camera policy — overview / scoped / manual. */
export type ResultCameraMode = 'overview' | 'scoped' | 'manual';

export type ResultCameraState = {
  zoom: number;
  translateX: number;
  translateY: number;
};

export type FlowBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type CameraAnchor = {
  x: number;
  y: number;
};

export const RESULT_CAMERA_INITIAL: ResultCameraState = {
  zoom: RESULT_ZOOM.initial,
  translateX: 0,
  translateY: 0
};

/** Balanced visual padding inside the main pane (top ≈ bottom, left ≈ right). */
export const RESULT_CAMERA_PADDING = {
  overview: 32,
  scoped: 36
} as const;

/** Subpixel tolerance — skip setState when camera / bounds barely moved. */
export const RESULT_CAMERA_EPSILON = 0.01;

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function nearlyEqual(a: number, b: number, epsilon = RESULT_CAMERA_EPSILON): boolean {
  return Math.abs(a - b) <= epsilon;
}

export function camerasNearlyEqual(
  a: ResultCameraState,
  b: ResultCameraState,
  epsilon = RESULT_CAMERA_EPSILON
): boolean {
  return (
    nearlyEqual(a.zoom, b.zoom, epsilon) &&
    nearlyEqual(a.translateX, b.translateX, epsilon) &&
    nearlyEqual(a.translateY, b.translateY, epsilon)
  );
}

export function isValidFlowBounds(bounds: FlowBounds | null | undefined): bounds is FlowBounds {
  if (!bounds) {
    return false;
  }

  return (
    isFiniteNumber(bounds.left) &&
    isFiniteNumber(bounds.top) &&
    isFiniteNumber(bounds.right) &&
    isFiniteNumber(bounds.bottom) &&
    bounds.right > bounds.left &&
    bounds.bottom > bounds.top
  );
}

export function flowBoundsCenter(bounds: FlowBounds): { centerX: number; centerY: number } {
  return {
    centerX: (bounds.left + bounds.right) / 2,
    centerY: (bounds.top + bounds.bottom) / 2
  };
}

export function flowBoundsSize(bounds: FlowBounds): { width: number; height: number } {
  return {
    width: Math.max(bounds.right - bounds.left, 1),
    height: Math.max(bounds.bottom - bounds.top, 1)
  };
}

function roundCamera(camera: ResultCameraState): ResultCameraState {
  return {
    zoom: roundZoom(camera.zoom),
    translateX: Number.isFinite(camera.translateX) ? Math.round(camera.translateX) : 0,
    translateY: Number.isFinite(camera.translateY) ? Math.round(camera.translateY) : 0
  };
}

/**
 * Fits content bounds into the main-pane viewport via camera only.
 * Bounds must be in the scaler's layout space (transform target).
 * Scaler uses transform-origin: center top.
 */
export function computeCameraFit(options: {
  bounds: FlowBounds;
  viewportWidth: number;
  viewportHeight: number;
  scalerWidth: number;
  padding?: number;
  current?: ResultCameraState;
  /** When true, may go below RESULT_ZOOM.min down to RESULT_ZOOM.fitMin. */
  allowFitMin?: boolean;
}): ResultCameraState {
  const {
    bounds,
    viewportWidth,
    viewportHeight,
    scalerWidth,
    padding = RESULT_CAMERA_PADDING.overview,
    current = RESULT_CAMERA_INITIAL,
    allowFitMin = true
  } = options;

  if (!isValidFlowBounds(bounds) || viewportWidth <= 0 || viewportHeight <= 0 || scalerWidth <= 0) {
    return { ...current };
  }

  const { width: contentWidth, height: contentHeight } = flowBoundsSize(bounds);
  const availableWidth = Math.max(viewportWidth - padding * 2, 120);
  const availableHeight = Math.max(viewportHeight - padding * 2, 120);

  const fitScale = Math.min(availableWidth / contentWidth, availableHeight / contentHeight);
  const zoomFloor = allowFitMin ? RESULT_ZOOM.fitMin : RESULT_ZOOM.min;
  const nextZoom = roundZoom(Math.max(zoomFloor, Math.min(RESULT_ZOOM.max, fitScale)));

  const { centerX: contentCenterX, centerY: contentCenterY } = flowBoundsCenter(bounds);

  // transform-origin: center top on the scaler element
  const originX = scalerWidth / 2;
  const scaledCenterX = originX + (contentCenterX - originX) * nextZoom;
  const scaledCenterY = contentCenterY * nextZoom;

  const availableCenterX = viewportWidth / 2;
  const availableCenterY = viewportHeight / 2;
  const translateX = availableCenterX - scaledCenterX;
  const translateY = availableCenterY - scaledCenterY;

  return roundCamera({
    zoom: nextZoom,
    translateX,
    translateY
  });
}

/**
 * Zoom while keeping a viewport point fixed on the same world point.
 * Compatible with transform-origin: center top + translate after scale.
 *
 *   worldX = originX + (anchorX - translateX - originX) / previousScale
 *   worldY = (anchorY - translateY) / previousScale
 *   nextX  = anchorX - originX - (worldX - originX) * nextScale
 *   nextY  = anchorY - worldY * nextScale
 */
export function zoomCameraAt(options: {
  current: ResultCameraState;
  nextZoom: number;
  anchorX: number;
  anchorY: number;
  scalerWidth: number;
}): ResultCameraState {
  const { current, nextZoom, anchorX, anchorY, scalerWidth } = options;
  const previousScale = Math.max(current.zoom, 0.01);
  const nextScale = Math.max(nextZoom, 0.01);

  if (nearlyEqual(previousScale, nextScale) || scalerWidth <= 0) {
    return current;
  }

  const originX = scalerWidth / 2;
  const worldX = originX + (anchorX - current.translateX - originX) / previousScale;
  const worldY = (anchorY - current.translateY) / previousScale;

  const translateX = anchorX - originX - (worldX - originX) * nextScale;
  const translateY = anchorY - worldY * nextScale;

  return {
    zoom: nextScale,
    translateX: Number.isFinite(translateX) ? translateX : current.translateX,
    translateY: Number.isFinite(translateY) ? translateY : current.translateY
  };
}

/**
 * Content-aware clamp after manual zoom/pan.
 * - Content fits → center in the main pane (no empty strip + cut opposite side).
 * - Content overflows → allow navigation but block excessive empty overscroll.
 * Uses allContentBounds (never selectedPathBounds).
 */
export function clampCameraToContent(options: {
  camera: ResultCameraState;
  contentBounds: FlowBounds;
  viewportWidth: number;
  viewportHeight: number;
  scalerWidth: number;
  padding?: number;
}): ResultCameraState {
  const {
    camera,
    contentBounds,
    viewportWidth,
    viewportHeight,
    scalerWidth,
    padding = RESULT_CAMERA_PADDING.overview
  } = options;

  if (
    !isValidFlowBounds(contentBounds) ||
    viewportWidth <= 0 ||
    viewportHeight <= 0 ||
    scalerWidth <= 0
  ) {
    return camera;
  }

  const scale = Math.max(camera.zoom, 0.01);
  const originX = scalerWidth / 2;
  const { width: contentWidth, height: contentHeight } = flowBoundsSize(contentBounds);
  const scaledWidth = contentWidth * scale;
  const scaledHeight = contentHeight * scale;
  const availableWidth = Math.max(viewportWidth - padding * 2, 1);
  const availableHeight = Math.max(viewportHeight - padding * 2, 1);
  const { centerX, centerY } = flowBoundsCenter(contentBounds);

  let translateX = camera.translateX;
  let translateY = camera.translateY;

  if (scaledWidth <= availableWidth) {
    translateX = viewportWidth / 2 - originX - (centerX - originX) * scale;
  } else {
    const maxX = padding - originX - (contentBounds.left - originX) * scale;
    const minX = viewportWidth - padding - originX - (contentBounds.right - originX) * scale;
    translateX = clamp(translateX, Math.min(minX, maxX), Math.max(minX, maxX));
  }

  if (scaledHeight <= availableHeight) {
    translateY = viewportHeight / 2 - centerY * scale;
  } else {
    const maxY = padding - contentBounds.top * scale;
    const minY = viewportHeight - padding - contentBounds.bottom * scale;
    translateY = clamp(translateY, Math.min(minY, maxY), Math.max(minY, maxY));
  }

  return roundCamera({
    zoom: camera.zoom,
    translateX,
    translateY
  });
}

/** @deprecated Prefer computeCameraFit */
export function computeCameraForTranslatorOpen(options: {
  bounds: FlowBounds;
  viewportWidth: number;
  viewportHeight: number;
  scalerWidth: number;
  current: ResultCameraState;
  padding?: number;
}): ResultCameraState {
  return computeCameraFit(options);
}

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getTdmResultAvailabilityMessage } from '@/features/theory-of-change/utils/tdm-result';
import { ResultDiagram } from './result-diagram/result-diagram';
import { ResultEmptyState } from './result-empty-state/result-empty-state';
import { ResultExperienceShell } from './result-experience-shell/result-experience-shell';
import { ResultHeader } from './result-header/result-header';
import { ResultToolbar } from './result-toolbar/result-toolbar';
import { ResultWorkspace } from './result-workspace/result-workspace';
import { ResultTheoryTranslatorPane } from './result-theory-translator/result-theory-translator-pane';
import { buildTheoryTranslatorViewModel } from './result-theory-translator/result-theory-translator.mapper';
import type { TheoryTranslatorSelection } from './result-theory-translator/result-theory-translator.types';
import {
  camerasNearlyEqual,
  clampCameraToContent,
  computeCameraFit,
  nearlyEqual,
  RESULT_CAMERA_INITIAL,
  RESULT_CAMERA_PADDING,
  zoomCameraAt,
  type CameraAnchor,
  type FlowBounds,
  type ResultCameraMode,
  type ResultCameraState
} from './result-view.camera';
import {
  RESULT_HEADER_TITLE_CANVAS,
  RESULT_HEADER_TITLE_EXAMPLE,
  RESULT_ZOOM
} from './result-view.constants';
import type { ResultExperienceProps } from './result-view.types';
import { getLayoutRectRelativeTo, roundZoom } from './result-view-utils';
import { getConnectedFlowFromNode } from './experience/result-experience-data';
import { useTheoryImageExport } from './use-theory-image-export';
import styles from './result-experience.module.sass';

function getOffsetWithin(element: HTMLElement, ancestor: HTMLElement): { left: number; top: number } {
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

  return { left, top };
}

function expandBounds(bounds: FlowBounds, pad: number): FlowBounds {
  return {
    left: bounds.left - pad,
    top: bounds.top - pad,
    right: bounds.right + pad,
    bottom: bounds.bottom + pad
  };
}

function measureNodesInScaler(nodeIds: Set<string>, board: HTMLElement, scaler: HTMLElement): FlowBounds | null {
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  let found = false;
  const boardOffset = getOffsetWithin(board, scaler);

  nodeIds.forEach((nodeId) => {
    const element = board.querySelector<HTMLElement>(`[data-result-node-id="${CSS.escape(nodeId)}"]`);
    if (!element) {
      return;
    }

    const rect = getLayoutRectRelativeTo(element, board);
    if (rect.width < 1 || rect.height < 1) {
      return;
    }

    found = true;
    const nodeLeft = boardOffset.left + rect.x - rect.width / 2;
    const nodeTop = boardOffset.top + rect.y - rect.height / 2;
    const nodeRight = boardOffset.left + rect.x + rect.width / 2;
    const nodeBottom = boardOffset.top + rect.y + rect.height / 2;
    left = Math.min(left, nodeLeft);
    top = Math.min(top, nodeTop);
    right = Math.max(right, nodeRight);
    bottom = Math.max(bottom, nodeBottom);
  });

  if (!found) {
    return null;
  }

  return { left, top, right, bottom };
}

/**
 * Overview bounds: logical union of all four stage columns.
 * Independent of spotlight, opacity, selection, or dimmed visuals.
 */
function measureOverviewBounds(board: HTMLElement, scaler: HTMLElement): FlowBounds | null {
  const columnElements = [...board.querySelectorAll<HTMLElement>('[data-result-column]')];
  if (columnElements.length > 0) {
    let left = Number.POSITIVE_INFINITY;
    let top = Number.POSITIVE_INFINITY;
    let right = Number.NEGATIVE_INFINITY;
    let bottom = Number.NEGATIVE_INFINITY;

    columnElements.forEach((element) => {
      const rect = getLayoutRectRelativeTo(element, scaler);
      if (rect.width < 1 || rect.height < 1) {
        return;
      }
      left = Math.min(left, rect.x - rect.width / 2);
      top = Math.min(top, rect.y - rect.height / 2);
      right = Math.max(right, rect.x + rect.width / 2);
      bottom = Math.max(bottom, rect.y + rect.height / 2);
    });

    if (Number.isFinite(left) && Number.isFinite(right) && right > left && bottom > top) {
      return expandBounds({ left, top, right, bottom }, 24);
    }
  }

  const columns = board.querySelector<HTMLElement>('[data-result-columns="true"]');
  const target = columns ?? board;
  const rect = getLayoutRectRelativeTo(target, scaler);
  if (rect.width < 1 || rect.height < 1) {
    return null;
  }

  return {
    left: rect.x - rect.width / 2,
    top: rect.y - rect.height / 2,
    right: rect.x + rect.width / 2,
    bottom: rect.y + rect.height / 2
  };
}

/** Scoped bounds: only related path nodes (+ padding for R/H markers). */
function measureScopedBounds(
  nodeIds: Set<string>,
  board: HTMLElement,
  scaler: HTMLElement
): FlowBounds | null {
  const rawBounds = measureNodesInScaler(nodeIds, board, scaler);
  if (!rawBounds) {
    return null;
  }
  return expandBounds(rawBounds, 28);
}

function readViewportMetrics(): {
  viewport: HTMLElement;
  board: HTMLElement;
  scaler: HTMLElement;
  viewportWidth: number;
  viewportHeight: number;
  scalerWidth: number;
} | null {
  const mainPane = document.querySelector<HTMLElement>('[data-result-main-pane="true"]');
  const viewport = mainPane?.querySelector<HTMLElement>('[data-result-viewport="true"]');
  const board = mainPane?.querySelector<HTMLElement>('[data-result-board="true"]');
  const scaler = mainPane?.querySelector<HTMLElement>('[data-result-scaler="true"]');
  if (!viewport || !board || !scaler) {
    return null;
  }

  const scalerWidth = scaler.offsetWidth || lockedFallbackWidth(scaler);
  if (scalerWidth <= 0 || viewport.clientWidth <= 0 || viewport.clientHeight <= 0) {
    return null;
  }

  return {
    viewport,
    board,
    scaler,
    viewportWidth: viewport.clientWidth,
    viewportHeight: viewport.clientHeight,
    scalerWidth
  };
}

function lockedFallbackWidth(scaler: HTMLElement): number {
  const locked = scaler.style.width ? Number.parseFloat(scaler.style.width) : NaN;
  return Number.isFinite(locked) ? locked : 0;
}

export function ResultExperience({
  viewModel,
  mode = 'example',
  headerTitle,
  backHref,
  closeHref,
  backLabel = 'Voltar',
  onBack,
  onClose,
  headerAccessory
}: ResultExperienceProps) {
  const { nodes, edges } = viewModel;
  const [selection, setSelection] = useState<TheoryTranslatorSelection | null>(null);
  const [isTranslatorExpanded, setIsTranslatorExpanded] = useState(false);
  const [camera, setCamera] = useState<ResultCameraState>(RESULT_CAMERA_INITIAL);
  const [cameraMode, setCameraMode] = useState<ResultCameraMode>('manual');
  const [isZooming, setIsZooming] = useState(false);
  const [highlightMarkerId, setHighlightMarkerId] = useState<string | null>(null);
  const cameraBeforeOpenRef = useRef<ResultCameraState | null>(null);
  const cameraModeRef = useRef<ResultCameraMode>('manual');
  const pendingFitRef = useRef<'overview' | 'scoped' | null>(null);
  const lastFittedSelectionRef = useRef<string | null>(null);
  const lockedContentWidthRef = useRef<number | null>(null);
  const [lockedContentWidth, setLockedContentWidth] = useState<number | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const highlightGenerationRef = useRef(0);
  const markerClickLockRef = useRef(false);
  const highlightProtectUntilRef = useRef(0);
  const pendingHighlightRef = useRef<string | null>(null);
  const fitRafRef = useRef<number | null>(null);
  const paneReadyRef = useRef(false);

  const setCameraModeSafe = useCallback((next: ResultCameraMode) => {
    cameraModeRef.current = next;
    setCameraMode(next);
  }, []);

  const clearHighlight = useCallback(() => {
    if (Date.now() < highlightProtectUntilRef.current) {
      return;
    }
    pendingHighlightRef.current = null;
    setHighlightMarkerId(null);
  }, []);

  const resolvedTitle =
    headerTitle ?? (mode === 'canvas-preview' ? RESULT_HEADER_TITLE_CANVAS : RESULT_HEADER_TITLE_EXAMPLE);
  const resolvedBackHref = mode === 'example' ? (backHref ?? '/exemplos/resultado') : backHref;
  const resolvedCloseHref = mode === 'example' ? (closeHref ?? '/exemplos/resultado') : closeHref;
  const resolvedClose = onClose ?? onBack;
  const {
    exportRootRef,
    handleExportImage,
    isExportingImage,
    exportingImageFormat,
    exportImageError
  } = useTheoryImageExport({
    theoryTitle: viewModel.title,
    nodes,
    edgeCount: edges.length,
    preferMountedReactFlow: mode === 'canvas-preview'
  });

  const selectedNodeId = selection?.type === 'node' ? selection.id : null;
  const selectedEdgeId = selection?.type === 'edge' ? selection.id : null;

  const flow = useMemo(() => {
    if (selection?.type === 'edge') {
      const edge = edges.find((item) => item.id === selection.id);
      if (!edge) {
        return { nodeIds: new Set<string>(), edgeIds: new Set<string>() };
      }

      return {
        nodeIds: new Set([edge.source, edge.target]),
        edgeIds: new Set([edge.id])
      };
    }

    return getConnectedFlowFromNode(selectedNodeId, edges);
  }, [edges, selectedNodeId, selection]);

  const translatorViewModel = useMemo(
    () => buildTheoryTranslatorViewModel(selection, nodes, edges),
    [edges, nodes, selection]
  );

  const hasResult = nodes.length > 0;
  const emptyMessage = getTdmResultAvailabilityMessage(nodes, edges);

  useEffect(() => {
    document.body.classList.add('public-page-scroll');
    return () => document.body.classList.remove('public-page-scroll');
  }, []);

  useEffect(() => {
    if (
      Date.now() < highlightProtectUntilRef.current &&
      pendingHighlightRef.current &&
      highlightMarkerId !== pendingHighlightRef.current
    ) {
      setHighlightMarkerId(pendingHighlightRef.current);
    }
  }, [highlightMarkerId, selection]);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  const markManualCamera = useCallback(() => {
    if (!isTranslatorExpanded) {
      return;
    }
    setCameraModeSafe('manual');
  }, [isTranslatorExpanded, setCameraModeSafe]);

  const resetViewportScroll = useCallback(() => {
    const metrics = readViewportMetrics();
    if (metrics) {
      metrics.viewport.scrollTop = 0;
      metrics.viewport.scrollLeft = 0;
    }
  }, []);

  /**
   * Manual zoom: one contract — scale + translate together, anchored, then
   * content-aware clamp on allContentBounds. Never leaves scoped translate stuck.
   */
  const setZoomSafely = useCallback(
    (next: number | ((current: number) => number), anchor?: CameraAnchor) => {
      const metrics = readViewportMetrics();

      setCamera((current) => {
        const raw = typeof next === 'function' ? next(current.zoom) : next;
        // Supporting pane narrows the main pane: manual zoom must reach fitMin
        // so the four columns can reappear without requiring reset.
        const floor = isTranslatorExpanded ? RESULT_ZOOM.fitMin : RESULT_ZOOM.min;
        const value = roundZoom(Math.min(RESULT_ZOOM.max, Math.max(floor, raw)));
        if (nearlyEqual(value, current.zoom)) {
          return current;
        }

        setIsZooming(true);
        if (isTranslatorExpanded) {
          cameraModeRef.current = 'manual';
          setCameraMode('manual');
        }

        if (!metrics) {
          return { ...current, zoom: value };
        }

        const anchorX = anchor?.x ?? metrics.viewportWidth / 2;
        const anchorY = anchor?.y ?? metrics.viewportHeight / 2;
        const zoomed = zoomCameraAt({
          current,
          nextZoom: value,
          anchorX,
          anchorY,
          scalerWidth: metrics.scalerWidth
        });

        // Clamp against full theory bounds — never selectedPathBounds.
        const allContentBounds = measureOverviewBounds(metrics.board, metrics.scaler);
        if (!allContentBounds) {
          return {
            zoom: roundZoom(zoomed.zoom),
            translateX: Math.round(zoomed.translateX),
            translateY: Math.round(zoomed.translateY)
          };
        }

        const clamped = clampCameraToContent({
          camera: zoomed,
          contentBounds: allContentBounds,
          viewportWidth: metrics.viewportWidth,
          viewportHeight: metrics.viewportHeight,
          scalerWidth: metrics.scalerWidth,
          padding: RESULT_CAMERA_PADDING.overview
        });

        if (camerasNearlyEqual(clamped, current)) {
          return current;
        }

        return clamped;
      });

      // Keep scroll offsets from fighting transform position in the same gesture.
      resetViewportScroll();
    },
    [isTranslatorExpanded, resetViewportScroll]
  );

  /** Re-apply content clamp after viewport resize (supporting pane settle / window). */
  const reclampManualCamera = useCallback(() => {
    if (cameraModeRef.current !== 'manual' || !paneReadyRef.current) {
      return;
    }

    const metrics = readViewportMetrics();
    if (!metrics) {
      return;
    }

    const allContentBounds = measureOverviewBounds(metrics.board, metrics.scaler);
    if (!allContentBounds) {
      return;
    }

    setCamera((current) => {
      const clamped = clampCameraToContent({
        camera: current,
        contentBounds: allContentBounds,
        viewportWidth: metrics.viewportWidth,
        viewportHeight: metrics.viewportHeight,
        scalerWidth: metrics.scalerWidth,
        padding: RESULT_CAMERA_PADDING.overview
      });
      if (camerasNearlyEqual(clamped, current)) {
        return current;
      }
      return clamped;
    });
    resetViewportScroll();
  }, [resetViewportScroll]);

  const fitCameraOverview = useCallback(() => {
    const metrics = readViewportMetrics();
    if (!metrics) {
      return false;
    }

    const bounds = measureOverviewBounds(metrics.board, metrics.scaler);
    if (!bounds) {
      return false;
    }

    setIsZooming(true);
    setCameraModeSafe('overview');
    resetViewportScroll();
    setCamera((current) =>
      computeCameraFit({
        bounds,
        viewportWidth: metrics.viewportWidth,
        viewportHeight: metrics.viewportHeight,
        scalerWidth: metrics.scalerWidth,
        padding: RESULT_CAMERA_PADDING.overview,
        current,
        allowFitMin: true
      })
    );
    return true;
  }, [resetViewportScroll, setCameraModeSafe]);

  const fitCameraScoped = useCallback(() => {
    const metrics = readViewportMetrics();
    if (!metrics || flow.nodeIds.size === 0) {
      return false;
    }

    const bounds = measureScopedBounds(flow.nodeIds, metrics.board, metrics.scaler);
    if (!bounds) {
      return false;
    }

    setIsZooming(true);
    setCameraModeSafe('scoped');
    resetViewportScroll();
    setCamera((current) =>
      computeCameraFit({
        bounds,
        viewportWidth: metrics.viewportWidth,
        viewportHeight: metrics.viewportHeight,
        scalerWidth: metrics.scalerWidth,
        padding: RESULT_CAMERA_PADDING.scoped,
        current,
        allowFitMin: true
      })
    );
    return true;
  }, [flow.nodeIds, resetViewportScroll, setCameraModeSafe]);

  const runPendingFit = useCallback(() => {
    const pending = pendingFitRef.current;
    if (!pending || !isTranslatorExpanded) {
      return;
    }

    if (fitRafRef.current != null) {
      window.cancelAnimationFrame(fitRafRef.current);
      fitRafRef.current = null;
    }

    // Double rAF: wait for layout after supporting-pane width settles.
    fitRafRef.current = window.requestAnimationFrame(() => {
      fitRafRef.current = window.requestAnimationFrame(() => {
        fitRafRef.current = null;
        const mode = pendingFitRef.current;
        if (!mode || !isTranslatorExpanded) {
          return;
        }

        const ok = mode === 'overview' ? fitCameraOverview() : fitCameraScoped();
        if (ok) {
          pendingFitRef.current = null;
        }
      });
    });
  }, [fitCameraOverview, fitCameraScoped, isTranslatorExpanded]);

  const requestFit = useCallback(
    (mode: 'overview' | 'scoped') => {
      pendingFitRef.current = mode;
      // Fit only after the supporting pane width has settled (or when already open).
      if (paneReadyRef.current) {
        runPendingFit();
      }
    },
    [runPendingFit]
  );

  const clearSelectionKeepTranslator = useCallback(() => {
    highlightProtectUntilRef.current = 0;
    highlightGenerationRef.current += 1;
    pendingHighlightRef.current = null;
    if (highlightTimerRef.current) {
      window.clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
    setSelection(null);
    setHighlightMarkerId(null);
    lastFittedSelectionRef.current = 'macro';
    if (isTranslatorExpanded) {
      requestFit('overview');
    }
  }, [isTranslatorExpanded, requestFit]);

  const clearSelection = useCallback(() => {
    clearSelectionKeepTranslator();
    setIsTranslatorExpanded(false);
    pendingFitRef.current = null;
    paneReadyRef.current = false;
    setCameraModeSafe('manual');
  }, [clearSelectionKeepTranslator, setCameraModeSafe]);

  const resetView = useCallback(() => {
    setIsZooming(true);
    setCamera(RESULT_CAMERA_INITIAL);
    cameraBeforeOpenRef.current = null;
    pendingFitRef.current = null;
    paneReadyRef.current = false;
    setCameraModeSafe('manual');
    clearSelection();
  }, [clearSelection, setCameraModeSafe]);

  const handleZoomAnimationComplete = useCallback(() => {
    setIsZooming(false);
  }, []);

  const handleTranslatorLayoutComplete = useCallback(() => {
    if (!isTranslatorExpanded) {
      paneReadyRef.current = false;
      return;
    }
    paneReadyRef.current = true;
    // Pending scoped/overview fit takes priority; otherwise reclamp manual camera
    // against the settled main-pane width (never reuse pre-pane dimensions).
    if (pendingFitRef.current) {
      runPendingFit();
      return;
    }
    reclampManualCamera();
  }, [isTranslatorExpanded, reclampManualCamera, runPendingFit]);

  const captureLayoutWidth = useCallback(() => {
    const scaler = document.querySelector<HTMLElement>('[data-result-scaler="true"]');
    if (!scaler) {
      return;
    }

    const width = Math.ceil(scaler.getBoundingClientRect().width / Math.max(camera.zoom, 0.01));
    if (width > 0) {
      lockedContentWidthRef.current = width;
      setLockedContentWidth(width);
    }
  }, [camera.zoom]);

  const openTranslator = useCallback(
    (fitMode: 'overview' | 'scoped') => {
      if (!isTranslatorExpanded) {
        cameraBeforeOpenRef.current = {
          zoom: camera.zoom,
          translateX: camera.translateX,
          translateY: camera.translateY
        };
        captureLayoutWidth();
        paneReadyRef.current = false;
        setIsTranslatorExpanded(true);
        requestFit(fitMode);
        return;
      }

      requestFit(fitMode);
    },
    [camera, captureLayoutWidth, isTranslatorExpanded, requestFit]
  );

  const handleExpandTranslator = useCallback(() => {
    // Rail open without selection → macro + overview.
    openTranslator(selection ? 'scoped' : 'overview');
  }, [openTranslator, selection]);

  const handleCollapseTranslator = useCallback(() => {
    highlightProtectUntilRef.current = 0;
    highlightGenerationRef.current += 1;
    pendingHighlightRef.current = null;
    if (highlightTimerRef.current) {
      window.clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
    setIsTranslatorExpanded(false);
    setHighlightMarkerId(null);
    setLockedContentWidth(null);
    lockedContentWidthRef.current = null;
    pendingFitRef.current = null;
    paneReadyRef.current = false;
    lastFittedSelectionRef.current = null;
    const previous = cameraBeforeOpenRef.current;
    if (previous) {
      setIsZooming(true);
      setCamera(previous);
      cameraBeforeOpenRef.current = null;
    }
    setCameraModeSafe('manual');
  }, [setCameraModeSafe]);

  const handleSelectNode = useCallback(
    (nodeId: string) => {
      if (markerClickLockRef.current) {
        return;
      }

      const isToggleOff = selection?.type === 'node' && selection.id === nodeId;
      clearHighlight();

      if (isToggleOff) {
        // Clear selection → macro + overview; Tradutor stays open.
        if (isTranslatorExpanded) {
          clearSelectionKeepTranslator();
          return;
        }
        setSelection(null);
        return;
      }

      lastFittedSelectionRef.current = null;
      setSelection({ type: 'node', id: nodeId });
      openTranslator('scoped');
    },
    [
      clearHighlight,
      clearSelectionKeepTranslator,
      isTranslatorExpanded,
      openTranslator,
      selection
    ]
  );

  const handleSelectEdge = useCallback(
    (edgeId: string) => {
      if (markerClickLockRef.current) {
        return;
      }

      const isToggleOff = selection?.type === 'edge' && selection.id === edgeId;
      clearHighlight();

      if (isToggleOff) {
        if (isTranslatorExpanded) {
          clearSelectionKeepTranslator();
          return;
        }
        setSelection(null);
        return;
      }

      lastFittedSelectionRef.current = null;
      setSelection({ type: 'edge', id: edgeId });
      openTranslator('scoped');
    },
    [
      clearHighlight,
      clearSelectionKeepTranslator,
      isTranslatorExpanded,
      openTranslator,
      selection
    ]
  );

  const handleSelectMarker = useCallback(
    (edgeId: string, markerId: string) => {
      markerClickLockRef.current = true;
      highlightProtectUntilRef.current = Date.now() + 500;
      const generation = highlightGenerationRef.current + 1;
      highlightGenerationRef.current = generation;
      const token = `${markerId}::${generation}`;
      pendingHighlightRef.current = token;
      lastFittedSelectionRef.current = null;
      setSelection({ type: 'edge', id: edgeId });
      setHighlightMarkerId(token);
      openTranslator('scoped');

      const blockTrailingGesture = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
      };
      window.addEventListener('pointerup', blockTrailingGesture, true);
      window.addEventListener('mouseup', blockTrailingGesture, true);
      window.addEventListener('click', blockTrailingGesture, true);
      window.setTimeout(() => {
        window.removeEventListener('pointerup', blockTrailingGesture, true);
        window.removeEventListener('mouseup', blockTrailingGesture, true);
        window.removeEventListener('click', blockTrailingGesture, true);
        markerClickLockRef.current = false;
        highlightProtectUntilRef.current = 0;
      }, 400);
    },
    [openTranslator]
  );

  useEffect(() => {
    highlightGenerationRef.current += 1;
    return () => {
      highlightGenerationRef.current += 1;
      if (highlightTimerRef.current) {
        window.clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = null;
      }
      if (fitRafRef.current != null) {
        window.cancelAnimationFrame(fitRafRef.current);
        fitRafRef.current = null;
      }
    };
  }, []);

  // Camera policy while Tradutor is open:
  // - no selection → overview (macro)
  // - explicit selection change → scoped (even after manual)
  // - manual zoom/pan → manual until next explicit selection
  useEffect(() => {
    if (!isTranslatorExpanded) {
      return;
    }

    const selectionKey = selection ? `${selection.type}:${selection.id}` : 'macro';
    if (selectionKey === lastFittedSelectionRef.current) {
      return;
    }

    lastFittedSelectionRef.current = selectionKey;
    requestFit(selection ? 'scoped' : 'overview');
  }, [isTranslatorExpanded, requestFit, selection]);

  // Remeasure main-pane viewport after supporting-pane width settles.
  // Manual mode only: never re-run scoped fit from ResizeObserver.
  useEffect(() => {
    if (!isTranslatorExpanded || typeof ResizeObserver === 'undefined') {
      return;
    }

    const mainPane = document.querySelector<HTMLElement>('[data-result-main-pane="true"]');
    if (!mainPane) {
      return;
    }

    let lastWidth = 0;
    let lastHeight = 0;
    let rafOuter: number | null = null;
    let rafInner: number | null = null;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const { width, height } = entry.contentRect;
      if (nearlyEqual(width, lastWidth) && nearlyEqual(height, lastHeight)) {
        return;
      }

      if (rafOuter != null) {
        window.cancelAnimationFrame(rafOuter);
      }
      if (rafInner != null) {
        window.cancelAnimationFrame(rafInner);
        rafInner = null;
      }

      // Double rAF: wait for layout after pane animation frame, not every tween tick.
      rafOuter = window.requestAnimationFrame(() => {
        rafOuter = null;
        rafInner = window.requestAnimationFrame(() => {
          rafInner = null;
          if (nearlyEqual(width, lastWidth) && nearlyEqual(height, lastHeight)) {
            return;
          }
          lastWidth = width;
          lastHeight = height;

          if (!paneReadyRef.current || cameraModeRef.current !== 'manual') {
            return;
          }
          if (pendingFitRef.current) {
            return;
          }
          reclampManualCamera();
        });
      });
    });

    observer.observe(mainPane);
    return () => {
      observer.disconnect();
      if (rafOuter != null) {
        window.cancelAnimationFrame(rafOuter);
      }
      if (rafInner != null) {
        window.cancelAnimationFrame(rafInner);
      }
    };
  }, [isTranslatorExpanded, reclampManualCamera]);


  return (
    <main
      ref={exportRootRef}
      className={styles.page}
      data-result-mode={mode}
      data-zooming={isZooming ? 'true' : 'false'}
      data-camera-mode={cameraMode}
    >
      <div className={styles.frame}>
        <ResultHeader
          title={resolvedTitle}
          backHref={resolvedBackHref}
          backLabel={backLabel}
          onBack={onBack ?? resolvedClose}
          actions={
            <>
              <ResultToolbar
                zoom={camera.zoom}
              onZoomIn={() => setZoomSafely((value) => value + RESULT_ZOOM.step)}
              onZoomOut={() => setZoomSafely((value) => value - RESULT_ZOOM.step)}
              onCenter={() => {
                setIsZooming(true);
                markManualCamera();
                setCamera((current) => ({
                  ...current,
                  zoom: RESULT_ZOOM.initial,
                  translateX: 0,
                  translateY: 0
                }));
              }}
              onReset={resetView}
              closeHref={resolvedCloseHref}
              onClose={resolvedClose}
              onExportImage={hasResult ? handleExportImage : undefined}
              exportImageHeading={
                selection
                  ? 'EXPORTAR IMAGEM DO FLUXO SELECIONADO'
                  : 'EXPORTAR IMAGEM DA TEORIA COMPLETA'
              }
              isExportingImage={isExportingImage}
                exportingImageFormat={exportingImageFormat}
                exportImageError={exportImageError}
              />
              {headerAccessory}
            </>
          }
        />

        <section className={styles.shell}>
          {!hasResult ? (
            <ResultEmptyState
              message={emptyMessage}
              backLabel={backLabel}
              onBack={onBack ?? resolvedClose}
            />
          ) : (
            <ResultExperienceShell
              isTranslatorExpanded={isTranslatorExpanded}
              onTranslatorLayoutComplete={handleTranslatorLayoutComplete}
              main={
                <ResultWorkspace
                  camera={camera}
                  cameraMode={cameraMode}
                  isZooming={isZooming}
                  lockedContentWidth={isTranslatorExpanded ? lockedContentWidth : null}
                  onZoomChange={setZoomSafely}
                  onManualPan={markManualCamera}
                  onCameraAnimationComplete={handleZoomAnimationComplete}
                >
                  <ResultDiagram
                    nodes={nodes}
                    edges={edges}
                    selectedNodeId={selectedNodeId}
                    selectedEdgeId={selectedEdgeId}
                    flow={flow}
                    onSelectNode={handleSelectNode}
                    onSelectEdge={handleSelectEdge}
                    onSelectMarker={handleSelectMarker}
                  />
                </ResultWorkspace>
              }
              translator={
                <ResultTheoryTranslatorPane
                  viewModel={translatorViewModel}
                  theoryTitle={viewModel.title}
                  nodes={nodes}
                  edges={edges}
                  isExpanded={isTranslatorExpanded}
                  highlightMarkerId={highlightMarkerId}
                  onExpand={handleExpandTranslator}
                  onCollapse={handleCollapseTranslator}
                />
              }
            />
          )}
        </section>
      </div>
    </main>
  );
}

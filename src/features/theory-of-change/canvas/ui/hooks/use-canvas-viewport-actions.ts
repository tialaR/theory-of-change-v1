'use client';

import { useCallback, useRef, useState } from 'react';
import type { CanvasViewport } from '../../domain/canvas-project';
import type { CanvasViewportNode, CanvasViewportRuntime } from '../../react-flow/canvas-flow.contracts';
import type { CanvasTranslator } from '../canvas-copy';

type FramingContext = {
  inspectorOpen?: boolean;
  fullCanvasMode?: boolean;
};

type UseCanvasViewportActionsInput = {
  initialViewport?: CanvasViewport;
  nodes: CanvasViewportNode[];
  viewportRuntime: CanvasViewportRuntime;
  inspectorOpen: boolean;
  fullCanvasMode: boolean;
  setInspectorOpen: (open: boolean) => void;
  setHistoryOpen: (open: boolean) => void;
  setFullCanvasMode: (full: boolean) => void;
  markDirty: () => void;
  notify: (message: string) => void;
  t: CanvasTranslator;
};

export function useCanvasViewportActions({
  initialViewport,
  nodes,
  viewportRuntime,
  inspectorOpen,
  fullCanvasMode,
  setInspectorOpen,
  setHistoryOpen,
  setFullCanvasMode,
  markDirty,
  notify,
  t
}: UseCanvasViewportActionsInput) {
  const [viewport, setViewport] = useState<CanvasViewport>(initialViewport ?? { x: 0, y: 0, zoom: 1 });
  const viewportBeforeInspectorRef = useRef<CanvasViewport | null>(null);

  const fitCurrentGraph = useCallback((duration = 520, context: FramingContext = {}) => {
    if (!nodes.length) return;

    const surface = document.querySelector<HTMLElement>('[data-testid="canvas-react-flow-surface"]');
    if (!surface) return;

    const rect = surface.getBoundingClientRect();
    const bounds = viewportRuntime.getNodesBounds(nodes);
    const safeLeft = 104;
    const nextInspectorOpen = context.inspectorOpen ?? inspectorOpen;
    const nextFullCanvasMode = context.fullCanvasMode ?? fullCanvasMode;
    const safeRight = nextInspectorOpen && !nextFullCanvasMode ? 392 : 104;
    const safeTop = nextFullCanvasMode ? 56 : 72;
    const safeBottom = 72;
    const availableWidth = Math.max(240, rect.width - safeLeft - safeRight);
    const availableHeight = Math.max(240, rect.height - safeTop - safeBottom);
    const widthZoom = availableWidth / Math.max(bounds.width, 1);
    const zoom = Math.min(1, Math.max(0.58, widthZoom * 0.9));
    const renderedWidth = bounds.width * zoom;
    const renderedHeight = bounds.height * zoom;
    const x = safeLeft + ((availableWidth - renderedWidth) / 2) - (bounds.x * zoom);
    const y = renderedHeight <= availableHeight
      ? safeTop + ((availableHeight - renderedHeight) / 2) - (bounds.y * zoom)
      : safeTop - (bounds.y * zoom);

    void viewportRuntime.setViewport({ x, y, zoom }, { duration });
  }, [fullCanvasMode, inspectorOpen, nodes, viewportRuntime]);

  const onViewportChange = useCallback((nextViewport: CanvasViewport) => {
    setViewport((current) => {
      const unchanged = current.x === nextViewport.x
        && current.y === nextViewport.y
        && current.zoom === nextViewport.zoom;
      return unchanged ? current : nextViewport;
    });
    markDirty();
  }, [markDirty]);

  const frameVisualization = useCallback(() => {
    if (!nodes.length) {
      void viewportRuntime.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 260 });
      notify(t('notices.viewCentered'));
      return;
    }
    fitCurrentGraph(560);
    notify(t('notices.viewFramed'));
  }, [fitCurrentGraph, nodes.length, notify, viewportRuntime, t]);

  const openInspector = useCallback(() => {
    if (!inspectorOpen) viewportBeforeInspectorRef.current = { ...viewportRuntime.getViewport() };
    setInspectorOpen(true);
    window.setTimeout(() => fitCurrentGraph(520, { inspectorOpen: true, fullCanvasMode: false }), 500);
  }, [fitCurrentGraph, inspectorOpen, viewportRuntime, setInspectorOpen]);

  const closeInspector = useCallback(() => {
    setInspectorOpen(false);
    const previousViewport = viewportBeforeInspectorRef.current;
    viewportBeforeInspectorRef.current = null;
    if (previousViewport) void viewportRuntime.setViewport(previousViewport, { duration: 460 });
  }, [viewportRuntime, setInspectorOpen]);

  const setCanvasMode = useCallback((nextFullCanvasMode: boolean) => {
    setFullCanvasMode(nextFullCanvasMode);
    setHistoryOpen(false);
    if (nextFullCanvasMode) setInspectorOpen(false);
    window.setTimeout(() => {
      fitCurrentGraph(520, { inspectorOpen: false, fullCanvasMode: nextFullCanvasMode });
    }, 320);
  }, [fitCurrentGraph, setFullCanvasMode, setHistoryOpen, setInspectorOpen]);

  return {
    viewport,
    onViewportChange,
    fitCurrentGraph,
    frameVisualization,
    openInspector,
    closeInspector,
    enterFullCanvas: () => setCanvasMode(true),
    exitFullCanvas: () => setCanvasMode(false),
    zoomIn: () => viewportRuntime.zoomIn({ duration: 180 }),
    zoomOut: () => viewportRuntime.zoomOut({ duration: 180 })
  };
}

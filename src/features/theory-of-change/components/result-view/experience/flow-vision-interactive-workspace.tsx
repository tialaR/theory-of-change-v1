'use client';

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { TdmEdge, TdmNode } from '../../../domain/tdm-types';
import type { ResultExperienceProps } from './types';
import { InteractiveExperienceShell } from './interactive-experience-shell';
import { FlowVisionDiagram } from './flow-vision-diagram';
import { getConnectedFlowFromNode, getFlowMarkerTexts, getFlowPathSummary } from './result-experience-data';
import { FlowTranslatorCard } from './flow-translator-card';
import shellStyles from './result-experience.module.sass';
import styles from './flow-vision-interactive.module.sass';

const ease = [0.22, 1, 0.36, 1] as const;
const INITIAL_ZOOM = 1;
const HEADER_TITLE = 'TMD - FLUXO EXEMPLO';

type PanOffset = { x: number; y: number };

type DragState = {
  dragging: boolean;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

function getNodeTitle(nodeId: string, nodes: TdmNode[]) {
  return nodes.find((node) => node.id === nodeId)?.title ?? 'Elemento';
}

function getConnectionTitles(nodeId: string, edges: TdmEdge[], nodes: TdmNode[], direction: 'in' | 'out') {
  const relatedEdges =
    direction === 'in'
      ? edges.filter((edge) => edge.target === nodeId)
      : edges.filter((edge) => edge.source === nodeId);

  return relatedEdges.map((edge) =>
    direction === 'in' ? getNodeTitle(edge.source, nodes) : getNodeTitle(edge.target, nodes)
  );
}

function computeCenteredPan(viewport: HTMLElement, flow: HTMLElement, zoom: number): PanOffset {
  const x = (viewport.clientWidth - flow.scrollWidth * zoom) / 2;
  const y = (viewport.clientHeight - flow.scrollHeight * zoom) / 2;
  return { x, y };
}

export function FlowVisionInteractiveWorkspace({ nodes, edges }: ResultExperienceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [panOffset, setPanOffset] = useState<PanOffset>({ x: 0, y: 0 });
  const reduce = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const centerOffsetRef = useRef<PanOffset>({ x: 0, y: 0 });
  const dragRef = useRef<DragState>({
    dragging: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0
  });

  const flow = useMemo(() => getConnectedFlowFromNode(selectedId, edges), [selectedId, edges]);
  const selectedNode = nodes.find((node) => node.id === selectedId);
  const markerTexts = useMemo(
    () => (selectedId ? getFlowMarkerTexts(selectedId, edges) : { risks: [], hypotheses: [] }),
    [selectedId, edges]
  );
  const flowPath = useMemo(
    () => (selectedId ? getFlowPathSummary(selectedId, nodes, edges) : ''),
    [selectedId, nodes, edges]
  );

  const incomingConnections = useMemo(
    () => (selectedId ? getConnectionTitles(selectedId, edges, nodes, 'in') : []),
    [selectedId, edges, nodes]
  );
  const outgoingConnections = useMemo(
    () => (selectedId ? getConnectionTitles(selectedId, edges, nodes, 'out') : []),
    [selectedId, edges, nodes]
  );

  const updateCenterOffset = useCallback(() => {
    const viewport = viewportRef.current;
    const flow = flowRef.current;
    if (!viewport || !flow) {
      return centerOffsetRef.current;
    }

    const centered = computeCenteredPan(viewport, flow, zoom);
    centerOffsetRef.current = centered;
    return centered;
  }, [zoom]);

  const applyCenteredView = useCallback(() => {
    const centered = updateCenterOffset();
    setPanOffset(centered);
  }, [updateCenterOffset]);

  const hasInitializedRef = useRef(false);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const flow = flowRef.current;
    if (!viewport || !flow) {
      return;
    }

    const syncCenterOffset = () => {
      centerOffsetRef.current = computeCenteredPan(viewport, flow, zoom);
    };

    syncCenterOffset();

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      requestAnimationFrame(() => {
        const centered = computeCenteredPan(viewport, flow, zoom);
        centerOffsetRef.current = centered;
        setPanOffset(centered);
      });
    }

    const observer = new ResizeObserver(() => {
      const centered = computeCenteredPan(viewport, flow, zoom);
      centerOffsetRef.current = centered;

      if (!dragRef.current.dragging) {
        setPanOffset((current) => {
          const isAtCenter =
            Math.abs(current.x - centered.x) < 1.5 && Math.abs(current.y - centered.y) < 1.5;
          return isAtCenter ? centered : current;
        });
      }
    });

    observer.observe(viewport);
    observer.observe(flow);

    return () => observer.disconnect();
  }, [nodes, edges, zoom]);

  const resetView = useCallback(() => {
    setZoom(INITIAL_ZOOM);
    setSelectedId(null);
    requestAnimationFrame(() => {
      const viewport = viewportRef.current;
      const flow = flowRef.current;
      if (!viewport || !flow) {
        setPanOffset({ x: 0, y: 0 });
        return;
      }

      const centered = computeCenteredPan(viewport, flow, INITIAL_ZOOM);
      centerOffsetRef.current = centered;
      setPanOffset(centered);
    });
  }, []);

  const handleCenter = useCallback(() => {
    setZoom(INITIAL_ZOOM);
    requestAnimationFrame(applyCenteredView);
  }, [applyCenteredView]);

  const handleCanvasPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (target.closest('button') || target.closest(`.${styles.flowVisionTranslatorAnchor}`)) {
        return;
      }

      dragRef.current = {
        dragging: true,
        startX: event.clientX,
        startY: event.clientY,
        originX: panOffset.x,
        originY: panOffset.y
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [panOffset.x, panOffset.y]
  );

  const handleCanvasPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging) {
      return;
    }

    setPanOffset({
      x: dragRef.current.originX + (event.clientX - dragRef.current.startX),
      y: dragRef.current.originY + (event.clientY - dragRef.current.startY)
    });
  }, []);

  const handleCanvasPointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current.dragging = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return (
    <InteractiveExperienceShell
      title={HEADER_TITLE}
      backHref="/exemplos/visao-do-fluxo"
      closeHref="/exemplos/visao-do-fluxo"
      zoom={zoom}
      onZoomIn={() => setZoom((value) => Math.min(1.4, Number((value + 0.1).toFixed(2))))}
      onZoomOut={() => setZoom((value) => Math.max(0.74, Number((value - 0.1).toFixed(2))))}
      onCenter={handleCenter}
      onReset={resetView}
      experienceClassName={styles.flowVisionExperience}
    >
      <div className={styles.flowVisionWorkspace}>
        <div
          ref={viewportRef}
          className={`${shellStyles.workspaceViewport} ${styles.flowVisionCanvas}`}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onPointerCancel={handleCanvasPointerUp}
        >
          <motion.div
            ref={flowRef}
            className={`${shellStyles.flowWorkspace} ${styles.flowVisionFlowSurface}`}
            animate={{ x: panOffset.x, y: panOffset.y, scale: zoom }}
            transition={{ duration: reduce ? 0.01 : 0.28, ease }}
          >
            <FlowVisionDiagram
              nodes={nodes}
              edges={edges}
              selectedNodeId={selectedId}
              onSelectNode={setSelectedId}
              zoom={zoom}
            />
          </motion.div>

          <div className={styles.flowVisionTranslatorAnchor}>
            <FlowTranslatorCard
              selectedNode={selectedNode ?? null}
              relatedCount={Math.max(0, flow.nodeIds.size - 1)}
              description={selectedNode?.shortNotes?.trim() || selectedNode?.description || ''}
              markerTexts={markerTexts}
              flowPath={flowPath}
              incomingConnections={incomingConnections}
              outgoingConnections={outgoingConnections}
            />
          </div>
        </div>
      </div>
    </InteractiveExperienceShell>
  );
}

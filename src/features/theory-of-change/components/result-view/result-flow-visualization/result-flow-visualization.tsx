'use client';

import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { TdmEdge, TdmNode } from '../../../domain/tdm-types';
import {
  buildFlowPathDescriptors,
  getEdgeMarkerText,
  getEdgeMarkerType,
  getMarkerHighlightState,
  type FlowPathDescriptor,
  type ResultBridgeKind
} from '../result-view-utils';
import styles from '../result-view.module.sass';

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;
const CONNECTION_DRAW = { duration: 0.4, ease: PREMIUM_EASE };
const MARKER_REVEAL = { duration: 0.28, ease: PREMIUM_EASE };

export function ResultFlowBridge({
  bridgeKind,
  edges,
  nodes,
  highlightedEdgeIds,
  focusedNodeId,
  focusedEdgeId,
  onSelectEdge,
  shouldReduceMotion
}: {
  bridgeKind: ResultBridgeKind;
  edges: TdmEdge[];
  nodes: TdmNode[];
  highlightedEdgeIds: Set<string>;
  focusedNodeId: string | null;
  focusedEdgeId: string | null;
  onSelectEdge: (edgeId: string) => void;
  shouldReduceMotion: boolean | null;
}) {
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const markerLabel = bridgeKind === 'risk' ? 'R' : 'H';
  const markerTitle = bridgeKind === 'risk' ? 'Risco' : 'Hipótese';
  const hasFocus = focusedNodeId !== null || focusedEdgeId !== null;
  const bridgeActive = edges.some((edge) => highlightedEdgeIds.has(edge.id));

  const markedEdges = edges.filter((edge) => {
    const markerType = getEdgeMarkerType(edge);

    if (markerType !== bridgeKind) {
      return false;
    }

    return Boolean(getEdgeMarkerText(edge, bridgeKind)?.trim());
  });

  const visibleEdges = markedEdges.filter((edge) => {
    if (!hasFocus) {
      return false;
    }

    return highlightedEdgeIds.has(edge.id);
  });

  const lineOpacity = bridgeActive ? 0.72 : hasFocus ? 0.08 : 0.14;
  const drawTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.4, ease: PREMIUM_EASE, delay: bridgeActive ? 0.04 : 0 };
  const markerRevealDelay = shouldReduceMotion ? 0 : bridgeActive ? 0.38 : 0.12;

  return (
    <div
      className={[
        styles.flowBridge,
        visibleEdges.length > 0 ? styles.flowBridgeActive : '',
        bridgeActive ? styles.flowBridgeLit : ''
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <svg className={styles.flowBridgeSvg} viewBox="0 0 2 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`bridge-idle-${bridgeKind}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="18%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="82%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id={`bridge-active-${bridgeKind}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="20%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.38)" />
            <stop offset="80%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <motion.line
          x1="1"
          y1="4"
          x2="1"
          y2="96"
          vectorEffect="non-scaling-stroke"
          stroke={`url(#bridge-idle-${bridgeKind})`}
          strokeWidth="1"
          strokeLinecap="round"
          initial={false}
          animate={{ opacity: hasFocus && !bridgeActive ? 0.18 : lineOpacity * 0.72 }}
          transition={shouldReduceMotion ? { duration: 0.01 } : CONNECTION_DRAW}
        />
        <motion.line
          className={styles.flowBridgeLineDrawn}
          x1="1"
          y1="4"
          x2="1"
          y2="96"
          vectorEffect="non-scaling-stroke"
          stroke={`url(#bridge-active-${bridgeKind})`}
          strokeWidth="1.15"
          strokeLinecap="round"
          initial={false}
          animate={{
            pathLength: bridgeActive ? 1 : hasFocus ? 0.28 : 0.58,
            opacity: lineOpacity
          }}
          transition={drawTransition}
        />
      </svg>
      <span className={styles.flowBridgeArrow} aria-hidden="true" />
      <div className={styles.flowBridgeMarkers}>
        <AnimatePresence initial={false}>
          {visibleEdges.map((edge) => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);
            const { isHighlighted, isDimmed } = getMarkerHighlightState(
              edge.id,
              focusedNodeId,
              focusedEdgeId,
              highlightedEdgeIds
            );
            const shouldReveal = isHighlighted;
            const isEdgeFocused = focusedEdgeId === edge.id;

            return (
              <motion.div
                key={edge.id}
                className={styles.markerWrap}
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92, y: 4 }}
                animate={{
                  opacity: isDimmed ? 0.22 : shouldReveal ? 1 : 0,
                  scale: isEdgeFocused ? 1.06 : isHighlighted ? 1 : shouldReveal ? 0.96 : 0.92,
                  y: isEdgeFocused ? -2 : isHighlighted ? 0 : shouldReveal ? 2 : 4
                }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.92, y: 4 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0.01 }
                    : { ...MARKER_REVEAL, delay: shouldReveal && bridgeActive ? markerRevealDelay : 0 }
                }
              >
                <button
                  type="button"
                  className={[
                    styles.markerIconOnly,
                    bridgeKind === 'risk' ? styles.markerIconOnlyRisk : styles.markerIconOnlyHypothesis,
                    isHighlighted ? styles.markerIconOnlyHighlighted : '',
                    isEdgeFocused ? styles.markerIconOnlyFocused : ''
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={`${markerTitle}: ${sourceNode?.title ?? 'origem'} para ${targetNode?.title ?? 'destino'}`}
                  onClick={() => onSelectEdge(edge.id)}
                >
                  {markerLabel}
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function FlowCausalOverlay({
  containerRef,
  columnViewportRefs,
  cardRefs,
  edges,
  focusedNodeId,
  focusedEdgeId,
  relatedEdgeIds,
  onSelectEdge,
  shouldReduceMotion
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  columnViewportRefs: RefObject<Map<string, HTMLElement>>;
  cardRefs: RefObject<Map<string, HTMLElement>>;
  edges: TdmEdge[];
  focusedNodeId: string | null;
  focusedEdgeId: string | null;
  relatedEdgeIds: Set<string>;
  onSelectEdge: (edgeId: string) => void;
  shouldReduceMotion: boolean | null;
}) {
  const [paths, setPaths] = useState<FlowPathDescriptor[]>([]);
  const [viewBox, setViewBox] = useState('0 0 1 1');
  const hasFocus = focusedNodeId !== null || focusedEdgeId !== null;

  const recalculatePaths = useCallback(() => {
    const container = containerRef.current;

    if (!container || !hasFocus || relatedEdgeIds.size === 0) {
      setPaths([]);
      return;
    }

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    if (width <= 0 || height <= 0) {
      return;
    }

    setViewBox(`0 0 ${width} ${height}`);
    setPaths(buildFlowPathDescriptors(relatedEdgeIds, edges, cardRefs.current, container));
  }, [cardRefs, containerRef, edges, hasFocus, relatedEdgeIds]);

  useEffect(() => {
    if (!hasFocus) {
      setPaths([]);
      return;
    }

    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(recalculatePaths);
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [hasFocus, focusedNodeId, focusedEdgeId, relatedEdgeIds, recalculatePaths]);

  useEffect(() => {
    const container = containerRef.current;
    const viewRoot = viewRefForScroll(container);

    if (!container) {
      return;
    }

    const handleLayoutChange = () => {
      window.requestAnimationFrame(recalculatePaths);
    };

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleLayoutChange) : null;
    resizeObserver?.observe(container);

    viewRoot?.addEventListener('scroll', handleLayoutChange, { passive: true });
    window.addEventListener('resize', handleLayoutChange);

    const columnViewports = columnViewportRefs.current;
    const scrollTargets = columnViewports ? [...columnViewports.values()] : [];
    scrollTargets.forEach((element) => {
      element.addEventListener('scroll', handleLayoutChange, { passive: true });
    });

    return () => {
      resizeObserver?.disconnect();
      viewRoot?.removeEventListener('scroll', handleLayoutChange);
      window.removeEventListener('resize', handleLayoutChange);
      scrollTargets.forEach((element) => {
        element.removeEventListener('scroll', handleLayoutChange);
      });
    };
  }, [columnViewportRefs, containerRef, recalculatePaths]);

  if (!hasFocus || paths.length === 0) {
    return null;
  }

  return (
    <svg
      className={styles.flowOverlaySvg}
      viewBox={viewBox}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <marker
          id="flow-arrowhead"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.42)" />
        </marker>
      </defs>
      {paths.map((path) => {
        const drawTransition = shouldReduceMotion
          ? { duration: 0.01 }
          : { ...CONNECTION_DRAW, delay: path.drawDelay };
        const markerDelay = shouldReduceMotion ? 0 : path.drawDelay + 0.34;
        const isEdgeFocused = focusedEdgeId === path.edgeId;
        const pathOpacity = isEdgeFocused ? 1 : 0.88;

        return (
          <g key={path.edgeId} className={styles.flowOverlayGroup}>
            <motion.path
              d={path.d}
              fill="none"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={false}
              animate={{
                pathLength: shouldReduceMotion ? 1 : 1,
                opacity: shouldReduceMotion ? 0.18 : 0.18
              }}
              transition={drawTransition}
            />
            <motion.path
              className={styles.flowOverlayPathHit}
              d={path.d}
              fill="none"
              stroke="transparent"
              strokeWidth="12"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onClick={() => onSelectEdge(path.edgeId)}
            />
            <motion.path
              className={styles.flowOverlayPathActive}
              d={path.d}
              fill="none"
              stroke="rgba(255,255,255,0.52)"
              strokeWidth={isEdgeFocused ? 1.35 : 1.15}
              strokeLinecap="round"
              markerEnd="url(#flow-arrowhead)"
              vectorEffect="non-scaling-stroke"
              initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: shouldReduceMotion ? pathOpacity : pathOpacity
              }}
              transition={drawTransition}
            />
            {path.markerType && path.markerText ? (
              <motion.foreignObject
                x={path.markerPoint.x - 13}
                y={path.markerPoint.y - 13}
                width="26"
                height="26"
                style={{ pointerEvents: 'auto' }}
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={shouldReduceMotion ? { duration: 0.01 } : { ...MARKER_REVEAL, delay: markerDelay }}
              >
                <button
                  type="button"
                  className={[
                    styles.pathMarker,
                    path.markerType === 'risk' ? styles.pathMarkerRisk : styles.pathMarkerHypothesis,
                    isEdgeFocused ? styles.pathMarkerFocused : ''
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={path.markerType === 'risk' ? 'Risco na conexão' : 'Hipótese na conexão'}
                  onClick={() => onSelectEdge(path.edgeId)}
                >
                  <span className={styles.pathMarkerGlyph}>{path.markerType === 'risk' ? 'R' : 'H'}</span>
                </button>
              </motion.foreignObject>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function viewRefForScroll(container: HTMLDivElement | null): HTMLElement | null {
  let current: HTMLElement | null = container;

  while (current) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(style.overflowY)) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
}


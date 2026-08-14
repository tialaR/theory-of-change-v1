'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TdmEdge } from '@/features/theory-of-change/domain/tdm-types';
import { RESULT_MOTION } from '../result-view.constants';
import type { CardRect, ConnectedFlow } from '../result-view.types';
import { buildMeasuredEdgePath, isValidCardRect, isValidMarkerPoint } from '../result-view-utils';
import { getEdgeBadges } from '../experience/result-experience-data';
import styles from './result-connections-layer.module.sass';

type ResultConnectionsLayerProps = {
  edges: TdmEdge[];
  cardRects: Map<string, CardRect>;
  flow: ConnectedFlow;
  hasSelection: boolean;
  selectedEdgeId?: string | null;
  relatedEdgeOrder: Map<string, number>;
  onSelectEdge?: (edgeId: string) => void;
  onSelectMarker?: (edgeId: string, markerId: string) => void;
};

export function ResultConnectionsLayer({
  edges,
  cardRects,
  flow,
  hasSelection,
  selectedEdgeId = null,
  relatedEdgeOrder,
  onSelectEdge,
  onSelectMarker
}: ResultConnectionsLayerProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <svg
      className={styles.overlay}
      aria-hidden={onSelectEdge || onSelectMarker ? undefined : true}
      data-has-marker-handler={onSelectMarker ? 'true' : 'false'}
      data-has-edge-handler={onSelectEdge ? 'true' : 'false'}
    >
      <defs>
        <marker id="tdm-arrow-workspace" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M 0 0 L 6 3 L 0 6 z" fill="rgba(244,247,251,.48)" />
        </marker>
      </defs>
      {edges.map((edge) => {
        const sourceRect = cardRects.get(edge.source);
        const targetRect = cardRects.get(edge.target);
        if (!isValidCardRect(sourceRect) || !isValidCardRect(targetRect)) {
          return null;
        }

        const geometry = buildMeasuredEdgePath(sourceRect, targetRect);
        if (!geometry) {
          return null;
        }

        const isActiveEdge =
          hasSelection &&
          flow.edgeIds.has(edge.id) &&
          flow.nodeIds.has(edge.source) &&
          flow.nodeIds.has(edge.target);
        const isSelectedEdge = selectedEdgeId === edge.id;
        const badgeDetails = isActiveEdge ? getEdgeBadges(edge) : [];
        const edgeDelay = relatedEdgeOrder.get(edge.id) ?? 0;
        const edgeTransitionDelay = isActiveEdge ? edgeDelay * RESULT_MOTION.edgeStagger : 0;
        const edgeOpacity = !hasSelection ? 0 : isActiveEdge ? 1 : 0.28;

        const handleEdgePointer = (event: ReactPointerEvent<SVGGElement>) => {
          const target = event.target as Element | null;
          const markerHit = target?.closest?.('[data-result-marker-hit="true"]');
          const markerId = markerHit?.getAttribute('data-marker-id');
          if (markerId && onSelectMarker) {
            event.preventDefault();
            event.stopPropagation();
            // Keep the gesture on the marker so mouseup/click cannot fall through to cards below.
            if (target && 'setPointerCapture' in target && event.pointerId != null) {
              try {
                (target as Element & { setPointerCapture: (id: number) => void }).setPointerCapture(
                  event.pointerId
                );
              } catch {
                // ignore capture failures on unsupported targets
              }
            }
            onSelectMarker(edge.id, markerId);
            return;
          }

          if (onSelectEdge && target instanceof Element && target.classList.contains(styles.hitArea)) {
            event.stopPropagation();
            onSelectEdge(edge.id);
          }
        };

        return (
          <g
            key={edge.id}
            className={[
              isActiveEdge ? styles.group : styles.dimmed,
              isSelectedEdge ? styles.selected : ''
            ]
              .filter(Boolean)
              .join(' ')}
            onPointerDown={handleEdgePointer}
          >
            {onSelectEdge ? (
              <path className={styles.hitArea} d={geometry.path}>
                <title>{`Conexão ${edge.source} → ${edge.target}`}</title>
              </path>
            ) : null}
            <motion.path
              className={[styles.path, isActiveEdge ? styles.pathActive : '', isSelectedEdge ? styles.pathSelected : '']
                .filter(Boolean)
                .join(' ')}
              d={geometry.path}
              markerEnd={isActiveEdge ? 'url(#tdm-arrow-workspace)' : undefined}
              initial={false}
              animate={{
                opacity: edgeOpacity,
                pathLength: hasSelection ? 1 : 0
              }}
              transition={{
                duration: shouldReduceMotion ? 0.01 : isActiveEdge ? RESULT_MOTION.pathDuration : RESULT_MOTION.cardDuration,
                delay: edgeTransitionDelay,
                ease: RESULT_MOTION.ease
              }}
            />
            {badgeDetails.length
              ? (() => {
                  const primary = badgeDetails[0];
                  if (!primary) {
                    return null;
                  }
                  const sameKind = badgeDetails.filter((badge) => badge.label === primary.label);
                  const point = geometry.pointAt(0.5);
                  if (!isValidMarkerPoint(point.x, point.y)) {
                    return null;
                  }
                  const markerId = `${edge.id}-${primary.type}-0`;
                  const badgeClass = primary.label === 'R' ? styles.badgeRisk : styles.badgeHypothesis;
                  const label =
                    sameKind.length > 1 ? `${primary.label} ${sameKind.length}` : primary.label;

                  return (
                    <g key={markerId} transform={`translate(${point.x}, ${point.y})`}>
                      <motion.g
                        className={styles.badgeGroup}
                        initial={false}
                        animate={{
                          scale: isActiveEdge ? 1 : 0.85,
                          opacity: isActiveEdge ? 1 : 0
                        }}
                        transition={{
                          duration: shouldReduceMotion ? 0.01 : RESULT_MOTION.cardDuration,
                          delay: edgeTransitionDelay + 0.1,
                          ease: RESULT_MOTION.ease
                        }}
                      >
                        <g className={styles.badgeHit}>
                          <circle
                            className={styles.badgeHitArea}
                            r="14"
                            data-result-marker-hit="true"
                            data-marker-id={markerId}
                            role={onSelectMarker ? 'button' : undefined}
                            tabIndex={onSelectMarker && isActiveEdge ? 0 : undefined}
                            aria-label={`${primary.label === 'R' ? 'Risco' : 'Hipótese'}: ${primary.text}`}
                          />
                          <circle
                            className={[styles.badgeCircle, badgeClass].join(' ')}
                            r="7.5"
                            pointerEvents="none"
                          />
                          <text
                            className={[
                              styles.badgeText,
                              primary.label === 'R' ? styles.badgeTextRisk : styles.badgeTextHypothesis
                            ].join(' ')}
                            y="3"
                            textAnchor="middle"
                            pointerEvents="none"
                          >
                            {label}
                          </text>
                          <title>{`${primary.label === 'R' ? 'Risco' : 'Hipótese'}: ${primary.text}`}</title>
                        </g>
                      </motion.g>
                    </g>
                  );
                })()
              : null}
          </g>
        );
      })}
    </svg>
  );
}

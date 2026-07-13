'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TDM_STAGE_ORDER } from '../../../domain/tdm-stages';
import type { TdmEdge, TdmNode } from '../../../domain/tdm-types';
import { groupNodesByStage } from '../result-view-utils';
import {
  getConnectedFlowFromNode,
  getConnectionBadge,
  getEdgeBadges
} from './result-experience-data';
import { STAGE_META, type CustomStyle } from './types';
import styles from './flow-vision-interactive.module.sass';

interface FlowVisionDiagramProps {
  nodes: TdmNode[];
  edges: TdmEdge[];
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  zoom?: number;
}

type CardRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Point = { x: number; y: number };

const EDGE_GAP = 8;

function cubicBezierPoint(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  return {
    x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
    y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y
  };
}

function buildMeasuredEdgePath(source: CardRect, target: CardRect) {
  const startX = source.x + source.width / 2 + EDGE_GAP;
  const startY = source.y;
  const endX = target.x - target.width / 2 - EDGE_GAP;
  const endY = target.y;
  const span = Math.max(endX - startX, 24);
  const control = Math.max(span * 0.44, 24);
  const p0 = { x: startX, y: startY };
  const p1 = { x: startX + control, y: startY };
  const p2 = { x: endX - control, y: endY };
  const p3 = { x: endX, y: endY };
  const midpoint = cubicBezierPoint(0.5, p0, p1, p2, p3);

  return {
    path: `M ${startX} ${startY} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${endX} ${endY}`,
    midX: midpoint.x,
    midY: midpoint.y
  };
}

function getCardDescription(node: TdmNode) {
  return node.shortNotes?.trim() || node.description;
}

export function FlowVisionDiagram({
  nodes,
  edges,
  selectedNodeId = null,
  onSelectNode,
  zoom = 1
}: FlowVisionDiagramProps) {
  const shouldReduceMotion = useReducedMotion();
  const boardRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [cardRects, setCardRects] = useState<Map<string, CardRect>>(new Map());
  const grouped = groupNodesByStage(nodes);
  const selected = selectedNodeId ?? null;
  const flow = useMemo(() => getConnectedFlowFromNode(selected, edges), [selected, edges]);
  const hasSelection = Boolean(selected);

  const measureCards = useCallback(() => {
    const board = boardRef.current;
    if (!board) {
      return;
    }

    const boardRect = board.getBoundingClientRect();
    const scaleX = board.offsetWidth / boardRect.width || 1;
    const scaleY = board.offsetHeight / boardRect.height || 1;
    const nextRects = new Map<string, CardRect>();

    cardRefs.current.forEach((element, nodeId) => {
      const rect = element.getBoundingClientRect();
      const width = rect.width * scaleX;
      const height = rect.height * scaleY;
      const x = (rect.left - boardRect.left) * scaleX + width / 2;
      const y = (rect.top - boardRect.top) * scaleY + height / 2;

      nextRects.set(nodeId, { x, y, width, height });
    });

    setCardRects(nextRects);
  }, []);

  useLayoutEffect(() => {
    measureCards();
    const board = boardRef.current;
    if (!board) {
      return;
    }

    const observer = new ResizeObserver(measureCards);
    observer.observe(board);
    window.addEventListener('resize', measureCards);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measureCards);
    };
  }, [measureCards, nodes, edges, selected, zoom]);

  const registerCardRef = useCallback((nodeId: string, element: HTMLButtonElement | null) => {
    if (element) {
      cardRefs.current.set(nodeId, element);
      return;
    }

    cardRefs.current.delete(nodeId);
  }, []);

  return (
    <div className={styles.flowVisionDiagram}>
      <div className={styles.flowVisionBoard} ref={boardRef}>
        <svg className={styles.flowVisionConnections} aria-hidden="true">
          <defs>
            <marker id="flow-vision-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M 0 0 L 6 3 L 0 6 z" fill="rgba(244,247,251,.48)" />
            </marker>
          </defs>
          {edges.map((edge) => {
            const sourceRect = cardRects.get(edge.source);
            const targetRect = cardRects.get(edge.target);
            if (!sourceRect || !targetRect) {
              return null;
            }

            const geometry = buildMeasuredEdgePath(sourceRect, targetRect);
            const isRelated =
              !hasSelection ||
              (flow.edgeIds.has(edge.id) && flow.nodeIds.has(edge.source) && flow.nodeIds.has(edge.target));
            const badge = getConnectionBadge(edge);
            const badgeDetails = getEdgeBadges(edge);
            const isPillBadge = badge === 'R/H';
            const targetNode = nodes.find((node) => node.id === edge.target);
            const stageAccent = targetNode ? STAGE_META[targetNode.stage].accent : 'rgba(255,255,255,.42)';

            return (
              <g
                key={edge.id}
                className={isRelated ? styles.flowVisionEdgeGroup : styles.flowVisionEdgeDimmed}
                style={{ '--edge-accent': stageAccent } as CustomStyle}
              >
                <motion.path
                  className={[styles.flowVisionEdgePath, isRelated ? styles.flowVisionEdgePathActive : ''].filter(Boolean).join(' ')}
                  d={geometry.path}
                  markerEnd={isRelated ? 'url(#flow-vision-arrow)' : undefined}
                  initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: isRelated ? 1 : 0.1 }}
                  transition={{ duration: shouldReduceMotion ? 0.01 : 0.48, ease: [0.22, 1, 0.36, 1] }}
                />
                {badge ? (
                  <motion.g
                    className={styles.flowVisionEdgeBadgeGroup}
                    transform={`translate(${geometry.midX}, ${geometry.midY})`}
                    initial={shouldReduceMotion ? false : { scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: isRelated ? 1 : 0.12 }}
                    transition={{ duration: shouldReduceMotion ? 0.01 : 0.22 }}
                  >
                    {isPillBadge ? (
                      <rect className={styles.flowVisionEdgeBadgePill} x="-13" y="-7.5" width="26" height="15" rx="7.5" />
                    ) : (
                      <circle className={styles.flowVisionEdgeBadgeCircle} r="8" />
                    )}
                    <text
                      className={[styles.flowVisionEdgeBadgeText, isPillBadge ? styles.flowVisionEdgeBadgeTextPill : ''].filter(Boolean).join(' ')}
                      y="3"
                      textAnchor="middle"
                    >
                      {badge}
                    </text>
                    <title>
                      {badgeDetails.map((item) => `${item.label}: ${item.text}`).join(' · ')}
                    </title>
                  </motion.g>
                ) : null}
              </g>
            );
          })}
        </svg>

        <div className={styles.flowVisionColumns}>
          {TDM_STAGE_ORDER.map((stage) => {
            const meta = STAGE_META[stage];
            const stageNodes = grouped[stage];

            return (
              <div
                key={stage}
                className={styles.flowVisionColumn}
                style={{ '--stage-color': meta.accent, '--stage-soft': meta.accentSoft } as CustomStyle}
              >
                <div className={styles.flowVisionColumnHeader}>
                  <span className={styles.flowVisionColumnLabel}>{meta.label}</span>
                </div>

                <div className={styles.flowVisionColumnCards}>
                  {stageNodes.map((node) => {
                    const isSelected = selected === node.id;
                    const isRelated = !hasSelection || flow.nodeIds.has(node.id);
                    const isRelatedOnly = isRelated && !isSelected;

                    return (
                      <motion.button
                        key={node.id}
                        ref={(element) => registerCardRef(node.id, element)}
                        type="button"
                        className={[
                          styles.flowVisionCard,
                          isSelected ? styles.flowVisionCardSelected : '',
                          isRelatedOnly ? styles.flowVisionCardRelated : '',
                          isRelated ? '' : styles.flowVisionCardDisabled
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => onSelectNode?.(node.id)}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                        animate={{
                          opacity: isRelated ? 1 : 0.22,
                          y: isSelected ? -4 : isRelatedOnly ? -2 : 0
                        }}
                        transition={{ duration: shouldReduceMotion ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <strong className={styles.flowVisionCardTitle}>{node.title}</strong>
                        <span className={styles.flowVisionCardText}>{getCardDescription(node)}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

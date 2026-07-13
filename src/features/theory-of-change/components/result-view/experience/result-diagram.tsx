'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TDM_STAGE_ORDER } from '../../../domain/tdm-stages';
import type { TdmEdge, TdmNode } from '../../../domain/tdm-types';
import { countNodeConnections, groupNodesByStage } from '../result-view-utils';
import {
  buildDiagramEdges,
  buildDiagramNodes,
  getConnectedFlowFromNode,
  getConnectionBadge,
  getEdgeBadges
} from './result-experience-data';
import { ResourceCard, ResourcesPanel, getLiquidGlassStageTheme } from '../liquid-glass';
import { DEFAULT_CARD_GLASS, DEFAULT_PANEL_GLASS } from '../liquid-glass/types';
import { STAGE_META, type CustomStyle } from './types';
import styles from './result-experience.module.sass';

const COLUMN_GLASS = {
  ...DEFAULT_PANEL_GLASS,
  borderRadius: 9,
  borderWidth: 0.02,
  brightness: 52,
  opacity: 1,
  blur: 18,
  displace: 5,
  backgroundOpacity: 0.08,
  saturation: 1.42,
  distortionScale: -180,
  redOffset: 0,
  greenOffset: 10,
  blueOffset: 20
} as const;

const CARD_GLASS = {
  ...DEFAULT_CARD_GLASS,
  borderRadius: 9,
  borderWidth: 0.02,
  brightness: 48,
  opacity: 1,
  blur: 14,
  displace: 5,
  backgroundOpacity: 0.1,
  saturation: 1.38,
  distortionScale: -180,
  redOffset: 0,
  greenOffset: 10,
  blueOffset: 20
} as const;

interface ResultDiagramProps {
  nodes: TdmNode[];
  edges: TdmEdge[];
  mode: 'preview' | 'workspace';
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

const EDGE_GAP = 10;

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
  const span = Math.max(endX - startX, 28);
  const control = Math.max(span * 0.44, 28);
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

export function ResultDiagram({
  nodes,
  edges,
  mode,
  selectedNodeId = null,
  onSelectNode,
  zoom = 1
}: ResultDiagramProps) {
  const shouldReduceMotion = useReducedMotion();
  const boardRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [cardRects, setCardRects] = useState<Map<string, CardRect>>(new Map());
  const grouped = groupNodesByStage(nodes);
  const selected = selectedNodeId ?? null;
  const flow = useMemo(() => getConnectedFlowFromNode(selected, edges), [selected, edges]);
  const hasSelection = mode === 'workspace' && Boolean(selected);
  const diagramNodes = useMemo(() => buildDiagramNodes(nodes), [nodes]);
  const diagramEdges = useMemo(() => buildDiagramEdges(edges, diagramNodes), [edges, diagramNodes]);

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

  if (mode === 'preview') {
    return (
      <div className={styles.diagramPreview}>
        <div className={styles.diagramScale} style={{ '--diagram-zoom': zoom } as CustomStyle}>
          <svg className={styles.diagramConnections} viewBox="0 0 1000 620" aria-hidden="true">
            <defs>
              <marker id="tdm-arrow-preview" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(244,247,251,.54)" />
              </marker>
            </defs>
            {diagramEdges.map((edge) => (
              <motion.path
                key={edge.id}
                className={styles.edgePath}
                d={edge.path}
                markerEnd="url(#tdm-arrow-preview)"
                initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.35 }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.48, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </svg>
          <div className={styles.diagramCards}>
            {diagramNodes.map((node) => {
              const meta = STAGE_META[node.stage];
              return (
                <div
                  key={node.id}
                  className={styles.diagramCardPreview}
                  style={{
                    '--x': `${node.x}px`,
                    '--y': `${node.y}px`,
                    '--stage-color': meta.accent
                  } as CustomStyle}
                >
                  <strong>{node.title}</strong>
                  <span>{node.description}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.diagramWorkspace}>
      <div className={styles.diagramBoard} ref={boardRef}>
        <svg className={styles.diagramConnectionsOverlay} aria-hidden="true">
          <defs>
            <marker id="tdm-arrow-workspace" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M 0 0 L 6 3 L 0 6 z" fill="rgba(244,247,251,.48)" />
            </marker>
          </defs>
          {edges.map((edge) => {
            if (!hasSelection) {
              return null;
            }

            const sourceRect = cardRects.get(edge.source);
            const targetRect = cardRects.get(edge.target);
            if (!sourceRect || !targetRect) {
              return null;
            }

            const geometry = buildMeasuredEdgePath(sourceRect, targetRect);
            const isRelated =
              flow.edgeIds.has(edge.id) && flow.nodeIds.has(edge.source) && flow.nodeIds.has(edge.target);
            const badge = isRelated ? getConnectionBadge(edge) : null;
            const badgeDetails = getEdgeBadges(edge);
            const isPillBadge = badge === 'R/H';

            return (
              <g key={edge.id} className={isRelated ? styles.edgeGroup : styles.edgeDimmed}>
                <motion.path
                  className={[styles.edgePath, isRelated ? styles.edgePathActive : ''].filter(Boolean).join(' ')}
                  d={geometry.path}
                  markerEnd={isRelated ? 'url(#tdm-arrow-workspace)' : undefined}
                  initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: isRelated ? 1 : 0.08 }}
                  transition={{ duration: shouldReduceMotion ? 0.01 : 0.48, ease: [0.22, 1, 0.36, 1] }}
                />
                {badge ? (
                  <motion.g
                    className={styles.edgeBadgeGroup}
                    transform={`translate(${geometry.midX}, ${geometry.midY})`}
                    initial={shouldReduceMotion ? false : { scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: shouldReduceMotion ? 0.01 : 0.22 }}
                  >
                    {isPillBadge ? (
                      <rect className={styles.edgeBadgePill} x="-13" y="-7.5" width="26" height="15" rx="7.5" />
                    ) : (
                      <circle className={styles.edgeBadgeCircle} r="8" />
                    )}
                    <text
                      className={[styles.edgeBadgeText, isPillBadge ? styles.edgeBadgeTextPill : ''].filter(Boolean).join(' ')}
                      y={isPillBadge ? '3' : '3'}
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

        <div className={styles.diagramColumns}>
          {TDM_STAGE_ORDER.map((stage) => {
            const meta = STAGE_META[stage];
            const stageNodes = grouped[stage];
            const liquidTheme = getLiquidGlassStageTheme(stage);
            const countLabel = `${stageNodes.length} ${stageNodes.length === 1 ? 'item' : 'itens'}`;

            return (
              <ResourcesPanel
                key={stage}
                title={meta.label.toUpperCase()}
                countLabel={countLabel}
                theme={liquidTheme}
                panelGlass={COLUMN_GLASS}
                className={styles.diagramColumnPanel}
                contentClassName={styles.diagramColumnPanelContent}
                isDimmed={hasSelection && stageNodes.every((node) => !flow.nodeIds.has(node.id))}
                ariaLabel={`${meta.label}, ${countLabel}`}
              >
                {stageNodes.map((node) => {
                  const counts = countNodeConnections(node.id, edges);
                  const isSelected = selected === node.id;
                  const isRelated = !hasSelection || flow.nodeIds.has(node.id);
                  const isRelatedOnly = isRelated && !isSelected;

                  return (
                    <motion.button
                      key={node.id}
                      ref={(element) => registerCardRef(node.id, element)}
                      type="button"
                      className={[
                        styles.diagramCardButton,
                        isRelated ? '' : styles.diagramCardDisabled
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{ '--stage-color': meta.accent, '--stage-soft': meta.accentSoft } as CustomStyle}
                      onClick={() => onSelectNode?.(node.id)}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                      animate={{
                        opacity: isRelated ? 1 : 0.22,
                        y: isSelected ? -5 : isRelatedOnly ? -2 : 0
                      }}
                      transition={{ duration: shouldReduceMotion ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ResourceCard
                        title={node.title}
                        description={node.description}
                        details={node.advancedDetails}
                        notes={node.shortNotes}
                        incomingCount={counts.incoming}
                        outgoingCount={counts.outgoing}
                        accentColor={meta.accent}
                        theme={liquidTheme}
                        glass={CARD_GLASS}
                        className={[
                          styles.diagramResourceCard,
                          isSelected ? styles.diagramResourceCardSelected : '',
                          isRelatedOnly ? styles.diagramResourceCardRelated : ''
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        ariaLabel={`${node.title}, ${meta.label}`}
                      />
                    </motion.button>
                  );
                })}
              </ResourcesPanel>
            );
          })}
        </div>
      </div>
    </div>
  );
}

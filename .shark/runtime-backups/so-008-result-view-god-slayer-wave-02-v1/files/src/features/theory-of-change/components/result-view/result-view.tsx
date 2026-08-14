'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { TdmEdge, TdmNode } from '../../domain/tdm-types';
import { TDM_STAGE_LABELS, TDM_STAGE_ORDER, type TdmStage } from '../../domain/tdm-stages';
import { canViewTdmResult } from '../../utils/tdm-result';
import {
  buildTheoryExportModel,
  exportTheoryDocx,
  exportTheoryPdf,
  exportTheoryPng,
  exportTheorySvg
} from '@/features/theory-of-change/export';
import {
  HERO_COMPACT_SCROLL_THRESHOLD,
  RESULT_FLOW_BRIDGES,
  RESULT_VIEW_TITLE,
  buildConnectionCountMap,
  buildFlowPathDescriptors,
  buildFlowReportContent,
  buildFlowReportContentForEdge,
  buildTheoryStatusSummary,
  getCardHighlightState,
  getCausalFamily,
  getCausalFamilyForEdge,
  getColumnHeaderState,
  getMarkerHighlightState,
  getResultStageAccent,
  getResultStageClassName,
  getEdgeMarkerText,
  getEdgeMarkerType,
  groupNodesByStage,
  type FlowPathDescriptor,
  type ResultBridgeKind,
  type ResultExportFormat
} from './result-view-utils';
import { ResultViewBlueprintLayer } from './result-view-blueprint-layer';
import { ResultViewExportMenu } from './result-view-export-menu/result-view-export-menu';
import { ResultViewFlowInspector, RhLegendMicro } from './result-view-flow-inspector';
import { ResultViewGrainientBackdrop } from './result-view-grainient-backdrop';
import { TdmGlassSurface } from './tdm-glass-surface';
import {
  LiquidGlassMonochromeBackdrop,
  ResultLiquidCard,
  ResultLiquidColumn,
  getLiquidGlassStageTheme
} from './liquid-glass';
import styles from './result-view.module.sass';

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;
const FOCUS_TRANSITION = { duration: 0.3, ease: PREMIUM_EASE };
const HERO_ENTRANCE = { duration: 0.42, ease: PREMIUM_EASE };
const RIPPLE_TRANSITION = { duration: 0.52, ease: PREMIUM_EASE };
const CONNECTION_DRAW = { duration: 0.4, ease: PREMIUM_EASE };
const MARKER_REVEAL = { duration: 0.28, ease: PREMIUM_EASE };
const CARD_FLOAT_Y = -2;
const CARD_FLOAT_SCALE = 1.006;

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={styles.backButtonIcon}>
      <path
        d="M10 3.5 5.5 8 10 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type RipplePoint = { x: number; y: number; id: number };

function ResultReadingCard({
  node,
  stage,
  incomingCount,
  outgoingCount,
  isFocused,
  isHighlighted,
  isDimmed,
  isDisabled,
  onSelect,
  onRegisterRef,
  shouldReduceMotion
}: {
  node: TdmNode;
  stage: TdmStage;
  incomingCount: number;
  outgoingCount: number;
  isFocused: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  isDisabled: boolean;
  onSelect: () => void;
  onRegisterRef: (nodeId: string, element: HTMLElement | null) => void;
  shouldReduceMotion: boolean | null;
}) {
  const [ripple, setRipple] = useState<RipplePoint | null>(null);
  const theme = getResultStageAccent(stage);
  const hasDetails = Boolean(node.advancedDetails?.trim());
  const hasNotes = Boolean(node.shortNotes?.trim());
  const description = node.description?.trim() || 'Sem descrição registrada.';

  const handleActivate = useCallback(
    (clientX?: number, clientY?: number, element?: HTMLElement | null) => {
      if (!isFocused && element && clientX !== undefined && clientY !== undefined && !shouldReduceMotion) {
        const rect = element.getBoundingClientRect();
        setRipple({
          x: clientX - rect.left,
          y: clientY - rect.top,
          id: Date.now()
        });
      }

      onSelect();
    },
    [isFocused, onSelect, shouldReduceMotion]
  );

  return (
    <motion.article
      ref={(element) => onRegisterRef(node.id, element)}
      layout={false}
      className={[
        styles.readingCardShell,
        isFocused ? styles.readingCardFocused : '',
        isHighlighted && !isFocused ? styles.readingCardHighlighted : '',
        isDimmed ? styles.readingCardDimmed : '',
        isDisabled ? styles.readingCardDisabled : ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          '--stage-accent': theme.accent,
          '--stage-accent-soft': theme.accentSoft,
          '--stage-border': theme.border,
          '--stage-glow': theme.glow,
          transformOrigin: 'center top'
        } as CSSProperties
      }
      onClick={(event) => handleActivate(event.clientX, event.clientY, event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleActivate(undefined, undefined, event.currentTarget);
        }
      }}
      tabIndex={0}
      aria-pressed={isFocused}
      aria-selected={isFocused}
      aria-label={`${node.title}, ${TDM_STAGE_LABELS[stage]}`}
      animate={{
        opacity: isDisabled && !isFocused ? 0.34 : isDimmed ? 0.45 : isHighlighted && !isFocused ? 0.94 : 1,
        y: isFocused ? CARD_FLOAT_Y : 0,
        scale: isFocused ? CARD_FLOAT_SCALE : 1
      }}
      transition={shouldReduceMotion ? { duration: 0.01 } : FOCUS_TRANSITION}
    >
      <ResultLiquidCard
        title={node.title}
        description={description}
        details={hasDetails ? node.advancedDetails : undefined}
        notes={hasNotes ? node.shortNotes : undefined}
        incomingCount={incomingCount}
        outgoingCount={outgoingCount}
        accentColor={theme.accent}
        theme={getLiquidGlassStageTheme(stage)}
        glassClassName={styles.readingCardGlass}
        titleClassName={styles.readingCardTitle}
        ariaLabel={`${node.title}, ${TDM_STAGE_LABELS[stage]}`}
      >
        <AnimatePresence>
          {ripple ? (
            <motion.span
              key={ripple.id}
              className={styles.cardRipple}
              style={{ left: ripple.x, top: ripple.y }}
              initial={{ scale: 0, opacity: 0.42 }}
              animate={{ scale: 5.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0.01 } : RIPPLE_TRANSITION}
              onAnimationComplete={() => setRipple(null)}
              aria-hidden="true"
            />
          ) : null}
        </AnimatePresence>
      </ResultLiquidCard>
    </motion.article>
  );
}

function ResultFlowBridge({
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

function FlowCausalOverlay({
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

function ResultHeaderStats({ nodes, edges }: { nodes: TdmNode[]; edges: TdmEdge[] }) {
  const status = useMemo(() => buildTheoryStatusSummary(nodes, edges), [nodes, edges]);

  return (
    <div className={styles.statusGlassTray} aria-label="Resumo da teoria">
      <div className={styles.statusGrid}>
      {TDM_STAGE_ORDER.map((stage) => {
        const theme = getResultStageAccent(stage);
        const count = status.stageCounts[stage];

        return (
          <span
            key={stage}
            className={styles.statusStat}
            style={
              {
                '--stage-accent': theme.accent,
                '--stage-accent-soft': theme.accentSoft
              } as CSSProperties
            }
          >
            <span className={styles.statusStatValue}>{count}</span>
            <span className={styles.statusStatLabel}>{TDM_STAGE_LABELS[stage]}</span>
          </span>
        );
      })}
      <span className={styles.statusStat}>
        <span className={styles.statusStatValue}>{status.connectionCount}</span>
        <span className={styles.statusStatLabel}>Conexões</span>
      </span>
      {status.riskCount > 0 ? (
        <span className={[styles.statusStat, styles.statusStatMarker].join(' ')}>
          <span className={styles.statusStatValue}>{status.riskCount}</span>
          <span className={styles.statusStatLabel}>Riscos</span>
        </span>
      ) : null}
      {status.hypothesisCount > 0 ? (
        <span className={[styles.statusStat, styles.statusStatHypothesis].join(' ')}>
          <span className={styles.statusStatValue}>{status.hypothesisCount}</span>
          <span className={styles.statusStatLabel}>Hipóteses</span>
        </span>
      ) : null}
      </div>
    </div>
  );
}

function ResultEmptyState({ onBack, backLabel }: { onBack: () => void; backLabel: string }) {
  return (
    <section className={styles.emptyState}>
      <TdmGlassSurface variant="strong" stage="neutral" className={styles.emptyStateGlass} contentClassName={styles.emptyStateGlassContent}>
        <p className={styles.emptyStateKicker}>Resultado da Teoria da Mudança</p>
        <h2 className={styles.emptyStateTitle}>Sua teoria ainda está em construção.</h2>
        <p className={styles.emptyStateMessage}>Crie itens no canvas para visualizar a teoria organizada.</p>
        <TdmGlassSurface variant="strong" stage="neutral" interactive className={styles.backButtonGlass}>
          <button type="button" className={styles.backButtonInner} onClick={onBack}>
            {backLabel}
          </button>
        </TdmGlassSurface>
      </TdmGlassSurface>
    </section>
  );
}

export function ResultView({
  title,
  description,
  nodes,
  edges,
  backLabel = 'Voltar para minha teoria',
  showExportActions = false,
  onExport: _legacyOnExport,
  onBack
}: {
  title: string;
  description?: string;
  nodes: TdmNode[];
  edges: TdmEdge[];
  backLabel?: string;
  showExportActions?: boolean;
  /** Mantido por compatibilidade com o canvas; exportação é tratada internamente. */
  onExport?: (format: 'pdf' | 'png' | 'jpeg' | 'svg') => void;
  onBack: () => void;
}) {
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [focusedEdgeId, setFocusedEdgeId] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [isHeroCompact, setIsHeroCompact] = useState(false);
  const viewRef = useRef<HTMLElement>(null);
  const resultExportRef = useRef<HTMLDivElement>(null);
  const flowViewportRef = useRef<HTMLDivElement>(null);
  const flowInspectorSlotRef = useRef<HTMLDivElement>(null);
  const flowInspectorMobileRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const columnViewportRefs = useRef<Map<string, HTMLElement>>(new Map());
  const shouldReduceMotion = useReducedMotion();

  const registerCardRef = useCallback((nodeId: string, element: HTMLElement | null) => {
    if (element) {
      cardRefs.current.set(nodeId, element);
      return;
    }

    cardRefs.current.delete(nodeId);
  }, []);

  const registerColumnViewportRef = useCallback((stage: TdmStage, element: HTMLElement | null) => {
    if (element) {
      columnViewportRefs.current.set(stage, element);
      return;
    }

    columnViewportRefs.current.delete(stage);
  }, []);

  const isComplete = canViewTdmResult(nodes, edges);
  const groupedNodes = useMemo(() => groupNodesByStage(nodes), [nodes]);
  const connectionCounts = useMemo(() => buildConnectionCountMap(edges), [edges]);

  const causalFamily = useMemo(() => {
    if (focusedNodeId) {
      return getCausalFamily(focusedNodeId, nodes, edges);
    }

    if (focusedEdgeId) {
      return getCausalFamilyForEdge(focusedEdgeId, nodes, edges);
    }

    return null;
  }, [edges, focusedEdgeId, focusedNodeId, nodes]);

  const relatedNodeIds = useMemo(() => causalFamily?.relatedNodeIds ?? new Set<string>(), [causalFamily]);
  const relatedEdgeIds = useMemo(() => causalFamily?.relatedEdgeIds ?? new Set<string>(), [causalFamily]);

  const flowInspectorContent = useMemo(() => {
    if (focusedEdgeId) {
      return buildFlowReportContentForEdge(focusedEdgeId, nodes, edges);
    }

    if (focusedNodeId) {
      return buildFlowReportContent(focusedNodeId, nodes, edges);
    }

    return null;
  }, [edges, focusedEdgeId, focusedNodeId, nodes]);

  const edgeEndpointIds = useMemo(() => {
    if (!focusedEdgeId) {
      return new Set<string>();
    }

    const edge = edges.find((candidate) => candidate.id === focusedEdgeId);

    if (!edge) {
      return new Set<string>();
    }

    return new Set([edge.source, edge.target]);
  }, [edges, focusedEdgeId]);

  const bridgeEdges = useMemo(
    () =>
      RESULT_FLOW_BRIDGES.reduce<Record<string, TdmEdge[]>>((accumulator, bridge) => {
        accumulator[bridge.id] = edges.filter((edge) => {
          const connectionKind = edge.data?.connectionKind;

          if (connectionKind) {
            return connectionKind === bridge.connectionKind;
          }

          return edge.sourceStage === bridge.sourceStage && edge.targetStage === bridge.targetStage;
        });
        return accumulator;
      }, {}),
    [edges]
  );

  const clearFocus = useCallback(() => {
    setFocusedNodeId(null);
    setFocusedEdgeId(null);
  }, []);

  const scrollFocusTargetIntoView = useCallback(
    (element: HTMLElement | null | undefined) => {
      if (!element) {
        return;
      }

      window.requestAnimationFrame(() => {
        element.scrollIntoView({
          behavior: shouldReduceMotion ? 'auto' : 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      });
    },
    [shouldReduceMotion]
  );

  const focusRelatedConnectionForNode = useCallback(
    (nodeId: string) => {
      const family = getCausalFamily(nodeId, nodes, edges);
      const partnerId = family.outgoingIds[0] ?? family.incomingIds[0] ?? null;
      const partnerElement = partnerId ? cardRefs.current.get(partnerId) : null;
      const selfElement = cardRefs.current.get(nodeId);
      const desktopInspector = flowInspectorSlotRef.current;
      const mobileInspector = flowInspectorMobileRef.current;
      const inspectorVisible =
        desktopInspector && window.getComputedStyle(desktopInspector).display !== 'none'
          ? desktopInspector
          : mobileInspector;

      scrollFocusTargetIntoView(partnerElement ?? selfElement);

      if (inspectorVisible && family.relatedEdgeIds.size > 0) {
        window.requestAnimationFrame(() => {
          scrollFocusTargetIntoView(inspectorVisible);
        });
      }
    },
    [edges, nodes, scrollFocusTargetIntoView]
  );

  const focusRelatedConnectionForEdge = useCallback(
    (edgeId: string) => {
      const edge = edges.find((candidate) => candidate.id === edgeId);

      if (!edge) {
        return;
      }

      const targetElement = cardRefs.current.get(edge.target) ?? cardRefs.current.get(edge.source);
      scrollFocusTargetIntoView(targetElement);
    },
    [edges, scrollFocusTargetIntoView]
  );

  const handleSelectNode = useCallback(
    (nodeId: string) => {
      setFocusedEdgeId(null);

      if (focusedNodeId === nodeId) {
        setFocusedNodeId(null);
        return;
      }

      setFocusedNodeId(nodeId);
      focusRelatedConnectionForNode(nodeId);
    },
    [focusRelatedConnectionForNode, focusedNodeId]
  );

  const handleSelectEdge = useCallback(
    (edgeId: string) => {
      setFocusedNodeId(null);

      if (focusedEdgeId === edgeId) {
        setFocusedEdgeId(null);
        return;
      }

      setFocusedEdgeId(edgeId);
      focusRelatedConnectionForEdge(edgeId);
    },
    [focusRelatedConnectionForEdge, focusedEdgeId]
  );

  const handleExport = useCallback(
    async (format: ResultExportFormat) => {
      setExportMenuOpen(false);
      setExportStatus(null);

      if (format === 'jpeg') {
        setExportStatus('JPEG ainda não está disponível.');
        return;
      }

      setIsExporting(true);

      try {
        if (format === 'png' || format === 'svg') {
          const container = resultExportRef.current;
          if (!container) {
            setExportStatus('Área do diagrama indisponível para exportação.');
            return;
          }

          const result =
            format === 'png'
              ? await exportTheoryPng({
                  container,
                  theoryTitle: title,
                  nodeCount: nodes.length,
                  edgeCount: edges.length
                })
              : await exportTheorySvg({
                  container,
                  theoryTitle: title,
                  nodeCount: nodes.length,
                  edgeCount: edges.length
                });

          if (result.status === 'error') {
            setExportStatus(result.message);
            return;
          }

          setExportStatus(result.message ?? `${format.toUpperCase()} gerado: ${result.filename}`);
          return;
        }

        const documentModel = buildTheoryExportModel(null, nodes, edges);
        if (!documentModel) {
          setExportStatus('Não há narrativa disponível para exportar.');
          return;
        }

        if (format === 'pdf') {
          const result = await exportTheoryPdf(documentModel, title);
          setExportStatus(
            result.status === 'success'
              ? result.message ?? `PDF gerado: ${result.filename}`
              : result.message
          );
          return;
        }

        if (format === 'word') {
          const result = await exportTheoryDocx(documentModel, title);
          setExportStatus(
            result.status === 'success'
              ? result.message ?? `DOCX gerado: ${result.filename}`
              : result.message
          );
        }
      } catch (error) {
        setExportStatus(
          error instanceof Error ? error.message : 'Falha inesperada ao exportar.'
        );
      } finally {
        setIsExporting(false);
      }
    },
    [edges, nodes, title]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExportMenuOpen(false);
        clearFocus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearFocus]);

  useEffect(() => {
    const root = viewRef.current;

    if (!root) {
      return;
    }

    const handleScroll = () => {
      setIsHeroCompact(root.scrollTop > HERO_COMPACT_SCROLL_THRESHOLD);
    };

    handleScroll();
    root.addEventListener('scroll', handleScroll, { passive: true });
    return () => root.removeEventListener('scroll', handleScroll);
  }, [isComplete]);

  if (!isComplete) {
    return (
      <main ref={viewRef} className={styles.view}>
        <ResultViewGrainientBackdrop />
        <ResultEmptyState onBack={onBack} backLabel={backLabel} />
      </main>
    );
  }

  return (
    <main ref={viewRef} className={styles.view}>
      <ResultViewGrainientBackdrop />

      <div className={[styles.resultShell, styles.content, styles.resultContent].join(' ')}>
        <div
          ref={resultExportRef}
          className={styles.exportTarget}
          aria-busy={isExporting || undefined}
        >
          {exportStatus ? (
            <p className={styles.noPrint} role="status" aria-live="polite">
              {exportStatus}
            </p>
          ) : null}
          <motion.header
            className={[
              styles.hero,
              isHeroCompact ? styles.heroCompact : ''
            ]
              .filter(Boolean)
              .join(' ')}
            data-export-exclude="true"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0.01 } : HERO_ENTRANCE}
          >
            <span className={styles.heroRibbon} aria-hidden="true" />

            <div className={styles.heroInner}>
              <div className={styles.heroLeft}>
                <span className={styles.heroEditorialLine} aria-hidden="true" />
                <p className={styles.kicker}>Resultado da Teoria da Mudança</p>
                <div className={styles.heroTitleShell}>
                  <h1 className={styles.title}>{RESULT_VIEW_TITLE}</h1>
                </div>
                <div className={styles.heroExpandable}>
                <p className={styles.subtitle}>
                  {description?.trim() ||
                    'Leia a lógica da intervenção em etapas, conexões, riscos e hipóteses.'}
                </p>
                <p className={styles.instruction}>
                  <span className={styles.instructionDot} aria-hidden="true" />
                  Selecione um bloco ou conexão para revelar o caminho causal.
                </p>
                <div className={[styles.heroMetaRow, styles.noPrint].join(' ')}>
                  <ResultHeaderStats nodes={nodes} edges={edges} />
                </div>
                </div>
              </div>

              <div className={[styles.heroRight, styles.noPrint].join(' ')}>
                <div className={styles.heroActions}>
                  {showExportActions ? (
                    <ResultViewExportMenu
                      isOpen={exportMenuOpen}
                      onToggle={() => setExportMenuOpen((current) => !current)}
                      onClose={() => setExportMenuOpen(false)}
                      onExport={handleExport}
                      shouldReduceMotion={shouldReduceMotion}
                      isExporting={isExporting}
                    />
                  ) : null}
                  <TdmGlassSurface
                    variant="strong"
                    stage="neutral"
                    interactive
                    className={showExportActions ? styles.backButtonSecondaryGlass : styles.backButtonGlass}
                  >
                    <button type="button" className={styles.backButtonInner} onClick={onBack}>
                      <BackArrowIcon />
                      <span>{backLabel}</span>
                    </button>
                  </TdmGlassSurface>
                </div>

                <div className={styles.flowInspectorSlot} ref={flowInspectorSlotRef}>
                  <AnimatePresence initial={false}>
                    {flowInspectorContent ? (
                      <ResultViewFlowInspector
                        key={flowInspectorContent.edgeId ?? flowInspectorContent.nodeId}
                        content={flowInspectorContent}
                        compact={isHeroCompact}
                      />
                    ) : (
                      <motion.div
                        key="rh-micro"
                        initial={false}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 0.18, ease: PREMIUM_EASE }}
                      >
                        <RhLegendMicro className={styles.heroRhMicro} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.header>

          <div
            className={[styles.flowInspectorMobile, styles.noPrint].join(' ')}
            ref={flowInspectorMobileRef}
          >
            <AnimatePresence mode="wait">
              {flowInspectorContent ? (
                <ResultViewFlowInspector
                  key={flowInspectorContent.edgeId ?? flowInspectorContent.nodeId}
                  content={flowInspectorContent}
                />
              ) : null}
            </AnimatePresence>
          </div>

          <section
            className={styles.flowSection}
            aria-label="Fluxo da teoria da mudança"
            data-theory-export-diagram="true"
          >
            <div className={styles.flowViewport} ref={flowViewportRef}>
              <LiquidGlassMonochromeBackdrop
                preset="gray-layers"
                intensity={1.08}
                speed={0.72}
                overlay
                className={styles.flowMonochromeLayer}
              />
              <ResultViewBlueprintLayer />

              <div className={styles.connectionLayer}>
                <FlowCausalOverlay
                  containerRef={flowViewportRef}
                  columnViewportRefs={columnViewportRefs}
                  cardRefs={cardRefs}
                  edges={edges}
                  focusedNodeId={focusedNodeId}
                  focusedEdgeId={focusedEdgeId}
                  relatedEdgeIds={relatedEdgeIds}
                  onSelectEdge={handleSelectEdge}
                  shouldReduceMotion={shouldReduceMotion}
                />
              </div>

              <div className={styles.stageGrid}>
                {TDM_STAGE_ORDER.map((stage, index) => {
                  const theme = getResultStageAccent(stage);
                  const stageNodes = groupedNodes[stage];
                  const bridge = index < RESULT_FLOW_BRIDGES.length ? RESULT_FLOW_BRIDGES[index] : null;
                  const liquidGlassTheme = getLiquidGlassStageTheme(stage);
                  const columnHeaderState = getColumnHeaderState(
                    stageNodes,
                    focusedNodeId,
                    focusedEdgeId,
                    relatedNodeIds,
                    edgeEndpointIds
                  );
                  const columnHeaderClassName = [
                    styles.columnHeader,
                    columnHeaderState.isDimmed ? styles.columnHeaderDimmed : '',
                    columnHeaderState.isSelected ? styles.columnHeaderSelected : ''
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <div key={stage} className={styles.flowSegment}>
                      <div className={styles.stageColumnShell}>
                        <span
                          className={styles.stageColumnHalo}
                          aria-hidden="true"
                          style={
                            {
                              '--stage-accent': theme.accent,
                              '--stage-glow': theme.glow,
                              '--stage-accent-soft': theme.accentSoft
                            } as CSSProperties
                          }
                        />
                        <ResultLiquidColumn
                          title={TDM_STAGE_LABELS[stage]}
                          countLabel={`${stageNodes.length} ${stageNodes.length === 1 ? 'item' : 'itens'}`}
                          theme={liquidGlassTheme}
                          className={[
                            styles.stageColumn,
                            styles[getResultStageClassName(stage) as keyof typeof styles]
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          headerClassName={columnHeaderClassName}
                          isDimmed={columnHeaderState.isDimmed}
                          isSelected={columnHeaderState.isSelected}
                          ariaLabel={`${TDM_STAGE_LABELS[stage]}, ${stageNodes.length} itens`}
                        >
                          <div
                            ref={(element) => registerColumnViewportRef(stage, element)}
                            className={styles.stageItemsViewport}
                          >
                            {stageNodes.map((node) => {
                              const { incoming, outgoing } = connectionCounts.get(node.id) ?? {
                                incoming: 0,
                                outgoing: 0
                              };
                              const { isFocused, isHighlighted, isDimmed, isDisabled } = getCardHighlightState(
                                node.id,
                                focusedNodeId,
                                focusedEdgeId,
                                relatedNodeIds,
                                connectionCounts
                              );

                              return (
                                <ResultReadingCard
                                  key={node.id}
                                  node={node}
                                  stage={stage}
                                  incomingCount={incoming}
                                  outgoingCount={outgoing}
                                  isFocused={isFocused}
                                  isHighlighted={isHighlighted}
                                  isDimmed={isDimmed}
                                  isDisabled={isDisabled}
                                  onSelect={() => handleSelectNode(node.id)}
                                  onRegisterRef={registerCardRef}
                                  shouldReduceMotion={shouldReduceMotion}
                                />
                              );
                            })}
                          </div>
                        </ResultLiquidColumn>
                      </div>

                      {bridge ? (
                        <ResultFlowBridge
                          bridgeKind={bridge.markerKind}
                          edges={bridgeEdges[bridge.id] ?? []}
                          nodes={nodes}
                          highlightedEdgeIds={relatedEdgeIds}
                          focusedNodeId={focusedNodeId}
                          focusedEdgeId={focusedEdgeId}
                          onSelectEdge={handleSelectEdge}
                          shouldReduceMotion={shouldReduceMotion}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

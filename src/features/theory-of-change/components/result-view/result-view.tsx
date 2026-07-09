'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { TdmEdge, TdmNode } from '../../domain/tdm-types';
import { TDM_STAGE_LABELS, TDM_STAGE_ORDER, type TdmStage } from '../../domain/tdm-stages';
import { canViewTdmResult } from '../../utils/tdm-result';
import {
  EXPORT_FORMAT_OPTIONS,
  HERO_COMPACT_SCROLL_THRESHOLD,
  RESULT_FLOW_BRIDGES,
  RESULT_VIEW_TITLE,
  buildConnectionCountMap,
  buildFlowPathDescriptors,
  buildFlowReportContent,
  buildFlowReportContentForEdge,
  buildTheoryStatusSummary,
  buildWordExportHtml,
  downloadWordDocument,
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
  sanitizeExportFilename,
  type ExportFormatOption,
  type FlowPathDescriptor,
  type ResultBridgeKind,
  type ResultExportFormat
} from './result-view-utils';
import { ResultViewBlueprintLayer } from './result-view-blueprint-layer';
import { ResultViewFlowInspector, RhLegendMicro } from './result-view-flow-inspector';
import { ResultViewGrainientBackdrop } from './result-view-grainient-backdrop';
import { TdmGlassSurface, tdmStageToGlassStage } from './tdm-glass-surface';
import styles from './result-view.module.sass';

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;
const FOCUS_TRANSITION = { duration: 0.3, ease: PREMIUM_EASE };
const HERO_ENTRANCE = { duration: 0.42, ease: PREMIUM_EASE };
const RIPPLE_TRANSITION = { duration: 0.52, ease: PREMIUM_EASE };
const CONNECTION_DRAW = { duration: 0.4, ease: PREMIUM_EASE };
const MARKER_REVEAL = { duration: 0.28, ease: PREMIUM_EASE };
const CARD_FLOAT_Y = -4;
const CARD_FLOAT_SCALE = 1.012;

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

function ExportFormatIcon({ format }: { format: ResultExportFormat }) {
  switch (format) {
    case 'pdf':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.exportOptionIcon}>
          <path
            d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M14 3v5h5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.5 13h7M8.5 16.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'png':
    case 'jpeg':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.exportOptionIcon}>
          <rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="9" cy="10" r="1.5" fill="currentColor" />
          <path d="m5.5 17 4.5-4 3 2.5 2.5-2 3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case 'svg':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.exportOptionIcon}>
          <path
            d="M5 5h9l5 5v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M14 5v5h5M8 14.5h8M8 17.5h5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'word':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.exportOptionIcon}>
          <path
            d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M14 3v5h5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.5 12.5 10 17l1.5-3 1.5 3 1.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

function ExportMenu({
  isOpen,
  onToggle,
  onClose,
  onExport,
  shouldReduceMotion
}: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onExport: (format: ResultExportFormat) => void;
  shouldReduceMotion: boolean | null;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTransition = shouldReduceMotion ? { duration: 0.01 } : { duration: 0.24, ease: PREMIUM_EASE };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen, onClose]);

  return (
    <div className={styles.exportMenuWrap} ref={menuRef}>
      <TdmGlassSurface
        variant="strong"
        stage="neutral"
        interactive
        className={[styles.exportTriggerGlass, isOpen ? styles.exportTriggerGlassOpen : ''].filter(Boolean).join(' ')}
      >
        <button
          type="button"
          className={styles.exportTriggerInner}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          onClick={onToggle}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.exportTriggerIcon}>
            <path d="M12 4v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M8.5 11.5 12 15l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span>Exportar</span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={[styles.exportTriggerChevron, isOpen ? styles.exportTriggerChevronOpen : ''].filter(Boolean).join(' ')}
          >
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </TdmGlassSurface>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className={styles.exportMenuMotion}
            role="menu"
            aria-label="Formatos de exportação"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
            transition={menuTransition}
          >
            <TdmGlassSurface variant="strong" stage="neutral" className={styles.exportMenuGlass} contentClassName={styles.exportMenuContent}>
              {EXPORT_FORMAT_OPTIONS.map((option) => (
                <ExportMenuOption key={option.id} option={option} onExport={onExport} />
              ))}
            </TdmGlassSurface>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ExportMenuOption({
  option,
  onExport
}: {
  option: ExportFormatOption;
  onExport: (format: ResultExportFormat) => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={[styles.exportOption, option.available ? '' : styles.exportOptionDisabled].filter(Boolean).join(' ')}
      disabled={!option.available}
      onClick={() => option.available && onExport(option.id)}
    >
      <ExportFormatIcon format={option.id} />
      <span className={styles.exportOptionCopy}>
        <span className={styles.exportOptionLabel}>{option.label}</span>
        <span className={styles.exportOptionDescription}>
          {option.available ? option.description : option.unavailableNote ?? option.description}
        </span>
      </span>
    </button>
  );
}

function StageAccentTile({ stage }: { stage: TdmStage }) {
  const theme = getResultStageAccent(stage);

  return (
    <span
      className={styles.stageAccentTile}
      style={{ '--stage-accent': theme.accent, '--stage-glow': theme.glow } as CSSProperties}
      aria-hidden="true"
    >
      <span className={styles.stageAccentTileCore} />
    </span>
  );
}

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
  const [isHovered, setIsHovered] = useState(false);
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
        isDisabled ? styles.readingCardDisabled : '',
        isHovered && !isFocused && !isDimmed && !isDisabled ? styles.readingCardHover : ''
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
      whileHover={
        shouldReduceMotion || isFocused || isDimmed || isDisabled
          ? undefined
          : { y: -2, transition: { duration: 0.22 } }
      }
      animate={{
        opacity: isDisabled && !isFocused ? 0.34 : isDimmed ? 0.45 : isHighlighted && !isFocused ? 0.94 : 1,
        y: isFocused ? CARD_FLOAT_Y : 0,
        scale: isFocused ? CARD_FLOAT_SCALE : isHighlighted && !isDimmed ? 1.004 : 1
      }}
      transition={shouldReduceMotion ? { duration: 0.01 } : FOCUS_TRANSITION}
    >
      <TdmGlassSurface
        variant="subtle"
        stage={tdmStageToGlassStage(stage)}
        interactive
        className={styles.readingCardGlass}
        contentClassName={styles.readingCardContent}
        style={
          {
            '--stage-accent': theme.accent,
            '--stage-border': theme.border,
            '--stage-glow': theme.glow
          } as CSSProperties
        }
      >
        <span className={styles.readingCardAccent} aria-hidden="true" />
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
        <header className={styles.readingCardHeader}>
        <div className={styles.readingCardTitleRow}>
          <StageAccentTile stage={stage} />
          <h3 className={styles.readingCardTitle}>{node.title}</h3>
        </div>
        {(incomingCount > 0 || outgoingCount > 0) && (
          <div className={styles.readingCardConnections} aria-label="Conexões relacionadas">
            {incomingCount > 0 ? <span className={styles.connectionBadge}>← {incomingCount}</span> : null}
            {outgoingCount > 0 ? <span className={styles.connectionBadge}>→ {outgoingCount}</span> : null}
          </div>
        )}
      </header>
      <p className={styles.readingCardDescription}>{description}</p>
      {hasDetails ? (
        <div className={styles.readingCardMeta}>
          <p className={styles.readingCardMetaLabel}>Detalhes</p>
          <p className={styles.readingCardMetaText}>{node.advancedDetails}</p>
        </div>
      ) : null}
      {hasNotes ? (
        <div className={styles.readingCardMeta}>
          <p className={styles.readingCardMetaLabel}>Notas</p>
          <p className={styles.readingCardMetaText}>{node.shortNotes}</p>
        </div>
      ) : null}
      </TdmGlassSurface>
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
  const [isHeroCompact, setIsHeroCompact] = useState(false);
  const viewRef = useRef<HTMLElement>(null);
  const resultExportRef = useRef<HTMLDivElement>(null);
  const flowViewportRef = useRef<HTMLDivElement>(null);
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

  const handleSelectNode = useCallback((nodeId: string) => {
    setFocusedEdgeId(null);
    setFocusedNodeId((current) => (current === nodeId ? null : nodeId));
  }, []);

  const handleSelectEdge = useCallback((edgeId: string) => {
    setFocusedNodeId(null);
    setFocusedEdgeId((current) => (current === edgeId ? null : edgeId));
  }, []);

  const handleExport = useCallback(
    (format: ResultExportFormat) => {
      setExportMenuOpen(false);

      if (format === 'pdf') {
        window.print();
        return;
      }

      if (format === 'word') {
        const html = buildWordExportHtml({ title, description, nodes, edges });
        downloadWordDocument(html, `${sanitizeExportFilename(title)}.doc`);
      }
    },
    [description, edges, nodes, title]
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
        <div ref={resultExportRef} className={styles.exportTarget}>
          <motion.header
            className={[
              styles.hero,
              isHeroCompact ? styles.heroCompact : ''
            ]
              .filter(Boolean)
              .join(' ')}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0.01 } : HERO_ENTRANCE}
          >
            <span className={styles.heroRibbon} aria-hidden="true" />

            <div className={styles.heroInner}>
              <div className={styles.heroLeft}>
                <span className={styles.heroEditorialLine} aria-hidden="true" />
                <p className={styles.kicker}>Resultado da Teoria da Mudança</p>
                <h1 className={styles.title}>{RESULT_VIEW_TITLE}</h1>
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

              <div className={[styles.heroRight, styles.noPrint].join(' ')}>
                <div className={styles.heroActions}>
                  {showExportActions ? (
                    <ExportMenu
                      isOpen={exportMenuOpen}
                      onToggle={() => setExportMenuOpen((current) => !current)}
                      onClose={() => setExportMenuOpen(false)}
                      onExport={handleExport}
                      shouldReduceMotion={shouldReduceMotion}
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

                <div className={styles.flowInspectorSlot}>
                  <AnimatePresence mode="wait">
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
                      >
                        <RhLegendMicro className={styles.heroRhMicro} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.header>

          <div className={[styles.flowInspectorMobile, styles.noPrint].join(' ')}>
            <AnimatePresence mode="wait">
              {flowInspectorContent ? (
                <ResultViewFlowInspector
                  key={flowInspectorContent.edgeId ?? flowInspectorContent.nodeId}
                  content={flowInspectorContent}
                />
              ) : null}
            </AnimatePresence>
          </div>

          <section className={styles.flowSection} aria-label="Fluxo da teoria da mudança">
            <div className={styles.flowViewport} ref={flowViewportRef}>
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
                        <TdmGlassSurface
                          variant="default"
                          stage={tdmStageToGlassStage(stage)}
                          className={[
                            styles.stageColumn,
                            styles[getResultStageClassName(stage) as keyof typeof styles],
                            columnHeaderState.isDimmed ? styles.stageColumnDimmed : ''
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          contentClassName={styles.stageColumnContent}
                          style={
                            {
                              '--stage-accent': theme.accent,
                              '--stage-accent-soft': theme.accentSoft,
                              '--stage-border': theme.border,
                              '--stage-glow': theme.glow
                            } as CSSProperties
                          }
                        >
                          <header className={columnHeaderClassName}>
                            <div className={styles.columnTitleRow}>
                              <span className={styles.columnAccentDot} aria-hidden="true" />
                              <h2 className={styles.columnTitle}>{TDM_STAGE_LABELS[stage]}</h2>
                            </div>
                            <span className={styles.columnCount}>
                              {stageNodes.length} {stageNodes.length === 1 ? 'item' : 'itens'}
                            </span>
                          </header>

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
                        </TdmGlassSurface>
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

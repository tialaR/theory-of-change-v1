'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
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
  buildTheoryStatusSummary,
  getCardHighlightState,
  getColumnHeaderState,
  getResultStageAccent,
  getResultStageClassName,
  groupNodesByStage,
  type ResultExportFormat
} from './result-view-utils';
import { ResultViewBlueprintLayer } from './result-view-blueprint-layer';
import { ResultViewExportMenu } from './result-view-export-menu/result-view-export-menu';
import { FlowCausalOverlay, ResultFlowBridge } from './result-flow-visualization/result-flow-visualization';
import { ResultReadingCard } from './result-reading-card/result-reading-card';
import { useResultViewFocusController } from './result-view-focus-controller/use-result-view-focus-controller';
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
const HERO_ENTRANCE = { duration: 0.42, ease: PREMIUM_EASE };

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
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [isHeroCompact, setIsHeroCompact] = useState(false);
  const viewRef = useRef<HTMLElement>(null);
  const resultExportRef = useRef<HTMLDivElement>(null);
  const flowViewportRef = useRef<HTMLDivElement>(null);
  const columnViewportRefs = useRef<Map<string, HTMLElement>>(new Map());
  const shouldReduceMotion = useReducedMotion();
  const {
    focusedNodeId,
    focusedEdgeId,
    relatedNodeIds,
    relatedEdgeIds,
    flowInspectorContent,
    edgeEndpointIds,
    flowInspectorSlotRef,
    flowInspectorMobileRef,
    cardRefs,
    registerCardRef,
    handleSelectNode,
    handleSelectEdge,
    clearFocus
  } = useResultViewFocusController({ nodes, edges, shouldReduceMotion });

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

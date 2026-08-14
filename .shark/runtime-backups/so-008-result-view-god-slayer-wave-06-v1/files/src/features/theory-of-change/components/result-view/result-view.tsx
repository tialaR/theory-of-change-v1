'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useReducedMotion } from 'motion/react';
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
  RESULT_FLOW_BRIDGES,
  buildConnectionCountMap,
  getCardHighlightState,
  getColumnHeaderState,
  getResultStageAccent,
  getResultStageClassName,
  groupNodesByStage,
  type ResultExportFormat
} from './result-view-utils';
import { ResultViewBlueprintLayer } from './result-view-blueprint-layer';
import { FlowCausalOverlay, ResultFlowBridge } from './result-flow-visualization/result-flow-visualization';
import { ResultReadingCard } from './result-reading-card/result-reading-card';
import { useResultViewFocusController } from './result-view-focus-controller/use-result-view-focus-controller';
import { ResultViewGrainientBackdrop } from './result-view-grainient-backdrop';
import { TdmGlassSurface } from './tdm-glass-surface';
import { ResultViewHero } from './result-view-hero/result-view-hero';
import { useResultViewHeroController } from './result-view-hero/use-result-view-hero-controller';
import {
  LiquidGlassMonochromeBackdrop,
  ResultLiquidColumn,
  getLiquidGlassStageTheme
} from './liquid-glass';
import styles from './result-view.module.sass';

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
  const viewRef = useRef<HTMLElement>(null);
  const resultExportRef = useRef<HTMLDivElement>(null);
  const flowViewportRef = useRef<HTMLDivElement>(null);
  const columnViewportRefs = useRef<Map<string, HTMLElement>>(new Map());
  const shouldReduceMotion = useReducedMotion();
  const isComplete = canViewTdmResult(nodes, edges);
  const { isHeroCompact } = useResultViewHeroController({ viewRef, isComplete });
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
          <ResultViewHero
            nodes={nodes}
            edges={edges}
            description={description}
            backLabel={backLabel}
            showExportActions={showExportActions}
            exportMenuOpen={exportMenuOpen}
            isExporting={isExporting}
            isHeroCompact={isHeroCompact}
            shouldReduceMotion={shouldReduceMotion}
            flowInspectorContent={flowInspectorContent}
            flowInspectorSlotRef={flowInspectorSlotRef}
            flowInspectorMobileRef={flowInspectorMobileRef}
            onToggleExportMenu={() => setExportMenuOpen((current) => !current)}
            onCloseExportMenu={() => setExportMenuOpen(false)}
            onExport={handleExport}
            onBack={onBack}
          />

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

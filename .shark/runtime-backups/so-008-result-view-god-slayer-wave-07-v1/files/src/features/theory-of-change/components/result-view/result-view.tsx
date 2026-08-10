'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import type { TdmEdge, TdmNode } from '../../domain/tdm-types';
import { canViewTdmResult } from '../../utils/tdm-result';
import {
  buildTheoryExportModel,
  exportTheoryDocx,
  exportTheoryPdf,
  exportTheoryPng,
  exportTheorySvg
} from '@/features/theory-of-change/export';
import { type ResultExportFormat } from './result-view-utils';
import { useResultViewFocusController } from './result-view-focus-controller/use-result-view-focus-controller';
import { ResultViewGrainientBackdrop } from './result-view-grainient-backdrop';
import { TdmGlassSurface } from './tdm-glass-surface';
import { ResultViewHero } from './result-view-hero/result-view-hero';
import { useResultViewHeroController } from './result-view-hero/use-result-view-hero-controller';
import { ResultTheoryFlow } from './result-theory-flow/result-theory-flow';
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

          <ResultTheoryFlow
            nodes={nodes}
            edges={edges}
            focusedNodeId={focusedNodeId}
            focusedEdgeId={focusedEdgeId}
            relatedNodeIds={relatedNodeIds}
            relatedEdgeIds={relatedEdgeIds}
            edgeEndpointIds={edgeEndpointIds}
            cardRefs={cardRefs}
            registerCardRef={registerCardRef}
            onSelectNode={handleSelectNode}
            onSelectEdge={handleSelectEdge}
            shouldReduceMotion={shouldReduceMotion}
          />
        </div>
      </div>
    </main>
  );
}

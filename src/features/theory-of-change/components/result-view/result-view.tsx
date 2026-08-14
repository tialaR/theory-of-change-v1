'use client';

import { useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import type { TdmEdge, TdmNode } from '../../domain/tdm-types';
import { canViewTdmResult } from '../../utils/tdm-result';
import { useResultViewFocusController } from './result-view-focus-controller/use-result-view-focus-controller';
import { ResultViewGrainientBackdrop } from './result-view-grainient-backdrop';
import { TdmGlassSurface } from './tdm-glass-surface';
import { ResultViewHero } from './result-view-hero/result-view-hero';
import { useResultViewHeroController } from './result-view-hero/use-result-view-hero-controller';
import { ResultTheoryFlow } from './result-theory-flow/result-theory-flow';
import { useResultViewExportController } from './result-view-export-controller/use-result-view-export-controller';
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
  const viewRef = useRef<HTMLElement>(null);
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

  const {
    exportMenuOpen,
    isExporting,
    exportStatus,
    resultExportRef,
    handleExport,
    toggleExportMenu,
    closeExportMenu
  } = useResultViewExportController({ title, nodes, edges, clearFocus });


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
            onToggleExportMenu={toggleExportMenu}
            onCloseExportMenu={closeExportMenu}
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

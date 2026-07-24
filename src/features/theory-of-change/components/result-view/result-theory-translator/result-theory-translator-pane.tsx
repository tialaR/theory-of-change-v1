'use client';

import { AnimatePresence, motion } from 'motion/react';
import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import { TDM_MOTION_TRANSITIONS } from '@/shared/motion/tdm-motion';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button';
import { TheoryNarrativeDocument } from '../result-theory-narrative/theory-narrative-document';
import type { TheoryDocumentModel } from '../result-theory-narrative/theory-narrative.types';
import { ResultTheoryTranslatorExportMenu } from './result-theory-translator-export-menu';
import { ResultTheoryTranslatorHeader } from './result-theory-translator-header';
import { THEORY_TRANSLATOR_LABELS } from './result-theory-translator.constants';
import { useResultTheoryTranslatorPane } from './use-result-theory-translator-pane';
import styles from './result-theory-translator-pane.module.sass';

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12">
      <path
        d="M3 3l6 6M9 3 3 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

type ResultTheoryTranslatorPaneProps = {
  viewModel: TheoryDocumentModel | null;
  theoryTitle?: string;
  nodes?: TdmNode[];
  edges?: TdmEdge[];
  isExpanded: boolean;
  highlightMarkerId?: string | null;
  onExpand: () => void;
  onCollapse: () => void;
  onPaneAnimationComplete?: () => void;
};

export function ResultTheoryTranslatorPane({
  viewModel,
  theoryTitle = 'Teoria da mudança',
  nodes = [],
  edges = [],
  isExpanded,
  highlightMarkerId = null,
  onExpand,
  onCollapse,
  onPaneAnimationComplete
}: ResultTheoryTranslatorPaneProps) {
  const {
    reduce,
    panelId,
    closeRef,
    scrollRef,
    documentKey,
    isExporting,
    exportStatus,
    handleExport
  } = useResultTheoryTranslatorPane({
    viewModel,
    theoryTitle,
    nodes,
    edges,
    isExpanded,
    highlightMarkerId,
    onCollapse
  });
  const duration = reduce ? 0.01 : TDM_MOTION_TRANSITIONS.panel.duration;
  const contentDuration = reduce ? 0.01 : TDM_MOTION_TRANSITIONS.opacity.duration;
  const hasScopedSelection = viewModel?.scope === 'scoped';

  const exportControl = viewModel ? (
    <ResultTheoryTranslatorExportMenu
      hasScopedSelection={Boolean(hasScopedSelection)}
      isExporting={isExporting}
      onExport={handleExport}
    />
  ) : null;

  return (
    <div
      className={styles.root}
      data-expanded={isExpanded ? 'true' : 'false'}
      data-translator-expanded={isExpanded ? 'true' : 'false'}
      data-highlight-marker-id={highlightMarkerId ?? ''}
    >
      <AnimatePresence initial={false} mode="sync">
        {!isExpanded ? (
          <motion.div
            key="translator-rail"
            className={styles.railHost}
            data-export-exclude="true"
            initial={reduce ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: 10 }}
            transition={{ duration, ease: TDM_MOTION_TRANSITIONS.panel.ease }}
          >
            <button
              type="button"
              className={styles.rail}
              onClick={onExpand}
              aria-expanded={false}
              aria-controls={panelId}
              aria-label={THEORY_TRANSLATOR_LABELS.open}
              title={THEORY_TRANSLATOR_LABELS.open}
            >
              <span className={styles.railLabel}>{THEORY_TRANSLATOR_LABELS.kickerUpper}</span>
              <span className={styles.railChevron} aria-hidden="true">›</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false} mode="sync">
        {isExpanded ? (
          <motion.aside
            key="translator-panel"
            id={panelId}
            className={styles.panel}
            role="complementary"
            aria-label={THEORY_TRANSLATOR_LABELS.kicker}
            initial={reduce ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: 16 }}
            transition={{ duration, ease: TDM_MOTION_TRANSITIONS.panel.ease }}
            onAnimationComplete={onPaneAnimationComplete}
          >
            {viewModel ? (
              <>
                <div
                  className={styles.stickyHeader}
                  data-export-exclude="true"
                  aria-busy={isExporting || undefined}
                >
                  <ResultTheoryTranslatorHeader
                    onClose={onCollapse}
                    closeRef={closeRef}
                    exportControl={exportControl}
                  />
                  {exportStatus ? (
                    <p
                      className={styles.exportStatus}
                      data-tone={exportStatus.tone}
                      role="status"
                      aria-live="polite"
                    >
                      {exportStatus.message}
                    </p>
                  ) : null}
                </div>

                <motion.div
                  key={documentKey}
                  ref={scrollRef}
                  className={styles.scroll}
                  data-theory-document-scroller="true"
                  tabIndex={0}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: contentDuration,
                    ease: TDM_MOTION_TRANSITIONS.opacity.ease
                  }}
                >
                  <TheoryNarrativeDocument
                    document={viewModel}
                    highlightMarkerId={highlightMarkerId}
                    presentation="screen"
                    showHeader
                  />
                </motion.div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.stickyHeader}>
                  <header className={styles.header}>
                    <div className={styles.headerCopy}>
                      <p className={styles.kicker}>{THEORY_TRANSLATOR_LABELS.kickerUpper}</p>
                      <h2 className={styles.title}>{THEORY_TRANSLATOR_LABELS.documentTitleMacro}</h2>
                    </div>
                    <div className={styles.headerActions}>
                      <TdmIconButton
                        ref={closeRef}
                        variant="subtle"
                        size="md"
                        aria-label={THEORY_TRANSLATOR_LABELS.close}
                        tooltip={THEORY_TRANSLATOR_LABELS.close}
                        onClick={onCollapse}
                      >
                        <CloseIcon />
                      </TdmIconButton>
                    </div>
                  </header>
                </div>
                <p className={styles.emptyCopy}>{THEORY_TRANSLATOR_LABELS.empty}</p>
              </div>
            )}
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

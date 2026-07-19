'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import { TDM_MOTION_TRANSITIONS } from '@/shared/motion/tdm-motion';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button/tdm-icon-button';
import { TheoryNarrativeDocument } from '../result-theory-narrative/theory-narrative-document';
import type { TheoryDocumentModel } from '../result-theory-narrative/theory-narrative.types';
import { exportTheoryDocumentDocx } from './export/theory-document-export-docx';
import { buildTheoryDocumentExportPayload } from './export/theory-document-export.mapper';
import { exportTheoryDocumentPdf } from './export/theory-document-export-pdf';
import type {
  TheoryDocumentExportFormat,
  TheoryDocumentExportScope
} from './export/theory-document-export.types';
import { ResultTheoryTranslatorExportMenu } from './result-theory-translator-export-menu';
import { ResultTheoryTranslatorHeader } from './result-theory-translator-header';
import { THEORY_TRANSLATOR_LABELS } from './result-theory-translator.constants';
import { buildTheoryTranslatorViewModel } from './result-theory-translator.mapper';
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

type ExportStatus = {
  tone: 'info' | 'error';
  message: string;
} | null;

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
  const reduce = useReducedMotion();
  const panelId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasContent = Boolean(viewModel);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>(null);
  const documentKey = viewModel
    ? `${viewModel.scope}:${viewModel.selection ? `${viewModel.selection.type}-${viewModel.selection.id}` : 'all'}`
    : 'empty';
  const [statusDocumentKey, setStatusDocumentKey] = useState(documentKey);

  if (statusDocumentKey !== documentKey) {
    setStatusDocumentKey(documentKey);
    setExportStatus(null);
  }

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (document.querySelector('[data-export-menu-open="true"]')) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onCollapse();
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [isExpanded, onCollapse]);

  useEffect(() => {
    if (isExpanded && hasContent) {
      closeRef.current?.focus({ preventScroll: true });
    }
  }, [hasContent, isExpanded, viewModel?.scope, viewModel?.selection]);

  useEffect(() => {
    if (!isExpanded || !highlightMarkerId || !scrollRef.current) {
      return;
    }

    const markerId = highlightMarkerId.includes('::')
      ? highlightMarkerId.slice(0, highlightMarkerId.indexOf('::'))
      : highlightMarkerId;
    if (!markerId) {
      return;
    }
    const target = scrollRef.current.querySelector<HTMLElement>(
      `[data-marker-id="${CSS.escape(markerId)}"]`
    );
    if (!target) {
      return;
    }

    target.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }, [highlightMarkerId, isExpanded, reduce, viewModel?.selection]);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll || !isExpanded) {
      return;
    }

    let hideTimer: number | null = null;

    const onScroll = () => {
      scroll.dataset.scrolling = 'true';
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
      hideTimer = window.setTimeout(() => {
        delete scroll.dataset.scrolling;
      }, 900);
    };

    scroll.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scroll.removeEventListener('scroll', onScroll);
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
    };
  }, [isExpanded, viewModel?.selection]);

  const duration = reduce ? 0.01 : TDM_MOTION_TRANSITIONS.panel.duration;
  const contentDuration = reduce ? 0.01 : TDM_MOTION_TRANSITIONS.opacity.duration;
  const panelEase = TDM_MOTION_TRANSITIONS.panel.ease;
  const contentEase = TDM_MOTION_TRANSITIONS.opacity.ease;
  const hasScopedSelection = viewModel?.scope === 'scoped';

  const handleExport = async (
    scope: TheoryDocumentExportScope,
    format: TheoryDocumentExportFormat
  ) => {
    setIsExporting(true);
    setExportStatus({ tone: 'info', message: THEORY_TRANSLATOR_LABELS.exporting });

    try {
      let documentForExport: TheoryDocumentModel | null = null;

      if (scope === 'scoped') {
        if (!viewModel || viewModel.scope !== 'scoped' || !viewModel.selection) {
          setExportStatus({
            tone: 'error',
            message: 'Selecione um fluxo válido antes de exportar o recorte.'
          });
          return;
        }
        documentForExport = buildTheoryTranslatorViewModel(viewModel.selection, nodes, edges, {
          includeReferencesPage: true
        });
      } else {
        documentForExport = buildTheoryTranslatorViewModel(null, nodes, edges);
      }

      if (!documentForExport) {
        setExportStatus({
          tone: 'error',
          message: 'Não há narrativa disponível para exportar.'
        });
        return;
      }

      const payload = buildTheoryDocumentExportPayload(
        theoryTitle,
        scope,
        documentForExport,
        format
      );

      const result =
        format === 'pdf'
          ? await exportTheoryDocumentPdf(payload)
          : await exportTheoryDocumentDocx(payload);

      if (result.status === 'success') {
        const label = format === 'pdf' ? 'PDF' : 'DOCX';
        setExportStatus({
          tone: 'info',
          message: `${label} gerado: ${result.filename}`
        });
        return;
      }

      if (result.status === 'unavailable') {
        setExportStatus({ tone: 'error', message: result.reason });
        return;
      }

      setExportStatus({ tone: 'error', message: result.message });
    } catch (error) {
      setExportStatus({
        tone: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Falha inesperada ao exportar a narrativa.'
      });
    } finally {
      setIsExporting(false);
    }
  };

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
            transition={{ duration, ease: panelEase }}
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
              <span className={styles.railChevron} aria-hidden="true">
                ›
              </span>
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
            transition={{ duration, ease: panelEase }}
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
                  transition={{ duration: contentDuration, ease: contentEase }}
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

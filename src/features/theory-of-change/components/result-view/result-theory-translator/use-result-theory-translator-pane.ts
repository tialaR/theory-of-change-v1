'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import type { TheoryDocumentModel } from '../result-theory-narrative/theory-narrative.types';
import { buildTheoryDocumentExportPayload } from './export/theory-document-export.mapper';
import type {
  TheoryDocumentExportFormat,
  TheoryDocumentExportScope
} from './export/theory-document-export.types';
import { THEORY_TRANSLATOR_LABELS } from './result-theory-translator.constants';
import { buildTheoryTranslatorViewModel } from './result-theory-translator.mapper';

export type ExportStatus = {
  tone: 'info' | 'error';
  message: string;
} | null;

type UseResultTheoryTranslatorPaneOptions = {
  viewModel: TheoryDocumentModel | null;
  theoryTitle: string;
  nodes: TdmNode[];
  edges: TdmEdge[];
  isExpanded: boolean;
  highlightMarkerId: string | null;
  onCollapse: () => void;
};

function getDocumentKey(viewModel: TheoryDocumentModel | null) {
  if (!viewModel) {
    return 'empty';
  }

  const selectionKey = viewModel.selection
    ? `${viewModel.selection.type}-${viewModel.selection.id}`
    : 'all';

  return `${viewModel.scope}:${selectionKey}`;
}

export function useResultTheoryTranslatorPane({
  viewModel,
  theoryTitle,
  nodes,
  edges,
  isExpanded,
  highlightMarkerId,
  onCollapse
}: UseResultTheoryTranslatorPaneOptions) {
  const reduce = useReducedMotion();
  const panelId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const documentKey = getDocumentKey(viewModel);
  const [exportFeedback, setExportFeedback] = useState<{
    documentKey: string;
    status: ExportStatus;
  }>({
    documentKey,
    status: null
  });
  const exportStatus = exportFeedback.documentKey === documentKey
    ? exportFeedback.status
    : null;

  const setExportStatus = (status: ExportStatus) => {
    setExportFeedback({ documentKey, status });
  };

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
    if (isExpanded && viewModel) {
      closeRef.current?.focus({ preventScroll: true });
    }
  }, [isExpanded, viewModel]);

  useEffect(() => {
    if (!isExpanded || !highlightMarkerId || !scrollRef.current) {
      return;
    }

    const separatorIndex = highlightMarkerId.indexOf('::');
    const markerId = separatorIndex >= 0
      ? highlightMarkerId.slice(0, separatorIndex)
      : highlightMarkerId;

    if (!markerId) {
      return;
    }

    const target = scrollRef.current.querySelector<HTMLElement>(
      `[data-marker-id="${CSS.escape(markerId)}"]`
    );

    target?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
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

  const handleExport = async (
    scope: TheoryDocumentExportScope,
    format: TheoryDocumentExportFormat
  ) => {
    setIsExporting(true);
    setExportStatus({ tone: 'info', message: THEORY_TRANSLATOR_LABELS.exporting });

    try {
      const documentForExport = scope === 'scoped'
        ? buildScopedDocument(viewModel, nodes, edges)
        : buildTheoryTranslatorViewModel(null, nodes, edges);

      if (!documentForExport) {
        setExportStatus({
          tone: 'error',
          message: scope === 'scoped'
            ? 'Selecione um fluxo válido antes de exportar o recorte.'
            : 'Não há narrativa disponível para exportar.'
        });
        return;
      }

      const payload = buildTheoryDocumentExportPayload(
        theoryTitle,
        scope,
        documentForExport,
        format
      );

      const result = format === 'pdf'
        ? await import('./export/theory-document-export-pdf').then(({ exportTheoryDocumentPdf }) =>
            exportTheoryDocumentPdf(payload)
          )
        : await import('./export/theory-document-export-docx').then(({ exportTheoryDocumentDocx }) =>
            exportTheoryDocumentDocx(payload)
          );

      if (result.status === 'success') {
        setExportStatus({
          tone: 'info',
          message: `${format === 'pdf' ? 'PDF' : 'DOCX'} gerado: ${result.filename}`
        });
        return;
      }

      setExportStatus({
        tone: 'error',
        message: result.status === 'unavailable' ? result.reason : result.message
      });
    } catch (error) {
      setExportStatus({
        tone: 'error',
        message: error instanceof Error
          ? error.message
          : 'Falha inesperada ao exportar a narrativa.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    reduce,
    panelId,
    closeRef,
    scrollRef,
    documentKey,
    isExporting,
    exportStatus,
    handleExport
  };
}

function buildScopedDocument(
  viewModel: TheoryDocumentModel | null,
  nodes: TdmNode[],
  edges: TdmEdge[]
) {
  if (!viewModel || viewModel.scope !== 'scoped' || !viewModel.selection) {
    return null;
  }

  return buildTheoryTranslatorViewModel(viewModel.selection, nodes, edges, {
    includeReferencesPage: true
  });
}

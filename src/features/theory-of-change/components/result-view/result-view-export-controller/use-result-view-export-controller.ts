import { useCallback, useEffect, useRef, useState } from 'react';
import type { TdmEdge, TdmNode } from '../../../domain/tdm-types';
import {
  buildTheoryExportModel,
  exportTheoryDocx,
  exportTheoryPdf,
  exportTheoryPng,
  exportTheorySvg
} from '@/features/theory-of-change/export';
import type { ResultExportFormat } from '../result-view-utils';

export function useResultViewExportController({
  title,
  nodes,
  edges,
  clearFocus
}: {
  title: string;
  nodes: TdmNode[];
  edges: TdmEdge[];
  clearFocus: () => void;
}) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const resultExportRef = useRef<HTMLDivElement>(null);

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

          setExportStatus(
            result.status === 'error'
              ? result.message
              : result.message ?? `${format.toUpperCase()} gerado: ${result.filename}`
          );
          return;
        }

        const documentModel = buildTheoryExportModel(null, nodes, edges);
        if (!documentModel) {
          setExportStatus('Não há narrativa disponível para exportar.');
          return;
        }

        const result =
          format === 'pdf'
            ? await exportTheoryPdf(documentModel, title)
            : await exportTheoryDocx(documentModel, title);

        setExportStatus(
          result.status === 'success'
            ? result.message ?? `${format === 'pdf' ? 'PDF' : 'DOCX'} gerado: ${result.filename}`
            : result.message
        );
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

  return {
    exportMenuOpen,
    isExporting,
    exportStatus,
    resultExportRef,
    handleExport,
    toggleExportMenu: () => setExportMenuOpen((current) => !current),
    closeExportMenu: () => setExportMenuOpen(false)
  };
}

'use client';

import { useCallback, useRef, useState } from 'react';
import type { Node } from '@xyflow/react';
import type { ResultImageExportFormat } from './result-toolbar/result-toolbar';

type UseTheoryImageExportOptions = {
  theoryTitle: string;
  nodes: Node[];
  edgeCount: number;
  preferMountedReactFlow?: boolean;
};

export function useTheoryImageExport({
  theoryTitle,
  nodes,
  edgeCount,
  preferMountedReactFlow = false
}: UseTheoryImageExportOptions) {
  const exportRootRef = useRef<HTMLElement | null>(null);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportingImageFormat, setExportingImageFormat] = useState<ResultImageExportFormat | null>(null);
  const [exportImageError, setExportImageError] = useState<string | null>(null);

  const handleExportImage = useCallback(
    async (format: ResultImageExportFormat) => {
      const resultRoot = exportRootRef.current;
      if (!resultRoot || isExportingImage) return;

      setIsExportingImage(true);
      setExportingImageFormat(format);
      setExportImageError(null);

      try {
        const reactFlowHost = preferMountedReactFlow
          ? (document.querySelector('.react-flow') as HTMLElement | null)
          : null;
        const { exportTheoryPng, exportTheorySvg } = await import(
          '@/features/theory-of-change/export/image/export-theory-image'
        );
        const imageOptions = {
          container: reactFlowHost ?? resultRoot,
          theoryTitle,
          nodes: reactFlowHost ? nodes : undefined,
          nodeCount: nodes.length,
          edgeCount
        };
        const result = format === 'png'
          ? await exportTheoryPng(imageOptions)
          : await exportTheorySvg(imageOptions);

        if (result.status === 'error') setExportImageError(result.message);
      } catch (error) {
        setExportImageError(
          error instanceof Error ? error.message : 'Falha inesperada ao exportar o diagrama.'
        );
      } finally {
        setIsExportingImage(false);
        setExportingImageFormat(null);
      }
    },
    [edgeCount, isExportingImage, nodes, preferMountedReactFlow, theoryTitle]
  );

  return {
    exportRootRef,
    handleExportImage,
    isExportingImage,
    exportingImageFormat,
    exportImageError
  };
}

import { createElement, type ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import type { TheoryDocumentModel } from '@/features/theory-of-change/components/result-view/result-theory-narrative/theory-narrative.types';
import { downloadBlob } from '../shared/download-blob';
import {
  buildInterpreterExportFilename,
  type TheoryExportResult
} from '../model/theory-export-model';

/**
 * Export the Intérprete document as a structured PDF via `@react-pdf/renderer`.
 * Does not use `window.print()`.
 */
export async function exportTheoryPdf(
  documentModel: TheoryDocumentModel,
  theoryTitle: string,
  options?: { download?: boolean }
): Promise<TheoryExportResult> {
  const format = 'pdf' as const;
  const filename = buildInterpreterExportFilename(theoryTitle, format);

  if (typeof window === 'undefined') {
    return {
      status: 'error',
      format,
      message: 'A exportação em PDF só está disponível no navegador.',
      filename
    };
  }

  try {
    const [{ pdf }, { TheoryPdfDocument }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('./theory-pdf-document')
    ]);

    // TheoryPdfDocument renders <Document>; react-pdf's pdf() types expect DocumentProps.
    const element = createElement(TheoryPdfDocument, {
      document: documentModel,
      theoryTitle
    }) as unknown as ReactElement<DocumentProps>;

    const blob = await pdf(element).toBlob();
    if (options?.download !== false) {
      downloadBlob(blob, filename);
    }

    return {
      status: 'success',
      format,
      filename,
      message: `PDF gerado: ${filename}`
    };
  } catch (error) {
    return {
      status: 'error',
      format,
      filename,
      message:
        error instanceof Error
          ? error.message
          : 'Falha inesperada ao gerar o arquivo PDF.'
    };
  }
}

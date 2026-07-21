import { exportTheoryPdf } from '@/features/theory-of-change/export';
import type {
  TheoryDocumentExportPayload,
  TheoryDocumentExportResult
} from './theory-document-export.types';

/**
 * PDF export — delegates to `@react-pdf/renderer` via the Fase 5B.8 module.
 * Does not use `window.print()`.
 */
export async function exportTheoryDocumentPdf(
  payload: TheoryDocumentExportPayload
): Promise<TheoryDocumentExportResult> {
  const result = await exportTheoryPdf(payload.document, payload.theoryTitle);

  if (result.status === 'success') {
    return {
      status: 'success',
      format: 'pdf',
      filename: result.filename
    };
  }

  return {
    status: 'error',
    format: 'pdf',
    message: result.message
  };
}

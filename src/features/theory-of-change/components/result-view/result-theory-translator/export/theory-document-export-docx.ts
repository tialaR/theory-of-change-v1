import { exportTheoryDocx } from '@/features/theory-of-change/export/docx/export-theory-docx';
import type {
  TheoryDocumentExportPayload,
  TheoryDocumentExportResult
} from './theory-document-export.types';

/**
 * DOCX export — delegates to the Fase 5B.8 export module.
 */
export async function exportTheoryDocumentDocx(
  payload: TheoryDocumentExportPayload
): Promise<TheoryDocumentExportResult> {
  const result = await exportTheoryDocx(payload.document, payload.theoryTitle);

  if (result.status === 'success') {
    return {
      status: 'success',
      format: 'docx',
      filename: result.filename
    };
  }

  return {
    status: 'error',
    format: 'docx',
    message: result.message
  };
}

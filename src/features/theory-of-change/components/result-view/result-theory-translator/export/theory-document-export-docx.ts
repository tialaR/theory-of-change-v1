import type {
  TheoryDocumentExportPayload,
  TheoryDocumentExportResult
} from './theory-document-export.types';

export const DOCX_EXPORT_PENDING_REASON =
  'Exportação DOCX pendente: o projeto não possui biblioteca para gerar arquivos .docx reais (ex.: `docx`). HTML renomeado ou .doc não são aceitos.';

/**
 * DOCX export is intentionally unavailable until an approved dependency is installed.
 * Do not fabricate .docx / .doc files from HTML.
 */
export function exportTheoryDocumentDocx(
  _payload: TheoryDocumentExportPayload
): TheoryDocumentExportResult {
  return {
    status: 'unavailable',
    format: 'docx',
    reason: DOCX_EXPORT_PENDING_REASON
  };
}

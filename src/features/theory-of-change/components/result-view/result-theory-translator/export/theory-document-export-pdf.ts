import { buildTheoryDocumentExportHtml } from './theory-document-export.mapper';
import type {
  TheoryDocumentExportPayload,
  TheoryDocumentExportResult
} from './theory-document-export.types';

/**
 * PDF export via a dedicated print surface (no app chrome).
 * Produces a real PDF when the user chooses “Save as PDF” in the print dialog.
 * No PDF library is installed in this project.
 */
export function exportTheoryDocumentPdf(
  payload: TheoryDocumentExportPayload
): TheoryDocumentExportResult {
  if (typeof window === 'undefined') {
    return {
      status: 'error',
      format: 'pdf',
      message: 'A exportação em PDF só está disponível no navegador.'
    };
  }

  try {
    const html = buildTheoryDocumentExportHtml(payload);
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!printWindow) {
      return {
        status: 'error',
        format: 'pdf',
        message: 'Não foi possível abrir a janela de impressão. Verifique se o navegador bloqueou pop-ups.'
      };
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.document.title = payload.filename.replace(/\.pdf$/i, '');

    const triggerPrint = () => {
      printWindow.focus();
      printWindow.print();
    };

    if (printWindow.document.readyState === 'complete') {
      window.setTimeout(triggerPrint, 120);
    } else {
      printWindow.addEventListener('load', () => window.setTimeout(triggerPrint, 120), { once: true });
    }

    return {
      status: 'success',
      format: 'pdf',
      filename: payload.filename
    };
  } catch (error) {
    return {
      status: 'error',
      format: 'pdf',
      message:
        error instanceof Error
          ? error.message
          : 'Falha inesperada ao preparar a exportação em PDF.'
    };
  }
}

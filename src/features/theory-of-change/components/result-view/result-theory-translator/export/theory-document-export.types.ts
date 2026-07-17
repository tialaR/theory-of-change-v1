import type { TheoryDocumentModel } from '../../result-theory-narrative/theory-narrative.types';

export type TheoryDocumentPresentation = 'screen' | 'export';

export type TheoryDocumentExportFormat = 'pdf' | 'docx';

export type TheoryDocumentExportScope = 'macro' | 'scoped';

export type TheoryDocumentExportRequest = {
  format: TheoryDocumentExportFormat;
  scope: TheoryDocumentExportScope;
  theoryTitle: string;
  document: TheoryDocumentModel;
};

export type TheoryDocumentExportResult =
  | { status: 'success'; format: TheoryDocumentExportFormat; filename: string }
  | { status: 'unavailable'; format: TheoryDocumentExportFormat; reason: string }
  | { status: 'error'; format: TheoryDocumentExportFormat; message: string };

export type TheoryDocumentExportPayload = {
  filename: string;
  theoryTitle: string;
  document: TheoryDocumentModel;
  includeReferences: boolean;
  references: string[];
};

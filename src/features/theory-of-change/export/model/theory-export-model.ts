import type {
  TheoryDocumentModel,
  TheoryNarrativeDocumentViewModel
} from '@/features/theory-of-change/components/result-view/result-theory-narrative/theory-narrative.types';
import { sanitizeFileName } from '../shared/sanitize-file-name';

export type {
  TheoryDocumentModel,
  TheoryNarrativeDocumentViewModel
};

export type TheoryExportFormat = 'docx' | 'pdf' | 'png' | 'svg';

export type TheoryExportSuccess = {
  status: 'success';
  format: TheoryExportFormat;
  filename: string;
  message?: string;
  width?: number;
  height?: number;
  nodeCount?: number;
  edgeCount?: number;
};

export type TheoryExportError = {
  status: 'error';
  format: TheoryExportFormat;
  message: string;
  filename?: string;
};

export type TheoryExportResult = TheoryExportSuccess | TheoryExportError;

export function buildInterpreterExportFilename(
  theoryTitle: string,
  format: 'docx' | 'pdf'
): string {
  return `${sanitizeFileName(theoryTitle || 'teoria-da-mudanca')}-interprete.${format}`;
}

export function buildFlowExportFilename(
  theoryTitle: string,
  format: 'png' | 'svg'
): string {
  return `${sanitizeFileName(theoryTitle || 'teoria-da-mudanca')}-fluxo.${format}`;
}

export function formatTheoryExportMetadata(document: TheoryDocumentModel): string {
  const { stagesCount, connectionsCount, riskCount, hypothesisCount } = document.metadata;
  const part = (count: number, singular: string, plural: string) =>
    `${count} ${count === 1 ? singular : plural}`;

  return [
    part(stagesCount, 'etapa', 'etapas'),
    part(connectionsCount, 'conexão', 'conexões'),
    part(riskCount, 'risco', 'riscos'),
    part(hypothesisCount, 'hipótese', 'hipóteses')
  ].join(' · ');
}

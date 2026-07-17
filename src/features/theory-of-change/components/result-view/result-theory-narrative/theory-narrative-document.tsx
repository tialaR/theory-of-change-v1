'use client';

import { TheoryDocumentPage } from './theory-document-page';
import type {
  TheoryDocumentModel,
  TheoryDocumentPresentation
} from './theory-narrative.types';
import styles from './theory-narrative-document.module.sass';

type TheoryNarrativeDocumentProps = {
  document: TheoryDocumentModel;
  highlightMarkerId?: string | null;
  /** When false, header is rendered by the pane chrome. */
  showHeader?: boolean;
  presentation?: TheoryDocumentPresentation;
  /** Screen macro shows references page; scoped screen may omit it. */
  showReferences?: boolean;
};

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatMetadata(
  stagesCount: number,
  connectionsCount: number,
  riskCount: number,
  hypothesisCount: number
): string {
  return [
    pluralize(stagesCount, 'etapa', 'etapas'),
    pluralize(connectionsCount, 'conexão', 'conexões'),
    pluralize(riskCount, 'risco', 'riscos'),
    pluralize(hypothesisCount, 'hipótese', 'hipóteses')
  ].join(' · ');
}

/**
 * Semantic paginated narrative document — render-only.
 * Writing decisions live in the mapper / templates, never here.
 * Presentation: docs/tdm-document-presentation-standard-v2.3.md
 */
export function TheoryNarrativeDocument({
  document: viewModel,
  highlightMarkerId = null,
  showHeader = true,
  presentation = 'screen',
  showReferences
}: TheoryNarrativeDocumentProps) {
  const shouldShowReferences =
    showReferences ?? (presentation === 'screen' ? viewModel.scope === 'macro' : true);

  const pages = shouldShowReferences
    ? viewModel.pages
    : viewModel.pages.filter((page) => page.kind !== 'references');

  return (
    <div
      className={styles.documentViewport}
      data-theory-narrative-document="true"
      data-mode={viewModel.scope}
      data-presentation={presentation}
    >
      {showHeader ? (
        <header className={styles.stackHeader}>
          <p className={styles.kicker}>INTÉRPRETE DA TEORIA</p>
          <h2 className={styles.title}>{viewModel.title}</h2>
          <p className={styles.meta}>
            {formatMetadata(
              viewModel.metadata.stagesCount,
              viewModel.metadata.connectionsCount,
              viewModel.metadata.riskCount,
              viewModel.metadata.hypothesisCount
            )}
          </p>
        </header>
      ) : null}

      <div className={styles.documentStack}>
        {pages.map((page) => (
          <TheoryDocumentPage
            key={page.id}
            page={page}
            references={viewModel.references}
            highlightMarkerId={highlightMarkerId}
            presentation={presentation}
          />
        ))}
      </div>
    </div>
  );
}

export function formatNarrativeMetadata(
  stagesCount: number,
  connectionsCount: number,
  riskCount = 0,
  hypothesisCount = 0
): string {
  return formatMetadata(stagesCount, connectionsCount, riskCount, hypothesisCount);
}

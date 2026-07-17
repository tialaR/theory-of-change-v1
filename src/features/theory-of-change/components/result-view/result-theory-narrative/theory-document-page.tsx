'use client';

import { TheoryConvergenceMapFigure } from './figures/theory-convergence-map-figure';
import { TheoryFlowOverviewFigure } from './figures/theory-flow-overview-figure';
import { TheoryResourcesMapFigure } from './figures/theory-resources-map-figure';
import { NARRATIVE_LABELS } from './theory-narrative.templates';
import type {
  NarrativeParagraph,
  TheoryDocumentCallout,
  TheoryDocumentFigure,
  TheoryDocumentPageModel,
  TheoryDocumentSection,
  TheoryReference
} from './theory-narrative.types';
import styles from './theory-narrative-document.module.sass';

type TheoryDocumentPageProps = {
  page: TheoryDocumentPageModel;
  references?: TheoryReference[];
  highlightMarkerId?: string | null;
  presentation?: 'screen' | 'export';
};

function isHighlighted(markerId: string, highlightMarkerId?: string | null): boolean {
  if (!highlightMarkerId) {
    return false;
  }
  return highlightMarkerId === markerId || highlightMarkerId.startsWith(`${markerId}::`);
}

function renderFigure(figure: TheoryDocumentFigure) {
  if (figure.kind === 'resources-map') {
    return <TheoryResourcesMapFigure key={figure.id} figure={figure} />;
  }
  if (figure.kind === 'convergence-map') {
    return <TheoryConvergenceMapFigure key={figure.id} figure={figure} />;
  }
  return <TheoryFlowOverviewFigure key={figure.id} figure={figure} />;
}

function renderParagraph(item: NarrativeParagraph, forceNoIndent: boolean) {
  const className =
    forceNoIndent || item.suppressIndent ? styles.paragraphAfterHeading : styles.paragraph;
  return (
    <p key={item.id} className={className} data-role={item.role}>
      {item.text}
    </p>
  );
}

function renderCallout(callout: TheoryDocumentCallout, highlightMarkerId?: string | null) {
  return (
    <aside
      key={callout.id}
      className={styles.callout}
      data-marker={callout.kind}
      data-marker-id={callout.id}
      data-edge-id={callout.edgeId}
      data-highlighted={isHighlighted(callout.id, highlightMarkerId) ? 'true' : 'false'}
    >
      <p className={styles.calloutLabel}>{callout.label}</p>
      <p className={styles.calloutText}>{callout.text}</p>
    </aside>
  );
}

function renderSection(
  section: TheoryDocumentSection,
  highlightMarkerId?: string | null,
  options?: { isReferencesPage?: boolean; references?: TheoryReference[] }
) {
  const heading =
    section.title != null
      ? `${section.number ? `${section.number} ` : ''}${section.title}`
      : null;

  const HeadingTag = section.level === 1 ? 'h2' : section.level === 2 ? 'h3' : 'h4';
  const headingClass =
    section.level === 1
      ? styles.heading1
      : section.level === 2
        ? styles.heading2
        : styles.heading3;

  return (
    <section
      key={section.id}
      className={styles.sectionBlock}
      data-section-id={section.id}
      data-section-level={section.level}
    >
      {heading && !options?.isReferencesPage ? (
        <HeadingTag className={headingClass}>{heading}</HeadingTag>
      ) : null}

      {options?.isReferencesPage ? (
        <>
          <h2 className={styles.referencesTitle}>{NARRATIVE_LABELS.references}</h2>
          {(options.references ?? []).map((reference) => (
            <p key={reference.id} className={styles.referenceItem}>
              {reference.text}
            </p>
          ))}
        </>
      ) : null}

      {section.paragraphs?.map((item, index) =>
        renderParagraph(item, index === 0 && Boolean(heading))
      )}

      {section.figure ? renderFigure(section.figure) : null}

      {section.callouts?.map((callout) => renderCallout(callout, highlightMarkerId))}
    </section>
  );
}

export function TheoryDocumentPage({
  page,
  references = [],
  highlightMarkerId = null,
  presentation = 'screen'
}: TheoryDocumentPageProps) {
  const isReferencesPage = page.kind === 'references';

  return (
    <article
      className={styles.documentPage}
      data-page-id={page.id}
      data-page-kind={page.kind}
      data-page-number={page.pageNumber}
      data-presentation={presentation}
    >
      <div className={styles.pageBody}>
        {page.sections.map((section) =>
          renderSection(section, highlightMarkerId, {
            isReferencesPage: isReferencesPage && section.title === NARRATIVE_LABELS.references,
            references
          })
        )}
      </div>
      <footer className={styles.pageFooter}>
        <span>{page.pageNumber}</span>
      </footer>
    </article>
  );
}

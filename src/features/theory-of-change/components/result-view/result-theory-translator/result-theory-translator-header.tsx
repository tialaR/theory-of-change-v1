import type { ReactNode, Ref } from 'react';
import { THEORY_TRANSLATOR_LABELS } from './result-theory-translator.constants';
import styles from './result-theory-translator-pane.module.sass';

type ResultTheoryTranslatorHeaderProps = {
  onClose: () => void;
  closeRef?: Ref<HTMLButtonElement>;
  exportControl?: ReactNode;
};

/**
 * Interface chrome only — documentary header lives inside TheoryNarrativeDocument.
 * docs/tdm-document-presentation-standard-v2.2.md
 */
export function ResultTheoryTranslatorHeader({
  onClose,
  closeRef,
  exportControl
}: ResultTheoryTranslatorHeaderProps) {
  return (
    <header className={styles.toolbar} data-interpreter-toolbar="true">
      <div className={styles.headerActions}>
        {exportControl}
        <button
          ref={closeRef}
          className={styles.closeButton}
          type="button"
          onClick={onClose}
          aria-label={THEORY_TRANSLATOR_LABELS.close}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </header>
  );
}

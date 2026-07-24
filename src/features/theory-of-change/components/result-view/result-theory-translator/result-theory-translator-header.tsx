import type { ReactNode, Ref } from 'react';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button';
import { THEORY_TRANSLATOR_LABELS } from './result-theory-translator.constants';
import styles from './result-theory-translator-pane.module.sass';

type ResultTheoryTranslatorHeaderProps = {
  onClose: () => void;
  closeRef?: Ref<HTMLButtonElement>;
  exportControl?: ReactNode;
};

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12">
      <path
        d="M3 3l6 6M9 3 3 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
    <header
      className={styles.toolbar}
      data-interpreter-toolbar="true"
      data-export-exclude="true"
    >
      <div className={styles.headerActions}>
        {exportControl}
        <TdmIconButton
          ref={closeRef}
          variant="subtle"
          size="md"
          aria-label={THEORY_TRANSLATOR_LABELS.close}
          tooltip={THEORY_TRANSLATOR_LABELS.close}
          onClick={onClose}
        >
          <CloseIcon />
        </TdmIconButton>
      </div>
    </header>
  );
}

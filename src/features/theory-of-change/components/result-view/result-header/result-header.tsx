'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button/tdm-icon-button';
import styles from './result-header.module.sass';

type ResultHeaderProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
  actions: ReactNode;
};

function BackChevron() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M9.5 3.5 4.5 8l5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ResultHeader({
  title,
  backHref,
  backLabel = 'Voltar',
  onBack,
  actions
}: ResultHeaderProps) {
  return (
    <header className={styles.topbar} data-export-exclude="true">
      <div className={styles.start}>
        {backHref ? (
          <Link href={backHref} className={styles.backLink} aria-label={backLabel}>
            <span className={styles.backIcon} aria-hidden="true">
              <BackChevron />
            </span>
          </Link>
        ) : (
          <TdmIconButton aria-label={backLabel} variant="subtle" size="md" tooltip={backLabel} onClick={onBack}>
            <BackChevron />
          </TdmIconButton>
        )}
      </div>

      <h1 className={styles.heading}>{title}</h1>

      <div className={styles.actions}>{actions}</div>
    </header>
  );
}

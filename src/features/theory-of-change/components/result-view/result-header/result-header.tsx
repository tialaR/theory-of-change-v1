'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './result-header.module.sass';

type ResultHeaderProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
  actions: ReactNode;
};

export function ResultHeader({
  title,
  backHref,
  backLabel = 'Voltar',
  onBack,
  actions
}: ResultHeaderProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.start}>
        {backHref ? (
          <Link href={backHref} className={styles.backButton} aria-label={backLabel}>
            <span aria-hidden="true">←</span>
          </Link>
        ) : (
          <button type="button" className={styles.backButton} aria-label={backLabel} onClick={onBack}>
            <span aria-hidden="true">←</span>
          </button>
        )}
      </div>

      <h1 className={styles.heading}>{title}</h1>

      <div className={styles.actions}>{actions}</div>
    </header>
  );
}

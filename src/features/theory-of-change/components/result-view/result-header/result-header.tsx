'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { TdmArrowLeftIcon } from '@/shared/ui/tdm-icons';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button';
import styles from './result-header.module.sass';

const BRAND_MARK_SRC = '/assets/brand/tmd-construtor-guided-story-mark.png';

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
  const backControl = backHref ? (
    <TdmIconButton
      href={backHref}
      aria-label={backLabel}
      tooltip={backLabel}
      variant="subtle"
      size="md"
    >
      <TdmArrowLeftIcon />
    </TdmIconButton>
  ) : (
    <TdmIconButton
      aria-label={backLabel}
      tooltip={backLabel}
      variant="subtle"
      size="md"
      onClick={onBack}
    >
      <TdmArrowLeftIcon />
    </TdmIconButton>
  );

  return (
    <header className={styles.topbar} data-export-exclude="true">
      <div className={styles.start}>{backControl}</div>

      <div className={styles.identity}>
        <Image
          className={styles.brandMark}
          src={BRAND_MARK_SRC}
          width={24}
          height={24}
          sizes="1.5rem"
          alt=""
          aria-hidden="true"
          priority
        />
        <h1 className={styles.heading}>{title}</h1>
      </div>

      <div className={styles.actions}>{actions}</div>
    </header>
  );
}

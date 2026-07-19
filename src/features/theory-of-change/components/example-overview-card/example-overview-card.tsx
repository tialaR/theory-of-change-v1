import type { ReactNode } from 'react';
import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import styles from './example-overview-card.module.sass';

export type ExampleOverviewCardProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  primaryHref: string;
  primaryLabel: string;
  className?: string;
};

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M9.5 3.5 4.5 8l5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4.75 8h6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ExampleOverviewCard({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  className = ''
}: ExampleOverviewCardProps) {
  return (
    <article className={`${styles.card} ${className}`.trim()}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.description}>{description}</div>
      <div className={styles.actions}>
        <TdmButton href={primaryHref} variant="primary">
          {primaryLabel}
        </TdmButton>
        <TdmButton
          href="/exemplos"
          variant="tertiary"
          leadingIcon={<BackArrowIcon />}
        >
          Voltar para exemplos
        </TdmButton>
      </div>
    </article>
  );
}

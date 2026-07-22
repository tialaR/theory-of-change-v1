import type { ReactNode } from 'react';
import { PublicButton } from '@/shared/ui/public-button';
import styles from './example-overview-card.module.sass';

export type ExampleOverviewCardProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  primaryHref: string;
  primaryLabel: string;
  className?: string;
};

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
        <PublicButton href={primaryHref} variant="primary">
          {primaryLabel}
        </PublicButton>
        <PublicButton href="/exemplos" variant="text">
          Voltar para exemplos
        </PublicButton>
      </div>
    </article>
  );
}

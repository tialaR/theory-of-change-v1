import type { ReactNode } from 'react';
import { TdmButton } from '@/shared/ui/tdm-button';
import { TdmArrowLeftIcon, TdmEyeIcon } from '@/shared/ui/tdm-icons';
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
        <TdmButton
          href={primaryHref}
          recipe="public"
          variant="primary"
          leadingIcon={<TdmEyeIcon />}
        >
          {primaryLabel}
        </TdmButton>
        <TdmButton
          href="/exemplos"
          recipe="public"
          variant="tertiary"
          leadingIcon={<TdmArrowLeftIcon />}
        >
          Voltar para exemplos
        </TdmButton>
      </div>
    </article>
  );
}

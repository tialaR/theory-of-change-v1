import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './tdm-public-feature-card.module.sass';

export type TdmPublicFeatureCardSize = 'compact' | 'standard' | 'choice';

export type TdmPublicFeatureCardProps = {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  description: ReactNode;
  actionLabel?: string;
  href?: string;
  interactive?: boolean;
  size?: TdmPublicFeatureCardSize;
  badge?: string;
  className?: string;
};

function sizeClass(size: TdmPublicFeatureCardSize) {
  if (size === 'standard') return styles.sizeStandard;
  if (size === 'choice') return styles.sizeChoice;
  return styles.sizeCompact;
}

function cardClassName({
  size,
  interactive,
  isLink,
  hasIcon,
  className
}: {
  size: TdmPublicFeatureCardSize;
  interactive: boolean;
  isLink: boolean;
  hasIcon: boolean;
  className: string;
}) {
  return [
    styles.card,
    sizeClass(size),
    hasIcon ? styles.withIcon : styles.withoutIcon,
    interactive ? styles.interactive : '',
    isLink ? styles.isLink : '',
    className
  ]
    .filter(Boolean)
    .join(' ');
}

export function TdmPublicFeatureCard({
  icon,
  eyebrow,
  title,
  description,
  actionLabel,
  href,
  interactive,
  size = 'compact',
  badge,
  className = ''
}: TdmPublicFeatureCardProps) {
  const isInteractive = Boolean(interactive ?? href);
  const isLink = Boolean(href);
  const hasIcon = Boolean(icon);
  const isChoice = size === 'choice';
  const classes = cardClassName({
    size,
    interactive: isInteractive,
    isLink,
    hasIcon,
    className
  });

  const action = actionLabel ? (
    isChoice ? (
      <span className={styles.action}>
        <span>{actionLabel}</span>
        <span className={styles.actionArrow} aria-hidden="true">
          →
        </span>
      </span>
    ) : (
      <span className={styles.action}>{actionLabel}</span>
    )
  ) : null;

  const content = (
    <>
      {hasIcon ? <span className={styles.iconWell}>{icon}</span> : null}
      <div className={styles.titleBlock}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={styles.body}>
        <div className={styles.description}>{description}</div>
      </div>
      {action}
      {badge ? <em className={styles.badge}>{badge}</em> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} data-interactive={isInteractive ? 'true' : undefined}>
        {content}
      </Link>
    );
  }

  return (
    <article className={classes} data-interactive={isInteractive ? 'true' : undefined}>
      {content}
    </article>
  );
}

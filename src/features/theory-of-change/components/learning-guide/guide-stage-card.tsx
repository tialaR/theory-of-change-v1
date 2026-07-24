import type { HTMLAttributes, ReactNode } from 'react';
import type { GuideStageTone } from './guide-data';
import styles from './guide-stage-card.module.sass';

export interface GuideStageCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  tone: GuideStageTone;
  contentClassName?: string;
}

export function GuideStageCard({
  children,
  tone,
  className = '',
  contentClassName = '',
  ...rest
}: GuideStageCardProps) {
  const rootClassName = [styles.root, className].filter(Boolean).join(' ');
  const cardClassName = [styles.card, contentClassName].filter(Boolean).join(' ');

  return (
    <section className={rootClassName} data-tone={tone} {...rest}>
      <div className={cardClassName}>{children}</div>
    </section>
  );
}

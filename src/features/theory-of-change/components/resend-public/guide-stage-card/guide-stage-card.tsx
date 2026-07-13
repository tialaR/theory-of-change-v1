import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import styles from './guide-stage-card.module.sass';

type GuideStageCardStyle = CSSProperties & {
  '--guide-stage-card-accent'?: string;
};

export interface GuideStageCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  accentColor?: string;
  contentClassName?: string;
}

export function GuideStageCard({
  children,
  accentColor = 'rgba(232, 235, 242, 0.92)',
  className = '',
  contentClassName = '',
  style,
  ...rest
}: GuideStageCardProps) {
  const rootStyle: GuideStageCardStyle = {
    '--guide-stage-card-accent': accentColor,
    ...style,
  };

  const rootClassName = [styles.root, className].filter(Boolean).join(' ');
  const contentClassNames = [styles.card, contentClassName].filter(Boolean).join(' ');

  return (
    <section className={rootClassName} style={rootStyle} {...rest}>
      <div className={contentClassNames}>{children}</div>
    </section>
  );
}

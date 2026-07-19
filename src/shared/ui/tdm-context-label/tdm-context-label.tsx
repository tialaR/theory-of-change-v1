import type { ComponentType, ReactNode } from 'react';
import type { TdmContextLabelIconProps } from './tdm-context-label-icons';
import styles from './tdm-context-label.module.sass';

export type { TdmContextLabelIconProps } from './tdm-context-label-icons';

export type TdmContextLabelProps = {
  icon: ComponentType<TdmContextLabelIconProps>;
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'strong';
  align?: 'start' | 'center';
};

function isUppercaseLabel(children: ReactNode): boolean {
  if (typeof children !== 'string') return false;
  const letters = children.replace(/[^\p{L}]/gu, '');
  if (!letters) return false;
  return letters === letters.toLocaleUpperCase('pt-BR');
}

export function TdmContextLabel({
  icon: Icon,
  children,
  className,
  tone = 'default',
  align = 'start'
}: TdmContextLabelProps) {
  return (
    <p
      className={[
        styles.root,
        tone === 'strong' ? styles.toneStrong : null,
        align === 'center' ? styles.alignCenter : styles.alignStart,
        isUppercaseLabel(children) ? styles.isUppercase : null,
        className
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={styles.icon} aria-hidden="true">
        <Icon />
      </span>
      <span className={styles.text}>{children}</span>
    </p>
  );
}

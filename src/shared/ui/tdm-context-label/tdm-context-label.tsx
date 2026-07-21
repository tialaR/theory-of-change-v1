import type { ComponentType, ReactNode } from 'react';
import { TdmKicker, type TdmKickerIconProps } from '@/shared/ui/tdm-kicker';
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

/** @deprecated Prefer `TdmKicker` for new call sites. */
export function TdmContextLabel({
  icon,
  children,
  className,
  align = 'start'
}: TdmContextLabelProps) {
  return (
    <TdmKicker
      icon={icon as ComponentType<TdmKickerIconProps>}
      className={[align === 'center' ? styles.alignCenter : styles.alignStart, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </TdmKicker>
  );
}

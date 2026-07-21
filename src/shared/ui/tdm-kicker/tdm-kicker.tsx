import type { ComponentType, ReactNode, SVGProps } from 'react';
import styles from './tdm-kicker.module.sass';

export type TdmKickerIconProps = SVGProps<SVGSVGElement>;

export type TdmKickerProps = {
  icon: ComponentType<TdmKickerIconProps>;
  children: ReactNode;
  className?: string;
};

export function TdmKicker({ icon: Icon, children, className }: TdmKickerProps) {
  return (
    <p className={[styles.root, className].filter(Boolean).join(' ')}>
      <span className={styles.icon} aria-hidden="true">
        <Icon />
      </span>
      <span className={styles.text}>{children}</span>
    </p>
  );
}

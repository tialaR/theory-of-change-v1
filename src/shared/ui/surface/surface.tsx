import { HTMLAttributes } from 'react';
import styles from './surface.module.sass';

export function Surface({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={[styles.surface, className].filter(Boolean).join(' ')} {...props} />;
}

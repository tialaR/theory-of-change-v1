import type { CSSProperties, ReactNode } from 'react';
import styles from './experience-card.module.sass';

export type ExperienceCardProps = {
  children: ReactNode;
  className?: string;
  accent?: string;
  as?: 'article' | 'section' | 'div';
};

export function ExperienceCard({ children, className, accent, as = 'article' }: ExperienceCardProps) {
  const Component = as;
  return (
    <Component className={[styles.card, className].filter(Boolean).join(' ')} style={accent ? { '--experience-accent': accent } as CSSProperties : undefined}>
      {children}
    </Component>
  );
}

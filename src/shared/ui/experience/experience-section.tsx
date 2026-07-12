import type { ReactNode } from 'react';
import { ExperienceReveal } from './experience-reveal';
import styles from './experience-section.module.sass';

export function ExperienceSection({ eyebrow, title, copy, children, className }: { eyebrow?: string; title: string; copy?: string; children?: ReactNode; className?: string }) {
  return (
    <ExperienceReveal className={[styles.section, className].filter(Boolean).join(' ')}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <div className={styles.headline}>
        <h2>{title}</h2>
        {copy ? <p>{copy}</p> : null}
      </div>
      {children ? <div className={styles.content}>{children}</div> : null}
    </ExperienceReveal>
  );
}

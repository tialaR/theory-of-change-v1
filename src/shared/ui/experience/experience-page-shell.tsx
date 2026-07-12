import type { ReactNode } from 'react';
import { ExperienceBackground } from './experience-background';
import styles from './experience-page-shell.module.sass';

export function ExperiencePageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={[styles.page, className].filter(Boolean).join(' ')}>
      <ExperienceBackground />
      <div className={styles.content}>{children}</div>
    </main>
  );
}

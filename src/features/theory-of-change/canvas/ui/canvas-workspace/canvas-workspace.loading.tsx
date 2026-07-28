'use client';

import { useTranslations } from 'next-intl';
import styles from './canvas-workspace.module.sass';

export function CanvasWorkspaceLoading() {
  const t = useTranslations('Canvas');
  return (
    <main className={styles.page} aria-busy="true" aria-label={t('loading')}>
      <header className={styles.topbar} />
      <section className={styles.workspace}><div className={styles.canvasViewport}><div className={styles.canvas} /></div></section>
    </main>
  );
}

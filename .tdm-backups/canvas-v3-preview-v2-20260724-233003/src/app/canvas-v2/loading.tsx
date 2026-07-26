import styles from '@/features/theory-of-change/canvas-v2/canvas-v2.module.sass';

export default function Loading() {
  return (
    <main className={styles.loadingPage} aria-label="Carregando canvas">
      <div className={styles.loadingHeader} />
      <div className={styles.loadingWorkspace}>
        <div className={styles.loadingRail} />
        <div className={styles.loadingNode} />
        <div className={styles.loadingNodeSecondary} />
        <div className={styles.loadingSidebar} />
      </div>
    </main>
  );
}

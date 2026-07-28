import styles from './canvas-workspace.module.sass';

export function CanvasWorkspaceLoading() {
  return (
    <main className={styles.page} aria-busy="true" aria-label="Carregando canvas">
      <header className={styles.topbar} />
      <section className={styles.workspace}>
        <div className={styles.canvasViewport}>
          <div className={styles.canvas} />
        </div>
      </section>
    </main>
  );
}

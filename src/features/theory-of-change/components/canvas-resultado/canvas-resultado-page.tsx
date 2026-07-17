'use client';

import Link from 'next/link';
import styles from './canvas-resultado-page.module.sass';

const EXPORT_ACTIONS = [
  { id: 'png', label: 'Exportar PNG' },
  { id: 'jpeg', label: 'Exportar JPEG' },
  { id: 'pdf', label: 'Exportar PDF' }
] as const;

export function CanvasResultadoPage() {
  return (
    <main className={styles.page} data-canvas-resultado="true">
      <div className={styles.atmosphere} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.kicker}>Revisão final</p>
            <h1 className={styles.title}>Resultado da sua teoria</h1>
            <p className={styles.subtitle}>
              Revise a síntese das etapas, conexões, riscos e hipóteses antes de exportar.
            </p>
          </div>

          <div className={styles.actions}>
            <Link href="/canvas" className={styles.primaryAction}>
              Voltar ao canvas
            </Link>
            <div className={styles.exportGroup} aria-label="Exportações">
              {EXPORT_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className={styles.exportAction}
                  disabled
                  title="Exportação em breve"
                  aria-label={`${action.label} — Exportação em breve`}
                >
                  <span>{action.label}</span>
                  <small>em breve</small>
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className={styles.panel} aria-label="Painel de resultado">
          <div className={styles.panelFrame}>
            <div className={styles.panelInner}>
              <p className={styles.emptyState}>
                Seu resultado aparecerá aqui quando a teoria tiver blocos suficientes.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

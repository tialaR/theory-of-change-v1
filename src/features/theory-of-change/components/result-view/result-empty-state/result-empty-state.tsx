'use client';

import styles from './result-empty-state.module.sass';

type ResultEmptyStateProps = {
  message?: string;
  backLabel?: string;
  onBack?: () => void;
};

export function ResultEmptyState({
  message = 'Crie itens no canvas para visualizar a teoria organizada.',
  backLabel = 'Voltar',
  onBack
}: ResultEmptyStateProps) {
  return (
    <section className={styles.empty} aria-live="polite">
      <p className={styles.kicker}>Resultado da Teoria da Mudança</p>
      <h2 className={styles.title}>Sua teoria ainda está em construção.</h2>
      <p className={styles.message}>{message}</p>
      {onBack ? (
        <button type="button" className={styles.backButton} onClick={onBack}>
          {backLabel}
        </button>
      ) : null}
    </section>
  );
}

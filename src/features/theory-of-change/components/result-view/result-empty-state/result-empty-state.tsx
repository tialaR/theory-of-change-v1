'use client';

import { TdmButton } from '@/shared/ui/tdm-button';
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
        <TdmButton type="button" variant="primary" tone="neutral" size="md" onClick={onBack}>
          {backLabel}
        </TdmButton>
      ) : null}
    </section>
  );
}

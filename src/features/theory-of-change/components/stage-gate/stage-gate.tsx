import styles from './stage-gate.module.sass';

export function StageGate({
  title,
  description,
  actionLabel,
  onAction,
  advanceLabel,
  onAdvance,
  organizeLabel,
  onOrganize,
  insightMessage,
  canAdvance
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  advanceLabel?: string;
  onAdvance?: () => void;
  organizeLabel?: string;
  onOrganize?: () => void;
  insightMessage?: string;
  canAdvance?: boolean;
}) {
  return (
    <section className={styles.gate}>
      <p className={styles.kicker}>Guia da etapa</p>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {insightMessage ? <p className={styles.insight}>{insightMessage}</p> : null}
      <div className={styles.actions}>
        {actionLabel && onAction ? (
          <button className={styles.primaryAction} type="button" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
        {organizeLabel && onOrganize ? (
          <button className={styles.secondaryAction} type="button" onClick={onOrganize}>
            {organizeLabel}
          </button>
        ) : null}
        {advanceLabel && onAdvance ? (
          <button
            className={[styles.secondaryAction, canAdvance ? '' : styles.secondaryActionMuted].filter(Boolean).join(' ')}
            type="button"
            onClick={onAdvance}
          >
            {advanceLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}

import styles from './process-dock-brand.module.sass';

type ProcessDockBrandProps = {
  compact?: boolean;
};

export function ProcessDockBrand({ compact = false }: ProcessDockBrandProps) {
  if (compact) {
    return (
      <span className={styles.compact} aria-hidden="true">
        <span className={styles.diamond} />
      </span>
    );
  }

  return (
    <div className={styles.brand} aria-hidden="true">
      <span className={styles.diamond} />
      <span className={styles.wordmark} />
    </div>
  );
}

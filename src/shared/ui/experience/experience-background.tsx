import styles from './experience-background.module.sass';

export function ExperienceBackground() {
  return (
    <div className={styles.background} aria-hidden="true">
      <span className={styles.beamOne} />
      <span className={styles.beamTwo} />
      <span className={styles.glowOne} />
      <span className={styles.glowTwo} />
      <span className={styles.grid} />
    </div>
  );
}

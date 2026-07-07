'use client';

import styles from './final-result-glass-sculpture.module.sass';

export function FinalResultGlassSculpture() {
  return (
    <span className={styles.sculpture} aria-hidden="true">
      <span className={styles.cosmicHalo} />
      <span className={`${styles.lens} ${styles.lensOne}`} />
      <span className={`${styles.lens} ${styles.lensTwo}`} />
      <span className={`${styles.lens} ${styles.lensThree}`} />
      <span className={styles.ringStack}>
        <span className={`${styles.ring} ${styles.ringA}`} />
        <span className={`${styles.ring} ${styles.ringB}`} />
        <span className={`${styles.ring} ${styles.ringC}`} />
        <span className={`${styles.ring} ${styles.ringD}`} />
      </span>
      <span className={`${styles.planet} ${styles.planetBack}`} />
      <span className={`${styles.planet} ${styles.planetFront}`} />
      <span className={`${styles.planet} ${styles.planetSmall}`} />
      <span className={`${styles.glassShard} ${styles.shardOne}`} />
      <span className={`${styles.glassShard} ${styles.shardTwo}`} />
      <span className={`${styles.spark} ${styles.sparkA}`} />
      <span className={`${styles.spark} ${styles.sparkB}`} />
    </span>
  );
}

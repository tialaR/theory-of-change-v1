'use client';

import type { CSSProperties } from 'react';
import type { TdmStage } from '../../domain/tdm-stages';
import { getTdmStageTheme } from '../../domain/tdm-theme';
import styles from './change-theory-orb.module.sass';

export type ChangeTheoryOrbProps = {
  currentStage: TdmStage;
  accentColor?: string;
  className?: string;
};

export function ChangeTheoryOrb({ currentStage, accentColor, className }: ChangeTheoryOrbProps) {
  const theme = getTdmStageTheme(currentStage);
  const accent = accentColor ?? theme.accent;

  return (
    <div
      className={[styles.orb, className].filter(Boolean).join(' ')}
      aria-hidden="true"
      style={
        {
          '--orb-accent': accent,
          '--orb-accent-glow': theme.glow,
          '--orb-accent-soft': theme.accentSoft,
          '--orb-accent-border': theme.border
        } as CSSProperties
      }
    >
      <div className={styles.stage}>
        <span className={styles.backGlow} />
        <span className={styles.lightSweep} />
        <span className={styles.plateStack}>
          <span className={styles.plateOne} />
          <span className={styles.plateTwo} />
          <span className={styles.plateThree} />
          <span className={styles.plateFour} />
          <span className={styles.plateFive} />
        </span>
        <span className={styles.orbitField}>
          <span className={`${styles.orbit} ${styles.orbitA}`} />
          <span className={`${styles.orbit} ${styles.orbitB}`} />
          <span className={`${styles.orbit} ${styles.orbitC}`} />
          <span className={`${styles.orbit} ${styles.orbitD}`} />
        </span>
        <span className={styles.core}>
          <span className={styles.coreReflection} />
          <span className={styles.coreVoid} />
        </span>
        <span className={styles.accentParticle} />
        <span className={styles.microParticle} />
      </div>
    </div>
  );
}

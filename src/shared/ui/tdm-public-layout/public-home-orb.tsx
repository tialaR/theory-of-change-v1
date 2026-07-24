'use client';

import { motion, useReducedMotion } from 'motion/react';
import { TDM_MOTION_TRANSITIONS } from '@/shared/motion/tdm-motion';
import styles from './tdm-public-layout.module.sass';

export function PublicHomeOrb() {
  const reduced = useReducedMotion();
  const initialState = reduced
    ? { opacity: 1, scale: 1 }
    : { opacity: 0, scale: 0.96 };
  const transition = reduced ? { duration: 0.01 } : TDM_MOTION_TRANSITIONS.panel;

  return (
    <motion.div
      className={styles.homeOrb}
      initial={initialState}
      animate={{ opacity: 1, scale: 1 }}
      transition={transition}
    >
      <span className={styles.homeOrbRing} />
      <span className={styles.homeOrbRing} />
      <span className={styles.homeOrbRing} />
      <span className={styles.homeOrbCore} />
    </motion.div>
  );
}

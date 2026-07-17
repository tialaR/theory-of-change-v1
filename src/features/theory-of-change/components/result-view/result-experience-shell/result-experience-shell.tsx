'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { THEORY_TRANSLATOR_MOTION } from '../result-theory-translator/result-theory-translator.constants';
import styles from './result-experience-shell.module.sass';

type ResultExperienceShellProps = {
  isTranslatorExpanded: boolean;
  main: ReactNode;
  translator: ReactNode;
  /** Fires once the supporting-pane width animation settles (fit timing). */
  onTranslatorLayoutComplete?: () => void;
};

export function ResultExperienceShell({
  isTranslatorExpanded,
  main,
  translator,
  onTranslatorLayoutComplete
}: ResultExperienceShellProps) {
  const reduce = useReducedMotion();
  const duration = reduce ? 0.01 : THEORY_TRANSLATOR_MOTION.duration;

  return (
    <div
      className={styles.shell}
      data-translator-expanded={isTranslatorExpanded ? 'true' : 'false'}
    >
      <div className={styles.mainPane} data-result-main-pane="true">
        {main}
      </div>

      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key="translator-track"
          className={styles.translatorTrack}
          data-expanded={isTranslatorExpanded ? 'true' : 'false'}
          initial={false}
          animate={{
            width: isTranslatorExpanded ? 'clamp(28rem, 34vw, 36rem)' : 0
          }}
          transition={{ duration, ease: THEORY_TRANSLATOR_MOTION.ease }}
          onAnimationComplete={onTranslatorLayoutComplete}
        >
          {translator}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

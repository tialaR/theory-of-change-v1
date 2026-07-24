'use client';

import { motion, useReducedMotion } from 'motion/react';
import { TDM_MOTION_TRANSITIONS } from '@/shared/motion/tdm-motion';
import { PublicReveal } from './public-reveal';
import type { PublicTimelineStepData } from './public-layout.types';
import styles from './tdm-public-layout.module.sass';

export function PublicTimeline({ steps }: { steps: PublicTimelineStepData[] }) {
  const reduced = useReducedMotion();
  const railTransition = reduced
    ? { duration: 0.01 }
    : {
        ...TDM_MOTION_TRANSITIONS.panel,
        duration: TDM_MOTION_TRANSITIONS.panel.duration * 2.8
      };

  return (
    <div className={styles.timeline}>
      <div className={styles.timelineRail} aria-hidden="true">
        <motion.div
          className={styles.timelineRailFill}
          initial={{ scaleY: reduced ? 1 : 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={railTransition}
        />
      </div>
      {steps.map((step, index) => (
        <PublicTimelineStep key={step.title} step={step} index={index} />
      ))}
    </div>
  );
}

function PublicTimelineStep({
  step,
  index
}: {
  step: PublicTimelineStepData;
  index: number;
}) {
  const reduced = useReducedMotion();
  const transition = reduced ? { duration: 0.01 } : TDM_MOTION_TRANSITIONS.layout;

  return (
    <motion.article
      className={styles.timelineStep}
      initial={{ opacity: reduced ? 1 : 0.35 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, amount: 0.45 }}
      transition={transition}
    >
      <div>
        <span className={styles.timelineStepNumber}>{step.number}</span>
        <h3>{step.title}</h3>
        <p>{step.text}</p>
      </div>
      <PublicReveal delay={index * 0.04}>
        <div className={styles.timelineCard}>
          <strong>{step.visual}</strong>
          <p>Visualize esta etapa no fluxo da teoria antes de avançar.</p>
        </div>
      </PublicReveal>
    </motion.article>
  );
}

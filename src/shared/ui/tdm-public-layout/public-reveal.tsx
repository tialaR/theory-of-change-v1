'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { TDM_MOTION_TRANSITIONS } from '@/shared/motion/tdm-motion';
import styles from './tdm-public-layout.module.sass';

export interface PublicRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}

export function PublicReveal({
  children,
  className = '',
  delay = 0,
  amount = 0.2
}: PublicRevealProps) {
  const reduced = useReducedMotion();
  const initialState = reduced
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: '0.75rem' };
  const transition = reduced
    ? { duration: 0.01 }
    : { ...TDM_MOTION_TRANSITIONS.layout, delay };

  return (
    <motion.div
      className={`${styles.reveal} ${className}`}
      initial={initialState}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

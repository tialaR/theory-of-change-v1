'use client';

import { useId, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import styles from './theory-change-sculpture.module.sass';

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

export function TheoryChangeSculpture({ accent = '#9b7cff' }: { accent?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const glowId = `theorySculptureGlow-${uid}`;
  const metalId = `theorySculptureMetal-${uid}`;
  const glassId = `theorySculptureGlass-${uid}`;
  const strokeId = `theorySculptureStroke-${uid}`;
  const blurId = `theorySculptureBlur-${uid}`;

  return (
    <span className={styles.sculpture} style={{ '--stage-accent': accent } as CSSProperties} aria-hidden="true">
      <motion.span
        className={styles.aura}
        animate={shouldReduceMotion ? { opacity: 0.74 } : { opacity: [0.56, 0.88, 0.56], scale: [0.96, 1.04, 0.96] }}
        transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 8.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.svg
        viewBox="0 0 420 250"
        className={styles.svg}
        fill="none"
        animate={shouldReduceMotion ? { y: 0 } : { y: [0, -3, 0] }}
        transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 7.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <radialGradient id={glowId} cx="48%" cy="44%" r="58%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.56" />
            <stop offset="38%" stopColor={accent} stopOpacity="0.24" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={metalId} x1="115" y1="42" x2="314" y2="210" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
            <stop offset="0.18" stopColor="#46474d" stopOpacity="0.86" />
            <stop offset="0.42" stopColor="#050506" stopOpacity="0.96" />
            <stop offset="0.62" stopColor="#f2f2f2" stopOpacity="0.62" />
            <stop offset="1" stopColor="#050506" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id={glassId} x1="86" y1="48" x2="338" y2="188" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0.72" />
            <stop offset="0.36" stopColor={accent} stopOpacity="0.28" />
            <stop offset="0.7" stopColor="#17181d" stopOpacity="0.22" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.42" />
          </linearGradient>
          <linearGradient id={strokeId} x1="72" y1="78" x2="350" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0.88" />
            <stop offset="0.35" stopColor={accent} stopOpacity="0.38" />
            <stop offset="0.72" stopColor="#ffffff" stopOpacity="0.72" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.08" />
          </linearGradient>
          <filter id={blurId} x="-40" y="-40" width="500" height="330" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.72 0" />
          </filter>
        </defs>

        <ellipse cx="210" cy="125" rx="188" ry="92" fill={`url(#${glowId})`} opacity="0.48" filter={`url(#${blurId})`} />
        <path d="M44 150C94 74 173 44 257 61c63 13 101 52 128 93" stroke="rgba(255,255,255,0.08)" strokeWidth="54" strokeLinecap="round" opacity="0.45" />
        <path d="M36 164C112 98 188 80 275 91c45 6 82 18 112 38" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" opacity="0.66" />
        <path d="M54 177C122 126 205 112 302 123c32 4 58 11 78 22" stroke="rgba(255,255,255,0.11)" strokeWidth="1" opacity="0.72" />
        <path d="M70 118C133 83 224 68 324 86" stroke={accent} strokeWidth="1.4" strokeOpacity="0.36" />

        <motion.g
          animate={shouldReduceMotion ? { rotate: 0 } : { rotate: [0, 7, 0, -5, 0] }}
          transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 15.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '210px 126px' }}
        >
          <path d="M143 126c23-62 85-81 134-44 49 37 42 103-8 132-44 25-110 11-132-35-8-17-4-35 6-53Z" fill={`url(#${metalId})`} opacity="0.92" />
          <path d="M160 118c30-47 84-57 123-22 27 24 28 69 2 97-31 34-90 32-119-1-21-24-21-50-6-74Z" fill="#020203" opacity="0.78" />
          <path d="M156 116c17-43 55-63 96-54-39 9-65 36-74 80-4 20-18 22-28 10-7-9-3-23 6-36Z" fill="rgba(255,255,255,0.54)" />
          <path d="M255 80c48 27 54 88 11 124 14-37 12-74-15-103-10-11-8-21 4-21Z" fill="rgba(255,255,255,0.42)" />
          <path d="M143 126c23-62 85-81 134-44 49 37 42 103-8 132-44 25-110 11-132-35-8-17-4-35 6-53Z" stroke={`url(#${strokeId})`} strokeWidth="2.2" />
        </motion.g>

        <motion.g
          animate={shouldReduceMotion ? { rotate: 0 } : { rotate: [0, -14, 0] }}
          transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '210px 126px' }}
        >
          <ellipse cx="210" cy="126" rx="160" ry="38" stroke={`url(#${strokeId})`} strokeWidth="1.35" opacity="0.9" />
          <ellipse cx="210" cy="126" rx="126" ry="25" stroke="rgba(255,255,255,0.24)" strokeWidth="0.9" />
          <ellipse cx="210" cy="126" rx="86" ry="16" stroke={accent} strokeWidth="0.75" strokeOpacity="0.38" />
        </motion.g>

        <motion.circle
          cx="326"
          cy="95"
          r="6"
          fill="#ffffff"
          opacity="0.78"
          animate={shouldReduceMotion ? { opacity: 0.72 } : { opacity: [0.45, 0.9, 0.45], r: [4.8, 6.3, 4.8] }}
          transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 5.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle cx="92" cy="175" r="3" fill="#fff" opacity="0.72" />
        <circle cx="300" cy="178" r="2.5" fill={accent} opacity="0.72" />
      </motion.svg>
    </span>
  );
}

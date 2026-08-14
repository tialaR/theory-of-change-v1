'use client';

import { useId, type CSSProperties } from 'react';
import { useReducedMotion } from 'motion/react';
import styles from './theory-change-sculpture.module.sass';

export function TheoryChangeSculpture({ accent = '#9b7cff' }: { accent?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const glowId = `theorySculptureGlow-${uid}`;
  const metalId = `theorySculptureMetal-${uid}`;
  const glassId = `theorySculptureGlass-${uid}`;
  const strokeId = `theorySculptureStroke-${uid}`;
  const blurId = `theorySculptureBlur-${uid}`;

  return (
    <span
      className={[styles.sculpture, shouldReduceMotion ? styles.reduceMotion : ''].filter(Boolean).join(' ')}
      style={{ '--stage-accent': accent } as CSSProperties}
      aria-hidden="true"
    >
      <span className={styles.aura} />
      <svg
        viewBox="0 0 500 320"
        className={styles.svg}
        fill="none"
      >
        <defs>
          <radialGradient id={glowId} cx="48%" cy="44%" r="58%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.56" />
            <stop offset="38%" stopColor="#d4dae3" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={metalId} x1="84" y1="28" x2="424" y2="262" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
            <stop offset="0.16" stopColor="#666872" stopOpacity="0.84" />
            <stop offset="0.42" stopColor="#050506" stopOpacity="0.96" />
            <stop offset="0.66" stopColor="#f2f2f2" stopOpacity="0.58" />
            <stop offset="1" stopColor="#050506" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id={glassId} x1="72" y1="44" x2="454" y2="258" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0.72" />
            <stop offset="0.25" stopColor="#dbe0e8" stopOpacity="0.24" />
            <stop offset="0.48" stopColor="#bcc4cf" stopOpacity="0.28" />
            <stop offset="0.72" stopColor="#e7ebf1" stopOpacity="0.2" />
            <stop offset="0.7" stopColor="#17181d" stopOpacity="0.22" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.42" />
          </linearGradient>
          <linearGradient id={strokeId} x1="72" y1="78" x2="350" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0.88" />
            <stop offset="0.35" stopColor="#cfd6df" stopOpacity="0.34" />
            <stop offset="0.72" stopColor="#ffffff" stopOpacity="0.72" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.08" />
          </linearGradient>
          <filter id={blurId} x="-40" y="-40" width="500" height="330" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.72 0" />
          </filter>
        </defs>

        <g className={styles.sculptureGlow}>
          <ellipse cx="254" cy="166" rx="236" ry="118" fill={`url(#${glowId})`} opacity="0.2" filter={`url(#${blurId})`} />
        </g>
        <path d="M70 198C124 116 210 74 294 82c70 7 112 43 144 95" stroke="rgba(255,255,255,0.08)" strokeWidth="48" strokeLinecap="round" opacity="0.32" />
        <path d="M66 210C134 154 212 126 302 130c58 3 108 18 142 42" stroke="rgba(255,255,255,0.16)" strokeWidth="1.15" opacity="0.55" />
        <path d="M82 226c61-42 131-61 211-57 58 2 104 13 139 32" stroke="rgba(255,255,255,0.1)" strokeWidth="1" opacity="0.6" />
        <path d="M112 148c61-35 136-49 224-42" stroke="#c8d0da" strokeWidth="1.2" strokeOpacity="0.2" />

        <g className={styles.sculptureShell}>
          <path d="M126 170c16-76 98-114 174-86 58 21 92 75 78 136-11 50-58 90-122 94-75 4-140-42-147-109-1-11 0-23 3-35 4-16 8-25 14-36Z" fill={`url(#${metalId})`} opacity="0.82" />
          <path d="M142 174c20-56 74-91 132-85 57 6 98 46 103 97 5 52-31 98-84 113-62 17-135-13-157-69-8-19-6-39 6-56Z" fill={`url(#${glassId})`} opacity="0.62" />
          <path d="M172 130c38-25 93-26 135 0-30-3-57 7-79 32-17 19-28 42-30 67-1 13-10 17-19 9-14-12-18-33-7-56 1-2 1-2 0 0Z" fill="rgba(255,255,255,0.34)" />
          <path d="M304 132c49 31 65 87 41 133 4-36-7-70-33-97-8-8-8-18 0-26Z" fill="rgba(255,255,255,0.26)" />
          <path d="M126 170c16-76 98-114 174-86 58 21 92 75 78 136-11 50-58 90-122 94-75 4-140-42-147-109-1-11 0-23 3-35 4-16 8-25 14-36Z" stroke={`url(#${strokeId})`} strokeWidth="2.1" />
        </g>

        <g className={styles.sculptureCore}>
          <path
            d="M90 180c30-24 70-38 125-42 67-4 132 10 206 40"
            stroke={`url(#${strokeId})`}
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.62"
          />
          <path
            d="M116 204c36-17 77-24 131-23 64 1 116 13 169 33"
            stroke="rgba(255,255,255,0.24)"
            strokeWidth="0.85"
            strokeLinecap="round"
            opacity="0.64"
          />
          <path
            d="M168 230c22-8 50-12 82-12 30 0 57 4 81 11"
            stroke="#d4d9e0"
            strokeWidth="0.72"
            strokeLinecap="round"
            strokeOpacity="0.2"
          />
        </g>

        <ellipse cx="390" cy="118" rx="9" ry="7" fill="#ffffff" opacity="0.2" />
        <ellipse cx="116" cy="238" rx="7" ry="5" fill="#ffffff" opacity="0.16" />
        <ellipse cx="356" cy="244" rx="7" ry="5" fill="#d8dee6" opacity="0.14" />
      </svg>
    </span>
  );
}

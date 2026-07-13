'use client';

import { type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { PREVIEW_STAGE_COLORS } from '../example-previews/stage-colors';
import styles from './home-animated-logo-mark.module.sass';

const STAGE_GLOW = [
  PREVIEW_STAGE_COLORS.input,
  PREVIEW_STAGE_COLORS.activity,
  PREVIEW_STAGE_COLORS.product,
  PREVIEW_STAGE_COLORS.outcome,
] as const;

const STAGE_SHADOW = [
  'rgba(167, 139, 250, 0.14)',
  'rgba(96, 165, 250, 0.14)',
  'rgba(246, 173, 85, 0.14)',
  'rgba(74, 222, 189, 0.14)',
] as const;

const NEUTRAL_SHADOW = 'rgba(180, 188, 204, 0.1)';

const BREATH_EASE = [0.42, 0, 0.58, 1] as const;
const COLOR_EASE = [0.45, 0.05, 0.55, 0.95] as const;

function TdmFlowGlyph({ animate = true }: { animate?: boolean }) {
  const paths = [
    'M 50 22 C 64 22 74 30 76 44',
    'M 76 44 C 78 58 70 72 56 76',
    'M 56 76 C 42 80 28 72 24 58',
    'M 24 58 C 20 44 30 26 50 22',
  ];

  const nodes = [
    { cx: 50, cy: 22 },
    { cx: 76, cy: 44 },
    { cx: 56, cy: 76 },
    { cx: 24, cy: 58 },
  ];

  return (
    <motion.svg
      className={styles.logoGlyph}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      animate={
        animate
          ? {
              y: [0, -1.5, 0, 1, 0],
              opacity: [0.94, 1, 0.96, 1, 0.94],
            }
          : undefined
      }
      transition={
        animate
          ? {
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : undefined
      }
    >
      <defs>
        <linearGradient id="tdmHomeGlyphGrad" x1="8%" y1="6%" x2="92%" y2="94%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.98)" />
          <stop offset="48%" stopColor="rgba(214, 220, 232, 0.82)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.9)" />
        </linearGradient>
        <filter id="tdmHomeGlyphGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0.5" stdDeviation="1.2" floodColor="rgba(255, 255, 255, 0.22)" />
        </filter>
      </defs>

      <circle cx="50" cy="50" r="3.2" fill="url(#tdmHomeGlyphGrad)" filter="url(#tdmHomeGlyphGlow)" />

      {paths.map((d, index) => (
        <motion.path
          key={d}
          d={d}
          stroke="url(#tdmHomeGlyphGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          filter="url(#tdmHomeGlyphGlow)"
          animate={
            animate
              ? {
                  strokeDashoffset: [0, index % 2 === 0 ? -6 : 6],
                }
              : undefined
          }
          transition={
            animate
              ? {
                  duration: 11 + index,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : undefined
          }
          strokeDasharray="28 4"
        />
      ))}

      <path
        d="M 28 56 Q 50 50 72 46"
        stroke="url(#tdmHomeGlyphGrad)"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
        opacity="0.38"
        strokeDasharray="2.5 4.5"
      />

      {nodes.map((node) => (
        <circle
          key={`${node.cx}-${node.cy}`}
          cx={node.cx}
          cy={node.cy}
          r="5.5"
          stroke="url(#tdmHomeGlyphGrad)"
          strokeWidth="1.7"
          fill="none"
          filter="url(#tdmHomeGlyphGlow)"
        />
      ))}
    </motion.svg>
  );
}

export function HomeAnimatedLogoMark() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={styles.logoTile}
      style={
        reduced
          ? ({ '--tile-shadow': NEUTRAL_SHADOW } as CSSProperties)
          : undefined
      }
      initial={reduced ? false : { opacity: 0, scale: 0.94 }}
      animate={
        reduced
          ? { opacity: 1, scale: 1 }
          : {
              opacity: 1,
              scale: [1, 1.018, 1, 1.012, 1],
              rotateX: [0, 1.2, 0, -0.8, 0],
              rotateY: [0, -0.9, 0, 1.1, 0],
              '--tile-shadow': [...STAGE_SHADOW, STAGE_SHADOW[0]],
              '--glow-color': [...STAGE_GLOW, STAGE_GLOW[0]],
              '--glow-x': ['38%', '58%', '46%', '34%', '38%'],
              '--glow-y': ['32%', '48%', '62%', '40%', '32%'],
            }
      }
      transition={
        reduced
          ? { duration: 0.01 }
          : {
              opacity: { duration: 0.8, ease: BREATH_EASE },
              scale: { duration: 8.5, repeat: Infinity, ease: BREATH_EASE },
              rotateX: { duration: 8.5, repeat: Infinity, ease: BREATH_EASE },
              rotateY: { duration: 8.5, repeat: Infinity, ease: BREATH_EASE },
              '--tile-shadow': { duration: 20, repeat: Infinity, ease: COLOR_EASE },
              '--glow-color': { duration: 20, repeat: Infinity, ease: COLOR_EASE },
              '--glow-x': { duration: 13, repeat: Infinity, ease: 'easeInOut' },
              '--glow-y': { duration: 11, repeat: Infinity, ease: 'easeInOut' },
            }
      }
    >
      <span className={styles.tileHighlight} aria-hidden="true" />
      <span className={styles.tileRim} aria-hidden="true" />

      {reduced ? (
        <>
          <span className={styles.stageGlowStatic} aria-hidden="true" />
          <span className={styles.liquidSheenStatic} aria-hidden="true" />
        </>
      ) : (
        <>
          <motion.div className={styles.stageGlow} aria-hidden="true" />
          <motion.div
            className={styles.liquidSheen}
            aria-hidden="true"
            animate={{
              x: ['-18%', '22%', '-12%', '16%', '-18%'],
              y: ['-14%', '18%', '12%', '-10%', '-14%'],
              opacity: [0.32, 0.5, 0.38, 0.46, 0.32],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}

      <TdmFlowGlyph animate={!reduced} />
    </motion.div>
  );
}

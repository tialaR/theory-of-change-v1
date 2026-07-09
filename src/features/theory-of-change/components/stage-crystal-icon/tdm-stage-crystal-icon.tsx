'use client';

import { useId, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { TdmStage } from '../../domain/tdm-stages';
import {
  getTdmStageCrystalPalette,
  getTdmStageCrystalTint,
  getTdmStageCrystalCssVarsExtended,
  getTdmStageTheme
} from '../../domain/tdm-theme';
import styles from './tdm-stage-crystal-icon.module.sass';

type CrystalSize = 'xs' | 'sm' | 'md' | 'lg' | 'progress';
type CrystalEmphasis = 'subtle' | 'default' | 'hero';

const SIZE_CLASS: Record<CrystalSize, string> = {
  xs: styles.sizeXs,
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  progress: styles.sizeProgress
};

const EMPHASIS_CLASS: Record<CrystalEmphasis, string> = {
  subtle: styles.emphasisSubtle,
  default: styles.emphasisDefault,
  hero: styles.emphasisHero
};

type Point = readonly [number, number];

function tri(a: Point, b: Point, c: Point): string {
  return `M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]}Z`;
}

/** Hex silhouette — premium filled gem, no wireframe */
const H = {
  top: [50, 3] as Point,
  ur: [92, 26] as Point,
  lr: [92, 74] as Point,
  bot: [50, 97] as Point,
  ll: [8, 74] as Point,
  ul: [8, 26] as Point
} as const;

const M = {
  top: [50, 18] as Point,
  ur: [74, 32] as Point,
  lr: [74, 68] as Point,
  bot: [50, 82] as Point,
  ll: [26, 68] as Point,
  ul: [26, 32] as Point
} as const;

const C = {
  ctr: [50, 50] as Point,
  top: [50, 32] as Point,
  bot: [50, 68] as Point,
  ur: [62, 41] as Point,
  lr: [62, 59] as Point,
  ll: [38, 59] as Point,
  ul: [38, 41] as Point
} as const;

function CrystalSvg({ stage, idSuffix }: { stage: TdmStage; idSuffix: string }) {
  const tint = getTdmStageCrystalTint(stage);
  const palette = getTdmStageCrystalPalette(stage);

  const crownFaces = [
    { d: tri(H.top, H.ul, M.ul), grad: 'crownLeft' },
    { d: tri(H.top, M.ul, M.top), grad: 'crownCenter' },
    { d: tri(H.top, M.top, M.ur), grad: 'crownCenter' },
    { d: tri(H.top, M.ur, H.ur), grad: 'crownRight' },
    { d: tri(H.top, H.ur, M.lr), grad: 'crownRight' },
    { d: tri(H.top, M.lr, C.top), grad: 'crownCenter' },
    { d: tri(H.top, C.top, M.ll), grad: 'crownLeft' },
    { d: tri(H.top, M.ll, H.ll), grad: 'crownLeft' }
  ];

  const leftFaces = [
    { d: tri(H.ul, H.ll, M.ll), grad: 'leftDeep' },
    { d: tri(H.ll, M.ll, M.bot), grad: 'leftDeep' },
    { d: tri(H.ll, M.bot, H.bot), grad: 'leftDeep' },
    { d: tri(M.ul, M.ll, C.ul), grad: 'leftMid' },
    { d: tri(M.ll, C.ll, C.bot), grad: 'leftMid' },
    { d: tri(M.ll, C.ul, C.ll), grad: 'leftMid' },
    { d: tri(M.ll, M.bot, C.bot), grad: 'leftDeep' },
    { d: tri(C.ul, C.top, C.ctr), grad: 'leftMid' },
    { d: tri(C.ul, C.ctr, C.ll), grad: 'leftMid' },
    { d: tri(C.ll, C.ctr, C.bot), grad: 'leftDeep' }
  ];

  const rightFaces = [
    { d: tri(H.ur, H.lr, M.lr), grad: 'rightDeep' },
    { d: tri(H.lr, M.lr, M.bot), grad: 'rightDeep' },
    { d: tri(H.lr, M.bot, H.bot), grad: 'rightDeep' },
    { d: tri(M.ur, M.lr, C.ur), grad: 'rightMid' },
    { d: tri(M.lr, C.lr, C.bot), grad: 'rightMid' },
    { d: tri(M.lr, C.ur, C.lr), grad: 'rightMid' },
    { d: tri(M.lr, M.bot, C.bot), grad: 'rightDeep' },
    { d: tri(C.ur, C.top, C.ctr), grad: 'rightMid' },
    { d: tri(C.ur, C.ctr, C.lr), grad: 'rightMid' },
    { d: tri(C.lr, C.ctr, C.bot), grad: 'rightDeep' }
  ];

  const centerFaces = [
    { d: tri(C.top, C.ur, C.ctr), grad: 'centerBright' },
    { d: tri(C.top, C.ul, C.ctr), grad: 'centerBright' },
    { d: tri(C.bot, C.ll, C.ctr), grad: 'centerDark' },
    { d: tri(C.bot, C.lr, C.ctr), grad: 'centerDark' },
    { d: tri(M.top, C.top, C.ctr), grad: 'centerBright' },
    { d: tri(M.bot, C.bot, C.ctr), grad: 'centerDark' }
  ];

  const gradId = (name: string) => `crystal-${name}-${idSuffix}`;

  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className={styles.svg}>
      <ellipse cx="50" cy="93" rx="20" ry="4" fill={`url(#${gradId('groundShadow')})`} />
      <ellipse cx="50" cy="48" rx="32" ry="34" fill={`url(#${gradId('aura')})`} className={styles.auraFill} />

      <g opacity="0.38" className={styles.stageTintLayer}>
        <path d={tri(H.top, M.top, C.top)} fill={`url(#${gradId('stageTintCrown')})`} />
        <path d={tri(H.ul, M.ul, M.ll)} fill={`url(#${gradId('stageTintLeft')})`} />
      </g>

      <g opacity="0.94">
        {leftFaces.map((face, index) => (
          <path key={`left-${index}`} d={face.d} fill={`url(#${gradId(face.grad)})`} />
        ))}
      </g>

      <g opacity="0.96">
        {rightFaces.map((face, index) => (
          <path key={`right-${index}`} d={face.d} fill={`url(#${gradId(face.grad)})`} />
        ))}
      </g>

      <g opacity="0.98">
        {centerFaces.map((face, index) => (
          <path key={`center-${index}`} d={face.d} fill={`url(#${gradId(face.grad)})`} />
        ))}
      </g>

      <g>
        {crownFaces.map((face, index) => (
          <path key={`crown-${index}`} d={face.d} fill={`url(#${gradId(face.grad)})`} />
        ))}
      </g>

      <path d={tri(H.top, M.top, C.top)} fill={`url(#${gradId('specularCrown')})`} opacity="0.78" />
      <path d={tri(H.top, M.ul, M.top)} fill="rgba(255,255,255,0.42)" opacity="0.55" />
      <path d="M44 6 L50 2 L56 6" stroke="rgba(255,255,255,0.88)" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />

      <defs>
        <radialGradient id={gradId('groundShadow')} cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
          <stop stopColor={tint.shadow} stopOpacity="0.28" />
          <stop offset="0.55" stopColor={palette.deep} stopOpacity="0.18" />
          <stop offset="1" stopColor={palette.deep} stopOpacity="0" />
        </radialGradient>

        <radialGradient id={gradId('aura')} cx="0.48" cy="0.28" r="0.62" gradientUnits="objectBoundingBox">
          <stop stopColor={tint.accent} stopOpacity="0.22" />
          <stop offset="0.5" stopColor={tint.accent} stopOpacity="0.07" />
          <stop offset="1" stopColor={tint.accent} stopOpacity="0" />
        </radialGradient>

        <linearGradient id={gradId('stageTintCrown')} x1="50" y1="3" x2="50" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor={tint.accent} stopOpacity="0.16" />
          <stop offset="1" stopColor={tint.accent} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={gradId('stageTintLeft')} x1="8" y1="26" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor={tint.accent} stopOpacity="0.12" />
          <stop offset="1" stopColor={tint.accent} stopOpacity="0" />
        </linearGradient>

        <linearGradient id={gradId('crownCenter')} x1="50" y1="3" x2="50" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(255,255,255,0.92)" />
          <stop offset="0.35" stopColor={palette.bright} stopOpacity="0.82" />
          <stop offset="1" stopColor={palette.mid} stopOpacity="0.62" />
        </linearGradient>
        <linearGradient id={gradId('crownLeft')} x1="8" y1="26" x2="50" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor={palette.bright} stopOpacity="0.78" />
          <stop offset="1" stopColor={palette.mid} stopOpacity="0.58" />
        </linearGradient>
        <linearGradient id={gradId('crownRight')} x1="92" y1="26" x2="50" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor={palette.bright} stopOpacity="0.72" />
          <stop offset="1" stopColor={palette.mid} stopOpacity="0.54" />
        </linearGradient>

        <linearGradient id={gradId('leftDeep')} x1="4" y1="68" x2="30" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor={palette.deep} stopOpacity="0.82" />
          <stop offset="1" stopColor={palette.deep} stopOpacity="0.94" />
        </linearGradient>
        <linearGradient id={gradId('leftMid')} x1="8" y1="32" x2="38" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor={palette.mid} stopOpacity="0.58" />
          <stop offset="1" stopColor={palette.bright} stopOpacity="0.78" />
        </linearGradient>

        <linearGradient id={gradId('rightDeep')} x1="96" y1="68" x2="70" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor={palette.deep} stopOpacity="0.82" />
          <stop offset="1" stopColor={palette.deep} stopOpacity="0.94" />
        </linearGradient>
        <linearGradient id={gradId('rightMid')} x1="92" y1="32" x2="62" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor={palette.bright} stopOpacity="0.72" />
          <stop offset="1" stopColor={palette.mid} stopOpacity="0.58" />
        </linearGradient>

        <linearGradient id={gradId('centerBright')} x1="50" y1="28" x2="50" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor={palette.bright} stopOpacity="0.68" />
          <stop offset="1" stopColor={palette.mid} stopOpacity="0.72" />
        </linearGradient>
        <linearGradient id={gradId('centerDark')} x1="50" y1="52" x2="50" y2="78" gradientUnits="userSpaceOnUse">
          <stop stopColor={palette.mid} stopOpacity="0.52" />
          <stop offset="1" stopColor={palette.deep} stopOpacity="0.78" />
        </linearGradient>

        <linearGradient id={gradId('specularCrown')} x1="50" y1="3" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(255,255,255,0.68)" />
          <stop offset="0.55" stopColor={palette.bright} stopOpacity="0.24" />
          <stop offset="1" stopColor={palette.mid} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const CRYSTAL_FLOAT_DURATION = 14;
const CRYSTAL_FLOAT_DURATION_HOVER = 6;
const CRYSTAL_SWAY_DURATION = 18;
const CRYSTAL_SWAY_DURATION_HOVER = 7;
const CRYSTAL_BREATH_DURATION = 16;

export function TdmStageCrystalIcon({
  stage,
  size = 'md',
  animated = true,
  emphasis = 'default',
  disabled = false,
  className
}: {
  stage: TdmStage;
  size?: CrystalSize;
  animated?: boolean;
  emphasis?: CrystalEmphasis;
  disabled?: boolean;
  className?: string;
}) {
  const theme = getTdmStageTheme(stage);
  const crystalTint = getTdmStageCrystalTint(stage);
  const idSuffix = useId().replace(/:/g, '');
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const shouldAnimate = animated && !disabled;
  const shouldMotion = shouldAnimate && !prefersReducedMotion;
  const floatDuration = isHovered ? CRYSTAL_FLOAT_DURATION_HOVER : CRYSTAL_FLOAT_DURATION;
  const swayDuration = isHovered ? CRYSTAL_SWAY_DURATION_HOVER : CRYSTAL_SWAY_DURATION;

  return (
    <span
      className={[
        styles.crystal,
        SIZE_CLASS[size],
        EMPHASIS_CLASS[emphasis],
        shouldAnimate ? styles.animated : '',
        isHovered && shouldAnimate ? styles.animatedHover : '',
        disabled ? styles.disabled : '',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
      style={
        {
          '--stage-accent': theme.accent,
          '--stage-crystal-accent': crystalTint.accent,
          '--stage-crystal-accent-soft': crystalTint.accentSoft,
          '--stage-crystal-glow': crystalTint.glow,
          '--stage-crystal-shadow': crystalTint.shadow,
          ...getTdmStageCrystalCssVarsExtended(stage)
        } as CSSProperties
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.span
        className={styles.crystalInner}
        animate={
          shouldMotion
            ? {
                rotateY: isHovered ? [-12, 12, -12] : [-7, 7, -7],
                rotateX: isHovered ? [3, -3, 3] : [2, -2, 2],
                rotateZ: isHovered ? [-2, 2, -2] : [-1.2, 1.2, -1.2],
                y: isHovered ? [-3, 2, -3] : [-2, 1.5, -2],
                scale: isHovered ? 1.06 : [1, 1.028, 1]
              }
            : isHovered && shouldAnimate
              ? { scale: 1.04, y: -2 }
              : undefined
        }
        transition={
          shouldMotion
            ? {
                rotateY: {
                  duration: swayDuration,
                  ease: 'easeInOut',
                  repeat: Infinity
                },
                rotateX: {
                  duration: swayDuration * 1.15,
                  ease: 'easeInOut',
                  repeat: Infinity
                },
                rotateZ: {
                  duration: swayDuration * 0.85,
                  ease: 'easeInOut',
                  repeat: Infinity
                },
                y: {
                  duration: floatDuration,
                  ease: 'easeInOut',
                  repeat: Infinity
                },
                scale: isHovered
                  ? {
                      duration: 0.55,
                      ease: [0.22, 1, 0.36, 1]
                    }
                  : {
                      duration: CRYSTAL_BREATH_DURATION,
                      ease: 'easeInOut',
                      repeat: Infinity,
                      times: [0, 0.5, 1]
                    }
              }
            : {
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1]
              }
        }
      >
        <CrystalSvg stage={stage} idSuffix={idSuffix} />
      </motion.span>
    </span>
  );
}

/** Alias for external / design-system usage */
export const StageCrystal3D = TdmStageCrystalIcon;
export const StageCrystalIcon = TdmStageCrystalIcon;

export type StageCrystalVariant = TdmStage;

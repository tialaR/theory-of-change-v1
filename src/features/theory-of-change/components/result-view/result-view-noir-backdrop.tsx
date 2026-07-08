'use client';

import { useId } from 'react';
import styles from './result-view-noir-backdrop.module.sass';

/**
 * Full-page atmosphere behind TdmGlassSurface columns.
 *
 * Reference: React Bits backgrounds were surveyed (Grainient, DarkVeil, SoftAurora,
 * FloatingLines, DotGrid). Suitable visuals use ogl/three/gsap — excluded by project rules.
 *
 * Lightweight adaptation: layered graphite gradients + SVG smoke/halos/editorial lines +
 * CSS grain wash (Grainient-style, without WebGL).
 */
export function ResultViewNoirBackdrop() {
  const uid = useId().replace(/:/g, '');

  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.gradientBase} />
      <div className={styles.smokeDriftA} />
      <div className={styles.smokeDriftB} />
      <div className={styles.depthGlow} />

      <svg
        className={styles.backdropSvg}
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        focusable="false"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`rv-silver-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(210,214,222,0)" />
            <stop offset="35%" stopColor="rgba(210,214,222,0.06)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="65%" stopColor="rgba(210,214,222,0.06)" />
            <stop offset="100%" stopColor="rgba(210,214,222,0)" />
          </linearGradient>

          <linearGradient id={`rv-line-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="20%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.14)" />
            <stop offset="80%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          <radialGradient id={`rv-smoke-a-${uid}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(280 320) scale(420 280)">
            <stop stopColor="rgba(255,255,255,0.08)" />
            <stop offset="0.42" stopColor="rgba(210,214,222,0.045)" />
            <stop offset="1" stopColor="rgba(3,3,4,0)" />
          </radialGradient>

          <radialGradient id={`rv-smoke-b-${uid}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1180 420) scale(380 260)">
            <stop stopColor="rgba(210,214,222,0.07)" />
            <stop offset="0.5" stopColor="rgba(255,255,255,0.035)" />
            <stop offset="1" stopColor="rgba(3,3,4,0)" />
          </radialGradient>

          <radialGradient id={`rv-smoke-c-${uid}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(800 520) scale(640 320)">
            <stop stopColor="rgba(255,255,255,0.05)" />
            <stop offset="0.55" stopColor="rgba(210,214,222,0.025)" />
            <stop offset="1" stopColor="rgba(3,3,4,0)" />
          </radialGradient>

          <radialGradient id={`rv-hero-glow-${uid}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(800 140) scale(520 180)">
            <stop stopColor="rgba(255,255,255,0.09)" />
            <stop offset="0.45" stopColor="rgba(210,214,222,0.045)" />
            <stop offset="1" stopColor="rgba(3,3,4,0)" />
          </radialGradient>

          <radialGradient id={`rv-stage-input-${uid}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 560) scale(220 380)">
            <stop stopColor="rgba(167,139,250,0.13)" />
            <stop offset="0.55" stopColor="rgba(167,139,250,0.045)" />
            <stop offset="1" stopColor="rgba(3,3,4,0)" />
          </radialGradient>

          <radialGradient id={`rv-stage-activity-${uid}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(560 580) scale(220 380)">
            <stop stopColor="rgba(96,165,250,0.12)" />
            <stop offset="0.55" stopColor="rgba(96,165,250,0.045)" />
            <stop offset="1" stopColor="rgba(3,3,4,0)" />
          </radialGradient>

          <radialGradient id={`rv-stage-output-${uid}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(920 580) scale(220 380)">
            <stop stopColor="rgba(245,158,66,0.11)" />
            <stop offset="0.55" stopColor="rgba(245,158,66,0.04)" />
            <stop offset="1" stopColor="rgba(3,3,4,0)" />
          </radialGradient>

          <radialGradient id={`rv-stage-outcome-${uid}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1280 560) scale(220 380)">
            <stop stopColor="rgba(72,211,165,0.11)" />
            <stop offset="0.55" stopColor="rgba(72,211,165,0.04)" />
            <stop offset="1" stopColor="rgba(3,3,4,0)" />
          </radialGradient>

          <filter id={`rv-blur-soft-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="18" />
          </filter>

          <filter id={`rv-blur-wide-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="42" />
          </filter>

          <filter id={`rv-grain-${uid}`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" result="noise" />
            <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
            <feComponentTransfer in="mono" result="soft">
              <feFuncA type="linear" slope="0.055" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="soft" mode="soft-light" />
          </filter>
        </defs>

        <ellipse cx="800" cy="140" rx="520" ry="160" fill={`url(#rv-hero-glow-${uid})`} filter={`url(#rv-blur-soft-${uid})`} />

        <ellipse cx="280" cy="320" rx="420" ry="260" fill={`url(#rv-smoke-a-${uid})`} filter={`url(#rv-blur-wide-${uid})`} opacity="0.9" />
        <ellipse cx="1180" cy="420" rx="360" ry="240" fill={`url(#rv-smoke-b-${uid})`} filter={`url(#rv-blur-wide-${uid})`} opacity="0.78" />
        <ellipse cx="800" cy="520" rx="640" ry="280" fill={`url(#rv-smoke-c-${uid})`} filter={`url(#rv-blur-wide-${uid})`} opacity="0.62" />

        <ellipse cx="200" cy="560" rx="200" ry="340" fill={`url(#rv-stage-input-${uid})`} filter={`url(#rv-blur-soft-${uid})`} />
        <ellipse cx="560" cy="580" rx="200" ry="340" fill={`url(#rv-stage-activity-${uid})`} filter={`url(#rv-blur-soft-${uid})`} />
        <ellipse cx="920" cy="580" rx="200" ry="340" fill={`url(#rv-stage-output-${uid})`} filter={`url(#rv-blur-soft-${uid})`} />
        <ellipse cx="1280" cy="560" rx="200" ry="340" fill={`url(#rv-stage-outcome-${uid})`} filter={`url(#rv-blur-soft-${uid})`} />

        <rect x="0" y="118" width="1600" height="1" fill={`url(#rv-silver-${uid})`} opacity="0.55" />
        <rect x="0" y="248" width="1600" height="0.75" fill={`url(#rv-line-${uid})`} opacity="0.35" />
        <rect x="0" y="680" width="1600" height="0.5" fill={`url(#rv-line-${uid})`} opacity="0.22" />

        <path
          d="M-40 180 C 220 80, 480 120, 760 72 S 1280 48, 1640 120"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.75"
        />
        <path
          d="M-20 720 C 280 640, 520 680, 800 620 S 1240 560, 1620 640"
          fill="none"
          stroke="rgba(210,214,222,0.05)"
          strokeWidth="0.65"
        />
        <path
          d="M80 860 C 360 780, 640 820, 920 760 S 1320 700, 1520 780"
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="0.55"
        />

        <ellipse cx="1320" cy="200" rx="180" ry="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.75" transform="rotate(-18 1320 200)" />
        <ellipse cx="1320" cy="200" rx="120" ry="80" fill="none" stroke="rgba(210,214,222,0.06)" strokeWidth="0.6" strokeDasharray="5 4" transform="rotate(12 1320 200)" />
        <circle cx="1320" cy="200" r="220" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

        <ellipse cx="120" cy="780" rx="140" ry="90" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.6" transform="rotate(22 120 780)" />

        <line x1="200" y1="320" x2="200" y2="920" stroke="rgba(167,139,250,0.06)" strokeWidth="0.5" strokeDasharray="3 6" />
        <line x1="560" y1="320" x2="560" y2="920" stroke="rgba(96,165,250,0.06)" strokeWidth="0.5" strokeDasharray="3 6" />
        <line x1="920" y1="320" x2="920" y2="920" stroke="rgba(245,158,66,0.06)" strokeWidth="0.5" strokeDasharray="3 6" />
        <line x1="1280" y1="320" x2="1280" y2="920" stroke="rgba(72,211,165,0.06)" strokeWidth="0.5" strokeDasharray="3 6" />

        <circle cx="340" cy="420" r="2" fill="rgba(255,255,255,0.28)" />
        <circle cx="680" cy="380" r="1.6" fill="rgba(255,255,255,0.22)" />
        <circle cx="1020" cy="440" r="1.8" fill="rgba(255,255,255,0.2)" />
        <circle cx="1380" cy="400" r="1.4" fill="rgba(255,255,255,0.18)" />

        <rect width="1600" height="1000" fill="transparent" filter={`url(#rv-grain-${uid})`} opacity="0.65" />
      </svg>

      <div className={styles.grainOverlay} />
      <div className={styles.vignette} />
    </div>
  );
}

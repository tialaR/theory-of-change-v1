'use client';

import { useId } from 'react';
import styles from './tdm-sidebar.module.sass';

export function FinalResultHeroWaves() {
  return (
    <svg
      className={styles.finalResultHeroWaves}
      viewBox="0 0 480 140"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className={styles.finalResultHeroWavePath}
        d="M-20 88 C 80 52, 160 102, 260 62 S 400 38, 500 76"
        stroke="rgba(255, 255, 255, 0.16)"
        strokeWidth="0.65"
      />
      <path
        className={styles.finalResultHeroWavePath}
        d="M-30 104 C 90 78, 180 118, 280 86 S 400 58, 510 92"
        stroke="rgba(210, 205, 225, 0.11)"
        strokeWidth="0.55"
      />
      <path
        className={styles.finalResultHeroWavePath}
        d="M0 58 C 100 34, 190 68, 290 42 S 410 22, 500 48"
        stroke="rgba(255, 255, 255, 0.09)"
        strokeWidth="0.5"
      />
      <path
        className={styles.finalResultHeroWavePath}
        d="M40 118 C 140 96, 230 128, 330 98 S 430 74, 520 102"
        stroke="rgba(195, 190, 210, 0.09)"
        strokeWidth="0.45"
      />
      <path
        className={styles.finalResultHeroWavePath}
        d="M60 72 C 150 56, 240 82, 340 58 S 430 42, 520 62"
        stroke="rgba(255, 255, 255, 0.07)"
        strokeWidth="0.4"
      />
      <path
        className={styles.finalResultHeroWavePath}
        d="M-10 42 C 80 24, 180 48, 280 28 S 390 12, 480 34"
        stroke="rgba(220, 216, 235, 0.08)"
        strokeWidth="0.38"
      />
    </svg>
  );
}

export function FinalResultVisual() {
  const gradientId = useId().replace(/:/g, '');
  const faceId = `finalResultFace-${gradientId}`;
  const brightFaceId = `finalResultBrightFace-${gradientId}`;
  const shadeFaceId = `finalResultShadeFace-${gradientId}`;
  const strokeId = `finalResultStroke-${gradientId}`;
  const softGlowId = `finalResultSoftGlow-${gradientId}`;

  return (
    <span className={styles.finalResultVisual} aria-hidden="true">
      <span className={styles.finalResultVisualGlow} />
      <span className={styles.finalResultVisualShell}>
        <svg viewBox="0 0 96 96" className={styles.finalResultVisualGlyph} fill="none">
          <defs>
            <radialGradient id={softGlowId} cx="52%" cy="42%" r="56%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
              <stop offset="42%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={faceId} x1="27" y1="17" x2="72" y2="78" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f7f7f7" stopOpacity="0.68" />
              <stop offset="0.48" stopColor="#b7b7bc" stopOpacity="0.26" />
              <stop offset="1" stopColor="#333338" stopOpacity="0.34" />
            </linearGradient>
            <linearGradient id={brightFaceId} x1="49" y1="16" x2="67" y2="62" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.88" />
              <stop offset="0.58" stopColor="#e4e4e6" stopOpacity="0.34" />
              <stop offset="1" stopColor="#a8a8ad" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id={shadeFaceId} x1="25" y1="28" x2="60" y2="84" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f5f5f5" stopOpacity="0.24" />
              <stop offset="0.62" stopColor="#6d6d74" stopOpacity="0.22" />
              <stop offset="1" stopColor="#141416" stopOpacity="0.46" />
            </linearGradient>
            <linearGradient id={strokeId} x1="22" y1="18" x2="74" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="0.52" stopColor="#d7d7da" stopOpacity="0.52" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.22" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="50" rx="34" ry="32" fill={`url(#${softGlowId})`} />
          <path d="M48 13 78 31 68 72 35 84 18 44Z" fill={`url(#${faceId})`} opacity="0.82" />
          <path d="M48 13 78 31 50 42Z" fill={`url(#${brightFaceId})`} opacity="0.94" />
          <path d="M50 42 78 31 68 72Z" fill="rgba(255,255,255,0.26)" />
          <path d="M48 13 50 42 18 44Z" fill="rgba(255,255,255,0.24)" />
          <path d="M18 44 50 42 35 84Z" fill={`url(#${shadeFaceId})`} opacity="0.86" />
          <path d="M50 42 68 72 35 84Z" fill="rgba(255,255,255,0.14)" />
          <path
            d="M48 13 78 31 68 72 35 84 18 44 48 13Z"
            stroke={`url(#${strokeId})`}
            strokeWidth="1.85"
            strokeLinejoin="round"
          />
          <path
            d="M48 13 50 42M78 31 50 42M18 44 50 42M68 72 50 42M35 84 50 42"
            stroke="rgba(255,255,255,0.44)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M31 31 50 42 57 25" stroke="rgba(255,255,255,0.38)" strokeWidth="0.95" strokeLinecap="round" />
          <path d="M42 66 50 42 62 57" stroke="rgba(255,255,255,0.26)" strokeWidth="0.9" strokeLinecap="round" />
        </svg>
      </span>
    </span>
  );
}

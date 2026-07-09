'use client';

import type { CSSProperties } from 'react';
import styles from './result-view-grainient-backdrop.module.sass';

/** Apple Noir Glass — graphite base, mineral silver light, mid graphite depth */
const DEFAULT_COLOR1 = '#07080B';
const DEFAULT_COLOR2 = '#A7A3B7';
const DEFAULT_COLOR3 = '#111318';

export type ResultViewGrainientBackdropProps = {
  className?: string;
  color1?: string;
  color2?: string;
  color3?: string;
};

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!match) {
    return null;
  }

  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

function hexToRgbString(hex: string, fallback: string): string {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return fallback;
  }

  return rgb.join(', ');
}

/**
 * Grainient-style atmosphere (CSS adaptation — no WebGL/OGL).
 * Reference: React Bits Grainient color layering; local module.sass only.
 */
export function ResultViewGrainientBackdrop({
  className = '',
  color1 = DEFAULT_COLOR1,
  color2 = DEFAULT_COLOR2,
  color3 = DEFAULT_COLOR3
}: ResultViewGrainientBackdropProps) {
  const style = {
    '--grain-color1': color1,
    '--grain-color2': color2,
    '--grain-color3': color3,
    '--grain-rgb1': hexToRgbString(color1, '8, 9, 13'),
    '--grain-rgb2': hexToRgbString(color2, '167, 163, 183'),
    '--grain-rgb3': hexToRgbString(color3, '36, 38, 45')
  } as CSSProperties;

  return (
    <div
      className={[styles.backdrop, className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
    >
      <div className={styles.gradientBase} />
      <div className={styles.gradientDriftA} />
      <div className={styles.gradientDriftB} />
      <div className={styles.mineralSheen} />
      <div className={styles.grainOverlay} />
      <div className={styles.vignette} />
    </div>
  );
}

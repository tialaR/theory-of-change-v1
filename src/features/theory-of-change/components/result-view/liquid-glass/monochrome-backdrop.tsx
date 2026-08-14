'use client';

import type { CSSProperties, ReactNode } from 'react';
import styles from './monochrome-backdrop.module.sass';

export type BackdropPreset = 'gray-layers' | 'topography' | 'glass-stack' | 'soft-beam';

export interface LiquidGlassMonochromeBackdropProps {
  children?: ReactNode;
  preset?: BackdropPreset;
  intensity?: number;
  speed?: number;
  className?: string;
  contentClassName?: string;
  overlay?: boolean;
}

function createContourPath(
  cx: number,
  cy: number,
  radiusX: number,
  radiusY: number,
  seed: number,
  points = 72,
): string {
  const coordinates: string[] = [];

  for (let index = 0; index < points; index += 1) {
    const angle = (index / points) * Math.PI * 2;
    const wobble =
      1 +
      Math.sin(angle * 3 + seed) * 0.055 +
      Math.sin(angle * 5 - seed * 0.7) * 0.027 +
      Math.cos(angle * 2 + seed * 1.3) * 0.018;
    const x = cx + Math.cos(angle) * radiusX * wobble;
    const y = cy + Math.sin(angle) * radiusY * wobble;
    coordinates.push(`${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return `${coordinates.join(' ')} Z`;
}

const centralContours = Array.from({ length: 17 }, (_, index) => {
  const scale = 1 - index * 0.052;
  return createContourPath(505, 585, 438 * scale, 332 * scale, 0.72 + index * 0.13);
});

const upperContours = Array.from({ length: 11 }, (_, index) => {
  const scale = 1 - index * 0.072;
  return createContourPath(710, 250, 270 * scale, 185 * scale, 1.8 + index * 0.16);
});

const lowerContours = Array.from({ length: 10 }, (_, index) => {
  const scale = 1 - index * 0.075;
  return createContourPath(238, 1000, 255 * scale, 174 * scale, 2.5 + index * 0.17);
});

const grayLayerCount = 9;
const grayColumnCount = 5;

export function LiquidGlassMonochromeBackdrop({
  children,
  preset = 'gray-layers',
  intensity = 1,
  speed = 1,
  className = '',
  contentClassName = '',
  overlay = false
}: LiquidGlassMonochromeBackdropProps) {
  const safeSpeed = Math.max(0.1, speed);
  const variables = {
    '--backdrop-intensity': intensity,
    '--backdrop-light-duration': `${18 / safeSpeed}s`,
    '--backdrop-fog-duration': `${32 / safeSpeed}s`,
    '--backdrop-topography-duration': `${25 / safeSpeed}s`,
    '--backdrop-noise-duration': `${42 / safeSpeed}s`,
    '--backdrop-plate-duration': `${15 / safeSpeed}s`,
    '--backdrop-layer-duration': `${26 / safeSpeed}s`,
    '--backdrop-column-duration': `${38 / safeSpeed}s`,
  } as CSSProperties;

  return (
    <section
      className={`${styles.backdrop} ${styles[preset]} ${overlay ? styles.overlay : ''} ${className}`}
      style={variables}
      data-preset={preset}
      aria-hidden={overlay ? true : undefined}
    >
      <div className={styles.blackBase} aria-hidden="true" />
      <div className={styles.lightField} aria-hidden="true" />
      <div className={styles.fogField} aria-hidden="true" />

      {preset === 'gray-layers' && (
        <>
          <div className={styles.grayColumns} aria-hidden="true">
            {Array.from({ length: grayColumnCount }, (_, index) => (
              <span
                key={`column-${index}`}
                className={styles.grayColumn}
                style={{
                  '--column-left': `${3 + index * 22}%`,
                  '--column-blur': `${32 + index * 7}px`,
                  '--column-opacity': 0.48 + index * 0.06,
                  '--column-light-top': (0.02 + index * 0.008) * intensity,
                  '--column-light-mid': (0.07 + index * 0.01) * intensity,
                  '--column-light-bottom': (0.025 + index * 0.006) * intensity,
                  '--column-duration': `${(38 + index * 4) / safeSpeed}s`,
                  '--column-x-start': `${(index - 2) * 2.5}%`,
                  '--column-x-end': `${(2 - index) * 3.5}%`,
                } as CSSProperties}
              />
            ))}
          </div>
          <div className={styles.grayLayers} aria-hidden="true">
            {Array.from({ length: grayLayerCount }, (_, index) => (
              <span
                key={`layer-${index}`}
                className={styles.grayLayer}
                style={{
                  '--layer-top': `${-2 + index * 12.4}%`,
                  '--layer-border-alpha': (0.018 + index * 0.005) * intensity,
                  '--layer-light-a': (0.035 + index * 0.006) * intensity,
                  '--layer-light-b': (0.13 + index * 0.012) * intensity,
                  '--layer-light-c': (0.075 + index * 0.008) * intensity,
                  '--layer-even-a': (0.105 + index * 0.008) * intensity,
                  '--layer-even-b': (0.05 + index * 0.006) * intensity,
                  '--layer-even-c': 0.055 * intensity,
                  '--layer-glow-alpha': 0.025 * intensity,
                  '--layer-blur': `${11 + index * 1.5}px`,
                  '--layer-mobile-blur': `${8 + index * 1.1}px`,
                  '--layer-opacity': 0.43 + index * 0.045,
                  '--layer-duration': `${(26 + index * 2.7) / safeSpeed}s`,
                  '--layer-delay': `${index * -3.1}s`,
                  '--layer-rotate-a': `${(index - 4) * 0.42}deg`,
                  '--layer-rotate-b': `${(index - 4) * 0.2}deg`,
                  '--layer-rotate-c': `${(index - 4) * 0.5}deg`,
                  '--layer-rotate-even-a': `${(index - 4) * 0.34}deg`,
                  '--layer-rotate-even-b': `${(index - 4) * 0.12}deg`,
                  '--layer-rotate-even-c': `${(index - 4) * 0.43}deg`,
                  '--layer-scale-a': 0.72 + index * 0.035,
                  '--layer-scale-b': 0.8 + index * 0.035,
                  '--layer-scale-c': 0.73 + index * 0.035,
                  '--layer-scale-even-a': 0.75 + index * 0.032,
                  '--layer-scale-even-b': 0.84 + index * 0.032,
                  '--layer-scale-even-c': 0.74 + index * 0.032,
                } as CSSProperties}
              />
            ))}
          </div>
        </>
      )}

      {preset === 'topography' && (
        <svg
          className={styles.topographySvg}
          viewBox="0 0 1000 1200"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <filter id="topography-soft-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4.4" />
            </filter>
            <linearGradient id="topography-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,.08)" />
              <stop offset="0.42" stopColor="rgba(255,255,255,.74)" />
              <stop offset="0.72" stopColor="rgba(255,255,255,.28)" />
              <stop offset="1" stopColor="rgba(255,255,255,.04)" />
            </linearGradient>
          </defs>

          <g className={styles.contourGlow} filter="url(#topography-soft-glow)">
            {centralContours.filter((_, index) => index % 3 === 0).map((path, index) => (
              <path key={`central-glow-${index}`} d={path} />
            ))}
          </g>

          <g className={styles.contourLines}>
            {centralContours.map((path, index) => (
              <path key={`central-${index}`} d={path} style={{ '--line-index': index } as CSSProperties} />
            ))}
            {upperContours.map((path, index) => (
              <path key={`upper-${index}`} d={path} style={{ '--line-index': index + 4 } as CSSProperties} />
            ))}
            {lowerContours.map((path, index) => (
              <path key={`lower-${index}`} d={path} style={{ '--line-index': index + 8 } as CSSProperties} />
            ))}
          </g>
        </svg>
      )}

      {preset === 'glass-stack' && (
        <div className={styles.stack} aria-hidden="true">
          {Array.from({ length: 7 }, (_, index) => (
            <span
              key={index}
              className={styles.stackPlate}
              style={{ '--plate-index': index } as CSSProperties}
            />
          ))}
        </div>
      )}

      <div className={styles.noise} aria-hidden="true" />
      <div className={`${styles.content} ${contentClassName}`}>{children}</div>
    </section>
  );
}

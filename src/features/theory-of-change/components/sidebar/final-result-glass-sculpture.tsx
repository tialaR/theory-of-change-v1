'use client';

import { useId } from 'react';
import styles from './final-result-glass-sculpture.module.sass';

export function FinalResultDecorLayer() {
  const uid = useId().replace(/:/g, '');

  return (
    <div className={styles.decorLayer} aria-hidden="true">
      <span className={styles.decorHazeCore} />
      <span className={styles.decorHazeSpread} />
      <span className={styles.decorHazeBand} />
      <span className={styles.decorHazeTrail} />
      <span className={styles.decorGlassLamina} />
      <span className={styles.decorGlassLaminaAlt} />
      <span className={styles.decorGlassLaminaFine} />
      <span className={styles.decorSpecular} />
      <svg
        className={styles.decorSvg}
        viewBox="0 0 360 180"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`frd-stroke-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(252, 252, 255, 0.38)" />
            <stop offset="45%" stopColor="rgba(214, 216, 222, 0.22)" />
            <stop offset="100%" stopColor="rgba(148, 150, 156, 0.1)" />
          </linearGradient>
          <linearGradient id={`frd-orbit-${uid}`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="rgba(236, 238, 244, 0.32)" />
            <stop offset="50%" stopColor="rgba(196, 198, 204, 0.18)" />
            <stop offset="100%" stopColor="rgba(168, 170, 176, 0.1)" />
          </linearGradient>
          <radialGradient
            id={`frd-glow-${uid}`}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(72 88) scale(64 48)"
          >
            <stop stopColor="rgba(252, 252, 255, 0.32)" />
            <stop offset="0.45" stopColor="rgba(214, 216, 222, 0.14)" />
            <stop offset="1" stopColor="rgba(168, 170, 176, 0)" />
          </radialGradient>
          <filter id={`frd-blur-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4.5" />
          </filter>
        </defs>

        <ellipse cx="72" cy="88" rx="58" ry="42" fill={`url(#frd-glow-${uid})`} filter={`url(#frd-blur-${uid})`} />

        <g className={styles.decorOrbitOuter}>
          <ellipse
            cx="72"
            cy="90"
            rx="62"
            ry="28"
            fill="none"
            stroke={`url(#frd-orbit-${uid})`}
            strokeWidth="0.55"
            transform="rotate(-8 72 90)"
          />
        </g>
        <g className={styles.decorOrbitMid}>
          <ellipse
            cx="72"
            cy="88"
            rx="48"
            ry="36"
            fill="none"
            stroke="rgba(228, 230, 236, 0.26)"
            strokeWidth="0.55"
            transform="rotate(22 72 88)"
            strokeDasharray="3 2.5"
          />
        </g>
        <g className={styles.decorOrbitInner}>
          <ellipse
            cx="72"
            cy="86"
            rx="34"
            ry="20"
            fill="none"
            stroke="rgba(236, 238, 244, 0.22)"
            strokeWidth="0.48"
            transform="rotate(-32 72 86)"
          />
        </g>

        <path
          className={styles.decorPath}
          d="M-12 108 C 52 58, 118 88, 188 62 S 298 38, 372 72"
          fill="none"
          stroke={`url(#frd-stroke-${uid})`}
          strokeWidth="0.75"
        />
        <path
          className={styles.decorPath}
          d="M8 138 C 78 96, 148 118, 218 96 S 308 72, 368 98"
          fill="none"
          stroke="rgba(214, 216, 222, 0.22)"
          strokeWidth="0.58"
        />
        <path
          className={styles.decorPath}
          d="M24 48 C 92 28, 162 56, 232 36 S 318 14, 368 42"
          fill="none"
          stroke="rgba(228, 230, 236, 0.18)"
          strokeWidth="0.52"
        />
        <path
          className={styles.decorPath}
          d="M48 72 C 108 52, 168 78, 228 58 S 308 42, 348 62"
          fill="none"
          stroke="rgba(196, 198, 204, 0.14)"
          strokeWidth="0.42"
        />

        <line x1="28" y1="98" x2="98" y2="62" stroke="rgba(236, 238, 244, 0.26)" strokeWidth="0.48" />
        <line x1="98" y1="62" x2="162" y2="78" stroke="rgba(214, 216, 222, 0.18)" strokeWidth="0.42" />
        <line x1="162" y1="78" x2="228" y2="54" stroke="rgba(196, 198, 204, 0.16)" strokeWidth="0.38" />
        <line x1="228" y1="54" x2="288" y2="68" stroke="rgba(214, 216, 222, 0.14)" strokeWidth="0.35" />
        <line x1="68" y1="124" x2="138" y2="94" stroke="rgba(196, 198, 204, 0.16)" strokeWidth="0.36" />
        <line x1="138" y1="94" x2="202" y2="108" stroke="rgba(168, 170, 176, 0.14)" strokeWidth="0.34" />
        <line x1="202" y1="108" x2="268" y2="82" stroke="rgba(214, 216, 222, 0.12)" strokeWidth="0.3" />

        <circle cx="28" cy="98" r="1.55" fill="rgba(252, 252, 255, 0.52)" />
        <circle cx="98" cy="62" r="1.35" fill="rgba(252, 252, 255, 0.44)" />
        <circle cx="162" cy="78" r="1.25" fill="rgba(236, 238, 244, 0.38)" />
        <circle cx="228" cy="54" r="1.4" fill="rgba(228, 230, 236, 0.34)" />
        <circle cx="288" cy="68" r="1.15" fill="rgba(214, 216, 222, 0.3)" />
        <circle cx="138" cy="94" r="1.05" fill="rgba(228, 230, 236, 0.28)" />
        <circle cx="202" cy="108" r="0.95" fill="rgba(196, 198, 204, 0.24)" />
        <circle cx="268" cy="82" r="0.85" fill="rgba(214, 216, 222, 0.2)" />

        <circle cx="118" cy="42" r="1.85" fill="rgba(252, 252, 255, 0.46)" className={styles.decorSatellite} />
        <circle cx="42" cy="68" r="1.35" fill="rgba(228, 230, 236, 0.36)" className={styles.decorSatelliteAlt} />
        <circle cx="248" cy="38" r="1.15" fill="rgba(236, 238, 244, 0.32)" />
      </svg>
    </div>
  );
}

const STACKED_DISCS = [
  { cy: 108, rx: 42, ry: 10, opacity: 0.48, stroke: 0.18 },
  { cy: 96, rx: 44, ry: 10.5, opacity: 0.56, stroke: 0.19 },
  { cy: 84, rx: 45, ry: 11, opacity: 0.64, stroke: 0.2 },
  { cy: 72, rx: 44.5, ry: 10.8, opacity: 0.72, stroke: 0.21 },
  { cy: 60, rx: 43, ry: 10.4, opacity: 0.8, stroke: 0.22 },
  { cy: 48, rx: 40, ry: 9.8, opacity: 0.88, stroke: 0.23 },
  { cy: 36, rx: 36, ry: 9, opacity: 0.94, stroke: 0.24 },
  { cy: 24, rx: 30, ry: 7.8, opacity: 0.98, stroke: 0.25 },
  { cy: 14, rx: 22, ry: 6.2, opacity: 1, stroke: 0.26 }
] as const;

export function FinalResultGlassSculpture() {
  const uid = useId().replace(/:/g, '');

  return (
    <span className={styles.sculpture} aria-hidden="true">
      <span className={styles.ambientCore} />
      <span className={styles.ambientSpread} />
      <span className={styles.ambientTrail} />
      <span className={styles.horizonRing} />
      <span className={styles.silverVeil} />
      <span className={styles.sculptureBackdrop} />
      <span className={styles.sculptureRefraction} />
      <span className={styles.sculptureSpecular} />

      <svg className={styles.sculptureSvg} viewBox="0 0 100 120" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`frs-disc-top-${uid}`} x1="18" y1="12" x2="82" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(252, 252, 255, 0.58)" />
            <stop offset="0.35" stopColor="rgba(228, 230, 236, 0.32)" />
            <stop offset="0.72" stopColor="rgba(108, 110, 116, 0.2)" />
            <stop offset="1" stopColor="rgba(24, 25, 28, 0.38)" />
          </linearGradient>
          <linearGradient id={`frs-disc-mid-${uid}`} x1="12" y1="48" x2="88" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(236, 238, 244, 0.38)" />
            <stop offset="0.45" stopColor="rgba(168, 170, 176, 0.22)" />
            <stop offset="1" stopColor="rgba(18, 19, 23, 0.42)" />
          </linearGradient>
          <linearGradient id={`frs-disc-base-${uid}`} x1="8" y1="82" x2="92" y2="116" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(214, 216, 222, 0.28)" />
            <stop offset="0.5" stopColor="rgba(108, 110, 116, 0.18)" />
            <stop offset="1" stopColor="rgba(12, 13, 16, 0.48)" />
          </linearGradient>
          <linearGradient id={`frs-edge-${uid}`} x1="14" y1="8" x2="86" y2="112" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(252, 252, 255, 0.72)" />
            <stop offset="0.45" stopColor="rgba(214, 216, 222, 0.42)" />
            <stop offset="1" stopColor="rgba(128, 130, 136, 0.24)" />
          </linearGradient>
          <linearGradient id={`frs-torus-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(252, 252, 255, 0.42)" />
            <stop offset="50%" stopColor="rgba(196, 198, 204, 0.22)" />
            <stop offset="100%" stopColor="rgba(108, 110, 116, 0.1)" />
          </linearGradient>
          <radialGradient
            id={`frs-glow-${uid}`}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(62 48) rotate(6) scale(38 30)"
          >
            <stop stopColor="rgba(252, 252, 255, 0.42)" />
            <stop offset="0.5" stopColor="rgba(214, 216, 222, 0.16)" />
            <stop offset="1" stopColor="rgba(168, 170, 176, 0)" />
          </radialGradient>
          <filter id={`frs-grain-${uid}`} x="-12%" y="-12%" width="124%" height="124%">
            <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.08" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" mode="soft-light" />
          </filter>
          <filter id={`frs-soft-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.8" />
          </filter>
        </defs>

        <ellipse cx="50" cy="62" rx="46" ry="38" fill={`url(#frs-glow-${uid})`} filter={`url(#frs-soft-${uid})`} opacity="0.72" />

        <g className={styles.sculptureOrbitOuter}>
          <ellipse
            cx="50"
            cy="58"
            rx="48"
            ry="22"
            fill="none"
            stroke={`url(#frs-torus-${uid})`}
            strokeWidth="0.78"
            transform="rotate(-14 50 58)"
          />
        </g>
        <g className={styles.sculptureOrbitMid}>
          <ellipse
            cx="50"
            cy="56"
            rx="38"
            ry="28"
            fill="none"
            stroke="rgba(228, 230, 236, 0.28)"
            strokeWidth="0.62"
            transform="rotate(28 50 56)"
            strokeDasharray="2.5 2"
          />
        </g>

        {STACKED_DISCS.map((disc, index) => {
          const fill =
            index < 3
              ? `url(#frs-disc-top-${uid})`
              : index < 6
                ? `url(#frs-disc-mid-${uid})`
                : `url(#frs-disc-base-${uid})`;

          return (
            <ellipse
              key={disc.cy}
              cx="50"
              cy={disc.cy}
              rx={disc.rx}
              ry={disc.ry}
              fill={fill}
              stroke={`url(#frs-edge-${uid})`}
              strokeWidth={disc.stroke}
              opacity={disc.opacity}
              filter={index > 3 ? `url(#frs-grain-${uid})` : undefined}
            />
          );
        })}

        <path
          d="M18 72 C 30 64, 70 64, 82 72"
          stroke="rgba(252, 252, 255, 0.48)"
          strokeWidth="0.78"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M22 48 C 34 42, 66 42, 78 48"
          stroke="rgba(236, 238, 244, 0.36)"
          strokeWidth="0.62"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M26 28 C 36 24, 64 24, 74 28"
          stroke="rgba(228, 230, 236, 0.28)"
          strokeWidth="0.5"
          strokeLinecap="round"
          fill="none"
        />

        <ellipse cx="66" cy="36" rx="6.5" ry="2.6" fill="rgba(252, 252, 255, 0.28)" transform="rotate(-16 66 36)" />
        <circle cx="68" cy="30" r="2.1" fill="rgba(252, 252, 255, 0.92)" />
        <circle cx="68" cy="30" r="3.8" stroke="rgba(236, 238, 244, 0.32)" strokeWidth="0.52" fill="none" />

        <circle cx="22" cy="42" r="2.5" fill="rgba(228, 230, 236, 0.22)" stroke="rgba(252, 252, 255, 0.38)" strokeWidth="0.42" />
        <circle cx="22" cy="42" r="1.05" fill="rgba(252, 252, 255, 0.62)" />

        <line x1="14" y1="100" x2="86" y2="100" stroke="rgba(168, 170, 176, 0.14)" strokeWidth="0.4" />
        <line x1="20" y1="106" x2="80" y2="106" stroke="rgba(148, 150, 156, 0.1)" strokeWidth="0.35" />
        <line x1="26" y1="112" x2="74" y2="112" stroke="rgba(120, 122, 128, 0.07)" strokeWidth="0.3" />
      </svg>
    </span>
  );
}

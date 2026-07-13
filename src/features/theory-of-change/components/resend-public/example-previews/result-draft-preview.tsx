'use client';

import { motion } from 'motion/react';
import styles from './example-previews.module.sass';

type ResultDraftPreviewProps = {
  active?: boolean;
  className?: string;
};

const lineTransition = {
  duration: 1.4,
  repeat: Infinity,
  ease: 'linear' as const,
};

function AnimatedWhitePath({ active, d }: { active?: boolean; d: string }) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="rgba(255,255,255,.66)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="7 12"
      markerEnd="url(#whiteArrow)"
      initial={false}
      animate={active ? { strokeDashoffset: [38, 0], opacity: [0.26, 0.72, 0.32] } : { strokeDashoffset: 0, opacity: 0.2 }}
      transition={active ? lineTransition : { duration: 0.26 }}
      vectorEffect="non-scaling-stroke"
    />
  );
}

function StageColumn({
  x,
  stage,
  count,
}: {
  x: number;
  stage: 'input' | 'activity' | 'product' | 'outcome';
  count: number;
}) {
  const colorByStage = {
    input: '#a78bfa',
    activity: '#60a5fa',
    product: '#f6ad55',
    outcome: '#4adebd',
  };
  const color = colorByStage[stage];
  const cards = Array.from({ length: count });

  return (
    <g filter="url(#resultColumnShadow)">
      <rect x={x} y="98" width="270" height="548" rx="14" fill="rgba(16,18,20,.5)" stroke={color} strokeWidth="1.1" opacity=".48" />
      <rect x={x + 18} y="126" width="54" height="4" rx="2" fill={color} opacity=".46" />
      <circle cx={x + 20} cy="121" r="3.8" fill={color} opacity=".9" />
      <rect x={x + 198} y="112" width="42" height="20" rx="8" fill={color} opacity=".12" stroke={color} strokeWidth="1" />
      {cards.map((_, index) => {
        const y = 166 + index * 147;
        return (
          <g key={`${stage}-${index}`}>
            <rect x={x + 24} y={y} width="222" height="108" rx="9" fill="url(#resultCardFill)" stroke={color} strokeWidth="1" opacity=".9" />
            <rect x={x + 24} y={y} width="3" height="108" rx="1.5" fill={color} opacity=".56" filter="url(#stageGlowResult)" />
            <rect x={x + 44} y={y + 27} width="35" height="35" rx="5" fill={color} opacity=".1" />
            <rect x={x + 92} y={y + 27} width="82" height="11" rx="3" fill="rgba(255,255,255,.08)" />
            <rect x={x + 92} y={y + 49} width="126" height="10" rx="3" fill="rgba(255,255,255,.06)" />
            <rect x={x + 92} y={y + 69} width="106" height="9" rx="3" fill="rgba(255,255,255,.052)" />
          </g>
        );
      })}
    </g>
  );
}

function ConnectionBadge({ x, y }: { x: number; y: number }) {
  return (
    <g opacity=".72">
      <circle cx={x} cy={y} r="10" fill="rgba(11,12,14,.9)" stroke="rgba(255,255,255,.5)" strokeWidth="1" />
      <circle cx={x} cy={y} r="3" fill="rgba(255,255,255,.58)" />
    </g>
  );
}

export function ResultDraftPreview({ active, className }: ResultDraftPreviewProps) {
  return (
    <div className={[styles.previewCanvas, className].filter(Boolean).join(' ')} aria-hidden="true">
      <svg viewBox="0 0 1520 820" role="img" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="resultBg" cx="48%" cy="42%" r="70%">
            <stop offset="0" stopColor="rgba(255,255,255,.055)" />
            <stop offset=".58" stopColor="rgba(255,255,255,.02)" />
            <stop offset="1" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <linearGradient id="resultCardFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(34,37,42,.78)" />
            <stop offset=".5" stopColor="rgba(17,19,22,.82)" />
            <stop offset="1" stopColor="rgba(8,9,11,.88)" />
          </linearGradient>
          <filter id="resultColumnShadow" x="-28%" y="-12%" width="156%" height="136%">
            <feDropShadow dx="0" dy="22" stdDeviation="18" floodColor="rgba(0,0,0,.44)" />
          </filter>
          <filter id="stageGlowResult" x="-800%" y="-80%" width="1700%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="resultGrid" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,.16)" />
            <path d="M36 0H0V36" fill="none" stroke="rgba(255,255,255,.035)" strokeWidth="1" />
          </pattern>
          <marker id="whiteArrow" viewBox="0 0 10 10" refX="8.8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,.68)" />
          </marker>
        </defs>

        <rect width="1520" height="820" fill="rgba(7,8,10,.94)" />
        <rect width="1520" height="820" fill="url(#resultBg)" />
        <rect width="1520" height="820" fill="url(#resultGrid)" opacity=".42" />

        <AnimatedWhitePath active={active} d="M 298 222 C 362 222, 382 222, 420 222" />
        <AnimatedWhitePath active={active} d="M 298 369 C 355 369, 378 278, 420 252" />
        <AnimatedWhitePath active={active} d="M 298 516 C 355 512, 382 424, 420 404" />
        <AnimatedWhitePath active={active} d="M 692 222 C 760 222, 786 222, 820 222" />
        <AnimatedWhitePath active={active} d="M 692 369 C 760 369, 786 369, 820 369" />
        <AnimatedWhitePath active={active} d="M 692 516 C 760 516, 786 516, 820 516" />
        <AnimatedWhitePath active={active} d="M 1092 222 C 1165 220, 1200 310, 1240 342" />
        <AnimatedWhitePath active={active} d="M 1092 369 C 1166 370, 1204 362, 1240 356" />

        <StageColumn x={52} stage="input" count={3} />
        <StageColumn x={420} stage="activity" count={3} />
        <StageColumn x={820} stage="product" count={3} />
        <StageColumn x={1198} stage="outcome" count={1} />

        <ConnectionBadge x={388} y={222} />
        <ConnectionBadge x={788} y={222} />
        <ConnectionBadge x={1160} y={252} />
      </svg>
    </div>
  );
}

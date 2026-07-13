'use client';

import { motion } from 'motion/react';
import styles from './example-previews.module.sass';

type FlowDraftPreviewProps = {
  active?: boolean;
  className?: string;
};

const lineTransition = {
  duration: 1.35,
  repeat: Infinity,
  ease: 'linear' as const,
};

function AnimatedPath({
  active,
  d,
  stroke,
  width = 2.25,
  markerEnd,
}: {
  active?: boolean;
  d: string;
  stroke: string;
  width?: number;
  markerEnd?: string;
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="6 11"
      initial={false}
      animate={active ? { strokeDashoffset: [34, 0], opacity: [0.42, 0.86, 0.48] } : { strokeDashoffset: 0, opacity: 0.48 }}
      transition={active ? lineTransition : { duration: 0.28 }}
      vectorEffect="non-scaling-stroke"
      markerEnd={markerEnd}
    />
  );
}

function NodeCard({
  x,
  y,
  stage,
  compact = false,
}: {
  x: number;
  y: number;
  stage: 'input' | 'activity' | 'product' | 'outcome';
  compact?: boolean;
}) {
  const colorByStage = {
    input: '#a78bfa',
    activity: '#60a5fa',
    product: '#f6ad55',
    outcome: '#4adebd',
  };
  const color = colorByStage[stage];
  const width = compact ? 226 : 244;
  const height = compact ? 88 : 94;
  const tile = compact ? 46 : 50;
  const topLine = compact ? 78 : 84;
  const midLine = compact ? 128 : 142;
  const bottomLine = compact ? 112 : 124;

  return (
    <g filter="url(#previewSoftShadow)">
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="7"
        fill="url(#cardFill)"
        stroke="rgba(255,255,255,.13)"
        strokeWidth="1"
      />
      <rect x={x} y={y} width="4" height={height} rx="2" fill={color} opacity=".75" filter="url(#stageGlow)" />
      <rect x={x + 22} y={y + 25} width={tile} height={tile} rx="4" fill={color} opacity=".1" />
      <rect x={x + 30} y={y + 30} width={tile - 16} height={tile - 16} rx="3" fill={color} opacity=".08" />
      <rect x={x + 82} y={y + 24} width={topLine} height="13" rx="3" fill="rgba(255,255,255,.09)" />
      <rect x={x + 82} y={y + 47} width={midLine} height="12" rx="3" fill="rgba(255,255,255,.075)" />
      <rect x={x + 82} y={y + 68} width={bottomLine} height="11" rx="3" fill="rgba(255,255,255,.06)" />
      <rect x={x + 1} y={y + 1} width={width - 2} height="1" fill="rgba(255,255,255,.16)" />
    </g>
  );
}

function Port({ x, y, color }: { x: number; y: number; color: string }) {
  return <circle cx={x} cy={y} r="4.5" fill="#131519" stroke={color} strokeWidth="1.35" opacity=".82" />;
}

function Badge({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g opacity=".86">
      <circle cx={x} cy={y} r="11" fill="rgba(9, 10, 12, .82)" stroke={color} strokeWidth="1.15" />
      <circle cx={x} cy={y} r="3.2" fill={color} opacity=".56" />
    </g>
  );
}

export function FlowDraftPreview({ active, className }: FlowDraftPreviewProps) {
  return (
    <div className={[styles.previewCanvas, className].filter(Boolean).join(' ')} aria-hidden="true">
      <svg viewBox="0 0 1520 820" role="img" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="flowBg" cx="48%" cy="44%" r="65%">
            <stop offset="0" stopColor="rgba(255,255,255,.065)" />
            <stop offset=".52" stopColor="rgba(255,255,255,.025)" />
            <stop offset="1" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <linearGradient id="cardFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(32,35,40,.84)" />
            <stop offset=".55" stopColor="rgba(18,20,24,.82)" />
            <stop offset="1" stopColor="rgba(9,10,12,.88)" />
          </linearGradient>
          <filter id="previewSoftShadow" x="-30%" y="-45%" width="160%" height="190%">
            <feDropShadow dx="0" dy="20" stdDeviation="18" floodColor="rgba(0,0,0,.55)" />
            <feDropShadow dx="0" dy="0" stdDeviation="9" floodColor="rgba(255,255,255,.04)" />
          </filter>
          <filter id="stageGlow" x="-800%" y="-90%" width="1700%" height="280%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="dotGrid" width="34" height="34" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="rgba(255,255,255,.16)" />
          </pattern>
          <marker id="arrowPurple" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#a78bfa" opacity=".7" />
          </marker>
          <marker id="arrowBlue" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#60a5fa" opacity=".72" />
          </marker>
          <marker id="arrowGreen" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#4adebd" opacity=".74" />
          </marker>
        </defs>

        <rect width="1520" height="820" fill="rgba(8,9,11,.94)" />
        <rect width="1520" height="820" fill="url(#flowBg)" />
        <rect width="1520" height="820" fill="url(#dotGrid)" opacity=".46" />

        <AnimatedPath active={active} d="M 310 203 C 370 203, 395 203, 438 203" stroke="#a78bfa" markerEnd="url(#arrowPurple)" />
        <AnimatedPath active={active} d="M 310 407 C 372 408, 386 308, 438 236" stroke="#a78bfa" markerEnd="url(#arrowPurple)" />
        <AnimatedPath active={active} d="M 310 616 C 390 606, 398 504, 438 458" stroke="#a78bfa" markerEnd="url(#arrowPurple)" />
        <AnimatedPath active={active} d="M 700 203 C 758 203, 803 203, 872 203" stroke="#60a5fa" markerEnd="url(#arrowBlue)" />
        <AnimatedPath active={active} d="M 700 407 C 760 407, 810 407, 872 407" stroke="#60a5fa" markerEnd="url(#arrowBlue)" />
        <AnimatedPath active={active} d="M 700 616 C 760 616, 810 616, 872 616" stroke="#60a5fa" markerEnd="url(#arrowBlue)" />
        <AnimatedPath active={active} d="M 1115 203 C 1187 202, 1216 284, 1260 333" stroke="#4adebd" markerEnd="url(#arrowGreen)" />
        <AnimatedPath active={active} d="M 1115 407 C 1192 408, 1218 379, 1260 352" stroke="#4adebd" markerEnd="url(#arrowGreen)" />

        <NodeCard x={70} y={158} stage="input" />
        <NodeCard x={70} y={362} stage="input" />
        <NodeCard x={70} y={570} stage="input" />
        <NodeCard x={480} y={158} stage="activity" />
        <NodeCard x={480} y={362} stage="activity" />
        <NodeCard x={480} y={570} stage="activity" />
        <NodeCard x={880} y={158} stage="product" />
        <NodeCard x={880} y={362} stage="product" />
        <NodeCard x={880} y={570} stage="product" />
        <NodeCard x={1260} y={306} stage="outcome" compact />

        <Port x={310} y={203} color="#a78bfa" />
        <Port x={310} y={407} color="#a78bfa" />
        <Port x={310} y={616} color="#a78bfa" />
        <Port x={480} y={203} color="#60a5fa" />
        <Port x={480} y={407} color="#60a5fa" />
        <Port x={480} y={616} color="#60a5fa" />
        <Port x={700} y={203} color="#60a5fa" />
        <Port x={700} y={407} color="#60a5fa" />
        <Port x={700} y={616} color="#60a5fa" />
        <Port x={880} y={203} color="#f6ad55" />
        <Port x={880} y={407} color="#f6ad55" />
        <Port x={880} y={616} color="#f6ad55" />
        <Port x={1115} y={203} color="#4adebd" />
        <Port x={1115} y={407} color="#4adebd" />
        <Port x={1260} y={350} color="#4adebd" />

        <Badge x={400} y={203} color="#f59e0b" />
        <Badge x={810} y={203} color="#f59e0b" />
        <Badge x={1188} y={238} color="#4adebd" />
      </svg>
    </div>
  );
}

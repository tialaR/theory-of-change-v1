'use client';

import { motion, useReducedMotion } from 'motion/react';
import {
  EditorialArrowMarker,
  EditorialConnections,
  useEditorialSurfaceMotion,
  type EditorialConnectionDef,
} from './editorial-preview-primitives';
import styles from './example-previews.module.sass';

type ResultDraftPreviewProps = {
  active?: boolean;
  className?: string;
};

const RESULT_CONNECTIONS: readonly EditorialConnectionDef[] = [
  { d: 'M 298 222 C 362 222, 382 222, 420 222', group: 0, item: 0 },
  { d: 'M 298 369 C 355 369, 378 278, 420 252', group: 0, item: 1 },
  { d: 'M 298 516 C 355 512, 382 424, 420 404', group: 0, item: 2 },
  { d: 'M 692 222 C 760 222, 786 222, 820 222', group: 1, item: 0 },
  { d: 'M 692 369 C 760 369, 786 369, 820 369', group: 1, item: 1 },
  { d: 'M 692 516 C 760 516, 786 516, 820 516', group: 1, item: 2 },
  { d: 'M 1092 222 C 1165 220, 1200 310, 1240 342', group: 2, item: 0 },
  { d: 'M 1092 369 C 1166 370, 1204 362, 1240 356', group: 2, item: 1 },
];

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
      <rect
        x={x}
        y="98"
        width="270"
        height="548"
        rx="14"
        fill="rgba(255, 255, 255, 0.026)"
        stroke="rgba(255, 255, 255, 0.075)"
        strokeWidth="1"
      />
      <rect x={x + 1} y="99" width="268" height="1" fill="rgba(255, 255, 255, 0.04)" />
      <rect x={x + 18} y="126" width="54" height="3" rx="1.5" fill={color} opacity=".42" />
      <circle cx={x + 20} cy="121" r="3.2" fill={color} opacity=".55" />
      <rect
        x={x + 198}
        y="112"
        width="42"
        height="18"
        rx="6"
        fill="rgba(255, 255, 255, 0.03)"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="1"
      />
      {cards.map((_, index) => {
        const y = 166 + index * 147;
        return (
          <g key={`${stage}-${index}`}>
            <rect
              x={x + 24}
              y={y}
              width="222"
              height="108"
              rx="9"
              fill="rgba(255, 255, 255, 0.032)"
              stroke="rgba(255, 255, 255, 0.085)"
              strokeWidth="1"
            />
            <rect x={x + 24} y={y} width="2" height="108" rx="1" fill={color} opacity=".48" />
            <rect x={x + 44} y={y + 27} width="35" height="35" rx="5" fill={color} opacity=".08" />
            <rect x={x + 92} y={y + 27} width="82" height="11" rx="3" fill="rgba(255, 255, 255, 0.09)" />
            <rect x={x + 92} y={y + 49} width="126" height="10" rx="3" fill="rgba(255, 255, 255, 0.07)" />
            <rect x={x + 92} y={y + 69} width="106" height="9" rx="3" fill="rgba(255, 255, 255, 0.055)" />
          </g>
        );
      })}
    </g>
  );
}

function ConnectionBadge({ x, y }: { x: number; y: number }) {
  return (
    <g opacity=".72">
      <circle cx={x} cy={y} r="9" fill="rgba(11, 12, 14, 0.9)" stroke="rgba(255, 255, 255, 0.14)" strokeWidth="1" />
      <circle cx={x} cy={y} r="2.4" fill="rgba(200, 204, 210, 0.48)" />
    </g>
  );
}

export function ResultDraftPreview({ active, className }: ResultDraftPreviewProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const surfaceMotion = useEditorialSurfaceMotion(shouldReduceMotion);

  return (
    <div className={[styles.previewCanvas, className].filter(Boolean).join(' ')} aria-hidden="true">
      <svg viewBox="0 48 1520 660" role="img" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="resultColumnShadow" x="-18%" y="-10%" width="136%" height="128%">
            <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="rgba(0, 0, 0, 0.22)" />
          </filter>
          <pattern id="resultGrid" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill="rgba(255, 255, 255, 0.07)" />
          </pattern>
          <EditorialArrowMarker />
        </defs>

        <motion.g {...surfaceMotion}>
          <rect x="0" y="48" width="1520" height="660" fill="rgba(9, 10, 12, 0.82)" />
          <rect x="0" y="48" width="1520" height="660" fill="url(#resultGrid)" opacity=".24" />

          <EditorialConnections
            connections={RESULT_CONNECTIONS}
            active={active}
            shouldReduceMotion={shouldReduceMotion}
          />

          <StageColumn x={52} stage="input" count={3} />
          <StageColumn x={420} stage="activity" count={3} />
          <StageColumn x={820} stage="product" count={3} />
          <StageColumn x={1198} stage="outcome" count={1} />

          <ConnectionBadge x={388} y={222} />
          <ConnectionBadge x={788} y={222} />
          <ConnectionBadge x={1160} y={252} />
        </motion.g>
      </svg>
    </div>
  );
}

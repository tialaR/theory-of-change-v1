'use client';

import { motion, useReducedMotion } from 'motion/react';
import {
  EditorialArrowMarker,
  EditorialConnections,
  useEditorialSurfaceMotion,
  type EditorialConnectionDef,
} from './editorial-preview-primitives';
import styles from './example-previews.module.sass';

type FlowDraftPreviewProps = {
  active?: boolean;
  className?: string;
};

const FLOW_CONNECTIONS: readonly EditorialConnectionDef[] = [
  { d: 'M 310 203 C 370 203, 395 203, 438 203', group: 0, item: 0 },
  { d: 'M 310 407 C 372 408, 386 308, 438 236', group: 0, item: 1 },
  { d: 'M 310 616 C 390 606, 398 504, 438 458', group: 0, item: 2 },
  { d: 'M 700 203 C 758 203, 803 203, 872 203', group: 1, item: 0 },
  { d: 'M 700 407 C 760 407, 810 407, 872 407', group: 1, item: 1 },
  { d: 'M 700 616 C 760 616, 810 616, 872 616', group: 1, item: 2 },
  { d: 'M 1115 203 C 1187 202, 1216 284, 1260 333', group: 2, item: 0 },
  { d: 'M 1115 407 C 1192 408, 1218 379, 1260 352', group: 2, item: 1 },
];

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
        fill="rgba(255, 255, 255, 0.032)"
        stroke="rgba(255, 255, 255, 0.085)"
        strokeWidth="1"
      />
      <rect x={x} y={y} width="2" height={height} rx="1" fill={color} opacity=".5" />
      <rect x={x + 22} y={y + 25} width={tile} height={tile} rx="4" fill={color} opacity=".08" />
      <rect x={x + 30} y={y + 30} width={tile - 16} height={tile - 16} rx="3" fill={color} opacity=".06" />
      <rect x={x + 82} y={y + 24} width={topLine} height="13" rx="3" fill="rgba(255, 255, 255, 0.09)" />
      <rect x={x + 82} y={y + 47} width={midLine} height="12" rx="3" fill="rgba(255, 255, 255, 0.07)" />
      <rect x={x + 82} y={y + 68} width={bottomLine} height="11" rx="3" fill="rgba(255, 255, 255, 0.055)" />
      <rect x={x + 1} y={y + 1} width={width - 2} height="1" fill="rgba(255, 255, 255, 0.04)" />
    </g>
  );
}

function Port({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="4.5" fill="#131519" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.1" />
      <circle cx={x} cy={y} r="1.7" fill={color} opacity=".55" />
    </g>
  );
}

function Badge({ x, y }: { x: number; y: number }) {
  return (
    <g opacity=".78">
      <circle cx={x} cy={y} r="9" fill="rgba(9, 10, 12, 0.82)" stroke="rgba(255, 255, 255, 0.14)" strokeWidth="1" />
      <circle cx={x} cy={y} r="2.4" fill="rgba(200, 204, 210, 0.45)" />
    </g>
  );
}

export function FlowDraftPreview({ active, className }: FlowDraftPreviewProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const surfaceMotion = useEditorialSurfaceMotion(shouldReduceMotion);

  return (
    <div className={[styles.previewCanvas, className].filter(Boolean).join(' ')} aria-hidden="true">
      <svg viewBox="0 80 1520 660" role="img" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="previewSoftShadow" x="-20%" y="-30%" width="140%" height="170%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="rgba(0, 0, 0, 0.2)" />
          </filter>
          <pattern id="dotGrid" width="34" height="34" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.85" fill="rgba(255, 255, 255, 0.08)" />
          </pattern>
          <EditorialArrowMarker />
        </defs>

        <motion.g {...surfaceMotion}>
          <rect x="0" y="80" width="1520" height="660" fill="rgba(9, 10, 12, 0.82)" />
          <rect x="0" y="80" width="1520" height="660" fill="url(#dotGrid)" opacity=".28" />

          <EditorialConnections
            connections={FLOW_CONNECTIONS}
            active={active}
            shouldReduceMotion={shouldReduceMotion}
          />

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

          <Badge x={400} y={203} />
          <Badge x={810} y={203} />
          <Badge x={1188} y={238} />
        </motion.g>
      </svg>
    </div>
  );
}

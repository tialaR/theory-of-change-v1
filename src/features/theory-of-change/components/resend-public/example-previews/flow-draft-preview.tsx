'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useId, type CSSProperties } from 'react';
import styles from './flow-draft-preview.module.sass';

export type FlowDraftPreviewProps = {
  active?: boolean;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  [key: string]: unknown;
};

type StageKey = 'input' | 'activity' | 'output' | 'outcome';

type NodeDefinition = {
  key: string;
  stage: StageKey;
  x: number;
  y: number;
  width: number;
  height: number;
};

type ConnectionDefinition = {
  key: string;
  d: string;
  stage: Exclude<StageKey, 'outcome'>;
  phase: number;
};

const COLORS: Record<StageKey, string> = {
  input: '#8f7cf5',
  activity: '#55a6df',
  output: '#d2974d',
  outcome: '#48b995',
};

const NODES: readonly NodeDefinition[] = [
  { key: 'input-1', stage: 'input', x: 70, y: 152, width: 238, height: 92 },
  { key: 'input-2', stage: 'input', x: 70, y: 354, width: 238, height: 92 },
  { key: 'input-3', stage: 'input', x: 70, y: 556, width: 238, height: 92 },
  { key: 'activity-1', stage: 'activity', x: 466, y: 152, width: 238, height: 92 },
  { key: 'activity-2', stage: 'activity', x: 466, y: 354, width: 238, height: 92 },
  { key: 'activity-3', stage: 'activity', x: 466, y: 556, width: 238, height: 92 },
  { key: 'output-1', stage: 'output', x: 862, y: 152, width: 238, height: 92 },
  { key: 'output-2', stage: 'output', x: 862, y: 354, width: 238, height: 92 },
  { key: 'output-3', stage: 'output', x: 862, y: 556, width: 238, height: 92 },
  { key: 'outcome-1', stage: 'outcome', x: 1234, y: 320, width: 218, height: 92 },
] as const;

const CONNECTIONS: readonly ConnectionDefinition[] = [
  { key: 'i1-a1', d: 'M 308 198 C 356 198, 402 198, 466 198', stage: 'input', phase: 0 },
  { key: 'i2-a1', d: 'M 308 400 C 376 400, 392 252, 466 214', stage: 'input', phase: -5 },
  { key: 'i3-a3', d: 'M 308 602 C 374 594, 408 602, 466 602', stage: 'input', phase: -10 },
  { key: 'a1-p1', d: 'M 704 198 C 758 198, 804 198, 862 198', stage: 'activity', phase: -15 },
  { key: 'a2-p2', d: 'M 704 400 C 758 400, 804 400, 862 400', stage: 'activity', phase: -20 },
  { key: 'a3-p3', d: 'M 704 602 C 758 602, 804 602, 862 602', stage: 'activity', phase: -25 },
  { key: 'p1-r1', d: 'M 1100 198 C 1168 198, 1186 316, 1234 346', stage: 'output', phase: -30 },
  { key: 'p2-r1', d: 'M 1100 400 C 1164 400, 1192 380, 1234 366', stage: 'output', phase: -35 },
] as const;

function FlowNode({ node }: { node: NodeDefinition }) {
  const color = COLORS[node.stage];
  const contentX = node.x + 54;
  const titleY = node.y + 28;

  return (
    <g>
      <rect
        className={styles.nodeSurface}
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx="9"
      />
      <line
        x1={node.x + 1}
        y1={node.y + 11}
        x2={node.x + 1}
        y2={node.y + node.height - 11}
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.54"
      />
      <rect
        className={styles.nodeTile}
        x={node.x + 18}
        y={node.y + 18}
        width="24"
        height="24"
        rx="6"
      />
      <circle cx={node.x + 30} cy={node.y + 30} r="2.8" fill={color} opacity="0.76" />
      <rect className={styles.nodeTitleLine} x={contentX} y={titleY} width="74" height="3" rx="1.5" />
      <rect className={styles.nodeCopyLine} x={contentX} y={titleY + 18} width="116" height="2.5" rx="1.25" />
      <rect className={styles.nodeCopyLine} x={contentX} y={titleY + 32} width="94" height="2.5" rx="1.25" />
      <rect className={styles.nodeCopyLineSoft} x={contentX} y={titleY + 48} width="72" height="2.25" rx="1.125" />
    </g>
  );
}

function FlowConnection({
  connection,
  markerId,
  animate,
}: {
  connection: ConnectionDefinition;
  markerId: string;
  animate: boolean;
}) {
  const color = COLORS[connection.stage];

  return (
    <motion.path
      className={styles.connection}
      d={connection.d}
      style={{ '--connection-color': color } as CSSProperties}
      markerEnd={`url(#${markerId})`}
      vectorEffect="non-scaling-stroke"
      initial={false}
      animate={{
        strokeDashoffset: animate
          ? [connection.phase, connection.phase - 22]
          : connection.phase,
      }}
      transition={
        animate
          ? {
              duration: 4.8,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }
          : { duration: 0 }
      }
    />
  );
}

export function FlowDraftPreview({
  active = true,
  className = '',
  style,
  ariaLabel = 'Prévia editorial do fluxo causal da teoria da mudança',
}: FlowDraftPreviewProps) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = active && !shouldReduceMotion;
  const markerId = `tdm-flow-arrow-${useId().replace(/:/g, '')}`;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        className={styles.svg}
        viewBox="0 0 1520 800"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 5 5"
            markerWidth="4.5"
            markerHeight="4.5"
            refX="4.1"
            refY="2.5"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path
              d="M 0.75 0.8 L 4 2.5 L 0.75 4.2"
              fill="none"
              stroke="rgba(218, 221, 226, 0.48)"
              strokeWidth="0.78"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>

        <g className={styles.connectionsLayer}>
          {CONNECTIONS.map((connection) => (
            <FlowConnection
              key={connection.key}
              connection={connection}
              markerId={markerId}
              animate={shouldAnimate}
            />
          ))}
        </g>

        <g className={styles.nodesLayer}>
          {NODES.map((node) => (
            <FlowNode key={node.key} node={node} />
          ))}
        </g>
      </svg>
    </div>
  );
}

export default FlowDraftPreview;

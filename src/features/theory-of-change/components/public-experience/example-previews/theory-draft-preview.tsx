'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useId, type CSSProperties } from 'react';
import styles from './theory-draft-preview.module.sass';

type PreviewVariant = 'result';

type StageDefinition = {
  key: 'input' | 'activity' | 'output' | 'outcome';
  color: string;
  x: number;
  cardCount: number;
};

type CardDefinition = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  key: string;
};

type ConnectionDefinition = {
  key: string;
  d: string;
  phase: number;
};

export type TheoryDraftPreviewProps = {
  variant: PreviewVariant;
  active?: boolean;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
};

const VIEWBOX_WIDTH = 1320;
const VIEWBOX_HEIGHT = 560;
const COLUMN_Y = 36;
const COLUMN_WIDTH = 240;
const COLUMN_HEIGHT = 476;
const CARD_WIDTH = 208;
const CARD_HEIGHT = 104;
const CARD_X_OFFSET = 16;
const CARD_YS = [92, 232, 372] as const;

const STAGES: readonly StageDefinition[] = [
  { key: 'input', color: '#8f7cf5', x: 48, cardCount: 3 },
  { key: 'activity', color: '#55a6df', x: 376, cardCount: 3 },
  { key: 'output', color: '#d2974d', x: 704, cardCount: 3 },
  { key: 'outcome', color: '#48b995', x: 1032, cardCount: 1 },
] as const;

const CONNECTIONS: readonly ConnectionDefinition[] = [
  { key: 'input-1-activity-1', d: 'M 272 144 C 318 144, 346 144, 392 144', phase: 0 },
  { key: 'input-2-activity-1', d: 'M 272 284 C 330 284, 336 172, 392 168', phase: -4 },
  { key: 'input-3-activity-3', d: 'M 272 424 C 330 424, 344 398, 392 396', phase: -8 },
  { key: 'activity-1-output-1', d: 'M 600 144 C 646 144, 674 144, 720 144', phase: -12 },
  { key: 'activity-2-output-2', d: 'M 600 284 C 646 284, 674 284, 720 284', phase: -16 },
  { key: 'activity-3-output-3', d: 'M 600 424 C 646 424, 674 424, 720 424', phase: -20 },
  { key: 'output-1-outcome', d: 'M 928 144 C 974 144, 1006 128, 1048 128', phase: -24 },
  { key: 'output-2-outcome', d: 'M 928 284 C 978 284, 1008 174, 1048 168', phase: -28 },
] as const;

function createCards(stage: StageDefinition): CardDefinition[] {
  return CARD_YS.slice(0, stage.cardCount).map((y, index) => ({
    x: stage.x + CARD_X_OFFSET,
    y,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    color: stage.color,
    key: `${stage.key}-${index + 1}`,
  }));
}

function ResultColumn({ stage }: { stage: StageDefinition }) {
  const cards = createCards(stage);

  return (
    <g>
      <rect
        className={styles.columnSurface}
        x={stage.x}
        y={COLUMN_Y}
        width={COLUMN_WIDTH}
        height={COLUMN_HEIGHT}
        rx="12"
      />
      <line
        x1={stage.x + 18}
        y1={58}
        x2={stage.x + 64}
        y2={58}
        stroke={stage.color}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.55"
      />
      <line
        className={styles.columnDivider}
        x1={stage.x + 16}
        y1={78}
        x2={stage.x + COLUMN_WIDTH - 16}
        y2={78}
      />
      {cards.map((card) => (
        <ResultCard key={card.key} card={card} />
      ))}
    </g>
  );
}

function ResultCard({ card }: { card: CardDefinition }) {
  const contentX = card.x + 48;
  const firstLineY = card.y + 27;

  return (
    <g>
      <rect
        className={styles.cardSurface}
        x={card.x}
        y={card.y}
        width={card.width}
        height={card.height}
        rx="9"
      />
      <line
        x1={card.x + 1}
        y1={card.y + 9}
        x2={card.x + 1}
        y2={card.y + card.height - 9}
        stroke={card.color}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.58"
      />
      <rect
        className={styles.dotTile}
        x={card.x + 18}
        y={card.y + 18}
        width="20"
        height="20"
        rx="5"
      />
      <circle cx={card.x + 28} cy={card.y + 28} r="2.8" fill={card.color} opacity="0.8" />
      <rect className={styles.titleLine} x={contentX} y={firstLineY} width="68" height="3" rx="1.5" />
      <rect className={styles.copyLine} x={contentX} y={firstLineY + 17} width="112" height="2.4" rx="1.2" />
      <rect className={styles.copyLine} x={contentX} y={firstLineY + 31} width="94" height="2.4" rx="1.2" />
      <rect className={styles.copyLineSoft} x={contentX} y={firstLineY + 48} width="72" height="2.2" rx="1.1" />
    </g>
  );
}

function ResultConnections({ animate }: { animate: boolean }) {
  const markerId = `tdm-result-arrow-${useId().replace(/:/g, '')}`;

  return (
    <g>
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 5 5"
          markerWidth="4.25"
          markerHeight="4.25"
          refX="4.1"
          refY="2.5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 0.75 0.8 L 4 2.5 L 0.75 4.2"
            fill="none"
            stroke="rgba(206, 210, 216, 0.48)"
            strokeWidth="0.76"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      {CONNECTIONS.map((connection) => (
        <motion.path
          key={connection.key}
          className={styles.connection}
          d={connection.d}
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
      ))}
    </g>
  );
}

export function TheoryDraftPreview({
  active = true,
  className = '',
  style,
  ariaLabel = 'Prévia editorial do resultado conectado da teoria da mudança',
}: TheoryDraftPreviewProps) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = active && !shouldReduceMotion;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <ResultConnections animate={shouldAnimate} />
        {STAGES.map((stage) => (
          <ResultColumn key={stage.key} stage={stage} />
        ))}
      </svg>
    </div>
  );
}

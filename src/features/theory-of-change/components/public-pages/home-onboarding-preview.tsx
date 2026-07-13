'use client';

import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { PREVIEW_STAGE_COLORS } from '@/features/theory-of-change/components/resend-public/example-previews/stage-colors';
import styles from './home-onboarding-preview.module.sass';

type StageId = 'input' | 'activity' | 'product' | 'outcome';

type FlowCard = {
  id: string;
  stage: StageId;
  col: number;
  row: number;
};

type Connection = {
  id: string;
  d: string;
  color: string;
  arrowX: number;
  arrowY: number;
};

type PreviewPhase =
  | 'intro'
  | 'buildFlow'
  | 'connectFlow'
  | 'transitionToResult'
  | 'buildResult'
  | 'connectResult'
  | 'finalMessage'
  | 'restart';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Ciclo total alvo: ~46s (dentro de 36–48s) */
const TIMING = {
  intro: 3000,
  initialCardDelay: 800,
  cardDelay: 850,
  stageDelay: 1350,
  afterLastCard: 2000,
  connDelay: 1000,
  afterLastConn: 1500,
  transition: 4500,
  colDelay: 1100,
  resultCardDelay: 450,
  afterBuildResult: 2500,
  arrowDelay: 1400,
  afterLastArrow: 1200,
  finalMessage: 4000,
  restartPause: 2000,
} as const;

const STAGE_META: Record<StageId, { label: string; color: string; count: number }> = {
  input: { label: 'Insumos', color: PREVIEW_STAGE_COLORS.input, count: 3 },
  activity: { label: 'Atividades', color: PREVIEW_STAGE_COLORS.activity, count: 2 },
  product: { label: 'Produtos', color: PREVIEW_STAGE_COLORS.product, count: 2 },
  outcome: { label: 'Resultados', color: PREVIEW_STAGE_COLORS.outcome, count: 1 },
};

const FLOW_CARDS: FlowCard[] = [
  { id: 'c1', stage: 'input', col: 0, row: 0 },
  { id: 'c2', stage: 'input', col: 0, row: 1 },
  { id: 'c3', stage: 'input', col: 0, row: 2 },
  { id: 'c4', stage: 'activity', col: 1, row: 0 },
  { id: 'c5', stage: 'activity', col: 1, row: 1 },
  { id: 'c6', stage: 'product', col: 2, row: 0 },
  { id: 'c7', stage: 'product', col: 2, row: 1 },
  { id: 'c8', stage: 'outcome', col: 3, row: 0 },
];

const CONNECTIONS: Connection[] = [
  { id: 'l1', d: 'M 17% 21% C 26% 21%, 30% 21%, 37% 21%', color: PREVIEW_STAGE_COLORS.input, arrowX: 37, arrowY: 21 },
  { id: 'l2', d: 'M 17% 37% C 26% 37%, 30% 26%, 37% 22%', color: PREVIEW_STAGE_COLORS.input, arrowX: 37, arrowY: 22 },
  { id: 'l3', d: 'M 17% 53% C 26% 53%, 30% 42%, 37% 39%', color: PREVIEW_STAGE_COLORS.input, arrowX: 37, arrowY: 39 },
  { id: 'l4', d: 'M 42% 22% C 51% 22%, 55% 22%, 62% 22%', color: PREVIEW_STAGE_COLORS.activity, arrowX: 62, arrowY: 22 },
  { id: 'l5', d: 'M 42% 39% C 51% 39%, 55% 39%, 62% 39%', color: PREVIEW_STAGE_COLORS.activity, arrowX: 62, arrowY: 39 },
  { id: 'l6', d: 'M 67% 22% C 75% 22%, 79% 28%, 85% 33%', color: PREVIEW_STAGE_COLORS.product, arrowX: 85, arrowY: 33 },
  { id: 'l7', d: 'M 67% 39% C 75% 39%, 79% 35%, 85% 34%', color: PREVIEW_STAGE_COLORS.product, arrowX: 85, arrowY: 34 },
];

const RESULT_ARROWS: Connection[] = [
  { id: 'a1', d: 'M 22% 50% L 30% 50%', color: 'rgba(255,255,255,0.42)', arrowX: 30, arrowY: 50 },
  { id: 'a2', d: 'M 47% 50% L 55% 50%', color: 'rgba(255,255,255,0.42)', arrowX: 55, arrowY: 50 },
  { id: 'a3', d: 'M 72% 50% L 80% 50%', color: 'rgba(255,255,255,0.42)', arrowX: 80, arrowY: 50 },
];

const STAGES_ORDER: StageId[] = ['input', 'activity', 'product', 'outcome'];

const CARD_ENTER = {
  initial: { opacity: 0, y: -10, scale: 0.985, filter: 'blur(0.25rem)' },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0rem)' },
  hidden: { opacity: 0, y: -10, scale: 0.985, filter: 'blur(0.25rem)' },
  transition: { duration: 0.92, ease: EASE },
};

const COLUMN_ENTER = {
  initial: { opacity: 0, x: -12, filter: 'blur(0.25rem)' },
  visible: { opacity: 1, x: 0, filter: 'blur(0rem)' },
  hidden: { opacity: 0, x: -12, filter: 'blur(0.25rem)' },
  transition: { duration: 0.95, ease: EASE },
};

function getCardDelay(prevCard: FlowCard | null, nextCard: FlowCard): number {
  if (!prevCard) return TIMING.initialCardDelay;
  if (prevCard.col !== nextCard.col) return TIMING.stageDelay;
  return TIMING.cardDelay;
}

function OverlayMessage({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <motion.div
      className={[styles.overlayMessage, className].filter(Boolean).join(' ')}
      initial={{ opacity: 0, y: '0.5rem', scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: '-0.375rem', scale: 0.985 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <h3 className={styles.overlayTitle}>{title}</h3>
      <p className={styles.overlaySubtitle}>{subtitle}</p>
    </motion.div>
  );
}

function SkeletonCard({ stage, visible }: { stage: StageId; visible: boolean }) {
  const color = STAGE_META[stage].color;
  return (
    <motion.div
      className={styles.cardWrap}
      initial={CARD_ENTER.initial}
      animate={visible ? CARD_ENTER.visible : CARD_ENTER.hidden}
      transition={CARD_ENTER.transition}
    >
      <div className={styles.card} style={{ '--stage-color': color } as CSSProperties}>
        <span className={styles.cardAccent} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLineShort} />
      </div>
    </motion.div>
  );
}

function FlowConnection({ conn, visible }: { conn: Connection; visible: boolean }) {
  const pathDuration = 1.15;

  return (
    <g>
      <motion.path
        d={conn.d}
        fill="none"
        stroke={conn.color}
        strokeWidth="0.32"
        strokeLinecap="round"
        strokeDasharray="1.2 1.8"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={visible ? { pathLength: 1, opacity: 0.58 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: pathDuration, ease: EASE }}
      />
      <motion.polygon
        points={`${conn.arrowX},${conn.arrowY - 0.6} ${conn.arrowX + 1.2},${conn.arrowY} ${conn.arrowX},${conn.arrowY + 0.6}`}
        fill={conn.color}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={
          visible
            ? { opacity: 0.72, scale: 1 }
            : { opacity: 0, scale: 0.6 }
        }
        transition={{ duration: 0.35, ease: EASE, delay: visible ? pathDuration * 0.55 : 0 }}
        style={{ transformOrigin: `${conn.arrowX}% ${conn.arrowY}%` }}
      />
    </g>
  );
}

function BuildView({
  visibleCards,
  visibleConnections,
  hidden,
}: {
  visibleCards: number;
  visibleConnections: number;
  hidden?: boolean;
}) {
  const cardsByCol = useMemo(() => {
    const cols: FlowCard[][] = [[], [], [], []];
    for (const card of FLOW_CARDS) {
      cols[card.col]?.push(card);
    }
    return cols;
  }, []);

  let cardIndex = 0;

  return (
    <motion.div
      className={styles.previewInner}
      animate={
        hidden
          ? { opacity: 0, filter: 'blur(0.375rem)', scale: 0.98 }
          : { opacity: 1, filter: 'blur(0rem)', scale: 1 }
      }
      transition={{ duration: 0.75, ease: EASE }}
      aria-hidden={hidden}
    >
      <div className={styles.flowGrid}>
        {cardsByCol.map((colCards, colIdx) => {
          const stage = STAGES_ORDER[colIdx];
          const meta = STAGE_META[stage];
          const colStartIndex = cardIndex;
          const colEndIndex = colStartIndex + colCards.length;
          const colHasVisibleCards = visibleCards > colStartIndex;
          cardIndex = colEndIndex;

          return (
            <div key={stage} className={styles.column}>
              {colHasVisibleCards ? (
                <motion.p
                  className={styles.columnHeader}
                  style={{ color: meta.color }}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 0.55, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  {meta.label}
                </motion.p>
              ) : (
                <span className={styles.columnHeaderPlaceholder} aria-hidden="true" />
              )}
              {colCards.map((card, localIdx) => {
                const idx = colStartIndex + localIdx;
                return <SkeletonCard key={card.id} stage={card.stage} visible={idx < visibleCards} />;
              })}
            </div>
          );
        })}
      </div>
      {visibleConnections > 0 ? (
        <svg className={styles.connectionsSvg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {CONNECTIONS.map((conn, i) => (
            <FlowConnection key={conn.id} conn={conn} visible={i < visibleConnections} />
          ))}
        </svg>
      ) : null}
    </motion.div>
  );
}

function ResultSkeletonCard({ stage, visible }: { stage: StageId; visible: boolean }) {
  const color = STAGE_META[stage].color;
  return (
    <motion.div
      className={styles.resultCard}
      style={{ '--stage-color': color } as CSSProperties}
      initial={{ opacity: 0, y: -8, filter: 'blur(0.2rem)' }}
      animate={
        visible
          ? { opacity: 1, y: 0, filter: 'blur(0rem)' }
          : { opacity: 0, y: -8, filter: 'blur(0.2rem)' }
      }
      transition={{ duration: 0.55, ease: EASE }}
    >
      <div className={styles.resultCardTop}>
        <span className={styles.resultCardDot} />
        <div className={styles.skeletonLine} style={{ width: '58%' }} />
      </div>
      <div className={styles.skeletonLine} style={{ width: '88%' }} />
      <div className={styles.skeletonLineShort} />
    </motion.div>
  );
}

function ResultArrow({ arrow, visible }: { arrow: Connection; visible: boolean }) {
  const pathDuration = 1.1;

  return (
    <g>
      <motion.path
        d={arrow.d}
        fill="none"
        stroke={arrow.color}
        strokeWidth="0.38"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={visible ? { pathLength: 1, opacity: 0.68 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: pathDuration, ease: EASE }}
      />
      <motion.polygon
        points={`${arrow.arrowX},${arrow.arrowY - 0.55} ${arrow.arrowX + 1.1},${arrow.arrowY} ${arrow.arrowX},${arrow.arrowY + 0.55}`}
        fill="rgba(255,255,255,0.48)"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={visible ? { opacity: 0.7, scale: 1 } : { opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.3, ease: EASE, delay: visible ? pathDuration * 0.6 : 0 }}
        style={{ transformOrigin: `${arrow.arrowX}% ${arrow.arrowY}%` }}
      />
    </g>
  );
}

function ResultView({
  visibleColumns,
  visibleResultCards,
  visibleArrows,
  hidden,
}: {
  visibleColumns: number;
  visibleResultCards: number[];
  visibleArrows: number;
  hidden?: boolean;
}) {
  const cardsByStage = useMemo(() => {
    const map: Record<StageId, FlowCard[]> = { input: [], activity: [], product: [], outcome: [] };
    for (const card of FLOW_CARDS) {
      map[card.stage].push(card);
    }
    return map;
  }, []);

  return (
    <motion.div
      className={styles.previewInner}
      animate={
        hidden
          ? { opacity: 0, filter: 'blur(0.375rem)', scale: 0.98 }
          : { opacity: 1, filter: 'blur(0rem)', scale: 1 }
      }
      transition={{ duration: 0.75, ease: EASE }}
      aria-hidden={hidden}
    >
      <div className={styles.resultGrid}>
        {STAGES_ORDER.map((stage, colIdx) => {
          const meta = STAGE_META[stage];
          const cards = cardsByStage[stage];
          const colVisible = colIdx < visibleColumns;
          return (
            <motion.div
              key={stage}
              className={styles.resultColumn}
              style={{ '--stage-color': meta.color } as CSSProperties}
              initial={COLUMN_ENTER.initial}
              animate={colVisible ? COLUMN_ENTER.visible : COLUMN_ENTER.hidden}
              transition={COLUMN_ENTER.transition}
            >
              <div className={styles.resultColumnHeader}>
                <span className={styles.resultColumnDot} />
                <span className={styles.resultColumnLabel}>{meta.label}</span>
                <span className={styles.resultColumnCount}>{meta.count} itens</span>
              </div>
              {cards.map((card, cardIdx) => {
                const visibleCount = visibleResultCards[colIdx] ?? 0;
                return (
                  <ResultSkeletonCard
                    key={card.id}
                    stage={card.stage}
                    visible={colVisible && cardIdx < visibleCount}
                  />
                );
              })}
            </motion.div>
          );
        })}
      </div>
      {visibleArrows > 0 ? (
        <svg className={styles.resultArrows} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {RESULT_ARROWS.map((arrow, i) => (
            <ResultArrow key={arrow.id} arrow={arrow} visible={i < visibleArrows} />
          ))}
        </svg>
      ) : null}
    </motion.div>
  );
}

function StaticFinalView() {
  const fullCounts = STAGES_ORDER.map((s) => STAGE_META[s].count);

  return (
    <ResultView visibleColumns={4} visibleResultCards={fullCounts} visibleArrows={RESULT_ARROWS.length} />
  );
}

function resetCounters() {
  return {
    visibleCards: 0,
    visibleConnections: 0,
    visibleColumns: 0,
    visibleResultCards: [0, 0, 0, 0] as number[],
    visibleArrows: 0,
  };
}

export function HomeOnboardingPreview() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<PreviewPhase>('intro');
  const [visibleCards, setVisibleCards] = useState(0);
  const [visibleConnections, setVisibleConnections] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState(0);
  const [visibleResultCards, setVisibleResultCards] = useState<number[]>([0, 0, 0, 0]);
  const [visibleArrows, setVisibleArrows] = useState(0);
  const [cycle, setCycle] = useState(0);

  const cardCounts = useMemo(() => STAGES_ORDER.map((s) => STAGE_META[s].count), []);

  useEffect(() => {
    if (reducedMotion) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    if (phase === 'intro') {
      schedule(() => setPhase('buildFlow'), TIMING.intro);
    } else if (phase === 'buildFlow') {
      if (visibleCards < FLOW_CARDS.length) {
        const prevCard = visibleCards > 0 ? FLOW_CARDS[visibleCards - 1] : null;
        const nextCard = FLOW_CARDS[visibleCards];
        const delay = getCardDelay(prevCard, nextCard);
        schedule(() => setVisibleCards((n) => n + 1), delay);
      } else {
        schedule(() => setPhase('connectFlow'), TIMING.afterLastCard);
      }
    } else if (phase === 'connectFlow') {
      if (visibleConnections < CONNECTIONS.length) {
        const delay = visibleConnections === 0 ? 400 : TIMING.connDelay;
        schedule(() => setVisibleConnections((n) => n + 1), delay);
      } else {
        schedule(() => setPhase('transitionToResult'), TIMING.afterLastConn);
      }
    } else if (phase === 'transitionToResult') {
      schedule(() => setPhase('buildResult'), TIMING.transition);
    } else if (phase === 'buildResult') {
      const totalResultCards = cardCounts.reduce((a, b) => a + b, 0);
      const currentTotal = visibleResultCards.reduce((a, b) => a + b, 0);

      if (visibleColumns < 4) {
        const delay = visibleColumns === 0 ? 0 : TIMING.colDelay;
        schedule(() => {
          setVisibleColumns((n) => n + 1);
          setVisibleResultCards((prev) => {
            const next = [...prev];
            next[visibleColumns] = 1;
            return next;
          });
        }, delay);
      } else if (currentTotal < totalResultCards) {
        const colIdx = visibleResultCards.findIndex((count, i) => count < cardCounts[i]);
        if (colIdx >= 0) {
          schedule(() => {
            setVisibleResultCards((prev) => {
              const next = [...prev];
              next[colIdx] = Math.min(cardCounts[colIdx], next[colIdx] + 1);
              return next;
            });
          }, TIMING.resultCardDelay);
        }
      } else {
        schedule(() => setPhase('connectResult'), TIMING.afterBuildResult);
      }
    } else if (phase === 'connectResult') {
      if (visibleArrows < RESULT_ARROWS.length) {
        const delay = visibleArrows === 0 ? 400 : TIMING.arrowDelay;
        schedule(() => setVisibleArrows((n) => n + 1), delay);
      } else {
        schedule(() => setPhase('finalMessage'), TIMING.afterLastArrow);
      }
    } else if (phase === 'finalMessage') {
      schedule(() => setPhase('restart'), TIMING.finalMessage);
    } else if (phase === 'restart') {
      schedule(() => {
        const reset = resetCounters();
        setVisibleCards(reset.visibleCards);
        setVisibleConnections(reset.visibleConnections);
        setVisibleColumns(reset.visibleColumns);
        setVisibleResultCards(reset.visibleResultCards);
        setVisibleArrows(reset.visibleArrows);
        setPhase('intro');
        setCycle((c) => c + 1);
      }, TIMING.restartPause);
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [
    phase,
    visibleCards,
    visibleConnections,
    visibleColumns,
    visibleResultCards,
    visibleArrows,
    reducedMotion,
    cardCounts,
    cycle,
  ]);

  if (reducedMotion) {
    return (
      <div className={styles.preview} aria-label="Prévia da teoria de mudança">
        <StaticFinalView />
      </div>
    );
  }

  const showFlow =
    phase === 'buildFlow' || phase === 'connectFlow' || phase === 'transitionToResult';
  const showResult =
    phase === 'buildResult' ||
    phase === 'connectResult' ||
    phase === 'finalMessage' ||
    phase === 'restart';

  return (
    <div className={styles.preview} aria-hidden="true" key={cycle}>
      {showFlow ? (
        <BuildView
          visibleCards={visibleCards}
          visibleConnections={phase === 'connectFlow' ? visibleConnections : 0}
          hidden={phase === 'transitionToResult'}
        />
      ) : null}

      {showResult ? (
        <motion.div
          className={styles.resultLayer}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'restart' ? 0 : 1 }}
          transition={{ duration: phase === 'restart' ? 0.7 : 0.65, ease: EASE }}
        >
          <ResultView
            visibleColumns={visibleColumns}
            visibleResultCards={visibleResultCards}
            visibleArrows={phase === 'connectResult' ? visibleArrows : 0}
            hidden={phase === 'finalMessage' || phase === 'restart'}
          />
        </motion.div>
      ) : null}

      <AnimatePresence mode="wait">
        {phase === 'intro' ? (
          <OverlayMessage
            key="intro"
            title="Comece pelas etapas da teoria."
            subtitle="Insumos, atividades, produtos e resultados entram em ordem para revelar a lógica causal."
            className={styles.overlayBackdrop}
          />
        ) : null}

        {phase === 'transitionToResult' ? (
          <OverlayMessage
            key="transition"
            title="O fluxo agora vira leitura."
            subtitle="As conexões deixam de ser rascunho e passam a organizar a visão por etapa."
            className={styles.overlayBackdrop}
          />
        ) : null}

        {phase === 'finalMessage' ? (
          <OverlayMessage
            key="final"
            title="Do rascunho à leitura final."
            subtitle="A teoria mostra o caminho, os vínculos e o que sustenta cada resultado."
            className={styles.overlayBackdrop}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

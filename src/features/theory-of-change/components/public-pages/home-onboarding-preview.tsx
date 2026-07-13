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

/** Ciclo total alvo: ~52s (dentro de 42–56s) */
const TIMING = {
  intro: 5800,
  initialCardDelay: 1000,
  cardDelay: 600,
  stageDelay: 1150,
  afterLastCard: 2500,
  connInitialDelay: 750,
  connDelay: 850,
  afterLastConn: 2100,
  transition: 5800,
  colFirstCardDelay: 550,
  resultCardDelay: 550,
  colStageDelay: 875,
  afterBuildResult: 2800,
  arrowInitialDelay: 550,
  arrowDelay: 1200,
  afterLastArrow: 1800,
  finalMessage: 6000,
  restartPause: 2500,
} as const;

const FLOW_PATH_DURATION = 1.95;
const FLOW_ARROW_DELAY_RATIO = 0.65;

const TEXT_MOTION = {
  initial: { opacity: 0, y: '1rem', scale: 0.985, filter: 'blur(0.45rem)' },
  animate: { opacity: 1, y: '0rem', scale: 1, filter: 'blur(0rem)' },
  exit: { opacity: 0, y: '-0.75rem', scale: 0.99, filter: 'blur(0.3rem)' },
  transition: { duration: 1.6, ease: EASE },
} as const;

const TEXT_SUBTITLE_DELAY = 0.32;

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

/** Path ends in the corridor; arrow tip (arrowX + 1.3) stops before destination card left edge. */
const CONNECTIONS: Connection[] = [
  { id: 'l1', d: 'M 19.8 28.5 C 23 28.5, 26.5 34, 30.2 40.5', color: PREVIEW_STAGE_COLORS.input, arrowX: 30.2, arrowY: 40.5 },
  { id: 'l2', d: 'M 19.8 50.5 C 23 50.5, 26.5 45.5, 30.2 40.5', color: PREVIEW_STAGE_COLORS.input, arrowX: 30.2, arrowY: 40.5 },
  { id: 'l3', d: 'M 19.8 72.5 C 23 72.5, 26.5 65.5, 30.2 58.5', color: PREVIEW_STAGE_COLORS.input, arrowX: 30.2, arrowY: 58.5 },
  { id: 'l4', d: 'M 47.2 40.5 C 50.5 40.5, 53 40.5, 56.8 40.5', color: PREVIEW_STAGE_COLORS.activity, arrowX: 56.8, arrowY: 40.5 },
  { id: 'l5', d: 'M 47.2 58.5 C 50.5 58.5, 53 58.5, 56.8 58.5', color: PREVIEW_STAGE_COLORS.activity, arrowX: 56.8, arrowY: 58.5 },
  { id: 'l6', d: 'M 73.5 40.5 C 76.5 42.5, 78.5 46, 81.2 51.5', color: PREVIEW_STAGE_COLORS.product, arrowX: 81.2, arrowY: 51.5 },
  { id: 'l7', d: 'M 73.5 58.5 C 76.5 56.5, 78.5 53, 81.2 51.5', color: PREVIEW_STAGE_COLORS.product, arrowX: 81.2, arrowY: 51.5 },
];

const RESULT_ARROWS: Connection[] = [
  { id: 'a1', d: 'M 22% 50% L 30% 50%', color: 'rgba(255,255,255,0.42)', arrowX: 30, arrowY: 50 },
  { id: 'a2', d: 'M 47% 50% L 55% 50%', color: 'rgba(255,255,255,0.42)', arrowX: 55, arrowY: 50 },
  { id: 'a3', d: 'M 72% 50% L 80% 50%', color: 'rgba(255,255,255,0.42)', arrowX: 80, arrowY: 50 },
];

const STAGES_ORDER: StageId[] = ['input', 'activity', 'product', 'outcome'];

const CARD_ENTER = {
  initial: { opacity: 0, y: '-0.5rem', scale: 0.985, filter: 'blur(0.25rem)' },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0rem)' },
  hidden: { opacity: 0, y: '-0.5rem', scale: 0.985, filter: 'blur(0.25rem)' },
  transition: { duration: 0.95, ease: EASE },
};

const COLUMN_ENTER = {
  initial: { opacity: 0, x: '-0.75rem', filter: 'blur(0.25rem)' },
  visible: { opacity: 1, x: 0, filter: 'blur(0rem)' },
  hidden: { opacity: 0, x: '-0.75rem', filter: 'blur(0.25rem)' },
  transition: { duration: 1.05, ease: EASE },
};

const SCENE_EXIT = {
  opacity: 0,
  filter: 'blur(0.3rem)',
  scale: 0.99,
  transition: { duration: 1.05, ease: EASE },
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <motion.h3
        className={styles.overlayTitle}
        initial={TEXT_MOTION.initial}
        animate={TEXT_MOTION.animate}
        exit={TEXT_MOTION.exit}
        transition={TEXT_MOTION.transition}
      >
        {title}
      </motion.h3>
      <motion.p
        className={styles.overlaySubtitle}
        initial={TEXT_MOTION.initial}
        animate={TEXT_MOTION.animate}
        exit={TEXT_MOTION.exit}
        transition={{ ...TEXT_MOTION.transition, delay: TEXT_SUBTITLE_DELAY }}
      >
        {subtitle}
      </motion.p>
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
  return (
    <g>
      <motion.path
        d={conn.d}
        fill="none"
        stroke={conn.color}
        strokeWidth="0.64"
        strokeLinecap="round"
        strokeDasharray="1.2 1.8"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={visible ? { pathLength: 1, opacity: 0.82 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: FLOW_PATH_DURATION, ease: EASE }}
      />
      <motion.polygon
        points={`${conn.arrowX},${conn.arrowY - 0.65} ${conn.arrowX + 1.3},${conn.arrowY} ${conn.arrowX},${conn.arrowY + 0.65}`}
        fill={conn.color}
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 0.9 } : { opacity: 0 }}
        transition={{ duration: 0.45, ease: EASE, delay: visible ? FLOW_PATH_DURATION * FLOW_ARROW_DELAY_RATIO : 0 }}
      />
    </g>
  );
}

function BuildView({
  visibleCards,
  visibleConnections,
}: {
  visibleCards: number;
  visibleConnections: number;
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
    <div className={styles.previewInner}>
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
                  initial={{ opacity: 0, y: '-0.375rem' }}
                  animate={{ opacity: 0.58, y: 0 }}
                  transition={{ duration: 0.65, ease: EASE }}
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
      <svg className={styles.connectionsSvg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {CONNECTIONS.map((conn, i) => (
          <FlowConnection key={conn.id} conn={conn} visible={i < visibleConnections} />
        ))}
      </svg>
    </div>
  );
}

function ResultSkeletonCard({ stage, visible }: { stage: StageId; visible: boolean }) {
  const color = STAGE_META[stage].color;
  return (
    <motion.div
      className={styles.resultCard}
      style={{ '--stage-color': color } as CSSProperties}
      initial={{ opacity: 0, y: '-0.4375rem', filter: 'blur(0.2rem)' }}
      animate={
        visible
          ? { opacity: 1, y: 0, filter: 'blur(0rem)' }
          : { opacity: 0, y: '-0.4375rem', filter: 'blur(0.2rem)' }
      }
      transition={{ duration: 0.85, ease: EASE }}
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
  const pathDuration = 1.15;

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
        initial={{ opacity: 0, scale: 0.55 }}
        animate={visible ? { opacity: 0.72, scale: 1 } : { opacity: 0, scale: 0.55 }}
        transition={{ duration: 0.35, ease: EASE, delay: visible ? pathDuration * 0.55 : 0 }}
        style={{ transformOrigin: `${arrow.arrowX}% ${arrow.arrowY}%` }}
      />
    </g>
  );
}

function ResultView({
  visibleColumns,
  visibleResultCards,
  visibleArrows,
}: {
  visibleColumns: number;
  visibleResultCards: number[];
  visibleArrows: number;
}) {
  const cardsByStage = useMemo(() => {
    const map: Record<StageId, FlowCard[]> = { input: [], activity: [], product: [], outcome: [] };
    for (const card of FLOW_CARDS) {
      map[card.stage].push(card);
    }
    return map;
  }, []);

  return (
    <div className={styles.previewInner}>
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
    </div>
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
        const delay = visibleConnections === 0 ? TIMING.connInitialDelay : TIMING.connDelay;
        schedule(() => setVisibleConnections((n) => n + 1), delay);
      } else {
        schedule(() => setPhase('transitionToResult'), TIMING.afterLastConn);
      }
    } else if (phase === 'transitionToResult') {
      schedule(() => setPhase('buildResult'), TIMING.transition);
    } else if (phase === 'buildResult') {
      const totalResultCards = cardCounts.reduce((a, b) => a + b, 0);
      const currentTotal = visibleResultCards.reduce((a, b) => a + b, 0);

      if (currentTotal >= totalResultCards && visibleColumns >= 4) {
        schedule(() => setPhase('connectResult'), TIMING.afterBuildResult);
      } else if (visibleColumns === 0) {
        schedule(() => setVisibleColumns(1), 0);
      } else {
        const activeCol = visibleColumns - 1;
        const cardsShown = visibleResultCards[activeCol];

        if (cardsShown < cardCounts[activeCol]) {
          const delay = cardsShown === 0 ? TIMING.colFirstCardDelay : TIMING.resultCardDelay;
          schedule(() => {
            setVisibleResultCards((prev) => {
              const next = [...prev];
              next[activeCol] = cardsShown + 1;
              return next;
            });
          }, delay);
        } else if (visibleColumns < 4) {
          schedule(() => setVisibleColumns((n) => n + 1), TIMING.colStageDelay);
        }
      }
    } else if (phase === 'connectResult') {
      if (visibleArrows < RESULT_ARROWS.length) {
        const delay = visibleArrows === 0 ? TIMING.arrowInitialDelay : TIMING.arrowDelay;
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
        <div className={styles.sceneLayer}>
          <StaticFinalView />
        </div>
      </div>
    );
  }

  const showFlow = phase === 'buildFlow' || phase === 'connectFlow';
  const showResult = phase === 'buildResult' || phase === 'connectResult';

  return (
    <div className={styles.preview} aria-hidden="true" key={cycle}>
      <AnimatePresence mode="wait">
        {showFlow ? (
          <motion.div
            key="flow-scene"
            className={styles.sceneLayer}
            initial={{ opacity: 0, filter: 'blur(0.3rem)', scale: 0.99 }}
            animate={{ opacity: 1, filter: 'blur(0rem)', scale: 1 }}
            exit={SCENE_EXIT}
            transition={{ duration: 1.05, ease: EASE }}
          >
            <BuildView
              visibleCards={visibleCards}
              visibleConnections={phase === 'connectFlow' ? visibleConnections : 0}
            />
          </motion.div>
        ) : null}

        {showResult ? (
          <motion.div
            key="result-scene"
            className={styles.sceneLayer}
            initial={{ opacity: 0, filter: 'blur(0.3rem)', scale: 0.99 }}
            animate={{ opacity: 1, filter: 'blur(0rem)', scale: 1 }}
            exit={SCENE_EXIT}
            transition={{ duration: 1.05, ease: EASE }}
          >
            <ResultView
              visibleColumns={visibleColumns}
              visibleResultCards={visibleResultCards}
              visibleArrows={phase === 'connectResult' ? visibleArrows : 0}
            />
          </motion.div>
        ) : null}

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

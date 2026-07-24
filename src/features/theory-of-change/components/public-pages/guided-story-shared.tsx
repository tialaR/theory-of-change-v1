import {
  type CSSProperties,
  type ReactNode,
  type RefCallback,
  useCallback,
  useMemo,
} from 'react';
import {
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  edgeTimelineProgress,
  flowColumns,
  overviewCards,
  type EdgeSceneKey,
  type FocusFlags,
} from './guided-story-data';
import type { BadgePos, CardRefs, SceneEdgeLayout } from './guided-story-types';
import styles from './home-onboarding-preview.module.sass';

export const EMPTY_FOCUS: FocusFlags = { active: false, complete: false };
export const COMPLETE_FOCUS: FocusFlags = { active: false, complete: true };

export function emptySceneLayout(): SceneEdgeLayout {
  return {
    edges: [],
    viewBox: { width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT },
  };
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function focusClass(flags: FocusFlags): string {
  return cx(flags.active && styles.isActive, flags.complete && styles.isComplete);
}

export function IconPrev() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 6-6 6 6 6" /></svg>;
}

export function IconNext() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 6 6 6-6 6" /></svg>;
}

export function IconReplay() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7v5h5" />
      <path d="M5.2 12a7 7 0 1 0 2-5" />
    </svg>
  );
}

export function IconPlay() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z" className={styles.playPath} /></svg>;
}

export function IconPause() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14M15 5v14" /></svg>;
}

export function EdgeLayer({
  sceneKey,
  layout,
  local,
  keep,
  startsByGroup,
  duration,
  stagger,
}: {
  sceneKey: EdgeSceneKey;
  layout: SceneEdgeLayout;
  local: number;
  keep: boolean;
  startsByGroup: readonly number[];
  duration: number;
  stagger: number;
}) {
  const safeLayout = layout ?? emptySceneLayout();
  const { edges, viewBox } = safeLayout;
  const groupCounts = useMemo(() => {
    const counts = new Map<number, number>();
    return edges.map((edge) => {
      const same = counts.get(edge.group) ?? 0;
      counts.set(edge.group, same + 1);
      return same;
    });
  }, [edges]);

  return (
    <svg className={styles.edgeLayer} viewBox={`0 0 ${viewBox.width} ${viewBox.height}`} aria-hidden="true">
      <defs>
        <marker id={`arrow-${sceneKey}`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M1 1.2 5.6 3.5 1 5.8" fill="none" stroke="var(--tdm-guided-story-marker-stroke)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      <g>
        {edges.map((edge) => <path key={`base-${edge.index}`} d={edge.d} className={styles.edgeBase} markerEnd={`url(#arrow-${sceneKey})`} />)}
      </g>
      <g>
        {edges.map((edge, index) => {
          const timeline = edgeTimelineProgress(local, edge.group, groupCounts[index]!, startsByGroup, duration, stagger, keep);
          return (
            <path
              key={`live-${edge.index}`}
              d={edge.d}
              className={styles.edgeLive}
              style={{ strokeDasharray: edge.length, strokeDashoffset: edge.length * (1 - timeline.progress), opacity: timeline.opacity }}
            />
          );
        })}
      </g>
    </svg>
  );
}

export function OverviewGrid({ idPrefix, cardRefs, focus }: { idPrefix: 'overview' | 'relations'; cardRefs: CardRefs; focus: FocusFlags[] }) {
  const setRef = useCallback((id: string): RefCallback<HTMLElement> => (node) => {
    if (node) cardRefs.current.set(id, node);
    else cardRefs.current.delete(id);
  }, [cardRefs]);

  return (
    <div className={styles.overviewGrid}>
      {overviewCards.map((card, index) => {
        const id = `${idPrefix}-${card.id}`;
        return (
          <article key={id} ref={setRef(id)} className={cx(styles.overviewCard, focusClass(focus[index] ?? EMPTY_FOCUS))} style={{ '--stage': card.stageColor } as CSSProperties}>
            <div className={styles.stageKicker}><span>{card.kicker}</span></div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <ul>{card.items.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        );
      })}
    </div>
  );
}

export function FlowBoard({
  idPrefix,
  cardRefs,
  columnFocus,
  cardFocus,
  compact,
}: {
  idPrefix: 'structure' | 'details' | 'causality' | 'final';
  cardRefs: CardRefs;
  columnFocus: FocusFlags[];
  cardFocus: FocusFlags[];
  compact?: boolean;
}) {
  const setRef = useCallback((id: string): RefCallback<HTMLElement> => (node) => {
    if (node) cardRefs.current.set(id, node);
    else cardRefs.current.delete(id);
  }, [cardRefs]);

  return (
    <div className={styles.flowGrid}>
      {flowColumns.map((column, colIndex) => {
        const baseCardIndex = flowColumns.slice(0, colIndex).reduce((sum, previousColumn) => sum + previousColumn.cards.length, 0);
        return (
          <section key={`${idPrefix}-${column.stage}`} className={cx(styles.flowColumn, compact && styles.flowColumnCompact, focusClass(columnFocus[colIndex] ?? EMPTY_FOCUS))} style={{ '--stage': column.stageColor } as CSSProperties}>
            <div className={cx(styles.columnHeading, compact && styles.columnHeadingCompact)}>
              <span>{column.kicker}</span><h3>{column.title}</h3><p>{column.description}</p>
            </div>
            <div className={cx(styles.cardStack, compact && styles.cardStackCompact)}>
              {column.cards.map((card, localCardIndex) => {
                const index = baseCardIndex + localCardIndex;
                const id = `${idPrefix}-${card.idSuffix}`;
                return (
                  <article key={id} ref={setRef(id)} className={cx(styles.flowCard, compact && styles.flowCardCompact, focusClass(cardFocus[index] ?? EMPTY_FOCUS))} style={{ '--stage': column.stageColor } as CSSProperties}>
                    <span className={styles.cardLabel}>{card.label}</span><h4>{card.title}</h4><p>{card.description}</p>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function RelationBadge({ kind, active, pos }: { kind: 'risk' | 'hyp'; active: boolean; pos?: BadgePos }) {
  return <span className={cx(styles.relationBadge, kind === 'risk' ? styles.riskBadge : styles.hypBadge, active && styles.isActive)} style={pos ? { left: pos.left, top: pos.top } : undefined}>{kind === 'risk' ? 'R' : 'H'}</span>;
}

export function RelationRail({ notes, riskActive, hypActive }: { notes: { risk: string; hyp: string }; riskActive: boolean; hypActive: boolean }) {
  return (
    <div className={styles.relationRail}>
      <article className={cx(styles.relationNote, styles.riskNote, riskActive && styles.isActive)}><span>Risco criado</span><p>{notes.risk}</p></article>
      <article className={cx(styles.relationNote, styles.hypNote, hypActive && styles.isActive)}><span>Hipótese criada</span><p>{notes.hyp}</p></article>
    </div>
  );
}

export function ChapterTextSwap({ swapKey, className, children }: { swapKey: string | number; className?: string; children: ReactNode }) {
  return <div className={cx(styles.textSwapSlot, className)}><div key={swapKey} className={styles.textSwapItem}>{children}</div></div>;
}

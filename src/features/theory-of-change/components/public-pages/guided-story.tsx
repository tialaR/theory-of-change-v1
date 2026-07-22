'use client';

import {
  type CSSProperties,
  type MutableRefObject,
  type ReactNode,
  type RefCallback,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useReducedMotion } from 'motion/react';
import {
  BRAND_LOGO_SRC,
  BRAND_MARK_SRC,
  EDGE_GAP,
  FINAL_START,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  MIN_READABLE_SCALE,
  OPENING_BRAND_COPY,
  RELATION_NOTES,
  chapterAt,
  chapterProgressFill,
  chapterStarts,
  chapters,
  clamp,
  connectionSets,
  detailsFocus,
  edgeTimelineProgress,
  flowColumns,
  overviewCards,
  overviewFocus,
  shouldPlaceHypBadge,
  shouldPlaceRiskBadge,
  structureColumnFocus,
  type EdgeSceneKey,
  type FocusFlags,
} from './guided-story-data';
import {
  createStoryScheduler,
  pathData,
  type PathGeom,
  type StoryScheduler,
} from './guided-story-scheduler';
import styles from './home-onboarding-preview.module.sass';

type EdgeLayout = PathGeom & { group: number; index: number };
type BadgePos = { left: number; top: number };
type SceneEdgeLayout = {
  edges: EdgeLayout[];
  viewBox: { width: number; height: number };
};
type LayoutMap = Record<EdgeSceneKey, SceneEdgeLayout>;
type BadgeMap = Partial<Record<EdgeSceneKey, { risk?: BadgePos; hyp?: BadgePos }>>;

function emptySceneLayout(): SceneEdgeLayout {
  return {
    edges: [],
    viewBox: { width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT },
  };
}

const EMPTY_FOCUS: FocusFlags = { active: false, complete: false };
const COMPLETE_FOCUS: FocusFlags = { active: false, complete: true };

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function focusClass(flags: FocusFlags): string {
  return cx(flags.active && styles.isActive, flags.complete && styles.isComplete);
}

function IconPrev() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m14.5 6-6 6 6 6" />
    </svg>
  );
}

function IconNext() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9.5 6 6 6-6 6" />
    </svg>
  );
}

function IconReplay() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7v5h5" />
      <path d="M5.2 12a7 7 0 1 0 2-5" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m8 5 11 7-11 7Z" className={styles.playPath} />
    </svg>
  );
}

function IconPause() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 5v14M15 5v14" />
    </svg>
  );
}

function EdgeLayer({
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
    <svg
      className={styles.edgeLayer}
      viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
      aria-hidden="true"
    >
      <defs>
        <marker
          id={`arrow-${sceneKey}`}
          markerWidth="7"
          markerHeight="7"
          refX="6"
          refY="3.5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M1 1.2 5.6 3.5 1 5.8"
            fill="none"
            stroke="var(--tdm-guided-story-marker-stroke)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
      <g>
        {edges.map((edge) => (
          <path
            key={`base-${edge.index}`}
            d={edge.d}
            className={styles.edgeBase}
            markerEnd={`url(#arrow-${sceneKey})`}
          />
        ))}
      </g>
      <g>
        {edges.map((edge, i) => {
          const { progress, opacity } = edgeTimelineProgress(
            local,
            edge.group,
            groupCounts[i]!,
            startsByGroup,
            duration,
            stagger,
            keep,
          );
          return (
            <path
              key={`live-${edge.index}`}
              d={edge.d}
              className={styles.edgeLive}
              style={{
                strokeDasharray: edge.length,
                strokeDashoffset: edge.length * (1 - progress),
                opacity,
              }}
            />
          );
        })}
      </g>
    </svg>
  );
}

function OverviewGrid({
  idPrefix,
  cardRefs,
  focus,
}: {
  idPrefix: 'overview' | 'relations';
  cardRefs: MutableRefObject<Map<string, HTMLElement>>;
  focus: FocusFlags[];
}) {
  const setRef = useCallback(
    (id: string): RefCallback<HTMLElement> =>
      (node) => {
        if (node) cardRefs.current.set(id, node);
        else cardRefs.current.delete(id);
      },
    [cardRefs],
  );

  return (
    <div className={styles.overviewGrid}>
      {overviewCards.map((card, index) => {
        const id = `${idPrefix}-${card.id}`;
        return (
          <article
            key={id}
            ref={setRef(id)}
            className={cx(styles.overviewCard, focusClass(focus[index] ?? EMPTY_FOCUS))}
            style={{ '--stage': card.stageColor } as CSSProperties}
          >
            <div className={styles.stageKicker}>
              <span>{card.kicker}</span>
            </div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <ul>
              {card.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}

function FlowBoard({
  idPrefix,
  cardRefs,
  columnFocus,
  cardFocus,
  compact,
}: {
  idPrefix: 'structure' | 'details' | 'causality' | 'final';
  cardRefs: MutableRefObject<Map<string, HTMLElement>>;
  columnFocus: FocusFlags[];
  cardFocus: FocusFlags[];
  compact?: boolean;
}) {
  const setRef = useCallback(
    (id: string): RefCallback<HTMLElement> =>
      (node) => {
        if (node) cardRefs.current.set(id, node);
        else cardRefs.current.delete(id);
      },
    [cardRefs],
  );

  return (
    <div className={styles.flowGrid}>
      {flowColumns.map((column, colIndex) => {
        const baseCardIndex = flowColumns
          .slice(0, colIndex)
          .reduce((sum, previousColumn) => sum + previousColumn.cards.length, 0);

        return (
          <section
            key={`${idPrefix}-${column.stage}`}
            className={cx(
              styles.flowColumn,
              compact && styles.flowColumnCompact,
              focusClass(columnFocus[colIndex] ?? EMPTY_FOCUS),
            )}
            style={{ '--stage': column.stageColor } as CSSProperties}
          >
            <div className={cx(styles.columnHeading, compact && styles.columnHeadingCompact)}>
              <span>{column.kicker}</span>
              <h3>{column.title}</h3>
              <p>{column.description}</p>
            </div>
            <div className={cx(styles.cardStack, compact && styles.cardStackCompact)}>
              {column.cards.map((card, localCardIndex) => {
                const index = baseCardIndex + localCardIndex;
                const id = `${idPrefix}-${card.idSuffix}`;
                return (
                  <article
                    key={id}
                    ref={setRef(id)}
                    className={cx(
                      styles.flowCard,
                      compact && styles.flowCardCompact,
                      focusClass(cardFocus[index] ?? EMPTY_FOCUS),
                    )}
                    style={{ '--stage': column.stageColor } as CSSProperties}
                  >
                    <span className={styles.cardLabel}>{card.label}</span>
                    <h4>{card.title}</h4>
                    <p>{card.description}</p>
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

function RelationBadge({
  kind,
  active,
  pos,
}: {
  kind: 'risk' | 'hyp';
  active: boolean;
  pos?: BadgePos;
}) {
  return (
    <span
      className={cx(
        styles.relationBadge,
        kind === 'risk' ? styles.riskBadge : styles.hypBadge,
        active && styles.isActive,
      )}
      style={pos ? { left: pos.left, top: pos.top } : undefined}
    >
      {kind === 'risk' ? 'R' : 'H'}
    </span>
  );
}

function RelationRail({
  notes,
  riskActive,
  hypActive,
}: {
  notes: { risk: string; hyp: string };
  riskActive: boolean;
  hypActive: boolean;
}) {
  return (
    <div className={styles.relationRail}>
      <article className={cx(styles.relationNote, styles.riskNote, riskActive && styles.isActive)}>
        <span>Risco criado</span>
        <p>{notes.risk}</p>
      </article>
      <article className={cx(styles.relationNote, styles.hypNote, hypActive && styles.isActive)}>
        <span>Hipótese criada</span>
        <p>{notes.hyp}</p>
      </article>
    </div>
  );
}

function ChapterTextSwap({
  swapKey,
  className,
  children,
}: {
  swapKey: string | number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx(styles.textSwapSlot, className)}>
      <div key={swapKey} className={styles.textSwapItem}>
        {children}
      </div>
    </div>
  );
}

export function HomeOnboardingPreview({
  density = 'default',
}: {
  density?: 'default' | 'embedded';
}) {
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const panRef = useRef<HTMLDivElement>(null);
  const sizerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const rootByScene = useRef(new Map<EdgeSceneKey, HTMLElement>());
  const schedulerRef = useRef<StoryScheduler | null>(null);
  const hasStartedRef = useRef(false);

  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(true);
  const [scale, setScale] = useState(1);
  const [canPan, setCanPan] = useState(false);
  const [layouts, setLayouts] = useState<LayoutMap>({
    overview: emptySceneLayout(),
    relations: emptySceneLayout(),
    causality: emptySceneLayout(),
    final: emptySceneLayout(),
  });
  const [badges, setBadges] = useState<BadgeMap>({});

  const { index: chapterIndex, local } = useMemo(() => chapterAt(elapsed), [elapsed]);
  const chapter = chapters[chapterIndex]!;
  const footerStatus = `${String(chapterIndex).padStart(2, '0')} / 06`;

  const setRootRef = useCallback(
    (key: EdgeSceneKey): RefCallback<HTMLElement> =>
      (node) => {
        if (node) rootByScene.current.set(key, node);
        else rootByScene.current.delete(key);
      },
    [],
  );

  const layoutConnections = useCallback(() => {
    const nextLayouts: LayoutMap = {
      overview: emptySceneLayout(),
      relations: emptySceneLayout(),
      causality: emptySceneLayout(),
      final: emptySceneLayout(),
    };
    const nextBadges: BadgeMap = {};

    (Object.keys(connectionSets) as EdgeSceneKey[]).forEach((sceneKey) => {
      const root = rootByScene.current.get(sceneKey);
      if (!root) return;
      const edges: EdgeLayout[] = [];
      connectionSets[sceneKey].forEach(([sourceId, targetId, group], index) => {
        const source = cardRefs.current.get(sourceId);
        const target = cardRefs.current.get(targetId);
        if (!source || !target) return;
        const geom = pathData(source, target, root, EDGE_GAP);
        edges.push({ ...geom, group, index });
        if (shouldPlaceRiskBadge(sceneKey, group, index)) {
          nextBadges[sceneKey] = {
            ...nextBadges[sceneKey],
            risk: { left: (geom.x1 + geom.x2) / 2, top: (geom.y1 + geom.y2) / 2 },
          };
        }
        if (shouldPlaceHypBadge(sceneKey, group, index)) {
          nextBadges[sceneKey] = {
            ...nextBadges[sceneKey],
            hyp: { left: (geom.x1 + geom.x2) / 2, top: (geom.y1 + geom.y2) / 2 },
          };
        }
      });
      nextLayouts[sceneKey] = {
        edges,
        viewBox: {
          width: Math.max(1, root.offsetWidth),
          height: Math.max(1, root.offsetHeight),
        },
      };
    });

    setLayouts(nextLayouts);
    setBadges(nextBadges);
  }, []);

  const updateScale = useCallback(() => {
    const pan = panRef.current;
    const sizer = sizerRef.current;
    const canvas = canvasRef.current;
    if (!pan || !sizer || !canvas) return;
    const available = Math.max(1, pan.clientWidth);
    const nextScale = Math.min(1, Math.max(MIN_READABLE_SCALE, available / LOGICAL_WIDTH));
    canvas.style.transform = `scale(${nextScale})`;
    sizer.style.width = `${LOGICAL_WIDTH * nextScale}px`;
    sizer.style.height = `${LOGICAL_HEIGHT * nextScale}px`;
    setScale(nextScale);
    setCanPan(LOGICAL_WIDTH * nextScale > available + 2);
  }, []);

  useLayoutEffect(() => {
    updateScale();
  }, [updateScale]);

  useLayoutEffect(() => {
    layoutConnections();
  }, [layoutConnections, scale, chapterIndex]);

  useEffect(() => {
    const pan = panRef.current;
    if (!pan || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      updateScale();
    });
    observer.observe(pan);
    return () => observer.disconnect();
  }, [updateScale]);

  useEffect(() => {
    const scheduler = createStoryScheduler({
      onElapsed: setElapsed,
      onPausedChange: setPaused,
    });
    schedulerRef.current = scheduler;
    return () => {
      scheduler.destroy();
      schedulerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const scheduler = schedulerRef.current;
    if (!root || !scheduler) return;

    if (reducedMotion) {
      scheduler.goTo(FINAL_START, true);
      hasStartedRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || hasStartedRef.current) return;
        hasStartedRef.current = true;
        scheduler.play(0);
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const goToChapter = (index: number) => {
    const scheduler = schedulerRef.current;
    if (!scheduler) return;
    const next = clamp(index, 0, chapters.length - 1);
    scheduler.goTo(chapterStarts[next]!, next === chapters.length - 1);
  };

  const overviewFlags =
    chapterIndex === 1
      ? overviewFocus(local, overviewCards.length)
      : chapterIndex === 2 || reducedMotion
        ? overviewCards.map(() => COMPLETE_FOCUS)
        : overviewCards.map(() => EMPTY_FOCUS);

  const structureFlags =
    chapterIndex === 3
      ? structureColumnFocus(local, flowColumns.length)
      : flowColumns.map(() => EMPTY_FOCUS);

  const detailsState =
    chapterIndex === 4
      ? detailsFocus(local, flowColumns.reduce((sum, col) => sum + col.cards.length, 0))
      : {
          cards: Array.from({ length: 12 }, () =>
            chapterIndex > 4 || reducedMotion ? COMPLETE_FOCUS : EMPTY_FOCUS,
          ),
          columns: flowColumns.map(() =>
            chapterIndex > 4 || reducedMotion ? COMPLETE_FOCUS : EMPTY_FOCUS,
          ),
        };

  const allCompleteColumns = flowColumns.map(() => COMPLETE_FOCUS);
  const allCompleteCards = Array.from({ length: 12 }, () => COMPLETE_FOCUS);

  const relationsEdgeLocal = chapterIndex === 2 ? local : 0;
  const causalityEdgeLocal = chapterIndex === 5 ? local : 0;
  const finalEdgeLocal = chapterIndex === 6 || reducedMotion ? 999999 : 0;

  const relationsRiskActive = chapterIndex === 2 && local > 5200;
  const relationsHypActive = chapterIndex === 2 && local > 9100;
  const relationsRiskNote = chapterIndex === 2 && local > 5600;
  const relationsHypNote = chapterIndex === 2 && local > 9500;

  const causalityRiskActive = chapterIndex === 5 && local > 6700;
  const causalityHypActive = chapterIndex === 5 && local > 11900;
  const causalityRiskNote = chapterIndex === 5 && local > 7150;
  const causalityHypNote = chapterIndex === 5 && local > 12350;

  const openingReady = chapterIndex === 0 && local > 500;
  const showFinalComplete = chapterIndex === 6 || Boolean(reducedMotion);

  return (
    <section
      ref={rootRef}
      className={cx(
        styles.storySection,
        density === 'embedded' && styles.densityEmbedded,
        reducedMotion && styles.reducedMotion,
      )}
      aria-label="Experiência completa do TMD Construtor"
    >
      <div className={styles.storyShell}>
        <div className={styles.storyHeader}>
          <div className={styles.storyCopy}>
            <ChapterTextSwap swapKey={chapterIndex} className={styles.storyCopySwap}>
              <span className={styles.chapterKicker}>{chapter.label}</span>
              <h2>
                <span key={chapterIndex} className={styles.chapterTitleReveal}>
                  {chapter.title}
                </span>
              </h2>
            </ChapterTextSwap>
          </div>
          <div className={styles.storyControls} aria-label="Controles da narrativa">
            <button
              className={styles.controlBtn}
              type="button"
              aria-label="Capítulo anterior"
              title="Capítulo anterior"
              onClick={() => goToChapter(chapterIndex - 1)}
            >
              <IconPrev />
            </button>
            <button
              className={styles.controlBtn}
              type="button"
              aria-label={paused ? 'Continuar narrativa' : 'Pausar narrativa'}
              title={paused ? 'Continuar' : 'Pausar'}
              onClick={() => schedulerRef.current?.togglePause()}
            >
              {paused ? <IconPlay /> : <IconPause />}
            </button>
            <button
              className={styles.controlBtn}
              type="button"
              aria-label="Próximo capítulo"
              title="Próximo capítulo"
              onClick={() => goToChapter(chapterIndex + 1)}
            >
              <IconNext />
            </button>
            <button
              className={styles.controlBtn}
              type="button"
              aria-label="Reiniciar narrativa"
              title="Reiniciar"
              onClick={() => schedulerRef.current?.play(0)}
            >
              <IconReplay />
            </button>
          </div>
        </div>

        <div ref={panRef} className={cx(styles.storyPan, canPan && styles.canPan)}>
          <div ref={sizerRef} className={styles.storySizer}>
            <div ref={canvasRef} className={styles.storyCanvas}>
              <section className={cx(styles.scene, chapterIndex === 0 && styles.active)} data-scene="0">
                <div className={cx(styles.sceneInner, styles.openingLayout)}>
                  <div className={cx(styles.openingBrand, openingReady && styles.isReady)}>
                    <img src={BRAND_LOGO_SRC} alt="TMD Construtor" width={1108} height={262} />
                    <p>{OPENING_BRAND_COPY}</p>
                  </div>
                </div>
              </section>

              <section className={cx(styles.scene, chapterIndex === 1 && styles.active)} data-scene="1">
                <div className={styles.sceneInner}>
                  <div ref={setRootRef('overview')} className={styles.overviewWrap}>
                    <EdgeLayer
                      sceneKey="overview"
                      layout={layouts.overview}
                      local={0}
                      keep={false}
                      startsByGroup={[0, 0, 0]}
                      duration={1}
                      stagger={0}
                    />
                    <OverviewGrid idPrefix="overview" cardRefs={cardRefs} focus={overviewFlags} />
                  </div>
                </div>
              </section>

              <section className={cx(styles.scene, chapterIndex === 2 && styles.active)} data-scene="2">
                <div className={styles.sceneInner}>
                  <div ref={setRootRef('relations')} className={styles.overviewWrap}>
                    <EdgeLayer
                      sceneKey="relations"
                      layout={layouts.relations}
                      local={relationsEdgeLocal}
                      keep={false}
                      startsByGroup={[900, 4800, 8700]}
                      duration={1850}
                      stagger={0}
                    />
                    <RelationBadge kind="risk" active={relationsRiskActive} pos={badges.relations?.risk} />
                    <RelationBadge kind="hyp" active={relationsHypActive} pos={badges.relations?.hyp} />
                    <OverviewGrid
                      idPrefix="relations"
                      cardRefs={cardRefs}
                      focus={overviewCards.map(() => COMPLETE_FOCUS)}
                    />
                  </div>
                  <RelationRail
                    notes={RELATION_NOTES.relations}
                    riskActive={relationsRiskNote}
                    hypActive={relationsHypNote}
                  />
                </div>
              </section>

              <section className={cx(styles.scene, chapterIndex === 3 && styles.active)} data-scene="3">
                <div className={styles.sceneInner}>
                  <div className={styles.detailWrap}>
                    <FlowBoard
                      idPrefix="structure"
                      cardRefs={cardRefs}
                      columnFocus={structureFlags}
                      cardFocus={Array.from({ length: 12 }, () => EMPTY_FOCUS)}
                    />
                  </div>
                </div>
              </section>

              <section className={cx(styles.scene, chapterIndex === 4 && styles.active)} data-scene="4">
                <div className={styles.sceneInner}>
                  <div className={styles.detailWrap}>
                    <FlowBoard
                      idPrefix="details"
                      cardRefs={cardRefs}
                      columnFocus={detailsState.columns}
                      cardFocus={detailsState.cards}
                    />
                  </div>
                </div>
              </section>

              <section className={cx(styles.scene, chapterIndex === 5 && styles.active)} data-scene="5">
                <div className={styles.sceneInner}>
                  <div ref={setRootRef('causality')} className={cx(styles.detailWrap, styles.detailWrapCausality)}>
                    <EdgeLayer
                      sceneKey="causality"
                      layout={layouts.causality}
                      local={causalityEdgeLocal}
                      keep={false}
                      startsByGroup={[900, 6100, 11300]}
                      duration={1800}
                      stagger={220}
                    />
                    <RelationBadge kind="risk" active={causalityRiskActive} pos={badges.causality?.risk} />
                    <RelationBadge kind="hyp" active={causalityHypActive} pos={badges.causality?.hyp} />
                    <FlowBoard
                      idPrefix="causality"
                      cardRefs={cardRefs}
                      columnFocus={allCompleteColumns}
                      cardFocus={allCompleteCards}
                      compact
                    />
                  </div>
                  <RelationRail
                    notes={RELATION_NOTES.causality}
                    riskActive={causalityRiskNote}
                    hypActive={causalityHypNote}
                  />
                </div>
              </section>

              <section className={cx(styles.scene, chapterIndex === 6 && styles.active)} data-scene="6">
                <div className={styles.sceneInner}>
                  <div ref={setRootRef('final')} className={cx(styles.detailWrap, styles.detailWrapCausality)}>
                    <EdgeLayer
                      sceneKey="final"
                      layout={layouts.final}
                      local={finalEdgeLocal}
                      keep
                      startsByGroup={[0, 0, 0]}
                      duration={1}
                      stagger={0}
                    />
                    <RelationBadge kind="risk" active={showFinalComplete} pos={badges.final?.risk} />
                    <RelationBadge kind="hyp" active={showFinalComplete} pos={badges.final?.hyp} />
                    <FlowBoard
                      idPrefix="final"
                      cardRefs={cardRefs}
                      columnFocus={allCompleteColumns}
                      cardFocus={allCompleteCards}
                      compact
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <footer className={styles.storyFooter}>
          <div className={styles.footerMain}>
            <img className={styles.footerIcon} src={BRAND_MARK_SRC} alt="" width={252} height={262} />
            <div className={styles.footerCopy}>
              <ChapterTextSwap swapKey={chapterIndex} className={styles.footerCopySwap}>
                <h3>{chapter.footerTitle}</h3>
                <p>{chapter.footerDescription}</p>
              </ChapterTextSwap>
            </div>
            <span className={styles.footerStatus}>{footerStatus}</span>
          </div>
          <nav className={styles.chapterNav} aria-label="Capítulos da narrativa">
            {chapters.map((item, index) => {
              const fill = chapterProgressFill(elapsed, index);
              return (
                <button
                  key={item.label}
                  type="button"
                  className={cx(styles.chapterStep, index === chapterIndex && styles.active)}
                  style={{ '--fill': clamp(fill, 0, 1).toFixed(4) } as CSSProperties}
                  onClick={() => goToChapter(index)}
                >
                  <span>{String(index).padStart(2, '0')}</span>
                  <b>{item.label}</b>
                </button>
              );
            })}
          </nav>
        </footer>
      </div>
    </section>
  );
}

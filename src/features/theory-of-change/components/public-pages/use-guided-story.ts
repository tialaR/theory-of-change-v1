import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  EDGE_GAP,
  FINAL_START,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  MIN_READABLE_SCALE,
  chapterAt,
  chapterStarts,
  chapters,
  clamp,
  connectionSets,
  detailsFocus,
  flowColumns,
  overviewCards,
  overviewFocus,
  shouldPlaceHypBadge,
  shouldPlaceRiskBadge,
  structureColumnFocus,
  type EdgeSceneKey,
} from './guided-story-data';
import { createStoryScheduler, pathData, type StoryScheduler } from './guided-story-scheduler';
import { COMPLETE_FOCUS, EMPTY_FOCUS, emptySceneLayout } from './guided-story-shared';
import type { BadgeMap, LayoutMap } from './guided-story-types';

export function useGuidedStory() {
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
  const [layouts, setLayouts] = useState<LayoutMap>({ overview: emptySceneLayout(), relations: emptySceneLayout(), causality: emptySceneLayout(), final: emptySceneLayout() });
  const [badges, setBadges] = useState<BadgeMap>({});
  const { index: chapterIndex, local } = useMemo(() => chapterAt(elapsed), [elapsed]);
  const chapter = chapters[chapterIndex]!;

  const setRootRef = useCallback((key: EdgeSceneKey) => (node: HTMLElement | null) => {
    if (node) rootByScene.current.set(key, node);
    else rootByScene.current.delete(key);
  }, []);

  const layoutConnections = useCallback(() => {
    const nextLayouts: LayoutMap = { overview: emptySceneLayout(), relations: emptySceneLayout(), causality: emptySceneLayout(), final: emptySceneLayout() };
    const nextBadges: BadgeMap = {};
    (Object.keys(connectionSets) as EdgeSceneKey[]).forEach((sceneKey) => {
      const root = rootByScene.current.get(sceneKey);
      if (!root) return;
      const edges = connectionSets[sceneKey].flatMap(([sourceId, targetId, group], index) => {
        const source = cardRefs.current.get(sourceId);
        const target = cardRefs.current.get(targetId);
        if (!source || !target) return [];
        const geom = pathData(source, target, root, EDGE_GAP);
        if (shouldPlaceRiskBadge(sceneKey, group, index)) nextBadges[sceneKey] = { ...nextBadges[sceneKey], risk: { left: (geom.x1 + geom.x2) / 2, top: (geom.y1 + geom.y2) / 2 } };
        if (shouldPlaceHypBadge(sceneKey, group, index)) nextBadges[sceneKey] = { ...nextBadges[sceneKey], hyp: { left: (geom.x1 + geom.x2) / 2, top: (geom.y1 + geom.y2) / 2 } };
        return [{ ...geom, group, index }];
      });
      nextLayouts[sceneKey] = { edges, viewBox: { width: Math.max(1, root.offsetWidth), height: Math.max(1, root.offsetHeight) } };
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

  useLayoutEffect(updateScale, [updateScale]);
  useLayoutEffect(layoutConnections, [layoutConnections, scale, chapterIndex]);
  useEffect(() => {
    const pan = panRef.current;
    if (!pan || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateScale);
    observer.observe(pan);
    return () => observer.disconnect();
  }, [updateScale]);
  useEffect(() => {
    const scheduler = createStoryScheduler({ onElapsed: setElapsed, onPausedChange: setPaused });
    schedulerRef.current = scheduler;
    return () => { scheduler.destroy(); schedulerRef.current = null; };
  }, []);
  useEffect(() => {
    const root = rootRef.current;
    const scheduler = schedulerRef.current;
    if (!root || !scheduler) return;
    if (reducedMotion) { scheduler.goTo(FINAL_START, true); hasStartedRef.current = true; return; }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || hasStartedRef.current) return;
      hasStartedRef.current = true;
      scheduler.play(0);
      observer.disconnect();
    }, { threshold: 0.3 });
    observer.observe(root);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const goToChapter = useCallback((index: number) => {
    const next = clamp(index, 0, chapters.length - 1);
    schedulerRef.current?.goTo(chapterStarts[next]!, next === chapters.length - 1);
  }, []);
  const togglePause = useCallback(() => schedulerRef.current?.togglePause(), []);
  const replay = useCallback(() => schedulerRef.current?.play(0), []);
  const cardCount = flowColumns.reduce((sum, column) => sum + column.cards.length, 0);
  const completedOverview = overviewCards.map(() => COMPLETE_FOCUS);
  const emptyOverview = overviewCards.map(() => EMPTY_FOCUS);
  const completeColumns = flowColumns.map(() => COMPLETE_FOCUS);
  const emptyColumns = flowColumns.map(() => EMPTY_FOCUS);
  const completeCards = Array.from({ length: cardCount }, () => COMPLETE_FOCUS);
  const emptyCards = Array.from({ length: cardCount }, () => EMPTY_FOCUS);
  const overviewFlags = chapterIndex === 1 ? overviewFocus(local, overviewCards.length) : chapterIndex === 2 || reducedMotion ? completedOverview : emptyOverview;
  const structureFlags = chapterIndex === 3 ? structureColumnFocus(local, flowColumns.length) : emptyColumns;
  const detailsState = chapterIndex === 4 ? detailsFocus(local, cardCount) : { cards: chapterIndex > 4 || reducedMotion ? completeCards : emptyCards, columns: chapterIndex > 4 || reducedMotion ? completeColumns : emptyColumns };

  return {
    reducedMotion: Boolean(reducedMotion), rootRef, panRef, sizerRef, canvasRef, cardRefs, setRootRef,
    elapsed, paused, canPan, chapterIndex, local, chapter, layouts, badges, goToChapter, togglePause, replay,
    sceneState: {
      chapterIndex, local, openingReady: chapterIndex === 0 && local > 500, overviewFlags, structureFlags, detailsState,
      allCompleteColumns: completeColumns, allCompleteCards: completeCards,
      relationsEdgeLocal: chapterIndex === 2 ? local : 0, causalityEdgeLocal: chapterIndex === 5 ? local : 0,
      finalEdgeLocal: chapterIndex === 6 || reducedMotion ? 999999 : 0,
      relationsRiskActive: chapterIndex === 2 && local > 5200, relationsHypActive: chapterIndex === 2 && local > 9100,
      relationsRiskNote: chapterIndex === 2 && local > 5600, relationsHypNote: chapterIndex === 2 && local > 9500,
      causalityRiskActive: chapterIndex === 5 && local > 6700, causalityHypActive: chapterIndex === 5 && local > 11900,
      causalityRiskNote: chapterIndex === 5 && local > 7150, causalityHypNote: chapterIndex === 5 && local > 12350,
      showFinalComplete: chapterIndex === 6 || Boolean(reducedMotion),
    },
  };
}

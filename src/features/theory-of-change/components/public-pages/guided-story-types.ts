import type { MutableRefObject, RefCallback } from 'react';
import type { EdgeSceneKey, FocusFlags } from './guided-story-data';
import type { PathGeom } from './guided-story-scheduler';

export type EdgeLayout = PathGeom & { group: number; index: number };
export type BadgePos = { left: number; top: number };
export type SceneEdgeLayout = {
  edges: EdgeLayout[];
  viewBox: { width: number; height: number };
};
export type LayoutMap = Record<EdgeSceneKey, SceneEdgeLayout>;
export type BadgeMap = Partial<Record<EdgeSceneKey, { risk?: BadgePos; hyp?: BadgePos }>>;
export type CardRefs = MutableRefObject<Map<string, HTMLElement>>;
export type SceneRootRef = (key: EdgeSceneKey) => RefCallback<HTMLElement>;

export type StorySceneState = {
  chapterIndex: number;
  local: number;
  openingReady: boolean;
  overviewFlags: FocusFlags[];
  structureFlags: FocusFlags[];
  detailsState: { columns: FocusFlags[]; cards: FocusFlags[] };
  allCompleteColumns: FocusFlags[];
  allCompleteCards: FocusFlags[];
  relationsEdgeLocal: number;
  causalityEdgeLocal: number;
  finalEdgeLocal: number;
  relationsRiskActive: boolean;
  relationsHypActive: boolean;
  relationsRiskNote: boolean;
  relationsHypNote: boolean;
  causalityRiskActive: boolean;
  causalityHypActive: boolean;
  causalityRiskNote: boolean;
  causalityHypNote: boolean;
  showFinalComplete: boolean;
};

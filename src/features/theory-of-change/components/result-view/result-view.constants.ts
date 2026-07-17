import { TDM_STAGE_LABELS, type TdmStage } from '@/features/theory-of-change/domain/tdm-stages';
import type { StageMeta } from './result-view.types';
import { DEFAULT_CARD_GLASS, DEFAULT_PANEL_GLASS } from './liquid-glass/types';

export const RESULT_ZOOM = {
  initial: 1,
  /** Manual zoom floor (toolbar / pinch). */
  min: 0.74,
  /**
   * Autofit floor for translator camera only.
   * Manual min/max are unchanged; overview/scoped may go lower so four columns
   * fit the reduced main pane without horizontal scroll.
   */
  fitMin: 0.58,
  max: 1.4,
  step: 0.1
} as const;

export const RESULT_MOTION = {
  ease: [0.22, 1, 0.36, 1] as const,
  zoomDuration: 0.24,
  cardDuration: 0.36,
  pathDuration: 0.78,
  edgeStagger: 0.12
} as const;

export const RESULT_EDGE_GAP = 10;

export const RESULT_HEADER_TITLE_EXAMPLE = 'TDM · RESULTADO EXEMPLO';
export const RESULT_HEADER_TITLE_CANVAS = 'TDM · RESULTADO';

export const STAGE_META: Record<TdmStage, StageMeta> = {
  input: {
    stage: 'input',
    label: TDM_STAGE_LABELS.input,
    eyebrow: '01',
    accent: 'rgba(139, 124, 255, 0.68)',
    accentSoft: 'rgba(139, 124, 255, 0.1)'
  },
  activity: {
    stage: 'activity',
    label: TDM_STAGE_LABELS.activity,
    eyebrow: '02',
    accent: 'rgba(73, 179, 255, 0.68)',
    accentSoft: 'rgba(73, 179, 255, 0.1)'
  },
  output: {
    stage: 'output',
    label: TDM_STAGE_LABELS.output,
    eyebrow: '03',
    accent: 'rgba(242, 166, 90, 0.68)',
    accentSoft: 'rgba(242, 166, 90, 0.1)'
  },
  outcome: {
    stage: 'outcome',
    label: TDM_STAGE_LABELS.outcome,
    eyebrow: '04',
    accent: 'rgba(55, 200, 147, 0.68)',
    accentSoft: 'rgba(55, 200, 147, 0.1)'
  }
};

export const COLUMN_GLASS = {
  ...DEFAULT_PANEL_GLASS,
  borderRadius: 10,
  borderWidth: 0.02,
  brightness: 36,
  opacity: 1,
  blur: 4,
  displace: 0,
  backgroundOpacity: 0.88,
  saturation: 1,
  distortionScale: 0,
  redOffset: 0,
  greenOffset: 0,
  blueOffset: 0
} as const;

export const CARD_GLASS = {
  ...DEFAULT_CARD_GLASS,
  borderRadius: 9,
  borderWidth: 0.02,
  brightness: 34,
  opacity: 1,
  blur: 3,
  displace: 0,
  backgroundOpacity: 0.9,
  saturation: 1,
  distortionScale: 0,
  redOffset: 0,
  greenOffset: 0,
  blueOffset: 0
} as const;

import type { CSSProperties } from 'react';
import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import type { TdmStage } from '@/features/theory-of-change/domain/tdm-stages';
import { TDM_STAGE_LABELS, TDM_STAGE_ORDER } from '@/features/theory-of-change/domain/tdm-stages';

export interface ResultExperienceProps {
  title: string;
  description?: string;
  nodes: TdmNode[];
  edges: TdmEdge[];
}


export const resultStageOrder = TDM_STAGE_ORDER;

export function getStageNodes(data: ResultExperienceProps, stage: TdmStage) {
  return data.nodes.filter((node) => node.stage === stage);
}

export type StageMeta = {
  stage: TdmStage;
  label: string;
  eyebrow: string;
  accent: string;
  accentSoft: string;
};

export type CustomStyle = CSSProperties & Record<string, string | number>;

export const STAGE_META: Record<TdmStage, StageMeta> = {
  input: {
    stage: 'input',
    label: TDM_STAGE_LABELS.input,
    eyebrow: '01',
    accent: 'rgba(167, 139, 250, 0.9)',
    accentSoft: 'rgba(167, 139, 250, 0.12)'
  },
  activity: {
    stage: 'activity',
    label: TDM_STAGE_LABELS.activity,
    eyebrow: '02',
    accent: 'rgba(96, 165, 250, 0.9)',
    accentSoft: 'rgba(96, 165, 250, 0.12)'
  },
  output: {
    stage: 'output',
    label: TDM_STAGE_LABELS.output,
    eyebrow: '03',
    accent: 'rgba(245, 158, 66, 0.88)',
    accentSoft: 'rgba(245, 158, 66, 0.12)'
  },
  outcome: {
    stage: 'outcome',
    label: TDM_STAGE_LABELS.outcome,
    eyebrow: '04',
    accent: 'rgba(72, 211, 165, 0.88)',
    accentSoft: 'rgba(72, 211, 165, 0.12)'
  }
};

export const resultStageMeta = STAGE_META;

export type DisplayEdge = TdmEdge & {
  markerKinds: Array<'risk' | 'hypothesis'>;
};

export type DiagramNode = TdmNode & {
  columnIndex: number;
  rowIndex: number;
  x: number;
  y: number;
};

export type DiagramEdge = TdmEdge & {
  path: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  midX: number;
  midY: number;
};

import type { CSSProperties } from 'react';
import type { TdmEdge, TdmNode } from '@/features/theory-of-change/domain/tdm-types';
import type { TdmStage } from '@/features/theory-of-change/domain/tdm-stages';

export type ResultExperienceMode = 'example' | 'canvas-preview';

export type ResultViewModel = {
  title: string;
  description?: string;
  nodes: TdmNode[];
  edges: TdmEdge[];
};

export type ResultExperienceProps = {
  viewModel: ResultViewModel;
  mode?: ResultExperienceMode;
  headerTitle?: string;
  backHref?: string;
  closeHref?: string;
  backLabel?: string;
  onBack?: () => void;
  onClose?: () => void;
};

export type StageMeta = {
  stage: TdmStage;
  label: string;
  eyebrow: string;
  accent: string;
  accentSoft: string;
};

export type CustomStyle = CSSProperties & Record<string, string | number>;

export type CardRect = {
  x: number;
  y: number;
  width: number;
  height: number;
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

export type ConnectedFlow = {
  nodeIds: Set<string>;
  edgeIds: Set<string>;
};

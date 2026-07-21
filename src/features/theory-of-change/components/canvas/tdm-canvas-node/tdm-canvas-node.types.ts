import type { CSSProperties, MouseEvent, PointerEvent, ReactNode } from 'react';
import type { TdmStage } from '../../../domain/tdm-stages';

export type TdmCanvasNodeVisualMode = 'compact' | 'edit';

export type TdmCanvasNodeStageAccent = {
  color: string;
  soft: string;
};

export type TdmCanvasNodeShellProps = {
  mode: TdmCanvasNodeVisualMode;
  stage: TdmStage;
  selected: boolean;
  connectionTarget: boolean;
  toolbarOpen: boolean;
  stageAccent: TdmCanvasNodeStageAccent;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  onPointerDownCapture?: (event: PointerEvent<HTMLElement>) => void;
  onDoubleClick?: (event: MouseEvent<HTMLElement>) => void;
};

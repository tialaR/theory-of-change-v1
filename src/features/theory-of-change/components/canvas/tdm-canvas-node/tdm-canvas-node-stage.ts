import type { TdmStage } from '../../../domain/tdm-stages';
import type { TdmCanvasNodeStageAccent } from './tdm-canvas-node.types';

/** Cores semânticas de etapa já usadas no Canvas — apenas acento local. */
export const TDM_CANVAS_NODE_STAGE_ACCENTS: Record<TdmStage, TdmCanvasNodeStageAccent> = {
  input: {
    color: 'rgba(139, 124, 255, 0.68)',
    soft: 'rgba(139, 124, 255, 0.1)'
  },
  activity: {
    color: 'rgba(73, 179, 255, 0.68)',
    soft: 'rgba(73, 179, 255, 0.1)'
  },
  output: {
    color: 'rgba(242, 166, 90, 0.68)',
    soft: 'rgba(242, 166, 90, 0.1)'
  },
  outcome: {
    color: 'rgba(55, 200, 147, 0.68)',
    soft: 'rgba(55, 200, 147, 0.1)'
  }
};

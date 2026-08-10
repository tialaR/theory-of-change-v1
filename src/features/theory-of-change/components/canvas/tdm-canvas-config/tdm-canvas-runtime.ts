import { MarkerType, type EdgeTypes, type NodeTypes } from '@xyflow/react';

import { TdmTheoryEdge } from '../../edge/tdm-theory-edge';
import { TdmCanvasNode } from '../tdm-canvas-node/tdm-canvas-node';
import type { TdmStage } from '../../../domain/tdm-stages';
import type { TdmNodeDraft } from '../../../domain/tdm-types';

export const EMPTY_DRAFT: TdmNodeDraft = {
  title: '',
  description: '',
  advancedDetails: '',
  shortNotes: ''
};

export const QUICK_STAGE_DRAFTS: Record<TdmStage, TdmNodeDraft> = {
  input: {
    title: 'Novo insumo',
    description: 'Recurso necessário para a política acontecer.',
    advancedDetails: '',
    shortNotes: ''
  },
  activity: {
    title: 'Nova atividade',
    description: 'Ação realizada com os recursos disponíveis.',
    advancedDetails: '',
    shortNotes: ''
  },
  output: {
    title: 'Novo produto',
    description: 'Entrega concreta gerada pela atividade.',
    advancedDetails: '',
    shortNotes: ''
  },
  outcome: {
    title: 'Novo resultado',
    description: 'Mudança esperada depois das entregas.',
    advancedDetails: '',
    shortNotes: ''
  }
};

export const defaultEdgeOptions = {
  type: 'tdm',
  markerEnd: {
    type: MarkerType.ArrowClosed
  }
} as const;

export const CANVAS_MIN_ZOOM = 0.32;
export const CANVAS_MAX_ZOOM = 1.2;
export const CANVAS_SNAP_GRID: [number, number] = [20, 20];
export const CANVAS_FIT_VIEW_OPTIONS = {
  padding: 0.16,
  maxZoom: 1
} as const;

export const CANVAS_DS_MINIMAP: Record<TdmStage, { fill: string; stroke: string }> = {
  input: { fill: 'rgba(167, 139, 250, 0.16)', stroke: 'rgba(167, 139, 250, 0.55)' },
  activity: { fill: 'rgba(96, 165, 250, 0.14)', stroke: 'rgba(96, 165, 250, 0.5)' },
  output: { fill: 'rgba(246, 179, 93, 0.14)', stroke: 'rgba(246, 179, 93, 0.5)' },
  outcome: { fill: 'rgba(94, 224, 181, 0.14)', stroke: 'rgba(94, 224, 181, 0.5)' }
};

export const nodeTypes = {
  tdm: TdmCanvasNode
} satisfies NodeTypes;

export const edgeTypes = {
  tdm: TdmTheoryEdge
} satisfies EdgeTypes;

export type ViewMode = 'canvas' | 'example-preview' | 'result';

export function createEmptyDraftMap(): Record<TdmStage, TdmNodeDraft> {
  return {
    input: { ...EMPTY_DRAFT },
    activity: { ...EMPTY_DRAFT },
    output: { ...EMPTY_DRAFT },
    outcome: { ...EMPTY_DRAFT }
  };
}

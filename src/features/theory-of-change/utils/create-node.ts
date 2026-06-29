import { Position } from '@xyflow/react';
import { TdmNode } from '../domain/tdm-types';
import { TdmStage } from '../domain/tdm-stages';

const fallbackId = () => `node-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();

export function createNode({
  title,
  stage,
  description,
  advancedDetails = '',
  shortNotes = '',
  x,
  y
}: {
  title: string;
  stage: TdmStage;
  description?: string;
  advancedDetails?: string;
  shortNotes?: string;
  x: number;
  y: number;
}): TdmNode {
  const createdAt = now();

  return {
    id: globalThis.crypto?.randomUUID?.() ?? fallbackId(),
    type: 'tdm',
    stage,
    title,
    description: description ?? '',
    advancedDetails,
    shortNotes,
    position: { x, y },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    createdAt,
    updatedAt: createdAt,
    data: {
      stage,
      title,
      description: description ?? '',
      advancedDetails,
      shortNotes
    }
  };
}

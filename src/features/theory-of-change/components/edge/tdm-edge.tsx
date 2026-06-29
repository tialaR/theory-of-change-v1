'use client';

import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import type { CSSProperties } from 'react';
import { getTdmStageTheme } from '../../domain/tdm-theme';
import type { TdmStage } from '../../domain/tdm-stages';
import type { TdmEdge as TdmEdgeModel } from '../../domain/tdm-types';
import styles from './tdm-edge.module.sass';

export function TdmEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
  data
}: EdgeProps<TdmEdgeModel>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition
  });
  const sourceStage = (data?.sourceStage ?? 'input') as TdmStage;
  const theme = getTdmStageTheme(sourceStage);

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        ...style,
        '--edge-stroke': theme.accent,
        stroke: theme.accent,
        strokeDasharray: selected ? '4 6' : '7 9',
        strokeWidth: selected ? 2.4 : 1.7,
        opacity: data?.validationStatus === 'invalid' ? 0.55 : 0.88
      } as CSSProperties}
      markerEnd={markerEnd}
      className={[styles.edge, selected ? styles.selected : ''].filter(Boolean).join(' ')}
    />
  );
}

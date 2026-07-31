'use client';

import { getBezierPath, type ConnectionLineComponentProps } from '@xyflow/react';
import styles from '../canvas-workspace/canvas-workspace.module.sass';

export function CanvasConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition
}: ConnectionLineComponentProps) {
  const [path] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
    sourcePosition: fromPosition,
    targetPosition: toPosition,
    curvature: 0.42
  });

  return <path className={styles.connectionPreview} d={path} />;
}

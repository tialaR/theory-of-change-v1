'use client';

import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';
import type { CanvasRelationEdge } from './canvas-v4.model';
import styles from './canvas-v4.module.sass';

export function CanvasRelationEdgeView(props: EdgeProps<CanvasRelationEdge>) {
  const [path, labelX, labelY] = getBezierPath(props);
  const marker = props.data?.relationKind === 'risk' ? 'R' : props.data?.relationKind === 'hypothesis' ? 'H' : '';

  return (
    <>
      <BaseEdge id={props.id} path={path} className={styles.edgePath} markerEnd={props.markerEnd} />
      <EdgeLabelRenderer>
        <button
          type="button"
          className={styles.edgeAction}
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          title={marker ? 'Editar relação' : 'Adicionar risco ou hipótese'}
          data-edge-action={props.id}
          data-kind={props.data?.relationKind ?? 'empty'}
        >
          {marker || '›'}
        </button>
      </EdgeLabelRenderer>
    </>
  );
}

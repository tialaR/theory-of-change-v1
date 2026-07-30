'use client';

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps
} from '@xyflow/react';
import type { CanvasCausalEdge } from '../../react-flow/canvas-flow.types';
import styles from '../canvas-workspace/canvas-workspace.module.sass';
import { useCanvasRuntime } from '../runtime/canvas-runtime-context';
import { CanvasRelationPopover } from './canvas-relation-popover';

export function CanvasCausalEdgeComponent(props: EdgeProps<CanvasCausalEdge>) {
  const runtime = useCanvasRuntime();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    curvature: 0.45
  });
  const selected = runtime.ui.selectedEdgeId === props.id;
  const relationKind = props.data?.relationKind;
  const label = relationKind === 'risk' ? 'R' : relationKind === 'hypothesis' ? 'H' : '›';

  return (
    <>
      <BaseEdge
        id={props.id}
        path={edgePath}
        className={`${styles.reactFlowConnectionPath} ${selected ? styles.reactFlowConnectionPathSelected : ''}`}
        style={{ opacity: selected ? 1 : 0.72 }}
      />
      <EdgeLabelRenderer>
        <div
          className={styles.reactFlowEdgeLabel}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            zIndex: selected ? 5000 : 1
          }}
        >
          <button
            type="button"
            data-edge-action-id={props.id}
            className={`${styles.edgeAction} nodrag nopan`}
            data-kind={relationKind ?? 'empty'}
            data-selected={selected}
            onClick={(event) => {
              event.stopPropagation();
              const edge = runtime.flow.edges.find((item) => item.id === props.id);
              if (edge) runtime.selectEdge(edge);
            }}
            aria-label={runtime.t('relation.select')}
          >
            {label}
          </button>
          {selected ? <CanvasRelationPopover /> : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

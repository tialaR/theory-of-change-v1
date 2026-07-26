'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { getStage } from '../domain/canvas-v2.rules';
import type { TdmCanvasNode } from '../domain/canvas-v2.types';
import styles from '../canvas-v2.module.sass';

export function TdmNode({ data, selected }: NodeProps<TdmCanvasNode>) {
  const stage = getStage(data.stage);
  return (
    <article className={styles.nodeCard} data-stage={data.stage} data-selected={selected}>
      <Handle className={styles.nodeHandle} type="target" position={Position.Left} />
      <div className={styles.nodeStage}><span />{stage.singular}</div>
      <h2>{data.title}</h2>
      <p>{data.description}</p>
      <div className={styles.nodeFooter}><span>Conectar</span><span>Arraste para mover</span></div>
      <Handle className={styles.nodeHandle} type="source" position={Position.Right} />
    </article>
  );
}

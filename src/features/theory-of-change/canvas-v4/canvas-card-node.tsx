'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { CanvasCardNode } from './canvas-v4.model';
import styles from './canvas-v4.module.sass';

export function CanvasCardNodeView({ id, data, selected }: NodeProps<CanvasCardNode>) {
  return (
    <article className={styles.cardNode} data-stage={data.stage} data-selected={selected}>
      <Handle className={styles.handle} type="target" position={Position.Left} id="target" />
      <Handle className={styles.handle} type="source" position={Position.Right} id="source" />

      <div className={styles.cardTopline}>
        <span className={styles.stageDot} />
        <span>{data.stage}</span>
        <button
          type="button"
          className="nodrag nopan"
          aria-label="Abrir ações do bloco"
          title="Ações do bloco"
          data-node-menu={id}
        >
          •••
        </button>
      </div>

      {data.isEditing ? (
        <div className={`${styles.cardForm} nodrag`}>
          <input aria-label="Título" defaultValue={data.title} data-node-field="title" data-node-id={id} />
          <textarea aria-label="Descrição" defaultValue={data.description} data-node-field="description" data-node-id={id} />
          <details>
            <summary>Mais detalhes</summary>
            <textarea aria-label="Detalhes avançados" defaultValue={data.details} data-node-field="details" data-node-id={id} />
          </details>
          <div className={styles.cardFormActions}>
            <button type="button" data-node-cancel={id}>Cancelar</button>
            <button type="button" data-node-save={id}>Salvar</button>
          </div>
        </div>
      ) : (
        <div className={styles.cardBody}>
          <h2>{data.title}</h2>
          <p>{data.description}</p>
        </div>
      )}

      {data.menuOpen && (
        <div className={`${styles.cardToolbar} nodrag nopan`}>
          <button type="button" title="Editar" data-node-edit={id}>✎</button>
          <button type="button" title="Duplicar" data-node-duplicate={id}>⧉</button>
          <button type="button" title="Excluir" data-node-delete={id}>⌫</button>
        </div>
      )}
    </article>
  );
}

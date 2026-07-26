'use client';

import { icons } from './canvas-v3.icons';
import { stageMeta, type CanvasNode } from './canvas-v3.model';
import styles from './canvas-v3.module.sass';

type Props = {
  node: CanvasNode;
  selected: boolean;
  editing: boolean;
  menuOpen: boolean;
  connecting: boolean;
  onSelect: () => void;
  onStartDrag: (event: React.PointerEvent<HTMLElement>) => void;
  onInput: () => void;
  onOutput: () => void;
  onToggleMenu: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCancelEdit: () => void;
  onChange: (patch: Partial<Pick<CanvasNode, 'title' | 'description' | 'details'>>) => void;
  onSave: () => void;
};

export function CanvasV3Node(props: Props) {
  const { node, selected, editing, menuOpen, connecting } = props;
  const meta = stageMeta(node.stage);

  function stopPointer(event: React.PointerEvent<HTMLElement>) {
    event.stopPropagation();
  }

  return (
    <article
      className={styles.node}
      data-stage={node.stage}
      data-selected={selected}
      data-connecting={connecting}
      data-editing={editing}
      style={{ transform: `translate3d(${node.x}px, ${node.y}px, 0)` }}
      onPointerDown={props.onStartDrag}
      onClick={(event) => { event.stopPropagation(); props.onSelect(); }}
    >
      <button type="button" data-no-drag className={styles.inputHandle} onPointerDown={stopPointer} onClick={(event) => { event.stopPropagation(); props.onInput(); }} aria-label="Receber conexão" data-tooltip="Receber conexão" />
      <button type="button" data-no-drag className={styles.outputHandle} onPointerDown={stopPointer} onClick={(event) => { event.stopPropagation(); props.onOutput(); }} aria-label="Criar conexão" data-tooltip="Criar conexão" />

      <div className={styles.nodeMeta}>
        <span>{meta.label}</span>
        <button type="button" data-no-drag className={styles.moreButton} onPointerDown={stopPointer} onClick={(event) => { event.stopPropagation(); props.onToggleMenu(); }} aria-label="Abrir ações do card" data-tooltip="Ações do card">{icons.more}</button>
      </div>

      {menuOpen && !editing && (
        <div className={styles.nodeMenu} data-no-drag role="toolbar" aria-label="Ações do card" onPointerDown={stopPointer} onClick={(event) => event.stopPropagation()}>
          <button type="button" onClick={props.onEdit} data-tooltip="Editar card">{icons.edit}<span>Editar</span></button>
          <button type="button" onClick={props.onDuplicate} data-tooltip="Duplicar card">{icons.duplicate}<span>Duplicar</span></button>
          <button type="button" onClick={props.onOutput} data-tooltip="Criar conexão">{icons.connect}<span>Conectar</span></button>
          <button type="button" className={styles.dangerAction} onClick={props.onDelete} data-tooltip="Excluir card">{icons.trash}<span>Excluir</span></button>
        </div>
      )}

      {editing ? (
        <form className={styles.inlineForm} data-no-drag onPointerDown={stopPointer} onSubmit={(event) => { event.preventDefault(); props.onSave(); }}>
          <label>
            <span>Título</span>
            <input autoFocus value={node.title} onChange={(event) => props.onChange({ title: event.target.value })} />
          </label>
          <label>
            <span>Descrição breve</span>
            <textarea rows={2} value={node.description} onChange={(event) => props.onChange({ description: event.target.value })} />
          </label>
          <details>
            <summary>Detalhes avançados</summary>
            <textarea rows={2} value={node.details} placeholder="Contexto, critérios ou observação" onChange={(event) => props.onChange({ details: event.target.value })} />
          </details>
          <div className={styles.inlineActions}>
            <button type="button" onClick={props.onCancelEdit}>Cancelar</button>
            <button type="submit">Salvar</button>
          </div>
        </form>
      ) : (
        <>
          <h2>{node.title}</h2>
          <p>{node.description}</p>
          <div className={styles.nodeFooter}>
            <button type="button" data-no-drag onPointerDown={stopPointer} onClick={(event) => { event.stopPropagation(); props.onOutput(); }} data-tooltip="Conectar à próxima etapa">{icons.connect}<span>Conectar</span></button>
            <small>Arraste para mover</small>
          </div>
        </>
      )}
    </article>
  );
}

'use client';

import { STAGES } from '../domain/canvas-v2.constants';
import type { EdgeEditorKind, TdmCanvasEdge, TdmCanvasNode, TdmStageId } from '../domain/canvas-v2.types';
import { getStage } from '../domain/canvas-v2.rules';
import { icons } from './canvas-v2-icons';
import styles from '../canvas-v2.module.sass';

type Props = {
  open: boolean;
  node: TdmCanvasNode | null;
  edge: TdmCanvasEdge | null;
  counts: Record<TdmStageId, number>;
  edgeEditor: EdgeEditorKind;
  onClose: () => void;
  onUpdateNode: (field: 'title' | 'description' | 'details', value: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onOpenEdgeEditor: (kind: Exclude<EdgeEditorKind, null>) => void;
  onCloseEdgeEditor: () => void;
  onUpdateEdge: (kind: Exclude<EdgeEditorKind, null>, value: string) => void;
};

export function CanvasSidebar(props: Props) {
  if (!props.open) return null;
  const stage = props.node ? getStage(props.node.data.stage) : null;
  const edgeValue = props.edgeEditor && props.edge ? props.edge.data?.[props.edgeEditor] ?? '' : '';
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div><span>Editor</span><strong>{stage?.singular ?? (props.edge ? 'Conexão' : 'Visão geral')}</strong></div>
        <button type="button" onClick={props.onClose} aria-label="Fechar painel">{icons.close}</button>
      </div>

      {props.node ? (
        <>
          <div className={styles.selectedSummary} data-stage={props.node.data.stage}><span /><div><strong>{stage?.label}</strong><small>Bloco selecionado</small></div></div>
          <form className={styles.nodeForm} onSubmit={(event) => event.preventDefault()}>
            <label>Título<input value={props.node.data.title} onChange={(event) => props.onUpdateNode('title', event.target.value)} /></label>
            <label>Descrição breve<textarea rows={3} value={props.node.data.description} onChange={(event) => props.onUpdateNode('description', event.target.value)} /></label>
            <label>Detalhes avançados<textarea rows={4} placeholder="Contexto, critérios ou observação metodológica" value={props.node.data.details} onChange={(event) => props.onUpdateNode('details', event.target.value)} /></label>
          </form>
          <div className={styles.actionBar}>
            <button type="button" onClick={props.onDuplicate}>{icons.duplicate}<span>Duplicar</span></button>
            <button type="button" data-danger="true" onClick={props.onDelete}>{icons.trash}<span>Excluir</span></button>
          </div>
        </>
      ) : null}

      {props.edge ? (
        <div className={styles.edgePanel}>
          <p>Qualifique esta passagem causal somente quando a conexão for válida.</p>
          <button type="button" onClick={() => props.onOpenEdgeEditor('risk')}>Risco desta passagem</button>
          <button type="button" onClick={() => props.onOpenEdgeEditor('hypothesis')}>Hipótese desta passagem</button>
        </div>
      ) : null}

      {!props.node && !props.edge ? (
        <div className={styles.summaryPanel}>
          <p>Estrutura da teoria</p>
          {STAGES.map((item) => <div key={item.id} data-stage={item.id}><span />{item.label}<b>{props.counts[item.id]}</b></div>)}
        </div>
      ) : null}

      {props.edgeEditor && props.edge ? (
        <div className={styles.modalBackdrop} role="presentation">
          <section className={styles.edgeModal} role="dialog" aria-modal="true" aria-label={props.edgeEditor === 'risk' ? 'Editar risco' : 'Editar hipótese'}>
            <span>{props.edgeEditor === 'risk' ? 'Qualificar passagem' : 'Explicitar lógica causal'}</span>
            <h2>{props.edgeEditor === 'risk' ? 'Risco desta passagem' : 'Hipótese desta passagem'}</h2>
            <p>{props.edgeEditor === 'risk' ? 'O que pode atrapalhar esta conexão?' : 'Por que esta conexão deve funcionar?'}</p>
            <textarea rows={4} value={edgeValue} onChange={(event) => props.onUpdateEdge(props.edgeEditor as Exclude<EdgeEditorKind, null>, event.target.value)} />
            <div><button type="button" onClick={props.onCloseEdgeEditor}>Cancelar</button><button type="button" onClick={props.onCloseEdgeEditor}>Salvar</button></div>
          </section>
        </div>
      ) : null}
    </aside>
  );
}

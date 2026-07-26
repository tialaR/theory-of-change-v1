'use client';

import type { SaveStatus } from '../domain/canvas-v2.types';
import { icons } from './canvas-v2-icons';
import styles from '../canvas-v2.module.sass';

type Props = {
  name: string;
  status: SaveStatus;
  fullMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onNameChange: (value: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleFull: () => void;
};

const STATUS_LABELS: Record<SaveStatus, string> = {
  saved: 'Salvo',
  dirty: 'Alterações não salvas',
  saving: 'Salvando…',
  error: 'Falha ao salvar',
};

export function CanvasHeader(props: Props) {
  return (
    <header className={styles.header} data-hidden={props.fullMode}>
      <div className={styles.brandBlock}>
        <div className={styles.brandDiamond}><span /><span /><span /></div>
        <div>
          <strong>TMD Construtor</strong>
          <input aria-label="Nome da teoria" value={props.name} onChange={(event) => props.onNameChange(event.target.value)} />
        </div>
      </div>
      <div className={styles.saveStatus} data-status={props.status}><span />{STATUS_LABELS[props.status]}</div>
      <div className={styles.headerActions}>
        <button type="button" onClick={props.onUndo} disabled={!props.canUndo} aria-label="Desfazer" title="Desfazer">{icons.undo}</button>
        <button type="button" onClick={props.onRedo} disabled={!props.canRedo} aria-label="Refazer" title="Refazer">{icons.redo}</button>
        <button type="button" onClick={props.onToggleFull} aria-label="Modo foco" title="Modo foco">{icons.expand}</button>
      </div>
    </header>
  );
}

'use client';

import { STAGES } from '../domain/canvas-v2.constants';
import type { TdmStageId } from '../domain/canvas-v2.types';
import { icons } from './canvas-v2-icons';
import styles from '../canvas-v2.module.sass';

type Props = { open: boolean; counts: Record<TdmStageId, number>; onToggle: () => void; onAdd: (stage: TdmStageId) => void };

export function StagePalette({ open, counts, onToggle, onAdd }: Props) {
  function startDrag(event: React.DragEvent<HTMLButtonElement>, stage: TdmStageId) {
    event.dataTransfer.setData('application/tdm-stage', stage);
    event.dataTransfer.effectAllowed = 'copy';
  }

  return (
    <section className={styles.palette} data-open={open}>
      <button className={styles.paletteTrigger} type="button" onClick={onToggle} aria-expanded={open}>
        <span className={styles.paletteIcon}>{icons.duplicate}</span>
        <span><strong>Adicionar ao canvas</strong><small>Arraste ou clique em qualquer etapa</small></span>
        <i>{icons.chevron}</i>
      </button>
      {open ? (
        <div className={styles.paletteBody}>
          {STAGES.map((stage) => (
            <button key={stage.id} type="button" draggable onDragStart={(event) => startDrag(event, stage.id)} onClick={() => onAdd(stage.id)} data-stage={stage.id}>
              <span className={styles.paletteAdd}>{icons.plus}</span>
              <span><strong>{stage.singular}</strong><small>{stage.description}</small></span>
              <b>{counts[stage.id]}</b>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

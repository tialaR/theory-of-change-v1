'use client';

import { CANVAS_STAGES } from '../../domain/canvas-stage.constants';
import { CANVAS_TOOLTIP_LABELS } from '../../domain/canvas-ui.constants';
import { canvasIcons as icons } from '../canvas-icons';
import styles from '../canvas-workspace/canvas-workspace.module.sass';
import { useCanvasRuntime } from '../runtime/canvas-runtime-context';

export function CanvasCreatorPanel() {
  const runtime = useCanvasRuntime();
  const open = runtime.ui.creatorOpen;

  return (
    <section className={styles.creator} data-open={open}>
      <button
        type="button"
        className={styles.creatorToggle}
        onClick={() => runtime.ui.setCreatorOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? CANVAS_TOOLTIP_LABELS.closeCreator : CANVAS_TOOLTIP_LABELS.openCreator}
        title={open ? CANVAS_TOOLTIP_LABELS.closeCreator : CANVAS_TOOLTIP_LABELS.openCreator}
        data-tooltip={open ? CANVAS_TOOLTIP_LABELS.closeCreator : CANVAS_TOOLTIP_LABELS.openCreator}
      >
        <span className={styles.creatorIcon}><i /><i /><i /></span>
        {open ? (
          <span className={styles.creatorHeading}>
            <strong>Adicionar ao canvas</strong>
            <small>Arraste qualquer etapa</small>
          </span>
        ) : null}
        <span className={styles.creatorChevron}>{open ? icons.collapse : icons.expand}</span>
      </button>

      {open ? (
        <div className={styles.creatorBody}>
          {CANVAS_STAGES.map((stage) => (
            <button
              type="button"
              key={stage.id}
              data-stage={stage.id}
              draggable
              onDragStart={(event) => runtime.startStageDrag(event, stage.id)}
              aria-label={`Arrastar ${stage.singular} para o canvas`}
            >
              <span className={styles.stageGlyph}>{icons.add}</span>
              <span><strong>{stage.singular}</strong><small>{stage.hint}</small></span>
              <em>{runtime.flow.counts[stage.id]}</em>
            </button>
          ))}

          <div className={styles.creatorActions} role="toolbar" aria-label="Organização e apoio do canvas">
            <button
              type="button"
              onClick={runtime.centralizeColumns}
              data-tooltip={CANVAS_TOOLTIP_LABELS.columns}
              title={CANVAS_TOOLTIP_LABELS.columns}
              aria-label={CANVAS_TOOLTIP_LABELS.columns}
            >
              <svg viewBox="0 0 24 24">
                <rect x="3" y="5" width="4" height="14" rx="1" />
                <rect x="10" y="5" width="4" height="14" rx="1" />
                <rect x="17" y="5" width="4" height="14" rx="1" />
              </svg>
            </button>
            <button
              type="button"
              onClick={runtime.frameVisualization}
              data-tooltip={CANVAS_TOOLTIP_LABELS.frame}
              title={CANVAS_TOOLTIP_LABELS.frame}
              aria-label={CANVAS_TOOLTIP_LABELS.frame}
            >
              {icons.fit}
            </button>
            <button
              type="button"
              onClick={runtime.openGuide}
              data-tooltip={CANVAS_TOOLTIP_LABELS.guide}
              title={CANVAS_TOOLTIP_LABELS.guide}
              aria-label={CANVAS_TOOLTIP_LABELS.guide}
            >
              <svg viewBox="0 0 24 24">
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
                <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={runtime.openExamples}
              data-tooltip={CANVAS_TOOLTIP_LABELS.examples}
              title={CANVAS_TOOLTIP_LABELS.examples}
              aria-label={CANVAS_TOOLTIP_LABELS.examples}
            >
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="m7 15 3-3 2.5 2.5L16 10l2 2.5" />
                <circle cx="8" cy="8" r="1" />
              </svg>
            </button>
            <button
              type="button"
              onClick={runtime.organizeFlow}
              data-tooltip={CANVAS_TOOLTIP_LABELS.flow}
              title={CANVAS_TOOLTIP_LABELS.flow}
              aria-label={CANVAS_TOOLTIP_LABELS.flow}
            >
              <svg viewBox="0 0 24 24">
                <circle cx="5" cy="6" r="2" />
                <circle cx="19" cy="12" r="2" />
                <circle cx="5" cy="18" r="2" />
                <path d="M7 6h4a3 3 0 0 1 3 3v0a3 3 0 0 0 3 3" />
                <path d="M7 18h4a3 3 0 0 0 3-3v0a3 3 0 0 1 3-3" />
              </svg>
            </button>
          </div>
          <p>{icons.lock}<span>Riscos e hipóteses permanecem disponíveis somente entre relações válidas.</span></p>
        </div>
      ) : null}
    </section>
  );
}

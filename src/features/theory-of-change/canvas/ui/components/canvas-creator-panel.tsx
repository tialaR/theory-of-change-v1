'use client';

import { CANVAS_STAGES } from '../../domain/canvas-stage.constants';
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
        aria-label={open ? runtime.t('tooltips.closeCreator') : runtime.t('tooltips.openCreator')}
        title={open ? runtime.t('tooltips.closeCreator') : runtime.t('tooltips.openCreator')}
        data-tooltip={open ? runtime.t('tooltips.closeCreator') : runtime.t('tooltips.openCreator')}
      >
        <span className={styles.creatorIcon}><i /><i /><i /></span>
        {open ? (
          <span className={styles.creatorHeading}>
            <strong>{runtime.t('creator.title')}</strong>
            <small>{runtime.t('creator.subtitle')}</small>
          </span>
        ) : null}
        <span className={styles.creatorChevron}>{open ? icons.collapse : icons.expand}</span>
      </button>

      {open ? (
        <div className={styles.creatorBody}>
          {CANVAS_STAGES.map((stage) => {
            const copy = runtime.stageCopy(stage);
            return (
              <button
                type="button"
                key={stage}
                data-stage={stage}
                draggable
                onDragStart={(event) => runtime.startStageDrag(event, stage)}
                aria-label={runtime.t('creator.dragAria', { stage: copy.singular })}
              >
                <span className={styles.stageGlyph}>{icons.add}</span>
                <span><strong>{copy.singular}</strong><small>{copy.hint}</small></span>
                <em>{runtime.flow.counts[stage]}</em>
              </button>
            );
          })}

          <div className={styles.creatorActions} role="toolbar" aria-label={runtime.t('creator.toolbarLabel')}>
            <button
              type="button"
              onClick={runtime.centralizeColumns}
              data-tooltip={runtime.t('tooltips.columns')}
              title={runtime.t('tooltips.columns')}
              aria-label={runtime.t('tooltips.columns')}
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
              data-tooltip={runtime.t('tooltips.frame')}
              title={runtime.t('tooltips.frame')}
              aria-label={runtime.t('tooltips.frame')}
            >
              {icons.fit}
            </button>
            <button
              type="button"
              onClick={runtime.openGuide}
              data-tooltip={runtime.t('tooltips.guide')}
              title={runtime.t('tooltips.guide')}
              aria-label={runtime.t('tooltips.guide')}
            >
              <svg viewBox="0 0 24 24">
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
                <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={runtime.openExamples}
              data-tooltip={runtime.t('tooltips.examples')}
              title={runtime.t('tooltips.examples')}
              aria-label={runtime.t('tooltips.examples')}
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
              data-tooltip={runtime.t('tooltips.flow')}
              title={runtime.t('tooltips.flow')}
              aria-label={runtime.t('tooltips.flow')}
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
          <p>{icons.lock}<span>{runtime.t('creator.rule')}</span></p>
        </div>
      ) : null}
    </section>
  );
}

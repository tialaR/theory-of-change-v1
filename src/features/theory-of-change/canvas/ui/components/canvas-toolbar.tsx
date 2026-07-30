'use client';

import { canvasIcons as icons } from '../canvas-icons';
import styles from '../canvas-workspace/canvas-workspace.module.sass';
import { useCanvasRuntime } from '../runtime/canvas-runtime-context';

export function CanvasToolbar() {
  const runtime = useCanvasRuntime();

  return (
    <>
      <aside className={styles.rail} aria-label={runtime.t('toolbar.toolsLabel')}>
        <button type="button" data-active="true" data-tooltip={runtime.t('tooltips.select')}>{icons.cursor}</button>
        <span className={styles.railDivider} />
        <button type="button" data-tooltip={runtime.t('tooltips.zoomIn')} onClick={runtime.zoomIn}>{icons.zoomIn}</button>
        <button type="button" data-tooltip={runtime.t('tooltips.zoomOut')} onClick={runtime.zoomOut}>{icons.zoomOut}</button>
        <button type="button" data-tooltip={runtime.t('tooltips.fit')} onClick={runtime.frameVisualization}>{icons.fit}</button>
        <button
          type="button"
          data-tooltip={runtime.t('tooltips.columns')}
          title={runtime.t('tooltips.columns')}
          aria-label={runtime.t('tooltips.columns')}
          onClick={runtime.centralizeColumns}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="4" height="14" rx="1" />
            <rect x="10" y="5" width="4" height="14" rx="1" />
            <rect x="17" y="5" width="4" height="14" rx="1" />
          </svg>
        </button>
        <button
          type="button"
          data-tooltip={runtime.t('tooltips.flow')}
          title={runtime.t('tooltips.flow')}
          aria-label={runtime.t('tooltips.flow')}
          onClick={runtime.organizeFlow}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="5" cy="6" r="2" />
            <circle cx="19" cy="12" r="2" />
            <circle cx="5" cy="18" r="2" />
            <path d="M7 6h4a3 3 0 0 1 3 3v0a3 3 0 0 0 3 3" />
            <path d="M7 18h4a3 3 0 0 0 3-3v0a3 3 0 0 1 3-3" />
          </svg>
        </button>
        <button
          type="button"
          data-tooltip={runtime.t(runtime.ui.fullCanvasMode ? 'tooltips.closeFullCanvas' : 'tooltips.fullCanvas')}
          title={runtime.t(runtime.ui.fullCanvasMode ? 'tooltips.closeFullCanvas' : 'tooltips.fullCanvas')}
          onClick={runtime.ui.fullCanvasMode ? runtime.exitFullCanvas : runtime.enterFullCanvas}
          aria-label={runtime.t(runtime.ui.fullCanvasMode ? 'tooltips.closeFullCanvas' : 'tooltips.fullCanvas')}
        >
          {runtime.ui.fullCanvasMode ? icons.close : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 9 5 5m0 0v4m0-4h4M15 9l4-4m0 0v4m0-4h-4M9 15l-4 4m0 0v-4m0 4h4M15 15l4 4m0 0v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </aside>

      {runtime.ui.fullCanvasMode ? (
        <div className={styles.fullCanvasActions} role="toolbar" aria-label={runtime.t('toolbar.fullActionsLabel')}>
          <button type="button" onClick={runtime.undo} disabled={!runtime.flow.canUndo} data-tooltip={runtime.t('tooltips.undo')} title={runtime.t('tooltips.undo')} aria-label={runtime.t('tooltips.undo')}>{icons.undo}</button>
          <button type="button" onClick={runtime.redo} disabled={!runtime.flow.canRedo} data-tooltip={runtime.t('tooltips.redo')} title={runtime.t('tooltips.redo')} aria-label={runtime.t('tooltips.redo')}>{icons.redo}</button>
          <button type="button" onClick={() => void runtime.save()} data-tooltip={runtime.t('tooltips.save')} title={runtime.t('tooltips.save')} aria-label={runtime.t('tooltips.save')}>{icons.save}</button>
        </div>
      ) : null}
    </>
  );
}
